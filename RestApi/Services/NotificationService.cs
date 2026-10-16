using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using RestApi.Data;
using RestApi.Models;
using RestApi.Models.Dto;
using StackExchange.Redis;

namespace RestApi.Services;

public sealed class NotificationService(
    ApplicationDbContext context, IConnectionMultiplexer multiplexer)
    : INotificationService
{
    private readonly IDatabase _redis = multiplexer.GetDatabase();

    public async Task<NotificationResponseDto> CreateAsync(
        int userId, CreateNotificationRequestDto request, CancellationToken ct)
    {
        var item = new Notification
        {
            UserId = userId, Type = request.Type,
            Title = request.Title, Message = request.Message,
            CreatedAtUtc = DateTime.UtcNow
        };
        context.Notifications.Add(item);
        await context.SaveChangesAsync(ct);

        try
        {
            var recent = (RedisKey)NotificationRedisKeys.Recent(userId);
            await _redis.SortedSetAddAsync(recent, item.Id.ToString(),
                new DateTimeOffset(item.CreatedAtUtc).ToUnixTimeMilliseconds());
            await _redis.SortedSetRemoveRangeByRankAsync(recent, 0, -101);
            await _redis.KeyExpireAsync(recent, TimeSpan.FromDays(7));
            var itemKey = (RedisKey)NotificationRedisKeys.Item(item.Id);
            await _redis.HashSetAsync(itemKey, new[]
            {
                new HashEntry("title", item.Title),
                new HashEntry("message", item.Message),
                new HashEntry("read", "false")
            });
            await _redis.KeyExpireAsync(itemKey, TimeSpan.FromDays(1));
        }
        catch (RedisException ex)
        {
            // SQL commit already succeeded; caller must not assume it rolled back.
            throw new NotificationStoreUnavailableException(ex);
        }

        return Map(item);
    }

    public async Task<IReadOnlyList<NotificationResponseDto>> GetRecentAsync(
        int userId, int count, CancellationToken ct)
    {
        count = Math.Clamp(count, 1, 100);
        RedisValue[] ids;
        try
        {
            ids = await _redis.SortedSetRangeByRankAsync(
                NotificationRedisKeys.Recent(userId), 0, count - 1,
                Order.Descending);
        }
        catch (RedisException ex)
        {
            throw new NotificationStoreUnavailableException(ex);
        }

        if (ids.Length == 0)
        {
            var latest = await context.Notifications.AsNoTracking()
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedAtUtc)
                .Take(count).ToListAsync(ct);
            try
            {
                var key = (RedisKey)NotificationRedisKeys.Recent(userId);
                foreach (var item in latest)
                    await _redis.SortedSetAddAsync(key, item.Id.ToString(),
                        new DateTimeOffset(item.CreatedAtUtc).ToUnixTimeMilliseconds());
                await _redis.KeyExpireAsync(key, TimeSpan.FromDays(7));
                ids = latest.Select(n => (RedisValue)n.Id.ToString()).ToArray();
            }
            catch (RedisException ex)
            {
                throw new NotificationStoreUnavailableException(ex);
            }
        }

        var parsedIds = ids.Select(x => int.TryParse(x.ToString(), out var id) ? id : 0)
            .Where(id => id > 0).ToArray();
        var rows = await context.Notifications.AsNoTracking()
            .Where(n => n.UserId == userId && parsedIds.Contains(n.Id))
            .ToDictionaryAsync(n => n.Id, ct);
        return parsedIds.Where(rows.ContainsKey).Select(id => Map(rows[id])).ToArray();
    }

    public async Task<bool> MarkReadAsync(
        int userId, int notificationId, CancellationToken ct)
    {
        var item = await context.Notifications
            .SingleOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId, ct);
        if (item is null) return false;
        if (item.ReadAtUtc is null)
        {
            item.ReadAtUtc = DateTime.UtcNow;
            await context.SaveChangesAsync(ct);
            try
            {
                await _redis.HashSetAsync(NotificationRedisKeys.Item(item.Id),
                    "read", "true");
                await _redis.KeyExpireAsync(
                    NotificationRedisKeys.Item(item.Id), TimeSpan.FromDays(1));
            }
            catch (RedisException ex)
            {
                throw new NotificationStoreUnavailableException(ex);
            }
        }
        return true;
    }

    private static NotificationResponseDto Map(Notification n) =>
        new(n.Id, n.Type, n.Title, n.Message, n.CreatedAtUtc, n.ReadAtUtc);
}