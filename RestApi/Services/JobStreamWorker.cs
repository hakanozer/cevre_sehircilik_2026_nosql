using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;

namespace RestApi.Services;

public sealed class JobStreamWorker(
    IConnectionMultiplexer multiplexer, ILogger<JobStreamWorker> logger)
    : BackgroundService
{
    private readonly IDatabase _db = multiplexer.GetDatabase();
    private readonly string _consumer = $"{Environment.MachineName}-{Guid.NewGuid():N}";

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var groupReady = false;

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                if (!groupReady)
                {
                    try
                    {
                        await _db.StreamCreateConsumerGroupAsync(
                            JobStreamKeys.Stream, JobStreamKeys.Group, "0-0", true);
                    }
                    catch (RedisServerException ex) when (ex.Message.Contains("BUSYGROUP")) { }
                    groupReady = true;
                }

                var entries = await _db.StreamReadGroupAsync(
                    JobStreamKeys.Stream, JobStreamKeys.Group, _consumer, ">", 10);

                foreach (var entry in entries)
                {
                    stoppingToken.ThrowIfCancellationRequested();
                    
                    var type = entry.Values.FirstOrDefault(v => v.Name == "type").Value;
                    var payload = entry.Values.FirstOrDefault(v => v.Name == "payload").Value;

                    if (type == "echo")
                    {
                        // tread sleep
                        Thread.Sleep(1000);
                        logger.LogInformation("Processed demo job {JobId}; payload length {PayloadLength}",
                            entry.Id, payload.ToString().Length);
                        
                        await _db.StreamAcknowledgeAsync(
                            JobStreamKeys.Stream, JobStreamKeys.Group, entry.Id);
                    }
                    else 
                    {
                        logger.LogError("Unsupported job type {JobType}, message {JobId} left pending",
                            type.ToString(), entry.Id);
                    }
                }

                if (entries.Length == 0)
                    await Task.Delay(TimeSpan.FromSeconds(1), stoppingToken);
            }
            catch (RedisException ex)
            {
                groupReady = false;
                logger.LogError(ex, "Redis stream unavailable; worker will retry.");
                await Task.Delay(TimeSpan.FromSeconds(2), stoppingToken);
            }
        }
    }
}