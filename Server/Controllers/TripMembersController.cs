using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using XTracker.Api.Data;
using XTracker.Api.DTOs;
using XTracker.Api.Models;

namespace XTracker.Api.Controllers;

[ApiController]
[Route("api/trips/{tripId:int}/[controller]")]
public class MembersController : BaseController
{
    private readonly XTrackerDbContext _context;

    public MembersController(XTrackerDbContext context)
    {
        _context = context;
    }

    // GET: api/trips/{tripId}/members
    [HttpGet]
    public async Task<ActionResult<List<TripMemberDto>>> GetMembers(int tripId)
    {
        var currentUserId = CurrentUserId;

        var isMember = await _context.TripMembers.AnyAsync(m => m.TripId == tripId && m.UserId == currentUserId);

        if (!isMember)
        {
            return Forbid();
        }

        var members = await _context.TripMembers
            .AsNoTracking()
            .Where(m => m.TripId == tripId)
            .Select(m => new TripMemberDto
            {
                Id = m.Id,
                UserId = m.UserId,
                Name = m.Name,
                Email = m.Email,
                JoinedAt = m.JoinedAt,
                IsOwner = m.IsOwner
            })
            .ToListAsync();

        return Ok(members);
    }

    // POST: api/trips/{tripId}/members (add existing user by userId)
    [HttpPost]
    public async Task<ActionResult<TripMemberDto>> AddMember(int tripId, [FromBody] int userId)
    {
        var currentUserId = CurrentUserId;

        var requesterIsMember = await _context.TripMembers.AnyAsync(m => m.TripId == tripId && m.UserId == currentUserId);

        if (!requesterIsMember)
        {
            return Forbid();
        }

        // prevent duplicate membership
        var exists = await _context.TripMembers.AnyAsync(m => m.TripId == tripId && m.UserId == userId);

        if (exists)
        {
            return Conflict("User is already a member of the trip.");
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);

        if (user is null)
        {
            return NotFound("User not found.");
        }

        var member = new TripMember
        {
            TripId = tripId,
            UserId = user.Id,
            Name = user.Name,
            Email = user.Email,
            JoinedAt = DateTime.UtcNow,
            IsOwner = false
        };

        _context.TripMembers.Add(member);

        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetMembers), new { tripId = tripId }, new TripMemberDto
        {
            Id = member.Id,
            UserId = member.UserId,
            Name = member.Name,
            Email = member.Email,
            JoinedAt = member.JoinedAt,
            IsOwner = member.IsOwner
        });
    }

    // POST: api/trips/{tripId}/members/guest (add guest/virtual member by name)
    [HttpPost("guest")]
    public async Task<ActionResult<TripMemberDto>> AddGuestMember(int tripId, [FromBody] AddGuestMemberRequest request)
    {
        var currentUserId = CurrentUserId;

        var requesterIsMember = await _context.TripMembers.AnyAsync(m => m.TripId == tripId && m.UserId == currentUserId);

        if (!requesterIsMember)
        {
            return Forbid();
        }

        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest("Member name is required.");
        }

        var member = new TripMember
        {
            TripId = tripId,
            UserId = null,
            Name = request.Name.Trim(),
            Email = request.Email?.Trim(),
            JoinedAt = DateTime.UtcNow,
            IsOwner = false
        };

        _context.TripMembers.Add(member);

        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetMembers), new { tripId = tripId }, new TripMemberDto
        {
            Id = member.Id,
            UserId = member.UserId,
            Name = member.Name,
            Email = member.Email,
            JoinedAt = member.JoinedAt,
            IsOwner = member.IsOwner
        });
    }

    // DELETE: api/trips/{tripId}/members/{memberId}
    [HttpDelete("{memberId:int}")]
    public async Task<IActionResult> RemoveMember(int tripId, int memberId)
    {
        var currentUserId = CurrentUserId;
        var requesterIsOwner = await _context.TripMembers.AnyAsync(
            m => m.TripId == tripId && m.UserId == currentUserId && m.IsOwner);

        if (!requesterIsOwner)
        {
            return Forbid();
        }

        var member = await _context.TripMembers.FirstOrDefaultAsync(
            m => m.Id == memberId && m.TripId == tripId);

        if (member is null)
        {
            return NotFound("Trip member not found.");
        }

        if (member.IsOwner)
        {
            return BadRequest("The trip organizer cannot be removed.");
        }

        var hasExpenses = await _context.TripExpenses.AnyAsync(
            e => e.TripId == tripId && e.PaidByTripMemberId == memberId);
        var hasShares = await _context.TripExpenseParticipants.AnyAsync(
            p => p.TripMemberId == memberId && p.TripExpense.TripId == tripId);

        if (hasExpenses || hasShares)
        {
            return BadRequest("This member is included in trip expenses. Remove or update those expenses before removing the member.");
        }

        _context.TripMembers.Remove(member);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

public class AddGuestMemberRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Email { get; set; }
}
