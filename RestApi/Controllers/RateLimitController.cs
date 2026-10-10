using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RestApi.Services;
using StackExchange.Redis;

namespace RestApi.Controllers;

[ApiController]
[Route("api/limits")]
[Authorize]
public sealed class RateLimitController(IRateLimitService limiter) : ControllerBase
{
    [HttpPost("check")]
    public async Task<IActionResult> Check()
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId)
            || userId <= 0)
            return Unauthorized();

        try
        {
            var result = await limiter.CheckAsync(
                $"user:{userId}", "demo", 5, TimeSpan.FromMinutes(1));
            Response.Headers["Retry-After"] = result.RetryAfterSeconds.ToString();
            return result.Allowed
                ? Ok(result)
                : StatusCode(429, result);
        }
        catch (RedisException)
        {
            return StatusCode(503, new ProblemDetails
            {
                Status = 503, Title = "Rate-limit store unavailable."
            });
        }
    }
}