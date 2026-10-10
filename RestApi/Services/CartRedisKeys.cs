using System;

namespace RestApi.Services;

public static class CartRedisKeys
{
    public static string ForUser(int userId)
    {
        if (userId <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(userId));
        }

        return $"cart:user:{userId}";
    }
}
