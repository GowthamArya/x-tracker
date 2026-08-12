using System.ComponentModel.DataAnnotations;

namespace XTracker.Api.Models;

public class TripMember
{
    public int Id { get; set; }

    public int TripId { get; set; }

    public int? UserId { get; set; }

    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(255)]
    public string? Email { get; set; }

    public DateTime JoinedAt { get; set; }

    public bool IsOwner { get; set; }

    // Navigation
    public virtual Trip Trip { get; set; } = null!;
}
