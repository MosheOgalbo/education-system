using EducationSystem.Application.DTOs;

namespace EducationSystem.Application.Interfaces;

public interface IEducationPlaceRepository
{
    Task<IEnumerable<EducationPlaceStatsDto>> GetAllWithStatsAsync();
    Task<bool> ExistsAsync(int id);
}
