using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using XTracker.Api.Data;
using XTracker.Api.DTOs;
using XTracker.Api.Models;

namespace XTracker.Api.Controllers;

[ApiController]
[Route("api/trips/{tripId:int}/[controller]")]
public class ExpensesController : BaseController
{
    private readonly XTrackerDbContext _context;

    public ExpensesController(XTrackerDbContext context)
    {
        _context = context;
    }

    // GET: api/trips/{tripId}/expenses
    [HttpGet]
    public async Task<ActionResult<List<TripExpenseDto>>> GetExpenses(int tripId)
    {
        var currentUserId = CurrentUserId;

        var isMember = await _context.TripMembers
            .AnyAsync(m => m.TripId == tripId && m.UserId == currentUserId);

        if (!isMember)
        {
            return Forbid();
        }

        var expenses = await _context.TripExpenses
            .AsNoTracking()
            .Where(e => e.TripId == tripId)
            .OrderByDescending(e => e.ExpenseDate)
            .ThenByDescending(e => e.Id)
            .Select(e => new TripExpenseDto
            {
                Id = e.Id,
                TripId = e.TripId,
                CategoryId = e.CategoryId,
                PaidByTripMemberId = e.PaidByTripMemberId,
                PaidByMemberName = e.PaidBy != null ? e.PaidBy.Name : string.Empty,
                AddedByUserId = e.AddedByUserId,
                Description = e.Description,
                Amount = e.Amount,
                ExpenseDate = e.ExpenseDate,
                Notes = e.Notes,
                CreatedAt = e.CreatedAt,
                IsSettlement = e.Description.StartsWith("Settlement:") || (e.Notes != null && e.Notes.Contains("Settlement")),
                Participants = e.Participants.Select(p => new TripExpenseParticipantDto
                {
                    TripMemberId = p.TripMemberId,
                    Name = p.TripMember != null ? p.TripMember.Name : string.Empty,
                    ShareAmount = p.ShareAmount ?? 0m
                }).ToList()
            })
            .ToListAsync();

        return Ok(expenses);
    }

    // GET: api/trips/{tripId}/expenses/{id}
    [HttpGet("{id:int}")]
    public async Task<ActionResult<TripExpenseDto>> GetExpense(int tripId, int id)
    {
        var currentUserId = CurrentUserId;

        var isMember = await _context.TripMembers
            .AnyAsync(m => m.TripId == tripId && m.UserId == currentUserId);

        if (!isMember)
        {
            return Forbid();
        }

        var expense = await _context.TripExpenses
            .AsNoTracking()
            .Where(e => e.TripId == tripId && e.Id == id)
            .Select(e => new TripExpenseDto
            {
                Id = e.Id,
                TripId = e.TripId,
                CategoryId = e.CategoryId,
                PaidByTripMemberId = e.PaidByTripMemberId,
                PaidByMemberName = e.PaidBy != null ? e.PaidBy.Name : string.Empty,
                AddedByUserId = e.AddedByUserId,
                Description = e.Description,
                Amount = e.Amount,
                ExpenseDate = e.ExpenseDate,
                Notes = e.Notes,
                CreatedAt = e.CreatedAt,
                IsSettlement = e.Description.StartsWith("Settlement:") || (e.Notes != null && e.Notes.Contains("Settlement")),
                Participants = e.Participants.Select(p => new TripExpenseParticipantDto
                {
                    TripMemberId = p.TripMemberId,
                    Name = p.TripMember != null ? p.TripMember.Name : string.Empty,
                    ShareAmount = p.ShareAmount ?? 0m
                }).ToList()
            })
            .FirstOrDefaultAsync();

        if (expense is null)
        {
            return NotFound();
        }

        return Ok(expense);
    }

    // POST: api/trips/{tripId}/expenses
    [HttpPost]
    public async Task<ActionResult<TripExpenseDto>> CreateExpense(int tripId, TripExpenseRequestDto request)
    {
        var currentUserId = CurrentUserId;

        var member = await _context.TripMembers
            .FirstOrDefaultAsync(m => m.TripId == tripId && m.UserId == currentUserId);

        if (member is null)
        {
            return Forbid();
        }

        // Validate paid by is a trip member
        var paidByMember = await _context.TripMembers
            .FirstOrDefaultAsync(m => m.TripId == tripId && m.Id == request.PaidByTripMemberId);

        if (paidByMember is null)
        {
            return BadRequest("PaidByTripMemberId is not a member of the trip.");
        }

        var expense = new TripExpense
        {
            TripId = tripId,
            CategoryId = request.CategoryId,
            PaidByTripMemberId = request.PaidByTripMemberId,
            AddedByUserId = currentUserId, // ensure added by is server-side
            Description = request.Description.Trim(),
            Amount = request.Amount,
            ExpenseDate = request.ExpenseDate,
            Notes = request.Notes?.Trim(),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.TripExpenses.Add(expense);

        // Save participants & custom shares
        if (request.ParticipantShares != null && request.ParticipantShares.Count > 0)
        {
            foreach (var ps in request.ParticipantShares)
            {
                var p = await _context.TripMembers.FirstOrDefaultAsync(tm => tm.TripId == tripId && tm.Id == ps.TripMemberId);

                if (p != null)
                {
                    _context.TripExpenseParticipants.Add(new TripExpenseParticipant
                    {
                        TripExpense = expense,
                        TripMemberId = p.Id,
                        ShareAmount = ps.ShareAmount
                    });
                }
            }
        }
        else
        {
            foreach (var participantId in request.ParticipantTripMemberIds.Distinct())
            {
                var p = await _context.TripMembers.FirstOrDefaultAsync(tm => tm.TripId == tripId && tm.Id == participantId);

                if (p != null)
                {
                    _context.TripExpenseParticipants.Add(new TripExpenseParticipant
                    {
                        TripExpense = expense,
                        TripMemberId = p.Id,
                        ShareAmount = null
                    });
                }
            }
        }

        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetExpenses), new { tripId = tripId }, new TripExpenseDto
        {
            Id = expense.Id,
            TripId = expense.TripId,
            CategoryId = expense.CategoryId,
            PaidByTripMemberId = expense.PaidByTripMemberId,
            PaidByMemberName = paidByMember.Name,
            AddedByUserId = expense.AddedByUserId,
            Description = expense.Description,
            Amount = expense.Amount,
            ExpenseDate = expense.ExpenseDate,
            Notes = expense.Notes,
            CreatedAt = expense.CreatedAt,
            IsSettlement = request.IsSettlement || expense.Description.StartsWith("Settlement:")
        });
    }

    // PUT: api/trips/{tripId}/expenses/{id}
    [HttpPut("{id:int}")]
    public async Task<ActionResult<TripExpenseDto>> UpdateExpense(int tripId, int id, TripExpenseRequestDto request)
    {
        var currentUserId = CurrentUserId;

        var member = await _context.TripMembers
            .FirstOrDefaultAsync(m => m.TripId == tripId && m.UserId == currentUserId);

        if (member is null)
        {
            return Forbid();
        }

        var expense = await _context.TripExpenses
            .Include(e => e.Participants)
            .FirstOrDefaultAsync(e => e.TripId == tripId && e.Id == id);

        if (expense is null)
        {
            return NotFound();
        }

        var paidByMember = await _context.TripMembers
            .FirstOrDefaultAsync(m => m.TripId == tripId && m.Id == request.PaidByTripMemberId);

        if (paidByMember is null)
        {
            return BadRequest("PaidByTripMemberId is not a member of the trip.");
        }

        expense.CategoryId = request.CategoryId;
        expense.PaidByTripMemberId = request.PaidByTripMemberId;
        // Keep AddedByUserId as original (do not change)
        expense.Description = request.Description.Trim();
        expense.Amount = request.Amount;
        expense.ExpenseDate = request.ExpenseDate;
        expense.Notes = request.Notes?.Trim();
        expense.UpdatedAt = DateTime.UtcNow;

        // Replace participants
        _context.TripExpenseParticipants.RemoveRange(expense.Participants);

        if (request.ParticipantShares != null && request.ParticipantShares.Count > 0)
        {
            foreach (var ps in request.ParticipantShares)
            {
                var p = await _context.TripMembers.FirstOrDefaultAsync(tm => tm.TripId == tripId && tm.Id == ps.TripMemberId);

                if (p != null)
                {
                    _context.TripExpenseParticipants.Add(new TripExpenseParticipant
                    {
                        TripExpenseId = expense.Id,
                        TripMemberId = p.Id,
                        ShareAmount = ps.ShareAmount
                    });
                }
            }
        }
        else
        {
            foreach (var participantId in request.ParticipantTripMemberIds.Distinct())
            {
                var p = await _context.TripMembers.FirstOrDefaultAsync(tm => tm.TripId == tripId && tm.Id == participantId);

                if (p != null)
                {
                    _context.TripExpenseParticipants.Add(new TripExpenseParticipant
                    {
                        TripExpenseId = expense.Id,
                        TripMemberId = p.Id,
                        ShareAmount = null
                    });
                }
            }
        }

        await _context.SaveChangesAsync();

        return Ok(new TripExpenseDto
        {
            Id = expense.Id,
            TripId = expense.TripId,
            CategoryId = expense.CategoryId,
            PaidByTripMemberId = expense.PaidByTripMemberId,
            PaidByMemberName = paidByMember.Name,
            AddedByUserId = expense.AddedByUserId,
            Description = expense.Description,
            Amount = expense.Amount,
            ExpenseDate = expense.ExpenseDate,
            Notes = expense.Notes,
            CreatedAt = expense.CreatedAt,
            IsSettlement = request.IsSettlement || expense.Description.StartsWith("Settlement:")
        });
    }

    // DELETE: api/trips/{tripId}/expenses/{id}
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteExpense(int tripId, int id)
    {
        var currentUserId = CurrentUserId;

        var member = await _context.TripMembers
            .FirstOrDefaultAsync(m => m.TripId == tripId && m.UserId == currentUserId);

        if (member is null)
        {
            return Forbid();
        }

        var expense = await _context.TripExpenses.FirstOrDefaultAsync(e => e.TripId == tripId && e.Id == id);

        if (expense is null)
        {
            return NotFound();
        }

        _context.TripExpenses.Remove(expense);

        await _context.SaveChangesAsync();

        return NoContent();
    }
}
