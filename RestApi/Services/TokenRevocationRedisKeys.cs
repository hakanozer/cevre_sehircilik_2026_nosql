using System;

namespace RestApi.Services;

public static class TokenRevocationRedisKeys
{
    public static string ForJti(string jti)
    {
        if (string.IsNullOrWhiteSpace(jti)
            || jti.Length > 128
            || jti.Any(char.IsControl))
            throw new ArgumentException("Invalid token identifier.", nameof(jti));
        return $"auth:revoked:{jti}";
    }
}