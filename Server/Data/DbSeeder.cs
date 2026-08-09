using XTracker.Api.Models;

namespace XTracker.Api.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(XTrackerDbContext context)
    {
        // Don't seed again if data already exists
        if (context.Users.Any())
        {
            return;
        }

        var user = new User
        {
            Name = "XTracker Demo User",
            Email = "demo@xtracker.local",
            CreatedAt = DateTime.UtcNow
        };

        context.Users.Add(user);

        var personalAccount = new Account
        {
            User = user,
            Name = "Personal",
            OpeningBalance = 0,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var jointAccount = new Account
        {
            User = user,
            Name = "Joint",
            OpeningBalance = 0,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        context.Accounts.AddRange(
            personalAccount,
            jointAccount
        );

        var salaryCategory = new Category
        {
            User = user,
            Name = "Salary",
            Type = "income",
            CreatedAt = DateTime.UtcNow
        };

        var foodCategory = new Category
        {
            User = user,
            Name = "Food",
            Type = "expense",
            CreatedAt = DateTime.UtcNow
        };

        var transportCategory = new Category
        {
            User = user,
            Name = "Transport",
            Type = "expense",
            CreatedAt = DateTime.UtcNow
        };

        var billsCategory = new Category
        {
            User = user,
            Name = "Bills",
            Type = "expense",
            CreatedAt = DateTime.UtcNow
        };

        var groceriesCategory = new Category
        {
            User = user,
            Name = "Groceries",
            Type = "expense",
            CreatedAt = DateTime.UtcNow
        };

        context.Categories.AddRange(
            salaryCategory,
            foodCategory,
            transportCategory,
            billsCategory,
            groceriesCategory
        );

        context.Transactions.AddRange(
            new Transaction
            {
                User = user,
                Account = personalAccount,
                Category = salaryCategory,
                Title = "Salary",
                Amount = 60000,
                Type = "income",
                TransactionDate = new DateTime(2026, 8, 1),
                Notes = "Monthly salary",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Transaction
            {
                User = user,
                Account = personalAccount,
                Category = foodCategory,
                Title = "Lunch",
                Amount = 250,
                Type = "expense",
                TransactionDate = new DateTime(2026, 8, 8),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Transaction
            {
                User = user,
                Account = personalAccount,
                Category = transportCategory,
                Title = "Uber",
                Amount = 180,
                Type = "expense",
                TransactionDate = new DateTime(2026, 8, 7),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Transaction
            {
                User = user,
                Account = jointAccount,
                Category = billsCategory,
                Title = "Electricity Bill",
                Amount = 1200,
                Type = "expense",
                TransactionDate = new DateTime(2026, 8, 5),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Transaction
            {
                User = user,
                Account = jointAccount,
                Category = groceriesCategory,
                Title = "Grocery Shopping",
                Amount = 2500,
                Type = "expense",
                TransactionDate = new DateTime(2026, 8, 4),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            }
        );

        await context.SaveChangesAsync();
    }
}