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
        var properties = new AuthenticationProperties
        {
            RedirectUri = "/api/auth/google-callback"
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
}