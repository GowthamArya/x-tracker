namespace XTracker.Api.DTOs;

public class AccountInviteDto
{
    public int Id { get; set; }
    public int AccountId { get; set; }
    public string Token { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public bool IsActive { get; set; }
    public string? AccountName { get; set; }
}
