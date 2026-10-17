using System.Threading;
using System.Threading.Tasks;
using RestApi.Models.Dto;

namespace RestApi.Services;

public interface IJobQueue
{
    Task<string> EnqueueAsync(int userId, QueueJobDto job, CancellationToken ct);
}