namespace EducationSystem.Application.DTOs;

public sealed record UpdateStudentDto(
    string Name,
    string IdentityNumber,
    int    Age,
    int    EducationPlaceId,
    bool   IsActive
);
