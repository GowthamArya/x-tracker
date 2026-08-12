namespace XTracker.Api.DTOs;

public class TripMemberDto
{
    public int Id { get; set; }

    public int? UserId { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? Email { get; set; }

    public DateTime JoinedAt { get; set; }

    public bool IsOwner { get; set; }
}
