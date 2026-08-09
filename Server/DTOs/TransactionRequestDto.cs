namespace XTracker.Api.DTOs;

public class TransactionRequestDto
{
    public int UserId { get; set; }

    public int AccountId { get; set; }

    public int CategoryId { get; set; }

    public string Title { get; set; } = string.Empty;

    public decimal Amount { get; set; }

    public string Type { get; set; } = string.Empty;

    public DateTime TransactionDate { get; set; }

    public string? Notes { get; set; }
}