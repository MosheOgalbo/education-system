using EducationSystem.Application.Enums;

namespace EducationSystem.Application.DTOs;

/// <summary>
/// פנימייה עם אגרגציה: סטטוס (פעילה / השהייה / לא פעילה), מספר תלמידים כולל ופעילים, גיל ממוצע לפעילים בלבד.
/// </summary>
public sealed record EducationPlaceStatsDto(
    int                   Id,
    string                Name,
    string                City,
    EducationPlaceStatus  Status,
    int                   TotalStudentCount,
    int                   ActiveStudentCount,
    decimal               AverageAge);
