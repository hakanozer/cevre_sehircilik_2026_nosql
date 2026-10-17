using System;
namespace RestApi.Services;
public static class OtpRedisKeys
{
    public static string Challenge(int userId) =>
        userId > 0 ? $"otp:user:{userId}:verify"
                    : throw new ArgumentOutOfRangeException(nameof(userId));
}