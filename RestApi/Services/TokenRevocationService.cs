using System;
using System.Threading.Tasks;
using StackExchange.Redis;

namespace RestApi.Services;

public sealed class TokenRevocationService(IConnectionMultiplexer multiplexer): ITokenRevocationService
{
    public async Task RevokeAsync(string jti, DateTime expiresUtc)
    {
        var remaining = expiresUtc - DateTime.UtcNow;
        if (remaining <= TimeSpan.Zero) return;
        await multiplexer.GetDatabase().StringSetAsync(
            TokenRevocationRedisKeys.ForJti(jti), "1", remaining);
    }

    public Task<bool> IsRevokedAsync(string jti) =>
        multiplexer.GetDatabase().KeyExistsAsync(
            TokenRevocationRedisKeys.ForJti(jti));
}