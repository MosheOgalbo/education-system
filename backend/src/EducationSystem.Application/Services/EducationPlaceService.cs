using EducationSystem.Application.DTOs;
using EducationSystem.Application.Exceptions;
using EducationSystem.Application.Interfaces;

namespace EducationSystem.Application.Services;

public sealed class EducationPlaceService(IEducationPlaceRepository repository)
    : IEducationPlaceService
{
    public Task<IEnumerable<EducationPlaceStatsDto>> GetAllWithStatsAsync()
        => repository.GetAllWithStatsAsync();

    public async Task<EducationPlaceStatsDto> GetWithStatsByIdAsync(int id)
    {
        var row = await repository.GetWithStatsByIdAsync(id);
        if (row is null)
            throw new NotFoundException($"פנימייה עם מזהה {id} אינה קיימת.");
        return row;
    }

    public Task<EducationPlaceDto> CreateAsync(CreateEducationPlaceDto dto)
        => repository.InsertAsync(dto);

    public async Task<EducationPlaceDto> UpdateAsync(int id, UpdateEducationPlaceDto dto)
    {
        var updated = await repository.UpdateAsync(id, dto);
        if (updated is null)
            throw new NotFoundException($"פנימייה עם מזהה {id} אינה קיימת.");
        return updated;
    }

    public async Task DeleteAsync(int id)
    {
        if (!await repository.ExistsAsync(id))
            throw new NotFoundException($"פנימייה עם מזהה {id} אינה קיימת.");

        if (await repository.CountStudentsForPlaceAsync(id) > 0)
            throw new ValidationException("לא ניתן למחוק פנימייה שיש לה תלמידים משויכים.");

        await repository.DeleteAsync(id);
    }
}
