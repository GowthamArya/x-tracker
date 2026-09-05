using System.ComponentModel.DataAnnotations;

namespace XTracker.Api.Models;

public class SupportMessage
{
    public long Id { get; set; }
    public int? UserId { get; set; }
    [Required, MaxLength(200)] public string Name { get; set; } = string.Empty;
    [Required, EmailAddress, MaxLength(255)] public string Email { get; set; } = string.Empty;
    [Required, MaxLength(2000)] public string Message { get; set; } = string.Empty;
    [MaxLength(100)] public string? Subject { get; set; }
    [MaxLength(100)] public string? Source { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsResolved { get; set; }
    public User? User { get; set; }
}
