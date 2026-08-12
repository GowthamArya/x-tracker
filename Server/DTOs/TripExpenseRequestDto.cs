namespace XTracker.Api.DTOs;

public class TripExpenseRequestDto
{
    public int? CategoryId { get; set; }

    public int PaidByTripMemberId { get; set; }

    public int AddedByUserId { get; set; }

    public string Description { get; set; } = string.Empty;

    public decimal Amount { get; set; }

    public DateTime ExpenseDate { get; set; }

    public string? Notes { get; set; }

    // Participant trip member ids
    public int[] ParticipantTripMemberIds { get; set; } = Array.Empty<int>();
}
