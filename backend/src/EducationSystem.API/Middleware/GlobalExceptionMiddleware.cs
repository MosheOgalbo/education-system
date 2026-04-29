using EducationSystem.Application.Exceptions;
using System.Net;
using System.Text.Json;

namespace EducationSystem.API.Middleware;

public sealed class GlobalExceptionMiddleware(
    RequestDelegate next,
    ILogger<GlobalExceptionMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext ctx)
    {
        try
        {
            await next(ctx);
        }
        catch (ValidationException ex)
        {
            logger.LogWarning("Validation: {Message}", ex.Message);
            await WriteJsonAsync(ctx, HttpStatusCode.BadRequest, ex.Message);
        }
        catch (NotFoundException ex)
        {
            logger.LogWarning("NotFound: {Message}", ex.Message);
            await WriteJsonAsync(ctx, HttpStatusCode.NotFound, ex.Message);
        }
        catch (Exception ex)
        {
            logger.LogCritical(ex,
                "CRITICAL — Unhandled exception at {Method} {Path}",
                ctx.Request.Method, ctx.Request.Path);

            await NotifyCriticalAsync(ex, ctx);   // 🔔 נקודת חיבור לשירות התראות
            await WriteJsonAsync(ctx, HttpStatusCode.InternalServerError,
                "אירעה שגיאת מערכת. אנא נסה שוב מאוחר יותר.");
        }
    }

    // ── Helpers ────────────────────────────────────────────────────────────
    private static async Task WriteJsonAsync(
        HttpContext ctx, HttpStatusCode status, string message)
    {
        ctx.Response.ContentType = "application/json";
        ctx.Response.StatusCode = (int)status;

        await ctx.Response.WriteAsync(JsonSerializer.Serialize(new
        {
            StatusCode = (int)status,
            Message = message,
            Timestamp = DateTime.UtcNow
        }));
    }

    /// <summary>
    /// Stub — החלף בשירות אמיתי: Email / Slack webhook / Azure Monitor alert.
    /// </summary>
    private Task NotifyCriticalAsync(Exception ex, HttpContext ctx)
    {
        logger.LogError("ALERT | {Type} | {Path} | {Msg}",
            ex.GetType().Name, ctx.Request.Path, ex.Message);
        return Task.CompletedTask;
    }
}
