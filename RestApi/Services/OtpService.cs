using System;
using System.Security.Cryptography;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using StackExchange.Redis;
namespace RestApi.Services;
public sealed class OtpService(
    IConnectionMultiplexer multiplexer, IOtpDelivery delivery,
    IConfiguration configuration) : IOtpService
{
    private readonly IDatabase _db = multiplexer.GetDatabase();
    private readonly byte[] _key = GetHmacKey(configuration);

    private static byte[] GetHmacKey(IConfiguration configuration)
    {
        var value = configuration["Otp:HmacKey"]
            ?? throw new InvalidOperationException("Otp:HmacKey is required.");
        var key = Encoding.UTF8.GetBytes(value);
        if (key.Length < 32)
            throw new InvalidOperationException("Otp:HmacKey must be at least 32 bytes.");
        return key;
    }

    public async Task IssueAsync(int userId, string email, CancellationToken ct)
    {
        var code = RandomNumberGenerator.GetInt32(0, 1_000_000).ToString("D6");
        var digest = Convert.ToHexString(HMACSHA256.HashData(_key,
            Encoding.UTF8.GetBytes($"{userId}:{code}")));
        if (!await _db.StringSetAsync(OtpRedisKeys.Challenge(userId), digest,
                TimeSpan.FromMinutes(5), When.NotExists))
            throw new InvalidOperationException("Challenge already active.");
        await delivery.SendAsync(email, code, ct);
    }

    public async Task<bool> VerifyAsync(int userId, string code, CancellationToken ct)
    {
        ct.ThrowIfCancellationRequested();
        var key = (RedisKey)OtpRedisKeys.Challenge(userId);
        var stored = await _db.StringGetAsync(key);
        if (stored.IsNull) return false;
        var digest = Convert.ToHexString(HMACSHA256.HashData(_key,
            Encoding.UTF8.GetBytes($"{userId}:{code}")));
        if (!CryptographicOperations.FixedTimeEquals(
                Encoding.ASCII.GetBytes(stored.ToString()), Encoding.ASCII.GetBytes(digest)))
            return false;
        return await _db.KeyDeleteAsync(key);
    }
}