using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using XTracker.Api.Data;
using XTracker.Api.DTOs;
using XTracker.Api.Models;

namespace XTracker.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TripsController : BaseController
{
    private readonly XTrackerDbContext _context;

    public TripsController(XTrackerDbContext context)
    {
        _context = context;
    }

    // GET: api/Trips/{id}/balances
    [HttpGet("{id:int}/balances")]
    public async Task<ActionResult<List<TripMemberBalanceDto>>> GetBalances(int id)
    {
        var currentUserId = CurrentUserId;

        // Verify the user is a member of the trip
        var isMember = await _context.TripMembers.AnyAsync(m => m.TripId == id && m.UserId == currentUserId);
        if (!isMember)
        {
            return Forbid();
        }

        // Load members
        var members = await _context.TripMembers
            .Where(m => m.TripId == id)
            .Select(m => new { m.Id, m.Name, m.UserId })
            .ToListAsync();

        // Load expenses with participants for the trip
        var expenses = await _context.TripExpenses
            .Where(e => e.TripId == id)
            .Select(e => new
            {
                e.Id,
                e.Amount,
                PaidById = e.PaidByTripMemberId,
                Participants = e.Participants.Select(p => new { p.TripMemberId, p.ShareAmount })
            })
            .ToListAsync();

        var result = new List<TripMemberBalanceDto>();

        // initialize map
        var map = members.ToDictionary(m => m.Id, m => new TripMemberBalanceDto
        {
            TripMemberId = m.Id,
            Name = m.Name,
            TotalPaid = 0m,
            TotalShare = 0m,
            Balance = 0m,
            IsCurrentUser = m.UserId == currentUserId
        });

        // Aggregate
        foreach (var e in expenses)
        {
            // add to payer
            if (map.TryGetValue(e.PaidById, out var payer))
            {
                payer.TotalPaid += e.Amount;
            }

            // sum explicit shares and count participants without share
            decimal explicitSum = 0m;
            int noShareCount = 0;
            foreach (var p in e.Participants)
            {
                if (p.ShareAmount.HasValue)
                {
                    explicitSum += p.ShareAmount.Value;
                }
                else
                {
                    noShareCount++;
                }
            }

            decimal remaining = e.Amount - explicitSum;
            decimal perPerson = noShareCount > 0 ? decimal.Round(remaining / noShareCount, 2) : 0m;

            // assign shares
            foreach (var p in e.Participants)
            {
                var share = p.ShareAmount ?? perPerson;
                if (map.TryGetValue(p.TripMemberId, out var memberDto))
                {
                    memberDto.TotalShare += share;
                }
            }
        }

        // finalize balances
        foreach (var kv in map)
        {
            kv.Value.Balance = kv.Value.TotalPaid - kv.Value.TotalShare;
            result.Add(kv.Value);
        }

        // sort by name
        result = result.OrderByDescending(r => r.IsCurrentUser).ThenBy(r => r.Name).ToList();

        return Ok(result);
    }

    // GET: api/Trips
    [HttpGet]
    public async Task<ActionResult<List<TripDto>>> GetTrips()
    {
        var currentUserId = CurrentUserId;

        var trips = await _context.Trips
            .AsNoTracking()
            .Where(t => t.Members.Any(m => m.UserId == currentUserId))
            .Select(t => new TripDto
            {
                Id = t.Id,
                Name = t.Name,
                Description = t.Description,
                StartDate = t.StartDate,
                EndDate = t.EndDate,
                CreatedByUserId = t.CreatedByUserId,
                CreatedAt = t.CreatedAt,
                MemberCount = t.Members.Count,
                ExpenseCount = t.Expenses.Count
            })
            .ToListAsync();

        return Ok(trips);
    }

    // POST: api/Trips
    [HttpPost]
    public async Task<ActionResult<TripDto>> CreateTrip(TripCreateRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest("Trip name is required.");
        }

        var trip = new Trip
        {
            Name = request.Name.Trim(),
            Description = request.Description?.Trim(),
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            CreatedByUserId = CurrentUserId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Trips.Add(trip);

        await _context.SaveChangesAsync();

        // Add creator as member (populate name from user record)
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == CurrentUserId);

        var member = new TripMember
        {
            TripId = trip.Id,
            UserId = CurrentUserId,
            Name = user?.Name ?? string.Empty,
            Email = user?.Email,
            JoinedAt = DateTime.UtcNow,
            IsOwner = true
        };

        _context.TripMembers.Add(member);

        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTrip), new { id = trip.Id }, new TripDto
        {
            Id = trip.Id,
            Name = trip.Name,
            Description = trip.Description,
            StartDate = trip.StartDate,
            EndDate = trip.EndDate,
            CreatedByUserId = trip.CreatedByUserId,
            CreatedAt = trip.CreatedAt,
            MemberCount = 1,
            ExpenseCount = 0
        });
    }

    // GET: api/Trips/1
    [HttpGet("{id:int}")]
    public async Task<ActionResult<TripDto>> GetTrip(int id)
    {
        var currentUserId = CurrentUserId;

        var trip = await _context.Trips
            .AsNoTracking()
            .Where(t => t.Id == id || t.Members.Any(m => m.UserId == currentUserId))
            .Select(t => new TripDto
            {
                Id = t.Id,
                Name = t.Name,
                Description = t.Description,
                StartDate = t.StartDate,
                EndDate = t.EndDate,
                CreatedByUserId = t.CreatedByUserId,
                CreatedAt = t.CreatedAt,
                MemberCount = t.Members.Count,
                ExpenseCount = t.Expenses.Count
            })
            .FirstOrDefaultAsync();

        if (trip is null)
        {
            return NotFound();
        }

        return Ok(trip);
    }
}
