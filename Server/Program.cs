var builder = WebApplication.CreateBuilder(args);

// Add controller support
builder.Services.AddControllers();

// Add OpenAPI
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();

    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint(
            "/openapi/v1.json",
            "X-Tracker API v1"
        );
    });
}

app.UseHttpsRedirection();

// Map controller endpoints
app.MapControllers();

app.Run();