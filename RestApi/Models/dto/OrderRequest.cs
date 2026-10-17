using System.ComponentModel.DataAnnotations;

namespace RestApi.Models.Dto;

public record OrderRequest(
    [Required(ErrorMessage = "Sipariş ID zorunludur.")]
    [StringLength(20, MinimumLength = 3, ErrorMessage = "Sipariş ID 3-20 karakter olmalıdır.")]
    string OrderId,

    [Required(ErrorMessage = "Müşteri adı zorunludur.")]
    [StringLength(100)]
    string CustomerName,

    [Required(ErrorMessage = "Ürün adı zorunludur.")]
    string ProductName,

    [Range(1, 1000, ErrorMessage = "Miktar 1 ile 1000 arasında olmalıdır.")]
    int Quantity
);