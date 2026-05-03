using EducationSystem.Application.Exceptions;
using EducationSystem.Application.Interfaces;
using EducationSystem.Application.Models;
using System.Net;
using System.Text.Json;

namespace EducationSystem.API.Middleware;

/// <summary>
/// מידלוור גלובלי: לוכד חריגות מהצינור ומחזיר JSON אחיד עם קוד HTTP מתאים.
/// Serilog + <see cref="ILogger"/> — לוגים מובנים עם Scope (TraceId, Path).
/// שגיאות 500 — קריאה ל-<see cref="ICriticalErrorNotifier"/> (DI) לפני תשובה ללקוח.
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
            using (BeginRequestScope(ctx))
                logger.LogWarning(ex, "Validation | {Method} {Path} | {Message}",
                    ctx.Request.Method, ctx.Request.Path, ex.Message);
            await WriteJsonAsync(ctx, HttpStatusCode.BadRequest, ex.Message);
        }
        catch (NotFoundException ex)
        {
            using (BeginRequestScope(ctx))
                logger.LogWarning(ex, "NotFound | {Method} {Path} | {Message}",
                    ctx.Request.Method, ctx.Request.Path, ex.Message);
            await WriteJsonAsync(ctx, HttpStatusCode.NotFound, ex.Message);
        }
        catch (Exception ex)
        {
            using (BeginRequestScope(ctx))
            {
                logger.LogCritical(ex,
                    "CRITICAL — Unhandled exception at {Method} {Path}",
                    ctx.Request.Method, ctx.Request.Path);

                var notifier = ctx.RequestServices.GetService<ICriticalErrorNotifier>();
                if (notifier is not null)
                {
                    var alertCtx = new CriticalErrorContext(
                        ctx.TraceIdentifier,
                        ctx.Request.Method,
                        ctx.Request.Path.Value ?? string.Empty,
                        ctx.Request.QueryString.Value);
                    await notifier.NotifyCriticalAsync(ex, alertCtx, ctx.RequestAborted);
                }
            }

            await WriteJsonAsync(ctx, HttpStatusCode.InternalServerError,
                "אירעה שגיאת מערכת. אנא נסה שוב מאוחר יותר.");
        }
    }

    private IDisposable? BeginRequestScope(HttpContext ctx) =>
        logger.BeginScope(new Dictionary<string, object?>
        {
            ["TraceId"] = ctx.TraceIdentifier,
            ["RequestPath"] = ctx.Request.Path.Value,
            ["RequestMethod"] = ctx.Request.Method,
        });

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
            TraceId = ctx.TraceIdentifier,
            Timestamp = DateTime.UtcNow
        }));
    }
}
