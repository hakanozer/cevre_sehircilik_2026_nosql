using System;
using System.Linq;
using System.Threading.Tasks;
using RestApi.Models.Dto;
using StackExchange.Redis;

namespace RestApi.Services;

public sealed class RateLimitService(IConnectionMultiplexer multiplexer) : IRateLimitService
{
    private const string IncrementScript = @"
    local count = redis.call('INCR', KEYS[1])
    if count == 1 then redis.call('PEXPIRE', KEYS[1], ARGV[1]) end
    return {count, redis.call('PTTL', KEYS[1])}";

    public async Task<RateLimitResultDto> CheckAsync(
    string partitionKey,
    string operation,
    long limit,
    TimeSpan window)
    {
        if (string.IsNullOrWhiteSpace(partitionKey))
            throw new ArgumentException(
                "Partition key is required.",
                nameof(partitionKey));

        if (limit <= 0)
            throw new ArgumentOutOfRangeException(nameof(limit));

        if (window <= TimeSpan.Zero)
            throw new ArgumentOutOfRangeException(nameof(window));

        var windowMs = checked(
            (long)Math.Ceiling(window.TotalMilliseconds));

        var windowNumber =
            DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() / windowMs;

        // RateLimitRedisKeys sınıfını da string kimliği
        // destekleyecek şekilde güncelle.
        var key = (RedisKey)RateLimitRedisKeys.UserWindow(
            partitionKey, operation, windowNumber);

        var result = (RedisResult[])await multiplexer
            .GetDatabase()
            .ScriptEvaluateAsync(
                IncrementScript,
                new[] { key },
                new RedisValue[] { windowMs });

        var count = (long)result[0];
        var ttlMs = (long)result[1];

        var retrySeconds = Math.Max(1L, (ttlMs + 999) / 1000);

        return new RateLimitResultDto(
            count <= limit,
            limit,
            Math.Max(0, limit - count),
            count <= limit ? 0 : retrySeconds);
    }


}