namespace XTracker.Api.DTOs;

public sealed class ReportSummaryDto
{
    public DateOnly From { get; set; }
    public DateOnly To { get; set; }
    public decimal TotalIncome { get; set; }
    public decimal TotalExpenses { get; set; }
    public decimal Balance { get; set; }
    public int ExpenseCount { get; set; }
    public decimal AverageExpense { get; set; }
    public List<ReportBucketDto> DailyTotals { get; set; } = [];
    public List<ReportBucketDto> WeeklyTotals { get; set; } = [];
    public List<ReportBucketDto> MonthlyTotals { get; set; } = [];
    public List<ReportCategoryDto> ExpenseCategories { get; set; } = [];
    public List<ReportTransactionDto> Transactions { get; set; } = [];
}

public sealed class ReportBucketDto { public DateOnly Date { get; set; } public decimal Income { get; set; } public decimal Expenses { get; set; } public int TransactionCount { get; set; } }
public sealed class ReportCategoryDto { public string Category { get; set; } = string.Empty; public decimal Amount { get; set; } public decimal Percentage { get; set; } }
public sealed class ReportTransactionDto { public long Id { get; set; } public string Title { get; set; } = string.Empty; public decimal Amount { get; set; } public string Type { get; set; } = string.Empty; public DateOnly Date { get; set; } public string Category { get; set; } = string.Empty; }
