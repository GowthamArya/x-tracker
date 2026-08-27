using System.ComponentModel.DataAnnotations;

namespace XTracker.Api.Models;

public class User
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    public string GoogleId { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    // Navigation properties
    public virtual ICollection<Account> Accounts { get; set; }
        = new List<Account>();

    public virtual ICollection<AccountMember> AccountMemberships { get; set; }
        = new List<AccountMember>();

    public virtual ICollection<Category> Categories { get; set; }
        = new List<Category>();

    public virtual ICollection<Transaction> Transactions { get; set; }
        = new List<Transaction>();
}
