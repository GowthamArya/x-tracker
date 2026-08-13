using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using XTracker.Api.Data;
using XTracker.Api.Models;

namespace XTracker.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly XTrackerDbContext _context;

    public AuthController(XTrackerDbContext context)
    {
        _context = context;
    }

    [HttpGet("google")]
    public IActionResult GoogleLogin()
    {
        var returnUrl = Request.Query["returnUrl"].ToString();
        var redirectUri = "/api/auth/google-callback";
        if (!string.IsNullOrWhiteSpace(returnUrl))
        {
            redirectUri = $"/api/auth/google-callback?returnUrl={System.Net.WebUtility.UrlEncode(returnUrl)}";
        }

        var properties = new AuthenticationProperties
        {
            RedirectUri = redirectUri
        };

        return Challenge(
            properties,
            GoogleDefaults.AuthenticationScheme
        );
    }

    [HttpGet("google-callback")]
    public async Task<IActionResult> GoogleCallback()
    {
        var result =
            await HttpContext.AuthenticateAsync(
                "XTrackerCookie"
            );

        if (!result.Succeeded ||
            result.Principal == null)
        {
            return Unauthorized();
        }

        var claims = result.Principal.Claims;

        var googleId =
            claims.FirstOrDefault(
                x => x.Type == ClaimTypes.NameIdentifier
            )?.Value;

        var email =
            claims.FirstOrDefault(
                x => x.Type == ClaimTypes.Email
            )?.Value;

        var name =
            claims.FirstOrDefault(
                x => x.Type == ClaimTypes.Name
            )?.Value;

        var photoUrl =
            claims.FirstOrDefault(x =>
                x.Type == "picture" ||
                x.Type == "urn:google:picture" ||
                x.Type == "http://schemas.google.com/claims/picture"
            )?.Value;

        if (string.IsNullOrWhiteSpace(googleId) ||
            string.IsNullOrWhiteSpace(email))
        {
            return Unauthorized(
                "Google account information is missing."
            );
        }

        var user = await _context.Users
            .FirstOrDefaultAsync(
                x => x.GoogleId == googleId
            );

        if (user == null)
        {
            user = new User
            {
                Name = name ?? email,
                Email = email,
                GoogleId = googleId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);

            await _context.SaveChangesAsync();
        }

        // Create X-Tracker identity
        var xTrackerClaims = new List<Claim>
        {
            new(
                ClaimTypes.NameIdentifier,
                user.Id.ToString()
            ),

            new(
                ClaimTypes.Name,
                user.Name
            ),

            new(
                ClaimTypes.Email,
                user.Email
            ),

            new(
                "picture",
                photoUrl ?? string.Empty
            )
        };

        var identity = new ClaimsIdentity(
            xTrackerClaims,
            "XTrackerCookie"
        );

        var principal =
            new ClaimsPrincipal(identity);

        // Create X-Tracker authentication cookie
        await HttpContext.SignInAsync(
            "XTrackerCookie",
            principal
        );
        string? returnUrl = Request.Query["returnUrl"];
        if (!string.IsNullOrWhiteSpace(returnUrl))
        {
            return Redirect(returnUrl);
        }
        string dashboardUrl = Environment.GetEnvironmentVariable("DASHBOARD_URL") ?? "/tabs/dashboard";
        return Redirect(dashboardUrl);
    }

    [HttpGet("me")]
    public IActionResult Me()
    {
        Console.WriteLine("========== ME ENDPOINT HIT ==========");
        if (!User.Identity?.IsAuthenticated ?? true)
        {
            return Unauthorized();
        }

        return Ok(new
        {
            Id = User.FindFirstValue(
                ClaimTypes.NameIdentifier
            ),

            Name = User.FindFirstValue(
                ClaimTypes.Name
            ),

            Email = User.FindFirstValue(
                ClaimTypes.Email
            ),

            PhotoUrl = User.FindFirstValue(
                "picture"
            )
        });
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync(
            "XTrackerCookie"
        );
        return Ok();
    }

    [HttpDelete("me")]
    public async Task<IActionResult> DeleteMe()
    {
        if (!User.Identity?.IsAuthenticated ?? true)
        {
            return Unauthorized();
        }

        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(currentUserId, out var userId))
        {
            return Unauthorized();
        }

        await using var transaction = await _context.Database.BeginTransactionAsync();

        var accountIds = await _context.Accounts
            .Where(a => a.UserId == userId)
            .Select(a => a.Id)
            .ToListAsync();

        var categoryIds = await _context.Categories
            .Where(c => c.UserId == userId)
            .Select(c => c.Id)
            .ToListAsync();

        var sharedTripIds = await _context.TripMembers
            .Where(m => m.UserId == userId)
            .Select(m => m.TripId)
            .Distinct()
            .ToListAsync();

        var ownedTripIds = await _context.Trips
            .Where(t => t.CreatedByUserId == userId)
            .Select(t => t.Id)
            .ToListAsync();

        var userTripMemberIds = await _context.TripMembers
            .Where(m => m.UserId == userId)
            .Select(m => m.Id)
            .ToListAsync();

        var expenseIdsToDelete = await _context.TripExpenses
            .Where(e =>
                e.AddedByUserId == userId ||
                userTripMemberIds.Contains(e.PaidByTripMemberId) ||
                ownedTripIds.Contains(e.TripId))
            .Select(e => e.Id)
            .ToListAsync();

        if (expenseIdsToDelete.Count > 0)
        {
            await _context.TripExpenseParticipants
                .Where(p => expenseIdsToDelete.Contains(p.TripExpenseId))
                .ExecuteDeleteAsync();

            await _context.TripExpenses
                .Where(e => expenseIdsToDelete.Contains(e.Id))
                .ExecuteDeleteAsync();
        }

        if (sharedTripIds.Count > 0)
        {
            await _context.TripInvites
                .Where(i => sharedTripIds.Contains(i.TripId) && i.CreatedByUserId == userId)
                .ExecuteDeleteAsync();

            await _context.TripMembers
                .Where(m => sharedTripIds.Contains(m.TripId) && m.UserId == userId)
                .ExecuteDeleteAsync();
        }

        if (ownedTripIds.Count > 0)
        {
            await _context.TripInvites
                .Where(i => ownedTripIds.Contains(i.TripId))
                .ExecuteDeleteAsync();

            await _context.TripMembers
                .Where(m => ownedTripIds.Contains(m.TripId))
                .ExecuteDeleteAsync();

            await _context.Trips
                .Where(t => ownedTripIds.Contains(t.Id))
                .ExecuteDeleteAsync();
        }

        if (accountIds.Count > 0)
        {
            await _context.Transactions
                .Where(t => accountIds.Contains(t.AccountId))
                .ExecuteDeleteAsync();

            await _context.Accounts
                .Where(a => accountIds.Contains(a.Id))
                .ExecuteDeleteAsync();
        }

        if (categoryIds.Count > 0)
        {
            await _context.Categories
                .Where(c => categoryIds.Contains(c.Id))
                .ExecuteDeleteAsync();
        }

        await _context.Transactions
            .Where(t => t.UserId == userId)
            .ExecuteDeleteAsync();

        await _context.Users
            .Where(u => u.Id == userId)
            .ExecuteDeleteAsync();

        await transaction.CommitAsync();

        await HttpContext.SignOutAsync("XTrackerCookie");

        return NoContent();
    }
}
