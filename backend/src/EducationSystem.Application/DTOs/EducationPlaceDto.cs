using EducationSystem.Application.Enums;

namespace EducationSystem.Application.DTOs;

public sealed record EducationPlaceDto(
    int                   Id,
    string                Name,
    string                City,
    EducationPlaceStatus  Status);
