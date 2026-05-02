namespace EducationSystem.Application.DTOs;

public sealed record EducationPlaceStatsDto(
    int     Id,
    string  Name,
    string  City,
    bool    IsActive,
    int     ActiveStudentCount,
    decimal AverageAge
);
