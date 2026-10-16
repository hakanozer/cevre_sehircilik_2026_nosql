using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using RestApi.Models.Dto;

namespace RestApi.Services;

public interface INotificationService
{
    Task<NotificationResponseDto> CreateAsync(
        int userId, CreateNotificationRequestDto request, CancellationToken ct);
    Task<IReadOnlyList<NotificationResponseDto>> GetRecentAsync(
        int userId, int count, CancellationToken ct);
    Task<bool> MarkReadAsync(int userId, int notificationId, CancellationToken ct);
}