using EducationSystem.Application.Interfaces;
using EducationSystem.Application.Models;

namespace EducationSystem.API.Notifications;

/// <summary>מימוש ברירת־מחדל: רישום מובנה + נקודת עגינה להחלפת מימוש בפרודקשן.</summary>
public sealed class LoggingCriticalErrorNotifier(ILogger<LoggingCriticalErrorNotifier> logger)
    : ICriticalErrorNotifier
{
    /// <inheritdoc />
    public Task NotifyCriticalAsync(
        Exception exception,
        CriticalErrorContext context,
        CancellationToken cancellationToken = default)
    {
        using (logger.BeginScope(new Dictionary<string, object?>
        {
            ["TraceId"] = context.TraceIdentifier,
            ["HttpMethod"] = context.Method,
            ["Path"] = context.Path,
        }))
        {
            logger.LogError(exception,
                "CRITICAL_ALERT | {Method} {Path}{Query} | {ExceptionType}: {Message}",
                context.Method,
                context.Path,
                context.QueryString ?? string.Empty,
                exception.GetType().Name,
                exception.Message);
        }

        return Task.CompletedTask;
    }
}
