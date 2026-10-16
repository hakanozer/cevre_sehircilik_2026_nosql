using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RestApi.Models;

public sealed class Notification
{
    [Key]
    public int Id { get; set; }

    [Required, StringLength(80)]
    public string Type { get; set; } = string.Empty;

    [Required, StringLength(160)]
    public string Title { get; set; } = string.Empty;

    [Required, StringLength(2000)]
    public string Message { get; set; } = string.Empty;

    [Required]
    public int UserId { get; set; }

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? ReadAtUtc { get; set; }

    [ForeignKey(nameof(UserId))]
    public User User { get; set; } = null!;
}