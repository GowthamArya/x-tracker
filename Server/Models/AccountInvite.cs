using System.ComponentModel.DataAnnotations;

namespace XTracker.Api.Models;

public class AccountInvite
{
    public int Id { get; set; }
    public int AccountId { get; set; }

    [Required, MaxLength(128)]
    public string Token { get; set; } = string.Empty;

    public int CreatedByUserId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public bool IsActive { get; set; } = true;

    public virtual Account Account { get; set; } = null!;
}
