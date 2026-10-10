using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using StackExchange.Redis;
using RestApi.Services;

public sealed class GlobalRateLimitMiddleware
{
    private readonly RequestDelegate _next;

    public GlobalRateLimitMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(
        HttpContext context,
        IRateLimitService rateLimitService)
    {
        var user = context.User;

        string partitionKey;
        long limit;

        if (user.Identity?.IsAuthenticated == true)
        {
            var userId = user.FindFirstValue(
                ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(userId))
            {
                context.Response.StatusCode = 401;
                return;
            }

            // Rol önceliği: Note > Product > genel kullanıcı
            if (user.IsInRole("Note"))
            {
                limit = 30;
            }
            else if (user.IsInRole("Product"))
            {
                limit = 20;
            }
            else
            {
                // Kimliği doğrulanmış ama özel rolü olmayan kullanıcı
                limit = 10;
            }

            partitionKey = $"user:{userId}";
        }
        else
        {
            // Anonim kullanıcıları IP adresine göre sınırla.
            var ip = context.Connection.RemoteIpAddress?
                .MapToIPv4().ToString() ?? "unknown";

            partitionKey = $"ip:{ip}";
            limit = 10;
        }

        try
        {
            var result = await rateLimitService.CheckAsync(
                partitionKey,
                "global",
                limit,
                TimeSpan.FromMinutes(1));

            context.Response.Headers["X-RateLimit-Limit"] =
                result.Limit.ToString();

            context.Response.Headers["X-RateLimit-Remaining"] =
                result.Remaining.ToString();

            if (!result.Allowed)
            {
                context.Response.StatusCode = 429;
                context.Response.Headers["Retry-After"] =
                    result.RetryAfterSeconds.ToString();

                await context.Response.WriteAsJsonAsync(
                    new ProblemDetails
                    {
                        Status = 429,
                        Title = "Rate limit exceeded",
                        Detail = "İstek limitiniz aşıldı. Lütfen tekrar deneyin."
                    });

                return;
            }
        }
        catch (RedisException)
        {
            // Fail-closed: Redis erişilemiyorsa isteği geçirme.
            context.Response.StatusCode = 503;

            await context.Response.WriteAsJsonAsync(
                new ProblemDetails
                {
                    Status = 503,
                    Title = "Rate-limit store unavailable"
                });

            return;
        }

        await _next(context);
    }
}