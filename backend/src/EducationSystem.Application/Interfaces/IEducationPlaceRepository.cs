using EducationSystem.Application.DTOs;
using EducationSystem.Application.Enums;

namespace EducationSystem.Application.Interfaces;

/// <summary>גישה לנתוני פנימיות במסד — כולל אגרגציות.</summary>
public interface IEducationPlaceRepository
{
    Task<IEnumerable<EducationPlaceStatsDto>> GetAllWithStatsAsync();

    Task<EducationPlaceStatsDto?> GetWithStatsByIdAsync(int id);

    /// <summary>null אם הפנימייה לא קיימת; אחרת סטטוס נוכחי.</summary>
    Task<EducationPlaceStatus?> GetStatusIfExistsAsync(int id);

    Task<bool> ExistsAsync(int id);

    Task<int> CountStudentsForPlaceAsync(int educationPlaceId);

    /// <summary>כאשר אין תלמידים משויכים — מעביר ל-<see cref="EducationPlaceStatus.Suspended"/>.</summary>
    Task SetSuspendedIfNoStudentsAsync(int educationPlaceId);

    /// <summary>מתוך השהייה: אם יש לפחות תלמיד אחד — מחזיר ל-<see cref="EducationPlaceStatus.Active"/>.</summary>
    Task TryPromoteSuspendedToActiveWhenHasStudentsAsync(int educationPlaceId);

    Task<EducationPlaceDto> InsertAsync(CreateEducationPlaceDto dto);

    Task<EducationPlaceDto?> UpdateAsync(int id, UpdateEducationPlaceDto dto);

    Task<EducationPlaceDto?> SetStatusAsync(int id, EducationPlaceStatus status);

    Task<bool> DeleteAsync(int id);
}
