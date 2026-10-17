using System;
using System.Threading;
using System.Threading.Tasks;
namespace RestApi.Services;
public sealed class DevelopmentConsoleOtpDelivery : IOtpDelivery
{
    public Task SendAsync(string email, string code, CancellationToken ct)
    {
        Console.WriteLine($"[LOCAL OTP DELIVERY] recipient={email}; code={code}");
        return Task.CompletedTask;
    }
}