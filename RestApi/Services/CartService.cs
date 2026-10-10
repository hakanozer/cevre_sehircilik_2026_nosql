using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using RestApi.Data;
using RestApi.Models.Dto;
using StackExchange.Redis;

namespace RestApi.Services;

public sealed class CartService : ICartService
{
    private static readonly TimeSpan CartTtl = TimeSpan.FromDays(7);
    private readonly ApplicationDbContext _context;
    private readonly IConnectionMultiplexer _multiplexer;

    private const string AddScript = @"
local current = tonumber(redis.call('HGET', KEYS[1], ARGV[1]) or '0')
if current + tonumber(ARGV[2]) > tonumber(ARGV[4]) then return -1 end
local quantity = redis.call('HINCRBY', KEYS[1], ARGV[1], ARGV[2])
redis.call('EXPIRE', KEYS[1], ARGV[3])
return quantity";

    private const string UpdateScript = @"
if redis.call('HEXISTS', KEYS[1], ARGV[1]) == 0 then return 0 end
redis.call('HSET', KEYS[1], ARGV[1], ARGV[2])
redis.call('EXPIRE', KEYS[1], ARGV[3])
return 1";

    private const string RemoveScript = @"
local removed = redis.call('HDEL', KEYS[1], ARGV[1])
if redis.call('HLEN', KEYS[1]) == 0 then
  redis.call('DEL', KEYS[1])
else
  redis.call('EXPIRE', KEYS[1], ARGV[2])
end
return removed";

    public CartService(
        ApplicationDbContext context,
        IConnectionMultiplexer multiplexer)
    {
        _context = context;
        _multiplexer = multiplexer;
    }

    public async Task<CartResponseDto> GetAsync(
        int userId, CancellationToken cancellationToken)
    {
        HashEntry[] entries;
        var key = (RedisKey)CartRedisKeys.ForUser(userId);
        var redis = _multiplexer.GetDatabase();

        try
        {
            entries = await redis.HashGetAllAsync(key);
        }
        catch (RedisException exception)
        {
            throw new CartStoreUnavailableException(exception);
        }

        var quantities = new Dictionary<int, int>();
        foreach (var entry in entries)
        {
            if (!int.TryParse(entry.Name.ToString(), NumberStyles.None,
                    CultureInfo.InvariantCulture, out var productId)
                || productId <= 0
                || !int.TryParse(entry.Value.ToString(), NumberStyles.None,
                    CultureInfo.InvariantCulture, out var quantity)
                || quantity <= 0)
            {
                throw new CartDataException("Cart data contains an invalid product or quantity.");
            }

            quantities[productId] = quantity;
        }

        if (quantities.Count == 0)
        {
            return new CartResponseDto();
        }

        var productIds = quantities.Keys.ToArray();
        var products = await _context.Products
            .AsNoTracking()
            .Where(product => productIds.Contains(product.Id))
            .ToDictionaryAsync(product => product.Id, cancellationToken);

        var items = new List<CartItemResponseDto>();
        var staleFields = new List<RedisValue>();
        foreach (var (productId, quantity) in quantities)
        {
            if (!products.TryGetValue(productId, out var product))
            {
                staleFields.Add(productId.ToString(CultureInfo.InvariantCulture));
                continue;
            }

            items.Add(new CartItemResponseDto
            {
                ProductId = productId,
                Quantity = quantity,
                UnitPrice = product.Price,
                LineTotal = product.Price * quantity
            });
        }

        if (staleFields.Count > 0)
        {
            try
            {
                await redis.HashDeleteAsync(key, staleFields.ToArray());
            }
            catch (RedisException exception)
            {
                throw new CartStoreUnavailableException(exception);
            }
        }

        return new CartResponseDto
        {
            Items = items,
            Total = items.Sum(item => item.LineTotal)
        };
    }

    public async Task<CartResponseDto> AddAsync(
        int userId, int productId, int quantity,
        CancellationToken cancellationToken)
    {
        await EnsureProductExistsAsync(productId, cancellationToken);
        var key = (RedisKey)CartRedisKeys.ForUser(userId);
        long updatedQuantity;
        try
        {
            updatedQuantity = (long)await _multiplexer.GetDatabase().ScriptEvaluateAsync(
                AddScript,
                new RedisKey[] { key },
                new RedisValue[]
                {
                    productId.ToString(CultureInfo.InvariantCulture),
                    quantity,
                    (int)CartTtl.TotalSeconds,
                    99
                });
        }
        catch (RedisException exception)
        {
            throw new CartStoreUnavailableException(exception);
        }

        if (updatedQuantity < 0)
        {
            throw new CartQuantityLimitException();
        }

        return await GetAsync(userId, cancellationToken);
    }

    public async Task<CartResponseDto> UpdateAsync(
        int userId, int productId, int quantity,
        CancellationToken cancellationToken)
    {
        await EnsureProductExistsAsync(productId, cancellationToken);
        var key = (RedisKey)CartRedisKeys.ForUser(userId);
        long updated;
        try
        {
            updated = (long)await _multiplexer.GetDatabase().ScriptEvaluateAsync(
                UpdateScript,
                new RedisKey[] { key },
                new RedisValue[]
                {
                    productId.ToString(CultureInfo.InvariantCulture),
                    quantity,
                    (int)CartTtl.TotalSeconds
                });
        }
        catch (RedisException exception)
        {
            throw new CartStoreUnavailableException(exception);
        }

        if (updated == 0)
        {
            throw new CartItemNotFoundException(productId);
        }

        return await GetAsync(userId, cancellationToken);
    }

    public async Task RemoveAsync(int userId, int productId)
    {
        var key = (RedisKey)CartRedisKeys.ForUser(userId);
        try
        {
            await _multiplexer.GetDatabase().ScriptEvaluateAsync(
                RemoveScript,
                new RedisKey[] { key },
                new RedisValue[]
                {
                    productId.ToString(CultureInfo.InvariantCulture),
                    (int)CartTtl.TotalSeconds
                });
        }
        catch (RedisException exception)
        {
            throw new CartStoreUnavailableException(exception);
        }
    }

    private async Task EnsureProductExistsAsync(
        int productId, CancellationToken cancellationToken)
    {
        var exists = await _context.Products
            .AsNoTracking()
            .AnyAsync(product => product.Id == productId, cancellationToken);

        if (!exists)
        {
            throw new CartProductNotFoundException(productId);
        }
    }
}