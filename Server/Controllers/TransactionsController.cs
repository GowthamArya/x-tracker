using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using XTracker.Api.Data;
using XTracker.Api.DTOs;
using XTracker.Api.Models;
using XTracker.Api.Services;

namespace XTracker.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TransactionsController : BaseController
{
    private readonly XTrackerDbContext _context;
    private readonly AppCache _cache;

    public TransactionsController(XTrackerDbContext context, AppCache cache)
    {
        _context = context;
        _cache = cache;
    }

    // GET: api/Transactions
    [HttpGet]
    public async Task<ActionResult<List<TransactionDto>>> GetTransactions()
    {
        var transactions = await _cache.GetOrCreateAsync(_cache.Key(CurrentUserId, "transactions"), _ => _context.Transactions
            .AsNoTracking()
            .Where(x => x.UserId == CurrentUserId || x.Account.UserId == CurrentUserId || x.Account.Members.Any(m => m.UserId == CurrentUserId))
            .OrderByDescending(x => x.TransactionDate)
            .Select(x => new TransactionDto
            {
                Id = x.Id,
                UserId = x.UserId,
                AccountId = x.AccountId,
                CategoryId = x.CategoryId,
                Title = x.Title,
                Amount = x.Amount,
                Type = x.Type,
                TransactionDate = x.TransactionDate,
                Notes = x.Notes,
                AccountName = x.Account.Name,
                CategoryName = x.Category.Name,
                AddedByName = x.User.Name,
                IsJointAccount = x.Account.AccountType == "joint"
            })
            .ToListAsync(), TimeSpan.FromSeconds(20));

        return Ok(transactions);
    }

    // GET: api/Transactions/1
    [HttpGet("{id:long}")]
    public async Task<ActionResult<TransactionDto>> GetTransaction(long id)
    {
        var transaction = await _context.Transactions
            .AsNoTracking()
            .Where(x => x.Id == id && (x.UserId == CurrentUserId || x.Account.UserId == CurrentUserId || x.Account.Members.Any(m => m.UserId == CurrentUserId)))
            .Select(x => new TransactionDto
            {
                Id = x.Id,
                UserId = x.UserId,
                AccountId = x.AccountId,
                CategoryId = x.CategoryId,
                Title = x.Title,
                Amount = x.Amount,
                Type = x.Type,
                TransactionDate = x.TransactionDate,
                Notes = x.Notes,
                AccountName = x.Account.Name,
                CategoryName = x.Category.Name,
                AddedByName = x.User.Name,
                IsJointAccount = x.Account.AccountType == "joint"
            })
            .FirstOrDefaultAsync();

        if (transaction is null)
        {
            return NotFound();
        }

        return Ok(transaction);
    }

    // POST: api/Transactions
    [HttpPost]
    public async Task<ActionResult<TransactionDto>> CreateTransaction(
        TransactionRequestDto request)
    {
        if (!await CanAccessAccount(request.AccountId))
        {
            return Forbid();
        }

        var transaction = new Transaction
        {
            UserId = CurrentUserId,
            AccountId = request.AccountId,
            CategoryId = request.CategoryId,
            Title = request.Title.Trim(),
            Amount = request.Amount,
            Type = request.Type,
            TransactionDate = request.TransactionDate,
            Notes = request.Notes?.Trim(),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Transactions.Add(transaction);

        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetTransaction),
            new { id = transaction.Id },
            await GetTransactionDto(transaction.Id)
        );
    }

    // PUT: api/Transactions/1
    [HttpPut("{id:long}")]
    public async Task<ActionResult<TransactionDto>> UpdateTransaction(
        long id,
        TransactionRequestDto request)
    {
        var transaction = await _context.Transactions
            .FirstOrDefaultAsync(x => x.Id == id && (x.UserId == CurrentUserId || x.Account.UserId == CurrentUserId || x.Account.Members.Any(m => m.UserId == CurrentUserId)));

        if (transaction is null)
        {
            return NotFound();
        }

        if (!await CanAccessAccount(request.AccountId))
        {
            return Forbid();
        }
        
        transaction.UserId = CurrentUserId;
        transaction.AccountId = request.AccountId;
        transaction.CategoryId = request.CategoryId;
        transaction.Title = request.Title.Trim();
        transaction.Amount = request.Amount;
        transaction.Type = request.Type;
        transaction.TransactionDate = request.TransactionDate;
        transaction.Notes = request.Notes?.Trim();
        transaction.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(
            await GetTransactionDto(transaction.Id)
        );
    }

    // DELETE: api/Transactions/1
    [HttpDelete("{id:long}")]
    public async Task<IActionResult> DeleteTransaction(long id)
    {
        var transaction = await _context.Transactions
            .FirstOrDefaultAsync(x => x.Id == id && (x.UserId == CurrentUserId || x.Account.UserId == CurrentUserId || x.Account.Members.Any(m => m.UserId == CurrentUserId)));

        if (transaction is null)
        {
            return NotFound();
        }

        _context.Transactions.Remove(transaction);

        await _context.SaveChangesAsync();

        return NoContent();
    }

    private async Task<TransactionDto?> GetTransactionDto(
        long id)
    {
        return await _context.Transactions
            .AsNoTracking()
            .Where(x => x.Id == id && (x.UserId == CurrentUserId || x.Account.UserId == CurrentUserId || x.Account.Members.Any(m => m.UserId == CurrentUserId)))
            .Select(x => new TransactionDto
            {
                Id = x.Id,
                UserId = x.UserId,
                AccountId = x.AccountId,
                CategoryId = x.CategoryId,
                Title = x.Title,
                Amount = x.Amount,
                Type = x.Type,
                TransactionDate = x.TransactionDate,
                Notes = x.Notes,
                AccountName = x.Account.Name,
                CategoryName = x.Category.Name,
                AddedByName = x.User.Name,
                IsJointAccount = x.Account.AccountType == "joint"
            })
            .FirstOrDefaultAsync();
    }

    private Task<bool> CanAccessAccount(int accountId)
    {
        return _context.Accounts.AnyAsync(a => a.Id == accountId &&
            (a.UserId == CurrentUserId || a.Members.Any(m => m.UserId == CurrentUserId)));
    }
}
