using System.ComponentModel.DataAnnotations;
using RestApi.CustomValids;
namespace RestApi.Models.Dto;
public sealed class OtpVerifyDto
{
    [Required, SixDigitCode]
    public string Code { get; init; } = string.Empty;
}