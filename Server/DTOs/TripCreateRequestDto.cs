namespace XTracker.Api.DTOs;

public class TripCreateRequestDto
{
    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public DateTime? StartDate { get; set; }

    public DateTime? EndDate { get; set; }
}
