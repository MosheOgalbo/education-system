namespace EducationSystem.Application.DTOs;

/// <summary>פנימייה ללא שדות סטטיסטיקה מחושבים (תשובות POST/PUT/PATCH).</summary>
public sealed record EducationPlaceDto(int Id, string Name, string City, bool IsActive);
