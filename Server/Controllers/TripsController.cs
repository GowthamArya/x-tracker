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
    public async Task<ActionResult<TripBalancesResponseDto>> GetBalances(int id)
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

        // sort by current user first, then by name
        result = result.OrderByDescending(r => r.IsCurrentUser).ThenBy(r => r.Name).ToList();

        // Compute simplified debts (Splitwise debt minimization algorithm)
        var debts = new List<TripDebtDto>();

        var debtors = result
            .Where(b => b.Balance < -0.01m)
            .Select(b => new { MemberId = b.TripMemberId, Name = b.Name, Amount = -b.Balance, b.IsCurrentUser })
            .OrderByDescending(d => d.Amount)
            .ToList();

        var creditors = result
            .Where(b => b.Balance > 0.01m)
            .Select(b => new { MemberId = b.TripMemberId, Name = b.Name, Amount = b.Balance, b.IsCurrentUser })
            .OrderByDescending(c => c.Amount)
            .ToList();

        var debtorState = debtors.Select(d => new { d.MemberId, d.Name, Amount = d.Amount, d.IsCurrentUser }).ToList();
        var creditorState = creditors.Select(c => new { c.MemberId, c.Name, Amount = c.Amount, c.IsCurrentUser }).ToList();

        int iIdx = 0, jIdx = 0;
        var debtorList = debtorState.Select(d => new MutableDebtNode { MemberId = d.MemberId, Name = d.Name, Amount = d.Amount, IsCurrentUser = d.IsCurrentUser }).ToList();
        var creditorList = creditorState.Select(c => new MutableDebtNode { MemberId = c.MemberId, Name = c.Name, Amount = c.Amount, IsCurrentUser = c.IsCurrentUser }).ToList();

        while (iIdx < debtorList.Count && jIdx < creditorList.Count)
        {
            var d = debtorList[iIdx];
            var c = creditorList[jIdx];

            var settleAmount = Math.Min(d.Amount, c.Amount);
            if (settleAmount > 0.01m)
            {
                debts.Add(new TripDebtDto
                {
                    FromTripMemberId = d.MemberId,
                    FromTripMemberName = d.Name,
                    ToTripMemberId = c.MemberId,
                    ToTripMemberName = c.Name,
                    Amount = decimal.Round(settleAmount, 2),
                    IsFromCurrentUser = d.IsCurrentUser,
                    IsToCurrentUser = c.IsCurrentUser
                });

                d.Amount -= settleAmount;
                c.Amount -= settleAmount;
            }

            if (d.Amount <= 0.01m) iIdx++;
            if (c.Amount <= 0.01m) jIdx++;
        }

        return Ok(new TripBalancesResponseDto
        {
            Balances = result,
            Debts = debts
        });
    }

    private class MutableDebtNode
    {
        public int MemberId { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public bool IsCurrentUser { get; set; }
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
