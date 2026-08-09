using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using XTracker.Api.Data;
using XTracker.Api.Models;

namespace XTracker.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AccountsController : BaseController
{
    private readonly XTrackerDbContext _context;

    public AccountsController(XTrackerDbContext context)
    {
        _context = context;
    }

    // GET: api/Accounts
    [HttpGet]
    public async Task<ActionResult<List<Account>>> GetAccounts()
    {
        var accounts = await _context.Accounts
            .AsNoTracking()
            .Where(x => x.UserId == 1 || x.UserId == CurrentUserId)
            .OrderBy(x => x.Name)
            .ToListAsync();

        return Ok(accounts);
    }

    // GET: api/Accounts/1
    [HttpGet("{id:long}")]
    public async Task<ActionResult<Account>> GetAccount(long id)
    {
        var account = await _context.Accounts
            .AsNoTracking()
            .FirstOrDefaultAsync(
                x => x.Id == id &&
                     x.UserId == CurrentUserId
            );

        if (account is null)
        {
            return NotFound();
        }

        return Ok(account);
    }

    // POST: api/Accounts
    [HttpPost]
    public async Task<ActionResult<Account>> CreateAccount(
        Account request)
    {
        var account = new Account
        {
            UserId = CurrentUserId,
            Name = request.Name.Trim(),
            OpeningBalance = request.OpeningBalance
        };

        _context.Accounts.Add(account);

        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetAccount),
            new { id = account.Id },
            account
        );
    }

    // PUT: api/Accounts/1
    [HttpPut("{id:long}")]
    public async Task<ActionResult<Account>> UpdateAccount(
        long id,
        Account request)
    {
        var account = await _context.Accounts
            .FirstOrDefaultAsync(
                x => x.Id == id &&
                     x.UserId == CurrentUserId
            );

        if (account is null)
        {
            return NotFound();
        }

        account.Name = request.Name.Trim();
        account.OpeningBalance = request.OpeningBalance;

        await _context.SaveChangesAsync();

        return Ok(account);
    }

    // DELETE: api/Accounts/1
    [HttpDelete("{id:long}")]
    public async Task<IActionResult> DeleteAccount(long id)
    {
        var account = await _context.Accounts
            .FirstOrDefaultAsync(
                x => x.Id == id &&
                     x.UserId == CurrentUserId
            );

        if (account is null)
        {
            return NotFound();
        }

        var hasTransactions =
            await _context.Transactions.AnyAsync(
                x => x.AccountId == id &&
                     x.UserId == CurrentUserId
            );

        if (hasTransactions)
        {
            return BadRequest(
                "Cannot delete an account that has transactions."
            );
        }

        _context.Accounts.Remove(account);

        await _context.SaveChangesAsync();

        return NoContent();
    }
}