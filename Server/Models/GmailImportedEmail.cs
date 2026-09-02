using System.ComponentModel.DataAnnotations;

namespace XTracker.Api.Models;

public class GmailImportedEmail
{
    public long Id { get; set; }
    public long GmailConnectionId { get; set; }
    public int UserId { get; set; }
    [Required, MaxLength(200)] public string GmailMessageId { get; set; } = string.Empty;
    [MaxLength(255)] public string? Sender { get; set; }
    [MaxLength(500)] public string? Subject { get; set; }
    [MaxLength(200)] public string Title { get; set; } = string.Empty;
    [MaxLength(200)] public string? Payee { get; set; }
    public bool IsUpi { get; set; }
    public decimal? Amount { get; set; }
    [MaxLength(10)] public string? Type { get; set; }
    public DateTime? TransactionDate { get; set; }
    [MaxLength(1000)] public string? Preview { get; set; }
    [MaxLength(30)] public string Status { get; set; } = "review";
    public decimal Confidence { get; set; }
    public long? TransactionId { get; set; }
    public DateTime ReceivedAt { get; set; }
    public GmailConnection GmailConnection { get; set; } = null!;
    public User User { get; set; } = null!;
}
