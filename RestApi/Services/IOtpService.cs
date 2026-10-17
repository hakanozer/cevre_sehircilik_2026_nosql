using System.Threading;
using System.Threading.Tasks;
namespace RestApi.Services;
public interface IOtpService
{
    Task IssueAsync(int userId, string email, CancellationToken ct);
    Task<bool> VerifyAsync(int userId, string code, CancellationToken ct);
}