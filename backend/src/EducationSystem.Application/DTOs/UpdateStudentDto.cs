namespace EducationSystem.Application.DTOs;

/// <summary>גוף בקשה לעדכון תלמיד; המזהה מגיע מהנתיב PUT.</summary>
public sealed record UpdateStudentDto(
    string Name,
    string IdentityNumber,
    int    Age,
    int    EducationPlaceId,
    bool   IsActive
);
