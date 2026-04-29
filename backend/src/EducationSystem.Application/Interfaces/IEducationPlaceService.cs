using EducationSystem.Application.DTOs;

namespace EducationSystem.Application.Interfaces;

public interface IEducationPlaceService
{
    Task<IEnumerable<EducationPlaceStatsDto>> GetAllWithStatsAsync();
}
