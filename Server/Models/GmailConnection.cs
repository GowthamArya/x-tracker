using System.ComponentModel.DataAnnotations;

namespace XTracker.Api.Models;

public class GmailConnection
{
    public long Id { get; set; }
    public int UserId { get; set; }
    [Required, MaxLength(255)] public string GmailAddress { get; set; } = string.Empty;
    [Required] public string RefreshTokenEncrypted { get; set; } = string.Empty;
    [MaxLength(200)] public string? LastHistoryId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? LastSyncedAt { get; set; }
    public DateTime? WatchExpiresAt { get; set; }
    [MaxLength(500)] public string? LastError { get; set; }
    public User User { get; set; } = null!;
    public ICollection<GmailImportedEmail> ImportedEmails { get; set; } = new List<GmailImportedEmail>();
}
