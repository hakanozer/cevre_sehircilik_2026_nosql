using System.ComponentModel.DataAnnotations;

namespace RestApi.Models.Dto;

public sealed class AddCartItemRequestDto
{
    [Range(1, int.MaxValue)]
    public int ProductId { get; init; }

    [Range(1, 99)]
    public int Quantity { get; init; }
}