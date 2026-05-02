using EducationSystem.API.Middleware;
using EducationSystem.Application.Interfaces;
using EducationSystem.Application.Services;
using EducationSystem.Infrastructure.Repositories;
using Microsoft.Data.SqlClient;
using Serilog;
using System.Data;
using System.Reflection;

var builder = WebApplication.CreateBuilder(args);

// ── Logging ────────────────────────────────────────────────────────────────
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File("logs/education-.log", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();

// ── Services ───────────────────────────────────────────────────────────────
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Education System API", Version = "v1" });
    var xml = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xml);
    if (File.Exists(xmlPath))
        c.IncludeXmlComments(xmlPath, includeControllerXmlComments: true);
});

builder.Services.AddScoped<IDbConnection>(_ =>
    new SqlConnection(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IEducationPlaceRepository, EducationPlaceRepository>();
builder.Services.AddScoped<IStudentRepository, StudentRepository>();
builder.Services.AddScoped<IEducationPlaceService, EducationPlaceService>();
builder.Services.AddScoped<IStudentService, StudentService>();

builder.Services.AddCors(opt =>
    opt.AddPolicy("AllowAngular", p =>
    {
        if (builder.Environment.IsDevelopment())
        {
            p.SetIsOriginAllowed(static origin =>
                    !string.IsNullOrEmpty(origin) &&
                    (origin.StartsWith("http://localhost:", StringComparison.Ordinal) ||
                     origin.StartsWith("http://127.0.0.1:", StringComparison.Ordinal)))
                .AllowAnyHeader()
                .AllowAnyMethod();
        }
        else
        {
            p.WithOrigins(
                    "http://localhost:8080",
                    "http://127.0.0.1:8080",
                    "http://localhost:4300",
                    "http://127.0.0.1:4300")
                .AllowAnyHeader()
                .AllowAnyMethod();
        }
    }));

// ── Pipeline ───────────────────────────────────────────────────────────────
var app = builder.Build();

app.UseMiddleware<GlobalExceptionMiddleware>();

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Education System API v1");
    c.RoutePrefix = "swagger";
});

app.UseCors("AllowAngular");

// HTTP-only hosts (e.g. Docker) have no HTTPS endpoint; skip redirect to avoid warnings/broken responses.
if (Environment.GetEnvironmentVariable("DISABLE_HTTPS_REDIRECT") is not "1")
    app.UseHttpsRedirection();

app.MapGet("/", () => Results.Redirect("/swagger/index.html"));
app.MapControllers();
app.Run();
