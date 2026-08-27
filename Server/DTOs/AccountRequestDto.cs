namespace XTracker.Api.DTOs;

public class AccountRequestDto
{
    public string Name { get; set; } = string.Empty;

    public decimal OpeningBalance { get; set; }
    public string AccountType { get; set; } = "personal";
}
