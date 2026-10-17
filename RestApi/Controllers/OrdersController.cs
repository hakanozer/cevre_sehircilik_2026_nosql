using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using RestApi.Models.Dto;
using RestApi.Services;

namespace RestApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly IRedisPublisher _redisPublisher;
    private readonly IConfiguration _configuration;
    private readonly ILogger<OrdersController> _logger;

    public OrdersController(
        IRedisPublisher redisPublisher, 
        IConfiguration configuration,
        ILogger<OrdersController> logger)
    {
        _redisPublisher = redisPublisher;
        _configuration = configuration;
        _logger = logger;
    }

    [HttpPost]
    public async Task<IActionResult> CreateOrder([FromBody] OrderRequest request, CancellationToken cancellationToken)
    {
        // 1. Model doğrulaması otomatiktir, ancak ek kontroller burada yapılabilir.
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            // 2. Veriyi JSON'a çevir
            var message = JsonSerializer.Serialize(request);
            var channel = _configuration.GetSection("Redis").GetValue<string>("ChannelName") ?? "order-events";

            // 3. Redis'e yayınla
            await _redisPublisher.PublishOrderAsync(channel, message, cancellationToken);

            // 4. Fire-and-Forget mantığıyla, işlemin tamamlanmasını beklemeden 202 Accepted dönüyoruz.
            // Not: Bu yanıt, verinin veritabanına kaydedildiği anlamına GELMEZ. 
            // Sadece mesajın kuyruğa (kanala) başarıyla bırakıldığını belirtir.
            return Accepted(new 
            { 
                message = "Sipariş işleme alındı ve mesaj kuyruğuna iletildi.", 
                orderId = request.OrderId 
            });
        }
        catch (StackExchange.Redis.RedisConnectionException)
        {
            _logger.LogError("Redis bağlantısı kurulamadı.");
            return StatusCode(503, "Mesajlaşma altyapısı şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Sipariş oluşturma sırasında beklenmeyen hata.");
            return StatusCode(500, "Sunucu hatası oluştu.");
        }
    }
}