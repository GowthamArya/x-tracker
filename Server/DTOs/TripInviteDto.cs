namespace XTracker.Api.DTOs;

public class TripInviteDto
{
    public int Id { get; set; }

    public int TripId { get; set; }

    public string Token { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public DateTime? ExpiresAt { get; set; }

    public bool IsActive { get; set; }

    // Optional, non-sensitive trip information for invite previews
    public string? TripName { get; set; }
}
