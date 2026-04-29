using EducationSystem.Application.DTOs;
using EducationSystem.Application.Interfaces;

namespace EducationSystem.Application.Services;

public sealed class EducationPlaceService(IEducationPlaceRepository repository)
    : IEducationPlaceService
{
    public Task<IEnumerable<EducationPlaceStatsDto>> GetAllWithStatsAsync()
        => repository.GetAllWithStatsAsync();
}
