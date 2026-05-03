using EducationSystem.Application.Models;

namespace EducationSystem.Application.Interfaces;

/// <summary>
/// הרחבה ל-DI: התראה על שגיאת מערכת קריטית (לפני החזרת 500 ללקוח).
/// מימוש ברירת־מחדל — לוג; ניתן להחליף בשירות חיצוני (Sentry, אימייל, וכו').
/// </summary>
public interface ICriticalErrorNotifier
{
    Task NotifyCriticalAsync(
        Exception exception,
        CriticalErrorContext context,
        CancellationToken cancellationToken = default);
}
