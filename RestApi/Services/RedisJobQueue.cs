using System.Threading;
using System.Threading.Tasks;
using RestApi.Models.Dto;
using StackExchange.Redis;

namespace RestApi.Services;

public sealed class RedisJobQueue(IConnectionMultiplexer multiplexer) : IJobQueue
{
    private readonly IDatabase _db = multiplexer.GetDatabase();

    public async Task<string> EnqueueAsync(int userId, QueueJobDto job, CancellationToken ct)
    {
        ct.ThrowIfCancellationRequested();
        
        var id = await _db.StreamAddAsync(JobStreamKeys.Stream, new[]
        {
            new NameValueEntry("ownerId", userId),
            new NameValueEntry("type", job.Type),
            new NameValueEntry("payload", job.Payload)
        });
        
        return id.ToString();
    }
}