namespace XTracker.Api.DTOs;

public class TripExpenseParticipantDto
{
    public int TripMemberId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal ShareAmount { get; set; }
}

public class TripExpenseDto
{
    public int Id { get; set; }

    public int TripId { get; set; }

    public int? CategoryId { get; set; }

    public string? CategoryName { get; set; }

    public int PaidByTripMemberId { get; set; }

    public string PaidByMemberName { get; set; } = string.Empty;

    public int AddedByUserId { get; set; }

    public string Description { get; set; } = string.Empty;

    public decimal Amount { get; set; }

    public DateTime ExpenseDate { get; set; }

    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; }

    public bool IsSettlement { get; set; }

    public List<TripExpenseParticipantDto> Participants { get; set; } = new();
}

