using Microsoft.AspNetCore.Mvc;

namespace XTracker.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TransactionsController : ControllerBase
{
    [HttpGet]
    public IActionResult GetTransactions()
    {
        var transactions = new[]
        {
            new
            {
                Id = 1,
                Title = "Salary",
                Amount = 60000,
                Type = "income",
                Category = "Salary",
                Account = "Personal",
                Date = "2026-08-01"
            },
            new
            {
                Id = 2,
                Title = "Lunch",
                Amount = 250,
                Type = "expense",
                Category = "Food",
                Account = "Personal",
                Date = "2026-08-08"
            },
            new
            {
                Id = 3,
                Title = "Uber",
                Amount = 180,
                Type = "expense",
                Category = "Transport",
                Account = "Personal",
                Date = "2026-08-07"
            }
        };

        return Ok(transactions);
    }
}