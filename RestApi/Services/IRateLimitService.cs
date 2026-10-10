using System;
using System.Threading.Tasks;
using RestApi.Models.Dto;

namespace RestApi.Services;

public interface IRateLimitService
{
    Task<RateLimitResultDto> CheckAsync(
        string partitionKey, string operation, long limit, TimeSpan window);
}