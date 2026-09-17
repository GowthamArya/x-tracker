using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using XTracker.Api.Data;
using XTracker.Api.DTOs;

namespace XTracker.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class ReportsController(XTrackerDbContext context) : BaseController
{
    [HttpGet]
    public async Task<ActionResult<ReportSummaryDto>> Get([FromQuery] DateOnly from, [FromQuery] DateOnly to, [FromQuery] int? categoryId = null)
    {
        if (from > to || to.DayNumber - from.DayNumber > 3660) return BadRequest("Use a valid date range of up to ten years.");
        var start = from.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
        var end = to.AddDays(1).ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
        var query = context.Transactions.AsNoTracking().Where(x => (x.UserId == CurrentUserId || x.Account.UserId == CurrentUserId || x.Account.Members.Any(m => m.UserId == CurrentUserId)) && x.TransactionDate >= start && x.TransactionDate < end);
        if (categoryId.HasValue) query = query.Where(x => x.CategoryId == categoryId.Value);
        var rows = await query.Select(x => new { x.Id, x.Title, x.Amount, x.Type, x.TransactionDate, Category = x.Category.Name }).OrderBy(x => x.TransactionDate).ToListAsync();

        ReportBucketDto Bucket(IEnumerable<dynamic> items, DateOnly date) => new() { Date = date, Income = items.Where(x => x.Type == "income").Sum(x => (decimal?)x.Amount) ?? 0, Expenses = items.Where(x => x.Type == "expense").Sum(x => (decimal?)x.Amount) ?? 0, TransactionCount = items.Count() };
        var expenses = rows.Where(x => x.Type == "expense").ToList();
        var totalIncome = rows.Where(x => x.Type == "income").Sum(x => x.Amount);
        var totalExpenses = expenses.Sum(x => x.Amount);
        var daily = rows.GroupBy(x => DateOnly.FromDateTime(x.TransactionDate)).Select(g => Bucket(g, g.Key)).ToList();
        var weekly = rows.GroupBy(x => { var d = DateOnly.FromDateTime(x.TransactionDate); return d.AddDays(-((int)d.DayOfWeek + 6) % 7); }).Select(g => Bucket(g, g.Key)).ToList();
        var monthly = rows.GroupBy(x => { var d = DateOnly.FromDateTime(x.TransactionDate); return new DateOnly(d.Year, d.Month, 1); }).Select(g => Bucket(g, g.Key)).ToList();
        var categories = expenses.GroupBy(x => x.Category).Select(g => new ReportCategoryDto { Category = g.Key, Amount = g.Sum(x => x.Amount), Percentage = totalExpenses == 0 ? 0 : decimal.Round(g.Sum(x => x.Amount) * 100 / totalExpenses, 1) }).OrderByDescending(x => x.Amount).ToList();
        // TripExpenses intentionally remain excluded: they have no transaction link, so combining them could double-count activity. Settlements are trip-only records.
        return Ok(new ReportSummaryDto { From = from, To = to, TotalIncome = totalIncome, TotalExpenses = totalExpenses, Balance = totalIncome - totalExpenses, ExpenseCount = expenses.Count, AverageExpense = expenses.Count == 0 ? 0 : decimal.Round(totalExpenses / expenses.Count, 2), DailyTotals = daily, WeeklyTotals = weekly, MonthlyTotals = monthly, ExpenseCategories = categories, Transactions = rows.Select(x => new ReportTransactionDto { Id = x.Id, Title = x.Title, Amount = x.Amount, Type = x.Type, Date = DateOnly.FromDateTime(x.TransactionDate), Category = x.Category }).ToList() });
    }
}
