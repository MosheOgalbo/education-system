using EducationSystem.Application.DTOs;

namespace EducationSystem.Application.Interfaces;

public interface IEducationPlaceService
{
    Task<IEnumerable<EducationPlaceStatsDto>> GetAllWithStatsAsync();
    Task<EducationPlaceStatsDto> GetWithStatsByIdAsync(int id);
    Task<EducationPlaceDto> CreateAsync(CreateEducationPlaceDto dto);
    Task<EducationPlaceDto> UpdateAsync(int id, UpdateEducationPlaceDto dto);
    Task<EducationPlaceDto> SetActiveAsync(int id, SetEducationPlaceActiveDto dto);
    Task DeleteAsync(int id);
}
