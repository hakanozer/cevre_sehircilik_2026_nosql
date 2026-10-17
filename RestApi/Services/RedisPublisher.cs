using StackExchange.Redis;
using Microsoft.Extensions.Logging;

namespace RestApi.Services;

public class RedisPublisher : IRedisPublisher
{
    private readonly IConnectionMultiplexer _redis;
    private readonly ILogger<RedisPublisher> _logger;

    // IConnectionMultiplexer DI tarafından Singleton olarak enjekte edilir.
    public RedisPublisher(IConnectionMultiplexer redis, ILogger<RedisPublisher> logger)
    {
        _redis = redis ?? throw new ArgumentNullException(nameof(redis));
        _logger = logger;
    }

    public async Task PublishOrderAsync(string channel, string message, CancellationToken cancellationToken = default)
    {
        try
        {
            // GetSubscriber() hafif bir işlemdir, her çağrıda yeni bağlantı açmaz.
            var subscriber = _redis.GetSubscriber();
            
            // RedisChannel ve RedisValue struct'ları, StackExchange.Redis'in optimize edilmiş tipleridir.
            var redisChannel = new RedisChannel(channel, RedisChannel.PatternMode.Literal);
            var redisMessage = new RedisValue(message);

            await subscriber.PublishAsync(redisChannel, redisMessage, CommandFlags.FireAndForget);
            
            _logger.LogInformation("Mesaj başarıyla yayınlandı: {Channel}", channel);
        }
        catch (RedisConnectionException ex)
        {
            _logger.LogError(ex, "Redis bağlantı hatası. Mesaj yayınlanamadı.");
            throw; // Controller katmanında yakalanıp uygun HTTP yanıtı verilebilmesi için fırlatıyoruz.
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Mesaj yayınlanırken beklenmeyen bir hata oluştu.");
            throw;
        }
    }
}