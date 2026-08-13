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

public class TripDebtDto
{
    public int FromTripMemberId { get; set; }
    public string FromTripMemberName { get; set; } = string.Empty;
    public int ToTripMemberId { get; set; }
    public string ToTripMemberName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public bool IsFromCurrentUser { get; set; }
    public bool IsToCurrentUser { get; set; }
}

public class TripBalancesResponseDto
{
    public List<TripMemberBalanceDto> Balances { get; set; } = new();
    public List<TripDebtDto> Debts { get; set; } = new();
}

