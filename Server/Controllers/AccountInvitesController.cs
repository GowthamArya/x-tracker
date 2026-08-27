using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using XTracker.Api.Data;
using XTracker.Api.DTOs;
using XTracker.Api.Models;

namespace XTracker.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AccountInvitesController : BaseController
{
    private readonly XTrackerDbContext _context;
    public AccountInvitesController(XTrackerDbContext context) => _context = context;

    [HttpGet("account/{accountId:int}")]
    public async Task<ActionResult<AccountInviteDto>> GetForAccount(int accountId)
    {
        var account = await _context.Accounts.FirstOrDefaultAsync(a => a.Id == accountId && a.UserId == CurrentUserId && a.AccountType == "joint");
        if (account is null) return NotFound();
        var invite = await _context.AccountInvites.Where(i => i.AccountId == accountId && i.IsActive && (!i.ExpiresAt.HasValue || i.ExpiresAt > DateTime.UtcNow)).OrderByDescending(i => i.CreatedAt).FirstOrDefaultAsync();
        return invite is null ? NotFound() : Ok(ToDto(invite, account.Name));
    }

    [HttpPost("account/{accountId:int}")]
    public async Task<ActionResult<AccountInviteDto>> Create(int accountId)
    {
        var account = await _context.Accounts.FirstOrDefaultAsync(a => a.Id == accountId && a.UserId == CurrentUserId && a.AccountType == "joint");
        if (account is null) return NotFound();
        var now = DateTime.UtcNow;
        var invite = await _context.AccountInvites.FirstOrDefaultAsync(i => i.AccountId == accountId && i.IsActive && (!i.ExpiresAt.HasValue || i.ExpiresAt > now));
        if (invite is null)
        {
            invite = new AccountInvite { AccountId = accountId, Token = Guid.NewGuid().ToString("N"), CreatedByUserId = CurrentUserId, CreatedAt = now, ExpiresAt = now.AddDays(30), IsActive = true };
            _context.AccountInvites.Add(invite);
            await _context.SaveChangesAsync();
        }
        return Ok(ToDto(invite, account.Name));
    }

    [AllowAnonymous]
    [HttpGet("{token}")]
    public async Task<ActionResult<AccountInviteDto>> Get(string token)
    {
        var invite = await _context.AccountInvites.Include(i => i.Account).AsNoTracking().FirstOrDefaultAsync(i => i.Token == token && i.IsActive && (!i.ExpiresAt.HasValue || i.ExpiresAt > DateTime.UtcNow));
        return invite is null ? NotFound() : Ok(ToDto(invite, invite.Account.Name));
    }

    [HttpPost("{token}/join")]
    public async Task<IActionResult> Join(string token)
    {
        var invite = await _context.AccountInvites.FirstOrDefaultAsync(i => i.Token == token && i.IsActive && (!i.ExpiresAt.HasValue || i.ExpiresAt > DateTime.UtcNow));
        if (invite is null) return NotFound();
        var account = await _context.Accounts.FirstOrDefaultAsync(a => a.Id == invite.AccountId && a.AccountType == "joint");
        if (account is null) return NotFound();
        if (!await _context.AccountMembers.AnyAsync(m => m.AccountId == account.Id && m.UserId == CurrentUserId))
        {
            _context.AccountMembers.Add(new AccountMember { AccountId = account.Id, UserId = CurrentUserId, IsOwner = false, JoinedAt = DateTime.UtcNow });
            await _context.SaveChangesAsync();
        }
        return Ok(new { accountId = account.Id });
    }

    [HttpPost("{token}/revoke")]
    public async Task<IActionResult> Revoke(string token)
    {
        var invite = await _context.AccountInvites.FirstOrDefaultAsync(i => i.Token == token && i.IsActive && i.CreatedByUserId == CurrentUserId);
        if (invite is null) return NotFound();
        invite.IsActive = false;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    private static AccountInviteDto ToDto(AccountInvite invite, string name) => new() { Id = invite.Id, AccountId = invite.AccountId, Token = invite.Token, CreatedAt = invite.CreatedAt, ExpiresAt = invite.ExpiresAt, IsActive = invite.IsActive, AccountName = name };
}
