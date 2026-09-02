using System.Globalization;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using XTracker.Api.Data;
using XTracker.Api.Models;

namespace XTracker.Api.Controllers;

[ApiController, Route("api/gmail")]
public class GmailController : BaseController
{
    private const string GmailScope = "https://www.googleapis.com/auth/gmail.readonly";
    private readonly XTrackerDbContext context;
    private readonly IHttpClientFactory clients;
    private readonly IDataProtector protector;
    private readonly IConfiguration configuration;

    public GmailController(XTrackerDbContext context, IHttpClientFactory clients, IDataProtectionProvider protection, IConfiguration configuration)
    {
        this.context = context; this.clients = clients; this.configuration = configuration;
        protector = protection.CreateProtector("xtracker.gmail.oauth.v1");
    }

    [HttpGet("connections")]
    public async Task<IActionResult> Connections() => Ok(await context.GmailConnections.AsNoTracking()
        .Where(x => x.UserId == CurrentUserId).Select(x => new { x.Id, x.GmailAddress, x.CreatedAt, x.LastSyncedAt, x.LastError,
            pendingImports = x.ImportedEmails.Count(i => i.Status == "review") }).ToListAsync());

    [HttpGet("connect")]
    public IActionResult Connect()
    {
        var clientId = configuration["Authentication:Google:ClientId"];
        var callback = configuration["Authentication:Google:GmailCallbackUrl"] ?? $"{Request.Scheme}://{Request.Host}/api/gmail/callback";
        var state = protector.Protect($"{CurrentUserId}|{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}");
        var query = new Dictionary<string, string?> { ["client_id"] = clientId, ["redirect_uri"] = callback, ["response_type"] = "code", ["scope"] = $"openid email {GmailScope}", ["access_type"] = "offline", ["prompt"] = "consent", ["state"] = state };
        return Redirect("https://accounts.google.com/o/oauth2/v2/auth?" + string.Join("&", query.Select(x => $"{Uri.EscapeDataString(x.Key)}={Uri.EscapeDataString(x.Value ?? "")}")));
    }

    [AllowAnonymous, HttpGet("callback")]
    public async Task<IActionResult> Callback([FromQuery] string code, [FromQuery] string state)
    {
        int userId;
        try { var parts = protector.Unprotect(state).Split('|'); userId = int.Parse(parts[0]); if (DateTimeOffset.UtcNow.ToUnixTimeSeconds() - long.Parse(parts[1]) > 600) return BadRequest("Gmail connection expired."); }
        catch { return BadRequest("Invalid Gmail connection state."); }
        var callback = configuration["Authentication:Google:GmailCallbackUrl"] ?? $"{Request.Scheme}://{Request.Host}/api/gmail/callback";
        var client = clients.CreateClient();
        var token = await client.PostAsync("https://oauth2.googleapis.com/token", new FormUrlEncodedContent(new Dictionary<string, string> {
            ["code"] = code, ["client_id"] = configuration["Authentication:Google:ClientId"] ?? "", ["client_secret"] = configuration["Authentication:Google:ClientSecret"] ?? "", ["redirect_uri"] = callback, ["grant_type"] = "authorization_code" }));
        if (!token.IsSuccessStatusCode) return BadRequest("Unable to connect Gmail.");
        using var tokenJson = JsonDocument.Parse(await token.Content.ReadAsStringAsync());
        var refreshToken = tokenJson.RootElement.GetProperty("refresh_token").GetString();
        var accessToken = tokenJson.RootElement.GetProperty("access_token").GetString();
        if (string.IsNullOrWhiteSpace(refreshToken) || string.IsNullOrWhiteSpace(accessToken)) return BadRequest("Gmail did not return usable access.");
        client.DefaultRequestHeaders.Authorization = new("Bearer", accessToken);
        var profile = await client.GetFromJsonAsync<JsonElement>("https://gmail.googleapis.com/gmail/v1/users/me/profile");
        var address = profile.GetProperty("emailAddress").GetString() ?? "";
        var connection = await context.GmailConnections.FirstOrDefaultAsync(x => x.UserId == userId && x.GmailAddress == address);
        if (connection == null) { connection = new GmailConnection { UserId = userId, GmailAddress = address, CreatedAt = DateTime.UtcNow }; context.GmailConnections.Add(connection); }
        connection.RefreshTokenEncrypted = protector.Protect(refreshToken); connection.LastError = null; await context.SaveChangesAsync();
        var returnUrl = configuration["DASHBOARD_URL"] ?? "/tabs/more";
        return Redirect(returnUrl);
    }

    [HttpPost("connections/{id:long}/sync")]
    public async Task<IActionResult> Sync(long id)
    {
        var connection = await context.GmailConnections.FirstOrDefaultAsync(x => x.Id == id && x.UserId == CurrentUserId);
        if (connection == null) return NotFound();
        try
        {
            var client = clients.CreateClient();
            var refresh = protector.Unprotect(connection.RefreshTokenEncrypted);
            var token = await client.PostAsync("https://oauth2.googleapis.com/token", new FormUrlEncodedContent(new Dictionary<string, string> { ["client_id"] = configuration["Authentication:Google:ClientId"] ?? "", ["client_secret"] = configuration["Authentication:Google:ClientSecret"] ?? "", ["refresh_token"] = refresh, ["grant_type"] = "refresh_token" }));
            if (!token.IsSuccessStatusCode) throw new InvalidOperationException("Gmail authorization expired. Reconnect this account.");
            using var tokenJson = JsonDocument.Parse(await token.Content.ReadAsStringAsync()); client.DefaultRequestHeaders.Authorization = new("Bearer", tokenJson.RootElement.GetProperty("access_token").GetString());
            var list = await client.GetFromJsonAsync<JsonElement>("https://gmail.googleapis.com/gmail/v1/users/me/messages?q=" + Uri.EscapeDataString("newer_than:90d -loan -loans (receipt OR payment OR transaction OR debit OR credit)") + "&maxResults=50");
            var added = 0; if (list.TryGetProperty("messages", out var messages)) foreach (var item in messages.EnumerateArray())
            {
                var messageId = item.GetProperty("id").GetString()!; if (await context.GmailImportedEmails.AnyAsync(x => x.GmailConnectionId == id && x.GmailMessageId == messageId)) continue;
                var message = await client.GetFromJsonAsync<JsonElement>($"https://gmail.googleapis.com/gmail/v1/users/me/messages/{messageId}?format=full"); var parsed = Parse(message);
                if (parsed.amount == null || parsed.exclude) continue;
                context.GmailImportedEmails.Add(new GmailImportedEmail { GmailConnectionId = id, UserId = CurrentUserId, GmailMessageId = messageId, Sender = parsed.sender, Subject = parsed.subject, Title = parsed.title, Payee = parsed.payee, IsUpi = parsed.isUpi, Amount = parsed.amount, Type = parsed.type, TransactionDate = parsed.date, Preview = parsed.preview, Confidence = parsed.confidence, ReceivedAt = parsed.date ?? DateTime.UtcNow }); added++;
            }
            connection.LastSyncedAt = DateTime.UtcNow; connection.LastError = null; await context.SaveChangesAsync(); return Ok(new { added, pending = await context.GmailImportedEmails.CountAsync(x => x.GmailConnectionId == id && x.Status == "review") });
        }
        catch (Exception ex) { connection.LastError = ex.Message[..Math.Min(500, ex.Message.Length)]; await context.SaveChangesAsync(); return BadRequest(new { message = connection.LastError }); }
    }

    [HttpDelete("connections/{id:long}")]
    public async Task<IActionResult> Disconnect(long id) { var item = await context.GmailConnections.FirstOrDefaultAsync(x => x.Id == id && x.UserId == CurrentUserId); if (item == null) return NotFound(); context.GmailConnections.Remove(item); await context.SaveChangesAsync(); return NoContent(); }

    [HttpGet("imports")]
    public async Task<IActionResult> Imports()
    {
        var imports = await context.GmailImportedEmails.AsNoTracking().Include(x => x.GmailConnection).Where(x => x.UserId == CurrentUserId && x.Status == "review" && x.Amount != null && !x.Subject!.Contains("loan")).OrderByDescending(x => x.ReceivedAt).Take(100).ToListAsync();
        var result = new List<GmailImportDto>();
        foreach (var item in imports)
        {
            Transaction? match = null;
            if (item.Amount.HasValue && item.TransactionDate.HasValue)
                match = await context.Transactions.AsNoTracking().Include(x => x.Account).FirstOrDefaultAsync(x => x.UserId == CurrentUserId && x.Amount == item.Amount.Value && x.TransactionDate.Date == item.TransactionDate.Value.Date);
            result.Add(new GmailImportDto(item, match));
        }
        return Ok(result);
    }

    [HttpPost("imports/{id:long}/confirm")]
    public async Task<IActionResult> ConfirmImport(long id, ConfirmImportRequest request)
    {
        var item = await context.GmailImportedEmails.FirstOrDefaultAsync(x => x.Id == id && x.UserId == CurrentUserId && x.Status == "review");
        if (item == null) return NotFound();
        var account = await context.Accounts.FirstOrDefaultAsync(x => x.Id == request.AccountId && (x.UserId == CurrentUserId || x.Members.Any(m => m.UserId == CurrentUserId)));
        var category = await context.Categories.FirstOrDefaultAsync(x => x.Id == request.CategoryId && x.UserId == CurrentUserId);
        if (account == null || category == null || item.Amount == null || item.TransactionDate == null) return BadRequest("Choose a valid account and category, and complete the imported details first.");
        var note = $"Imported from Gmail: {item.Subject}";
        var transaction = new Transaction { UserId = CurrentUserId, AccountId = account.Id, CategoryId = category.Id, Title = item.Title, Amount = item.Amount.Value, Type = item.Type == "income" ? "income" : "expense", TransactionDate = item.TransactionDate.Value, Notes = note[..Math.Min(1000, note.Length)], CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
        context.Transactions.Add(transaction); await context.SaveChangesAsync(); item.Status = "imported"; item.TransactionId = transaction.Id; await context.SaveChangesAsync(); return Ok(new { transactionId = transaction.Id });
    }

    [HttpPost("imports/{id:long}/dismiss")]
    public async Task<IActionResult> DismissImport(long id) { var item = await context.GmailImportedEmails.FirstOrDefaultAsync(x => x.Id == id && x.UserId == CurrentUserId && x.Status == "review"); if (item == null) return NotFound(); item.Status = "dismissed"; await context.SaveChangesAsync(); return NoContent(); }

    private static (string sender, string subject, string title, string? payee, bool isUpi, decimal? amount, string? type, DateTime? date, string preview, decimal confidence, bool exclude) Parse(JsonElement message)
    {
        var headers = message.GetProperty("payload").GetProperty("headers"); string Header(string n) { foreach (var header in headers.EnumerateArray()) if (string.Equals(header.GetProperty("name").GetString(), n, StringComparison.OrdinalIgnoreCase)) return header.GetProperty("value").GetString() ?? ""; return ""; }
        var subject = Header("Subject"); var sender = Header("From"); var preview = message.TryGetProperty("snippet", out var s) ? s.GetString() ?? "" : ""; var body = ExtractText(message.GetProperty("payload")); var text = $"{subject} {preview} {body}";
        var exclude = Regex.IsMatch(subject, @"\bloan\b", RegexOptions.IgnoreCase);
        var money = Regex.Match(text, @"(?:₹|INR|Rs\.?|\$|USD|€|EUR)\s*([0-9][0-9,]*(?:\.\d{1,2})?)|\b([0-9][0-9,]*\.\d{2})\b"); decimal? amount = null; if (money.Success && decimal.TryParse(money.Groups[1].Success ? money.Groups[1].Value : money.Groups[2].Value, NumberStyles.Number, CultureInfo.InvariantCulture, out var value)) amount = value;
        DateTime? date = null; if (message.TryGetProperty("internalDate", out var internalDate) && long.TryParse(internalDate.GetString(), out var milliseconds)) date = DateTimeOffset.FromUnixTimeMilliseconds(milliseconds).UtcDateTime;
        var isUpi = Regex.IsMatch(text, @"\bupi\b|vpa|phonepe|google pay|gpay|paytm", RegexOptions.IgnoreCase); var payeeMatch = Regex.Match(text, @"(?:paid|sent|transferred|payment)\s+(?:to|towards)\s+([A-Za-z0-9 .&_-]{2,80})", RegexOptions.IgnoreCase); var payee = payeeMatch.Success ? payeeMatch.Groups[1].Value.Trim(' ', '.', ',', ':', '-') : null;
        var type = Regex.IsMatch(text, "credit|credited|salary|refund", RegexOptions.IgnoreCase) ? "income" : "expense"; var title = isUpi && payee != null ? $"UPI · {payee}" : (subject.Length > 0 ? subject : sender); return (sender, subject, title[..Math.Min(200, title.Length)], payee, isUpi, amount, type, date, preview[..Math.Min(1000, preview.Length)], amount.HasValue ? (isUpi ? .8m : .65m) : .25m, exclude);
    }

    private static string ExtractText(JsonElement payload)
    {
        var builder = new StringBuilder();
        if (payload.TryGetProperty("body", out var body) && body.TryGetProperty("data", out var data))
        {
            try { var raw = data.GetString() ?? ""; raw += new string('=', (4 - raw.Length % 4) % 4); builder.Append(Encoding.UTF8.GetString(Convert.FromBase64String(raw.Replace('-', '+').Replace('_', '/')))); } catch { }
        }
        if (payload.TryGetProperty("parts", out var parts)) foreach (var part in parts.EnumerateArray()) builder.Append(' ').Append(ExtractText(part));
        return Regex.Replace(builder.ToString(), "<[^>]+>", " ");
    }
}

public sealed class ConfirmImportRequest
{
    public int AccountId { get; set; }
    public int CategoryId { get; set; }
}

public sealed class GmailImportDto
{
    public long Id { get; init; }
    public string GmailMessageId { get; init; }
    public string? Sender { get; init; }
    public string? Subject { get; init; }
    public string Title { get; init; }
    public string? Payee { get; init; }
    public bool IsUpi { get; init; }
    public string GmailAddress { get; init; }
    public decimal? Amount { get; init; }
    public string? Type { get; init; }
    public DateTime? TransactionDate { get; init; }
    public string? Preview { get; init; }
    public decimal Confidence { get; init; }
    public GmailMatchDto? PossibleMatch { get; init; }

    public GmailImportDto(GmailImportedEmail item, Transaction? match)
    {
        Id = item.Id; GmailMessageId = item.GmailMessageId; Sender = item.Sender; Subject = item.Subject; Title = item.Title; Payee = item.Payee; IsUpi = item.IsUpi; GmailAddress = item.GmailConnection.GmailAddress; Amount = item.Amount; Type = item.Type; TransactionDate = item.TransactionDate; Preview = item.Preview; Confidence = item.Confidence;
        PossibleMatch = match == null ? null : new GmailMatchDto(match.Title, match.Amount, match.TransactionDate, match.Account.Name);
    }
}

public sealed record GmailMatchDto(string Title, decimal Amount, DateTime TransactionDate, string AccountName);
