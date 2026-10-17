namespace RestApi.Services;

public interface IRedisPublisher
{
    Task PublishOrderAsync(string channel, string message, CancellationToken cancellationToken = default);
}