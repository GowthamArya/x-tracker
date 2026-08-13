namespace XTracker.Api.DTOs;

public class ParticipantShareRequestDto
{
    public int TripMemberId { get; set; }
    public decimal? ShareAmount { get; set; }
}

public class TripExpenseRequestDto
{
    public int? CategoryId { get; set; }

    public int PaidByTripMemberId { get; set; }

    public int AddedByUserId { get; set; }

    public string Description { get; set; } = string.Empty;

    public decimal Amount { get; set; }

    public DateTime ExpenseDate { get; set; }

    public string? Notes { get; set; }

    public bool IsSettlement { get; set; }

    // Participant trip member ids (for equal splits)
    public int[] ParticipantTripMemberIds { get; set; } = Array.Empty<int>();

    // Optional explicit share breakdown (for custom splits)
    public List<ParticipantShareRequestDto>? ParticipantShares { get; set; }
}

