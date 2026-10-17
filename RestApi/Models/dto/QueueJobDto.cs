using System.ComponentModel.DataAnnotations;

namespace RestApi.Models.Dto;

public sealed class QueueJobDto
{
    [Required, RegularExpression("^[a-z0-9-]{1,40}$")]
    public string Type { get; init; } = string.Empty;

    [Required, StringLength(1000)]
    public string Payload { get; init; } = string.Empty;
}