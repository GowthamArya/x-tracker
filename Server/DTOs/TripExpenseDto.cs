namespace XTracker.Api.DTOs;

public class TripExpenseDto
{
    public int Id { get; set; }

    public int TripId { get; set; }

    public int? CategoryId { get; set; }

    public int PaidByTripMemberId { get; set; }

    public int AddedByUserId { get; set; }

    public string Description { get; set; } = string.Empty;

    public decimal Amount { get; set; }

    public DateTime ExpenseDate { get; set; }

    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; }
}
