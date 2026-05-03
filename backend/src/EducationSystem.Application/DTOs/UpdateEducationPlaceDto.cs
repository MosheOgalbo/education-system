namespace EducationSystem.Application.DTOs;

/// <summary>גוף בקשה לעדכון שם ועיר של פנימייה קיימת.</summary>
public sealed record UpdateEducationPlaceDto(string Name, string City);
