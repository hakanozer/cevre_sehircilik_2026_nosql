using System;
using System.Collections.Generic;

namespace RestApi.Models.Dto;

public sealed class CartItemResponseDto
{
    public int ProductId { get; init; }
    public int Quantity { get; init; }
    public decimal UnitPrice { get; init; }
    public decimal LineTotal { get; init; }
}

public sealed class CartResponseDto
{
    public IReadOnlyList<CartItemResponseDto> Items { get; init; } =
        Array.Empty<CartItemResponseDto>();

    public decimal Total { get; init; }
}