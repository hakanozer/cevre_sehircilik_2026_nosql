using System;
using System.Linq;

namespace RestApi.Services;

public static class RateLimitRedisKeys
{
    public static string UserWindow(string partitionKey, string operation, long windowNumber)
    {
        if (string.IsNullOrWhiteSpace(partitionKey))
            throw new ArgumentException("Invalid partition key.", nameof(partitionKey));
        if (string.IsNullOrWhiteSpace(operation)
            || operation.Any(c => !char.IsAsciiLetterOrDigit(c) && c != '-'))
            throw new ArgumentException("Invalid operation key.", nameof(operation));
        return $"rate:user:{partitionKey}:{operation}:{windowNumber}";
    }
}