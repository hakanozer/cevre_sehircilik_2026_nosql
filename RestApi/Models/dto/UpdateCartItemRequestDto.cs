using System.ComponentModel.DataAnnotations;

namespace RestApi.Models.Dto;

public sealed class UpdateCartItemRequestDto
{
    [Range(1, 99)]
    public int Quantity { get; init; }
}