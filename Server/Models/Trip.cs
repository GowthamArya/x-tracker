using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace XTracker.Api.Models;

public class Trip
{
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Description { get; set; }

    public DateTime? StartDate { get; set; }

    public DateTime? EndDate { get; set; }

    public int CreatedByUserId { get; set; }

    public DateTime CreatedAt { get; set; }

    public bool IsActive { get; set; } = true;

    // Navigation
    public virtual ICollection<TripMember> Members { get; set; } = new List<TripMember>();

    public virtual ICollection<TripExpense> Expenses { get; set; } = new List<TripExpense>();

    public virtual ICollection<TripInvite> Invites { get; set; } = new List<TripInvite>();
}
