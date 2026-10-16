using System;

namespace RestApi.Models.Dto;

public sealed record NotificationResponseDto(
    int Id, string Type, string Title, string Message,
    DateTime CreatedAtUtc, DateTime? ReadAtUtc);