using System.Threading;
using System.Threading.Tasks;
namespace RestApi.Services;
public interface IOtpDelivery
{
    Task SendAsync(string email, string code, CancellationToken ct);
}