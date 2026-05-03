namespace EducationSystem.Application.DTOs;

/// <summary>גוף בקשה ליצירת תלמיד חדש (ללא מזהה — נוצר במסד).</summary>
public sealed record CreateStudentDto(
    string Name,
    string IdentityNumber,
    int    Age,
    int    EducationPlaceId,
    bool   IsActive
);
