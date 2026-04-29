namespace EducationSystem.Application.DTOs;

public sealed record StudentDto(
    int    Id,
    string Name,
    string IdentityNumber,
    int    Age,
    int    EducationPlaceId,
    bool   IsActive
);
