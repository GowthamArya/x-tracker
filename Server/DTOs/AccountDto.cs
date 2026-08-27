namespace XTracker.Api.DTOs;

public class AccountDto
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public string Name { get; set; } = string.Empty;
    public string AccountType { get; set; } = "personal";

    public decimal OpeningBalance { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }
    public int MemberCount { get; set; }
    public bool IsOwner { get; set; }
}
