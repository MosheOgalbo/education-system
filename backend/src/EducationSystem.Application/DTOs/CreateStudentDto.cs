namespace EducationSystem.Application.DTOs;

public sealed record CreateStudentDto(
    string Name,
    string IdentityNumber,
    int    Age,
    int    EducationPlaceId,
    bool   IsActive
);
