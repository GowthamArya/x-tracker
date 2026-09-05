using System.Security.Claims;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using XTracker.Api.Data;
using XTracker.Api.Models;

namespace XTracker.Api.Controllers;

[ApiController, Route("api/support")]
public class SupportController : ControllerBase
{
    private readonly XTrackerDbContext context;
    private readonly ILogger<SupportController> logger;

    public SupportController(XTrackerDbContext context, ILogger<SupportController> logger)
    {
        this.context = context;
        this.logger = logger;
    }

    [AllowAnonymous, HttpPost("messages")]
    public async Task<IActionResult> CreateMessage(SupportMessageRequest request)
    {
        if (!ModelState.IsValid || string.IsNullOrWhiteSpace(request.Message))
            return BadRequest("Please provide a valid email address and message.");

        var message = new SupportMessage
        {
            UserId = int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId) ? userId : null,
            Name = request.Name.Trim(),
            Email = request.Email.Trim(),
            Subject = string.IsNullOrWhiteSpace(request.Subject) ? "Support request" : request.Subject.Trim(),
            Message = request.Message.Trim(),
            Source = "app",
            CreatedAt = DateTime.UtcNow
        };

        context.SupportMessages.Add(message);
        await context.SaveChangesAsync();
        logger.LogInformation("Support message {MessageId} received from {Email}", message.Id, message.Email);
        return Ok(new { message = "Thanks. Your message has been received." });
    }
}

public sealed class SupportMessageRequest
{
    [Required, MaxLength(200)] public string Name { get; set; } = string.Empty;
    [Required, EmailAddress, MaxLength(255)] public string Email { get; set; } = string.Empty;
    [MaxLength(100)] public string? Subject { get; set; }
    [Required, MaxLength(2000)] public string Message { get; set; } = string.Empty;
}
