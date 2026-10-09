using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RestApi.Data;
using RestApi.Models;

using System.Linq;

using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;

namespace RestApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Product")]
    public class ProductController : ControllerBase
    {
        private const string ProductsCacheKey = "products:all";

        // Redis Connection
        private readonly IConnectionMultiplexer _redis;
        private readonly ApplicationDbContext _context;

        public ProductController(ApplicationDbContext context, IConnectionMultiplexer redis)
        {
            _context = context;
            _redis = redis;
        }

        [HttpPost]
        public IActionResult Create(Product product)
        {
            // redis cache temizleme
            var redisDb = _redis.GetDatabase();
            redisDb.KeyDelete(ProductsCacheKey);

            _context.Products.Add(product);
            _context.SaveChanges();
            return Ok(product);
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, Product product)
        {
            var existingProduct = _context.Products.Find(id);
            if (existingProduct == null)
            {
                return NotFound();
            }
            existingProduct.Name = product.Name;
            existingProduct.Price = product.Price;
            _context.SaveChanges();
            return Ok(existingProduct);
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var product = _context.Products.Find(id);
            if (product == null)
            {
                return NotFound();
            }
            _context.Products.Remove(product);
            _context.SaveChanges();
            return Ok();
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var redisDb = _redis.GetDatabase();

            // 1. Önce Redis cache kontrol edilir.
            var cachedProducts = await redisDb.StringGetAsync(ProductsCacheKey);

            if (cachedProducts.HasValue)
            {
                var productsFromCache =
                    JsonSerializer.Deserialize<List<Product>>(
                        cachedProducts.ToString());

                if (productsFromCache != null)
                {
                    return Ok(productsFromCache);
                }
            }

            // 2. Cache yoksa veritabanından okunur.
            var products = await _context.Products
                .AsNoTracking()
                .ToListAsync();

            // 3. Sonuç Redis'e yazılır.
            var serializedProducts = JsonSerializer.Serialize(products);

            await redisDb.StringSetAsync(
                ProductsCacheKey,
                serializedProducts,
                expiry: TimeSpan.FromMinutes(10));

            // 4. API yanıtı döndürülür.
            return Ok(products);
        }


    }
}