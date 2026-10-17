using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RestApi.Models.Dto;
using RestApi.Services;
using StackExchange.Redis;

namespace RestApi.Controllers;

[ApiController]
[Route("api/jobs")]
[Authorize]
public sealed class JobsController(IJobQueue queue) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Enqueue(QueueJobDto request, CancellationToken ct)
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId)
            || userId <= 0) return Unauthorized();

        try 
        { 
            return Accepted(new { id = await queue.EnqueueAsync(userId, request, ct), status = "queued" }); 
        }
        catch (RedisException) 
        { 
            return StatusCode(503); 
        }
    }
}