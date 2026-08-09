namespace XTracker.Api.DTOs;

public class CategoryRequestDto
{
    public int UserId { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Type { get; set; } = string.Empty;
}