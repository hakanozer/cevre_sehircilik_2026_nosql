using System.Threading;
using System.Threading.Tasks;
using RestApi.Models.Dto;

namespace RestApi.Services;

public interface ICartService
{
    Task<CartResponseDto> GetAsync(int userId, CancellationToken cancellationToken);
    Task<CartResponseDto> AddAsync(int userId, int productId, int quantity, CancellationToken cancellationToken);
    Task<CartResponseDto> UpdateAsync(int userId, int productId, int quantity, CancellationToken cancellationToken);
    Task RemoveAsync(int userId, int productId);
}