using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace XTracker.Api.Models;

public class TripExpense
{
    public int Id { get; set; }

    public int TripId { get; set; }

    public int? CategoryId { get; set; }

    // TripMember who actually paid
    public int PaidByTripMemberId { get; set; }

    // User who added the expense (may be different)
    public int AddedByUserId { get; set; }

    [Required]
    [MaxLength(200)]
    public string Description { get; set; } = string.Empty;

    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    public DateTime ExpenseDate { get; set; }

    [MaxLength(1000)]
    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    // Navigation
    public virtual Trip Trip { get; set; } = null!;

    public virtual TripMember PaidBy { get; set; } = null!;

    public virtual ICollection<TripExpenseParticipant> Participants { get; set; } = new List<TripExpenseParticipant>();
}
