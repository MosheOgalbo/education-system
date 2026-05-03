using EducationSystem.Application.DTOs;
using EducationSystem.Application.Enums;
using EducationSystem.Application.Exceptions;
using EducationSystem.Application.Interfaces;

namespace EducationSystem.Application.Services;

/// <summary>
/// שירות פנימיות: שליפה עם סטטיסטיקה, CRUD, עדכון סטטוס (פעילה / לא פעילה / השהייה אוטומטית),
/// ומחיקה רק במצב «לא פעילה» וללא תלמידים משויכים.
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
        if (!await repository.ExistsAsync(id))
            throw new NotFoundException($"פנימייה עם מזהה {id} אינה קיימת.");

        var count = await repository.CountStudentsForPlaceAsync(id);
        var target = !dto.IsActive
            ? EducationPlaceStatus.Inactive
            : count == 0
                ? EducationPlaceStatus.Suspended
                : EducationPlaceStatus.Active;

        var updated = await repository.SetStatusAsync(id, target);
        if (updated is null)
            throw new NotFoundException($"פנימייה עם מזהה {id} אינה קיימת.");
        return updated;
    }

    /// <inheritdoc />
    public async Task DeleteAsync(int id)
    {
        if (!await repository.ExistsAsync(id))
            throw new NotFoundException($"פנימייה עם מזהה {id} אינה קיימת.");

        var status = await repository.GetStatusIfExistsAsync(id);
        if (status != EducationPlaceStatus.Inactive)
            throw new ValidationException(
                "לא ניתן למחוק פנימייה שאינה במצב «לא פעילה». " +
                "במצב פעילה או בהשהייה יש להעביר תחילה ל«לא פעילה» (PATCH), ורק אז ניתן למחוק.");

        if (await repository.CountStudentsForPlaceAsync(id) > 0)
            throw new ValidationException("לא ניתן למחוק פנימייה שיש לה תלמידים משויכים.");

        await repository.DeleteAsync(id);
    }
}
