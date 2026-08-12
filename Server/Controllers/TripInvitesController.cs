using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using XTracker.Api.Data;
using XTracker.Api.DTOs;
using XTracker.Api.Models;

namespace XTracker.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TripInvitesController : BaseController
{
    private readonly XTrackerDbContext _context;

    public TripInvitesController(XTrackerDbContext context)
    {
        _context = context;
    }

    // POST: api/TripInvites/{tripId}
    [HttpPost("{tripId:int}")]
    public async Task<ActionResult<TripInviteDto>> CreateInvite(int tripId)
    {
        var currentUserId = CurrentUserId;

        var isMember = await _context.TripMembers
            .AnyAsync(m => m.TripId == tripId && m.UserId == currentUserId && m.IsOwner);

        if (!isMember)
        {
            return Forbid();
        }

        var token = Guid.NewGuid().ToString("N");

        var invite = new TripInvite
        {
            TripId = tripId,
            Token = token,
            CreatedByUserId = currentUserId,
            CreatedAt = DateTime.UtcNow,
            IsActive = true,
            ExpiresAt = DateTime.UtcNow.AddDays(30)
        };

        _context.TripInvites.Add(invite);

        await _context.SaveChangesAsync();

        // include non-sensitive trip name for display
        var tripName = await _context.Trips.Where(t => t.Id == invite.TripId).Select(t => t.Name).FirstOrDefaultAsync();

        return CreatedAtAction(nameof(GetInvite), new { token = invite.Token }, new TripInviteDto
        {
            Id = invite.Id,
            TripId = invite.TripId,
            Token = invite.Token,
            CreatedAt = invite.CreatedAt,
            ExpiresAt = invite.ExpiresAt,
            IsActive = invite.IsActive,
            TripName = tripName
        });
    }

    // GET: api/TripInvites/{token}
    [AllowAnonymous]
    [HttpGet("{token}")]
    public async Task<ActionResult<TripInviteDto>> GetInvite(string token)
    {
        var invite = await _context.TripInvites
            .AsNoTracking()
            .Where(i => i.Token == token && i.IsActive)
            .Select(i => new TripInviteDto
            {
                Id = i.Id,
                TripId = i.TripId,
                Token = i.Token,
                CreatedAt = i.CreatedAt,
                ExpiresAt = i.ExpiresAt,
                IsActive = i.IsActive,
                TripName = i.Trip != null ? i.Trip.Name : null
            })
            .FirstOrDefaultAsync();

        if (invite is null)
        {
            return NotFound();
        }

        return Ok(invite);
    }

    // POST: api/TripInvites/{token}/join
    [HttpPost("{token}/join")]
    public async Task<IActionResult> JoinInvite(string token)
    {
        var invite = await _context.TripInvites
            .FirstOrDefaultAsync(i => i.Token == token && i.IsActive);

        if (invite is null)
        {
            return NotFound();
        }

        if (invite.ExpiresAt.HasValue && invite.ExpiresAt.Value < DateTime.UtcNow)
        {
            return BadRequest("Invite has expired.");
        }

        var currentUserId = CurrentUserId;

        // Prevent duplicate membership: if TripMember exists for this user, return OK
        var existing = await _context.TripMembers
            .FirstOrDefaultAsync(m => m.TripId == invite.TripId && m.UserId == currentUserId);

        if (existing != null)
        {
            return Ok();
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == currentUserId);

        // If there's an unlinked TripMember with the same email, link it instead of creating a duplicate
        if (user != null)
        {
            var unlinked = await _context.TripMembers
                .FirstOrDefaultAsync(m => m.TripId == invite.TripId && m.UserId == null && m.Email != null && m.Email == user.Email);

            if (unlinked != null)
            {
                unlinked.UserId = currentUserId;
                unlinked.Name = user.Name ?? unlinked.Name;
                await _context.SaveChangesAsync();
                return Ok();
            }
        }

        var member = new TripMember
        {
            TripId = invite.TripId,
            UserId = currentUserId,
            Name = user?.Name ?? string.Empty,
            Email = user?.Email,
            JoinedAt = DateTime.UtcNow,
            IsOwner = false
        };

        _context.TripMembers.Add(member);

        await _context.SaveChangesAsync();

        return Ok();
    }

    // POST: api/TripInvites/{token}/revoke
    [HttpPost("{token}/revoke")]
    public async Task<IActionResult> RevokeInvite(string token)
    {
        var invite = await _context.TripInvites
            .FirstOrDefaultAsync(i => i.Token == token && i.IsActive);

        if (invite is null)
        {
            return NotFound();
        }

        var currentUserId = CurrentUserId;

        var isMember = await _context.TripMembers
            .AnyAsync(m => m.TripId == invite.TripId && m.UserId == currentUserId && m.IsOwner);

        if (!isMember)
        {
            return Forbid();
        }

        invite.IsActive = false;
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
