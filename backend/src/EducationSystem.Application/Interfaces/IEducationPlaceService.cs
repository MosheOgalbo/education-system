using EducationSystem.Application.DTOs;

namespace EducationSystem.Application.Interfaces;

/// <summary>לוגיקה עסקית לפנימיות — כולל כללי מחיקה.</summary>
public interface IEducationPlaceService
{
    Task<IEnumerable<EducationPlaceStatsDto>> GetAllWithStatsAsync();

    Task<EducationPlaceStatsDto> GetWithStatsByIdAsync(int id);

    Task<EducationPlaceDto> CreateAsync(CreateEducationPlaceDto dto);

    Task<EducationPlaceDto> UpdateAsync(int id, UpdateEducationPlaceDto dto);

    Task<EducationPlaceDto> SetActiveAsync(int id, SetEducationPlaceActiveDto dto);

    Task DeleteAsync(int id);
}
