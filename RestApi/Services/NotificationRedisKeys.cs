using System;

namespace RestApi.Services;

public static class NotificationRedisKeys
{
    public static string Recent(int userId) =>
        userId > 0 ? $"notification:user:{userId}:recent"
                    : throw new ArgumentOutOfRangeException(nameof(userId));
    public static string Item(int id) =>
        id > 0 ? $"notification:item:{id}"
               : throw new ArgumentOutOfRangeException(nameof(id));
}