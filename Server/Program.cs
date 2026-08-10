using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.EntityFrameworkCore;
using XTracker.Api.Data;

var builder = WebApplication.CreateBuilder(args);

// Controllers
builder.Services.AddControllers();

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

        options.Cookie.SecurePolicy =
            CookieSecurePolicy.Always;

        options.Cookie.SameSite =
            SameSiteMode.None;

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
