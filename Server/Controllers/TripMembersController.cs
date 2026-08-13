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
}

public class AddGuestMemberRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Email { get; set; }
}

