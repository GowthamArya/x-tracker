namespace XTracker.Api.DTOs;

public class TripMemberBalanceDto
{
    public int TripMemberId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal TotalPaid { get; set; }
    public decimal TotalShare { get; set; }
    public decimal Balance { get; set; }
    public bool IsCurrentUser { get; set; }
}
