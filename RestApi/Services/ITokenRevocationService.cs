using System;
using System.Threading.Tasks;

namespace RestApi.Services;

public interface ITokenRevocationService
{
    Task RevokeAsync(string jti, DateTime expiresUtc);
    Task<bool> IsRevokedAsync(string jti);
}