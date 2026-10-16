using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RestApi.Models.Dto;
using RestApi.Services;
using StackExchange.Redis;

namespace RestApi.Controllers;

[ApiController]
[Route("api/notifications")]
[Authorize]
public sealed class NotificationsController(INotificationService service)
    : ControllerBase
{
    private bool TryUserId(out int id) =>
        int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out id) && id > 0;

    [HttpPost]
    public async Task<IActionResult> Create(
        CreateNotificationRequestDto request, CancellationToken ct)
    {
        if (!TryUserId(out var userId)) return Unauthorized();
        try { return StatusCode(201, await service.CreateAsync(userId, request, ct)); }
        catch (NotificationStoreUnavailableException)
        { return StatusCode(503, new ProblemDetails { Status=503, Title="Notification index unavailable; database write may have completed." }); }
    }

    [HttpGet]
    public async Task<IActionResult> Recent(
        [FromQuery] int count = 20, CancellationToken ct = default)
    {
        if (!TryUserId(out var userId)) return Unauthorized();
        if (count is < 1 or > 100) return BadRequest();
        try { return Ok(await service.GetRecentAsync(userId, count, ct)); }
        catch (NotificationStoreUnavailableException)
        { return StatusCode(503, new ProblemDetails { Status=503, Title="Notification index unavailable." }); }
    }

    [HttpPost("{id:int}/read")]
    public async Task<IActionResult> Read(int id, CancellationToken ct)
    {
        if (!TryUserId(out var userId)) return Unauthorized();
        try { return await service.MarkReadAsync(userId, id, ct) ? NoContent() : NotFound(); }
        catch (NotificationStoreUnavailableException)
        { return StatusCode(503, new ProblemDetails { Status=503, Title="Notification index unavailable; read state may be saved." }); }
    }
}