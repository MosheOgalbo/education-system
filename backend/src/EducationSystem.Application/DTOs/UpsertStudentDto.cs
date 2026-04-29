namespace EducationSystem.Application.DTOs;

public sealed record UpsertStudentDto(
    int?   Id,
    string Name,
    string IdentityNumber,
    int    Age,
    int    EducationPlaceId,
    bool   IsActive
);
