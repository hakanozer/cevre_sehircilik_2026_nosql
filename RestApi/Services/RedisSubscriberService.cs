using StackExchange.Redis;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using RestApi.Models;
using RestApi.Models.Dto;

namespace RestApi.Services;

public class RedisSubscriberService : BackgroundService
{
    private readonly IConnectionMultiplexer _redis;
    private readonly ILogger<RedisSubscriberService> _logger;
    private readonly string _channelName;
    private ISubscriber? _subscriber;

    public RedisSubscriberService(
        IConnectionMultiplexer redis, 
        ILogger<RedisSubscriberService> logger, 
        IConfiguration configuration)
    {
        _redis = redis ?? throw new ArgumentNullException(nameof(redis));
        _logger = logger;
        _channelName = configuration["Redis:ChannelName"] ?? "order-events";
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Redis Subscriber servisi başlatılıyor. Kanal: {Channel}", _channelName);

        try
        {
            _subscriber = _redis.GetSubscriber();

            // Abonelik işlemi. Gelen mesajlar ChannelMessageQueue'ya düşer.
            await _subscriber.SubscribeAsync(new RedisChannel(_channelName, RedisChannel.PatternMode.Literal), async (channel, message) =>
            {
                await ProcessMessageAsync(message, stoppingToken);
            });

            _logger.LogInformation("Redis kanalına başarıyla abone olundu: {Channel}", _channelName);

            // BackgroundService'in sonsuz döngüye girmesini ve CancellationToken ile kontrol edilmesini sağlar.
            // Redis bağlantısı koparsa veya uygulama kapanırsa bu satırda işlem sonlanır.
            await Task.Delay(Timeout.Infinite, stoppingToken);
        }
        catch (OperationCanceledException)
        {
            _logger.LogInformation("Subscriber servisi güvenli bir şekilde durduruluyor.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Subscriber servisinde kritik hata oluştu.");
        }
        finally
        {
            // Kaynak temizliği
            if (_subscriber != null)
            {
                await _subscriber.UnsubscribeAllAsync();
                _logger.LogInformation("Tüm Redis abonelikleri sonlandırıldı.");
            }
        }
    }

    private async Task ProcessMessageAsync(RedisValue message, CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("[Redis Subscriber] Yeni mesaj alındı. İşleniyor...");
            
            // JSON Deserialization
            var order = JsonSerializer.Deserialize<OrderRequest>(message.ToString());
            
            if (order == null)
            {
                _logger.LogWarning("Boş veya geçersiz JSON mesajı alındı: {Message}", message);
                return;
            }

            // Gerçek hayatta burada veritabanına kaydetme, e-posta gönderme vb. işlemler yapılır.
            _logger.LogInformation("==========================================");
            _logger.LogInformation("Yeni Sipariş Başarıyla İşlendi!");
            _logger.LogInformation("OrderId: {OrderId}", order.OrderId);
            _logger.LogInformation("Customer: {CustomerName}", order.CustomerName);
            _logger.LogInformation("Product: {ProductName}", order.ProductName);
            _logger.LogInformation("Quantity: {Quantity}", order.Quantity);
            _logger.LogInformation("==========================================");

            await Task.CompletedTask;
        }
        catch (JsonException ex)
        {
            _logger.LogError(ex, "JSON çözümleme hatası. Bozuk mesaj: {Message}", message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Mesaj işlenirken beklenmeyen hata oluştu.");
        }
    }
}