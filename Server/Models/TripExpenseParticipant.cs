namespace XTracker.Api.Models;

public class TripExpenseParticipant
{
    public int Id { get; set; }

    public int TripExpenseId { get; set; }

    public int TripMemberId { get; set; }

    // Optional explicit share amount for future features
    public decimal? ShareAmount { get; set; }

    // Navigation
    public virtual TripExpense TripExpense { get; set; } = null!;

    public virtual TripMember TripMember { get; set; } = null!;
}
