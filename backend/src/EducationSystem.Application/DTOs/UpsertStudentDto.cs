namespace EducationSystem.Application.DTOs;

/// <summary>
/// גוף ל-upsert: <c>Id</c> null או 0 ⇒ INSERT; אחרת ⇒ UPDATE לפי מזהה.
/// </summary>
public sealed record UpsertStudentDto(
    int?   Id,
    string Name,
    string IdentityNumber,
    int    Age,
    int    EducationPlaceId,
    bool   IsActive
);
