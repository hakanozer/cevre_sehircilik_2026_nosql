using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RestApi.Models.Dto;
using RestApi.Services;

namespace RestApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public sealed class CartController(ICartService cartService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();
        try
        {
            return Ok(await cartService.GetAsync(userId, cancellationToken));
        }
        catch (CartStoreUnavailableException)
        {
            return StatusCode(503, new ProblemDetails
            {
                Status = 503,
                Title = "Cart store is temporarily unavailable."
            });
        }
        catch (CartDataException)
        {
            return Problem(statusCode: 500, title: "Cart data is invalid.");
        }
    }

    [HttpPost("items")]
    public async Task<IActionResult> Add(
        AddCartItemRequestDto request, CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();
        try
        {
            return Ok(await cartService.AddAsync(
                userId, request.ProductId, request.Quantity, cancellationToken));
        }
        catch (CartProductNotFoundException)
        {
            return NotFound(new ProblemDetails
            {
                Status = 404,
                Title = "Product was not found."
            });
        }
        catch (CartQuantityLimitException)
        {
            return Conflict(new ProblemDetails
            {
                Status = 409,
                Title = "The maximum cart quantity for this product is 99."
            });
        }
        catch (CartStoreUnavailableException)
        {
            return StatusCode(503, new ProblemDetails
            {
                Status = 503,
                Title = "Cart store is temporarily unavailable."
            });
        }
        catch (CartDataException)
        {
            return Problem(statusCode: 500, title: "Cart data is invalid.");
        }
    }

    [HttpPut("items/{productId:int}")]
    public async Task<IActionResult> Update(
        [Range(1, int.MaxValue)]
        int productId, UpdateCartItemRequestDto request,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();
        try
        {
            return Ok(await cartService.UpdateAsync(
                userId, productId, request.Quantity, cancellationToken));
        }
        catch (CartProductNotFoundException)
        {
            return NotFound(new ProblemDetails
            {
                Status = 404,
                Title = "Product was not found."
            });
        }
        catch (CartItemNotFoundException)
        {
            return NotFound(new ProblemDetails
            {
                Status = 404,
                Title = "Product is not in the cart."
            });
        }
        catch (CartStoreUnavailableException)
        {
            return StatusCode(503, new ProblemDetails
            {
                Status = 503,
                Title = "Cart store is temporarily unavailable."
            });
        }
        catch (CartDataException)
        {
            return Problem(statusCode: 500, title: "Cart data is invalid.");
        }
    }

    [HttpDelete("items/{productId:int}")]
    public async Task<IActionResult> Remove([Range(1, int.MaxValue)] int productId)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();
        try
        {
            await cartService.RemoveAsync(userId, productId);
            return NoContent();
        }
        catch (CartStoreUnavailableException)
        {
            return StatusCode(503, new ProblemDetails
            {
                Status = 503,
                Title = "Cart store is temporarily unavailable."
            });
        }
    }

    private bool TryGetUserId(out int userId)
    {
        var claimValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(claimValue, out userId) && userId > 0;
    }
}