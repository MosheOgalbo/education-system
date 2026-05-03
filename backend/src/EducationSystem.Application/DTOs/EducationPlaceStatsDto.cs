namespace EducationSystem.Application.DTOs;

/// <summary>
/// פנימייה עם אגרגציה: מספר תלמידים פעילים וגיל ממוצע לפעילים בלבד.
/// </summary>
public sealed record EducationPlaceStatsDto(
    int     Id,
    string  Name,
    string  City,
    bool    IsActive,
    int     ActiveStudentCount,
    decimal AverageAge
);
