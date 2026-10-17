using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestApi.Data;
using RestApi.Models.Dto;
using RestApi.Services;
using StackExchange.Redis;
namespace RestApi.Controllers;
[ApiController]
[Route("api/otp")]
[Authorize]
public sealed class OtpController(ApplicationDbContext context, IOtpService service)
    : ControllerBase
{
    private bool TryUserId(out int id) =>
        int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out id) && id > 0;

    [HttpPost("send")]
    public async Task<IActionResult> Send(CancellationToken ct)
    {
        if (!TryUserId(out var userId)) return Unauthorized();
        var user = await context.Users.AsNoTracking()
            .SingleOrDefaultAsync(x => x.Id == userId, ct);
        if (user is null) return Unauthorized();
        try { await service.IssueAsync(userId, user.Username, ct); return Accepted(); }
        catch (InvalidOperationException) { return Conflict(); }
        catch (RedisException) { return StatusCode(503); }
    }

    [HttpPost("verify")]
    public async Task<IActionResult> Verify(OtpVerifyDto request, CancellationToken ct)
    {
        if (!TryUserId(out var userId)) return Unauthorized();
        try
        {
            return await service.VerifyAsync(userId, request.Code, ct)
                ? NoContent() : BadRequest(new ProblemDetails { Title = "Invalid or expired code." });
        }
        catch (RedisException) { return StatusCode(503); }
    }
}