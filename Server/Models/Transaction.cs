using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace XTracker.Api.Models;

public class Transaction
{
    public long Id { get; set; }

    public int UserId { get; set; }

    public int AccountId { get; set; }

    public int CategoryId { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    [Required]
    [MaxLength(10)]
    public string Type { get; set; } = string.Empty;

    public DateTime TransactionDate { get; set; }

    [MaxLength(1000)]
    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public virtual User User { get; set; } = null!;

    public virtual Account Account { get; set; } = null!;

    public virtual Category Category { get; set; } = null!;
}