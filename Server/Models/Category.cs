using System.ComponentModel.DataAnnotations;

namespace XTracker.Api.Models;

public class Category
{
    public int Id { get; set; }

    public int UserId { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(10)]
    public string Type { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    // Navigation properties
    public virtual User User { get; set; } = null!;

    public virtual ICollection<Transaction> Transactions { get; set; }
        = new List<Transaction>();
}