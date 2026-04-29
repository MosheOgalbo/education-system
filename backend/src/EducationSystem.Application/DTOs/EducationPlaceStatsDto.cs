namespace EducationSystem.Application.DTOs;

public sealed record EducationPlaceStatsDto(
    int     Id,
    string  Name,
    string  City,
    int     ActiveStudentCount,
    decimal AverageAge
);
