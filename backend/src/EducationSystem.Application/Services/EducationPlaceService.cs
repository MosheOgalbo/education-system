using EducationSystem.Application.DTOs;
using EducationSystem.Application.Exceptions;
using EducationSystem.Application.Interfaces;

namespace EducationSystem.Application.Services;

/// <summary>
/// שירות פנימיות: שליפה עם סטטיסטיקה, CRUD, וכלל מחיקה כשאין תלמידים.
/// </summary>
public sealed class EducationPlaceService(IEducationPlaceRepository repository)
    : IEducationPlaceService
{
    /// <inheritdoc />
    public Task<IEnumerable<EducationPlaceStatsDto>> GetAllWithStatsAsync()
        => repository.GetAllWithStatsAsync();

    /// <inheritdoc />
    public async Task<EducationPlaceStatsDto> GetWithStatsByIdAsync(int id)
    {
        var row = await repository.GetWithStatsByIdAsync(id);
        if (row is null)
            throw new NotFoundException($"פנימייה עם מזהה {id} אינה קיימת.");
        return row;
    }

    /// <inheritdoc />
    public Task<EducationPlaceDto> CreateAsync(CreateEducationPlaceDto dto)
        => repository.InsertAsync(dto);

    /// <inheritdoc />
    public async Task<EducationPlaceDto> UpdateAsync(int id, UpdateEducationPlaceDto dto)
    {
        var updated = await repository.UpdateAsync(id, dto);
        if (updated is null)
            throw new NotFoundException($"פנימייה עם מזהה {id} אינה קיימת.");
        return updated;
    }

    /// <inheritdoc />
    public async Task<EducationPlaceDto> SetActiveAsync(int id, SetEducationPlaceActiveDto dto)
    {
        var updated = await repository.SetActiveAsync(id, dto.IsActive);
        if (updated is null)
            throw new NotFoundException($"פנימייה עם מזהה {id} אינה קיימת.");
        return updated;
    }

    /// <inheritdoc />
    public async Task DeleteAsync(int id)
    {
        if (!await repository.ExistsAsync(id))
            throw new NotFoundException($"פנימייה עם מזהה {id} אינה קיימת.");

        if (await repository.CountStudentsForPlaceAsync(id) > 0)
            throw new ValidationException("לא ניתן למחוק פנימייה שיש לה תלמידים משויכים.");

        await repository.DeleteAsync(id);
    }
}
