using System.ComponentModel.DataAnnotations;

namespace RestApi.Models.Dto;

public sealed class CreateNotificationRequestDto
{
    [Required, StringLength(80)]
    public string Type { get; init; } = string.Empty;
    [Required, StringLength(160)]
    public string Title { get; init; } = string.Empty;
    [Required, StringLength(2000)]
    public string Message { get; init; } = string.Empty;
}