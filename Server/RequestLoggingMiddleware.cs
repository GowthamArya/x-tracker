using System.Diagnostics;
using System.Security.Claims;
using XTracker.Api.Services;

namespace XTracker.Api;

public sealed class RequestLoggingMiddleware
{
    private readonly RequestDelegate next;
    private readonly ILogger<RequestLoggingMiddleware> logger;
    private readonly AppCache appCache;

    public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger, AppCache appCache)
    {
        this.next = next;
        this.logger = logger;
        this.appCache = appCache;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var requestId = Activity.Current?.Id ?? context.TraceIdentifier;
        context.Response.Headers["X-Request-Id"] = requestId;
        var stopwatch = Stopwatch.StartNew();
        try
        {
            await next(context);
            if (!HttpMethods.IsGet(context.Request.Method) && context.Response.StatusCode < StatusCodes.Status400BadRequest &&
                int.TryParse(context.User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
            {
                appCache.InvalidateUser(userId);
            }
            logger.LogInformation("HTTP {Method} {Path} returned {StatusCode} in {ElapsedMs}ms, request {RequestId}", context.Request.Method, context.Request.Path, context.Response.StatusCode, stopwatch.ElapsedMilliseconds, requestId);
        }
        catch (Exception exception)
        {
            logger.LogError(exception, "HTTP {Method} {Path} failed after {ElapsedMs}ms, request {RequestId}", context.Request.Method, context.Request.Path, stopwatch.ElapsedMilliseconds, requestId);
            throw;
        }
    }
}