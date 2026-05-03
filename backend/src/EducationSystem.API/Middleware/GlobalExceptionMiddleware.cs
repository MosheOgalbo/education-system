using EducationSystem.Application.Exceptions;
using System.Net;
using System.Text.Json;

namespace EducationSystem.API.Middleware;

/// <summary>
/// מידלוור גלובלי: לוכד חריגות מהצינור ומחזיר JSON אחיד עם קוד HTTP מתאים.
/// </summary>
public sealed class GlobalExceptionMiddleware(
    RequestDelegate next,
    ILogger<GlobalExceptionMiddleware> logger)
{
    /// <summary>ממשיך לבקשה; תופס ValidationException, NotFoundException וכל השאר.</summary>
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

            await NotifyCriticalAsync(ex, ctx); // נקודת הרחבה: התראות למערכת ניטור
            await WriteJsonAsync(ctx, HttpStatusCode.InternalServerError,
                "אירעה שגיאת מערכת. אנא נסה שוב מאוחר יותר.");
        }
    }

    /// <summary>כותב גוף JSON עם statusCode, message, timestamp.</summary>
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
    /// מקום להחלפה בשירות אמיתי: אימייל / Slack / Azure Monitor.
    /// </summary>
    private Task NotifyCriticalAsync(Exception ex, HttpContext ctx)
    {
        logger.LogError("ALERT | {Type} | {Path} | {Msg}",
            ex.GetType().Name, ctx.Request.Path, ex.Message);
        return Task.CompletedTask;
    }
}
