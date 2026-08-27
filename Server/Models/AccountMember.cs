namespace XTracker.Api.Models;

public class AccountMember
{
    public int Id { get; set; }
    public int AccountId { get; set; }
    public int UserId { get; set; }
    public bool IsOwner { get; set; }
    public DateTime JoinedAt { get; set; }

    public virtual Account Account { get; set; } = null!;
    public virtual User User { get; set; } = null!;
}
