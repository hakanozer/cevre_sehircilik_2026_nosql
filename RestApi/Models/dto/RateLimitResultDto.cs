namespace RestApi.Models.Dto;

public sealed record RateLimitResultDto(
    bool Allowed, long Limit, long Remaining, long RetryAfterSeconds);