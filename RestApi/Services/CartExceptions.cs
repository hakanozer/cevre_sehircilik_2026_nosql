using System;

namespace RestApi.Services;

public sealed class CartProductNotFoundException(int productId)
    : Exception($"Product {productId} was not found.")
{
}

public sealed class CartItemNotFoundException(int productId)
    : Exception($"Product {productId} is not in the cart.")
{
}

public sealed class CartQuantityLimitException()
    : Exception("The maximum quantity for this product has been reached.")
{
}

public sealed class CartStoreUnavailableException(Exception innerException)
    : Exception("The cart store is unavailable.", innerException)
{
}

public sealed class CartDataException(string message)
    : Exception(message)
{
}