namespace XTracker.Api.DTOs;

public class TripDto
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public DateTime? StartDate { get; set; }

    public DateTime? EndDate { get; set; }

    public int CreatedByUserId { get; set; }

    public DateTime CreatedAt { get; set; }

    public int MemberCount { get; set; }

    public int ExpenseCount { get; set; }

    public decimal TotalPaid { get; set; }

    public decimal YourShare { get; set; }
}
