using EducationSystem.Application.DTOs;

namespace EducationSystem.Application.Interfaces;

public interface IEducationPlaceRepository
{
    Task<IEnumerable<EducationPlaceStatsDto>> GetAllWithStatsAsync();
    Task<EducationPlaceStatsDto?> GetWithStatsByIdAsync(int id);
    Task<bool> ExistsAsync(int id);
    Task<int> CountStudentsForPlaceAsync(int educationPlaceId);
    Task<EducationPlaceDto> InsertAsync(CreateEducationPlaceDto dto);
    Task<EducationPlaceDto?> UpdateAsync(int id, UpdateEducationPlaceDto dto);
    Task<bool> DeleteAsync(int id);
}
