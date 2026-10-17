using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;
namespace RestApi.CustomValids;
public sealed class SixDigitCodeAttribute : ValidationAttribute
{
    public override bool IsValid(object? value) =>
        value is string code && Regex.IsMatch(code, "^[0-9]{6}$");
}