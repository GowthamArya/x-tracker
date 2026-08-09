namespace XTracker.Api.DTOs;

public class TransactionDto
{
    public long Id { get; set; }

    public int UserId { get; set; }

    public int AccountId { get; set; }

    public int CategoryId { get; set; }

    public string Title { get; set; } = string.Empty;

    public decimal Amount { get; set; }

    public string Type { get; set; } = string.Empty;

    public DateTime TransactionDate { get; set; }

    public string? Notes { get; set; }

    public string AccountName { get; set; } = string.Empty;

    public string CategoryName { get; set; } = string.Empty;
}