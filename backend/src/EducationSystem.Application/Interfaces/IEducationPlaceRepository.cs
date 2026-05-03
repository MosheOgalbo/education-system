using EducationSystem.Application.DTOs;

namespace EducationSystem.Application.Interfaces;

/// <summary>גישה לנתוני פנימיות במסד — כולל אגרגציות.</summary>
public interface IEducationPlaceRepository
{
    /// <summary>כל הפנימיות עם סטטיסטיקה (בדרך כלל דרך SP).</summary>
    Task<IEnumerable<EducationPlaceStatsDto>> GetAllWithStatsAsync();

    /// <summary>פנימייה אחת עם סטטיסטיקה או null.</summary>
    Task<EducationPlaceStatsDto?> GetWithStatsByIdAsync(int id);

    /// <summary>null אם הפנימייה לא קיימת; אחרת ערך IsActive.</summary>
    Task<bool?> GetIsActiveIfExistsAsync(int id);

    /// <summary>האם קיימת רשומה עם המזהה.</summary>
    Task<bool> ExistsAsync(int id);

    /// <summary>כמה תלמידים משויכים לפנימייה (לכלל מחיקה).</summary>
    Task<int> CountStudentsForPlaceAsync(int educationPlaceId);

    Task<EducationPlaceDto> InsertAsync(CreateEducationPlaceDto dto);

    Task<EducationPlaceDto?> UpdateAsync(int id, UpdateEducationPlaceDto dto);

    Task<EducationPlaceDto?> SetActiveAsync(int id, bool isActive);

    Task<bool> DeleteAsync(int id);
}
