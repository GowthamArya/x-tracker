using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.DataProtection.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using XTracker.Api.Data;
using XTracker.Api;
using XTracker.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Controllers
builder.Services.AddControllers();
builder.Services.AddHttpClient();
builder.Services.AddMemoryCache();
builder.Services.AddSingleton<AppCache>();
// Authentication cookies are encrypted with ASP.NET Core Data Protection
// keys. Store the key ring in SQL so IIS recycles, deployments, and multiple
// app instances continue to understand existing session cookies.
builder.Services
    .AddDataProtection()
    .SetApplicationName("XTracker")
    .PersistKeysToDbContext<XTrackerDbContext>();

// Authentication
builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme =
            "XTrackerCookie";

        options.DefaultSignInScheme =
            "XTrackerCookie";

        options.DefaultChallengeScheme =
             "XTrackerCookie";
    })
    .AddCookie("XTrackerCookie", options =>
    {
        options.Cookie.Name = "XTracker.Auth";

        options.Cookie.HttpOnly = true;

        options.Cookie.Path = "/";

        options.Cookie.SecurePolicy =
            CookieSecurePolicy.Always;

        // Production serves the SPA and API from one HTTPS host, so Lax is
        // appropriate after Google redirects back. Local development uses an
        // HTTP client (localhost:8100) and HTTPS API (localhost:7043), which
        // browsers treat as cross-site; it therefore needs None for /auth/me.
        options.Cookie.SameSite =
            builder.Environment.IsDevelopment()
                ? SameSiteMode.None
                : SameSiteMode.Lax;

        options.ExpireTimeSpan =
            TimeSpan.FromDays(30);

         options.SlidingExpiration = true;

        options.Events.OnRedirectToLogin = context =>
        {
            if (context.Request.Path.StartsWithSegments("/api"))
            {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                return Task.CompletedTask;
            }

            context.Response.Redirect(context.RedirectUri);

            return Task.CompletedTask;
        };
    })
    .AddGoogle(options =>
    {
        options.ClientId =
            builder.Configuration[
                "Authentication:Google:ClientId"
            ]!;

        options.ClientSecret =
            builder.Configuration[
                "Authentication:Google:ClientSecret"
            ]!;
        options.Scope.Add("profile");
        options.Scope.Add("email");
        options.ClaimActions.MapJsonKey(
                "urn:google:picture",
                "picture",
                "url"
            );
        options.SaveTokens = true;
    });

builder.Services.AddAuthorization();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("XTrackerClient", policy =>
    {
        policy
            .WithOrigins("http://localhost:8100")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// Database
builder.Services.AddDbContext<XTrackerDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString(
            "DefaultConnection"
        )
    )
);

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseMiddleware<RequestLoggingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();

    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint(
            "/swagger/v1/swagger.json",
            "XTracker API v1"
        );
    });
}

app.UseHttpsRedirection();

app.UseStaticFiles();

app.UseCors("XTrackerClient");

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

// Angular SPA fallback
app.MapFallbackToFile("index.html");

app.Run();
