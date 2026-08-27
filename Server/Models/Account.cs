using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace XTracker.Api.Models;

public class Account
{
    public int Id { get; set; }

    public int UserId { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    public string AccountType { get; set; } = "personal";

    [Column(TypeName = "decimal(18,2)")]
    public decimal OpeningBalance { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public virtual User User { get; set; } = null!;

    public virtual ICollection<Transaction> Transactions { get; set; }
        = new List<Transaction>();

    public virtual ICollection<AccountMember> Members { get; set; }
        = new List<AccountMember>();
}

public class CreateAccountRequest
{
    public string Name { get; set; } = string.Empty;
    public decimal OpeningBalance { get; set; } = 0;
    public string AccountType { get; set; } = "personal";
}
