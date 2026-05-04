using EducationSystem.Application.DTOs;
using EducationSystem.Application.Enums;
using EducationSystem.Application.Exceptions;
using EducationSystem.Application.Interfaces;
using EducationSystem.Application.Validation;

namespace EducationSystem.Application.Services;

/// <summary>
/// שירות תלמידים: ולידציה עסקית לפני כתיבה למסד (גיל, ת״ז, שם, פנימייה פעילה/בהשהייה, ייחודיות ת״ז),
/// וסנכרון סטטוס פנימייה (השהייה כשאין תלמידים, חזרה לפעילה כשיש).
/// </summary>
public sealed class StudentService(
    IStudentRepository         studentRepository,
    IEducationPlaceRepository  educationPlaceRepository) : IStudentService
{
    private const int MinAge = 5;
    /// <summary>גיל מקסימלי לשיבוץ/עדכון תלמיד בפנימייה (רק כשמשנים גיל).</summary>
    private const int MaxAge = 19;

    /// <inheritdoc />
    public Task<IEnumerable<StudentDto>> GetAllAsync(int? educationPlaceId)
        => studentRepository.GetAllAsync(educationPlaceId);

    /// <inheritdoc />
    public async Task<StudentDto> GetByIdAsync(int id)
    {
        var student = await studentRepository.GetByIdAsync(id);
        if (student is null)
            throw new NotFoundException($"תלמיד עם מזהה {id} אינו קיים.");
        return student;
    }

    /// <inheritdoc />
    public async Task<StudentDto> CreateAsync(CreateStudentDto dto)
    {
        var idNorm = NormalizeAndValidateStudentInput(dto.Name, dto.IdentityNumber, dto.EducationPlaceId);
        ValidateAge(dto.Age);
        await EnsurePlaceAcceptsEnrollmentAsync(dto.EducationPlaceId);
        await EnsureIdentityUnique(idNorm, excludeId: null);

        var toInsert = dto with { IdentityNumber = idNorm };
        var created = await studentRepository.InsertAsync(toInsert);
        await SyncEducationPlaceStatusAfterStudentChangeAsync(dto.EducationPlaceId);
        return created;
    }

    /// <inheritdoc />
    public async Task<StudentDto> UpdateAsync(int id, UpdateStudentDto dto)
    {
        var existing = await studentRepository.GetByIdAsync(id);
        if (existing is null)
            throw new NotFoundException($"תלמיד עם מזהה {id} אינו קיים.");

        var nameTrim = (dto.Name ?? string.Empty).Trim();
        if (!string.Equals(nameTrim, existing.Name.Trim(), StringComparison.Ordinal))
            BusinessInputValidators.ValidateStudentName(dto.Name ?? string.Empty);

        if (dto.Age != existing.Age)
            ValidateAge(dto.Age);

        if (dto.EducationPlaceId <= 0)
            throw new ValidationException("מזהה פנימייה חייב להיות ערך חיובי תקף.");

        var idNorm = ResolveIdentityNumberForUpdate(dto.IdentityNumber, existing.IdentityNumber);

        await EnsurePlaceAcceptsEnrollmentAsync(dto.EducationPlaceId);
        await EnsureIdentityUnique(idNorm, excludeId: id);

        var toUpdate = dto with { Name = nameTrim, IdentityNumber = idNorm };
        var updated = await studentRepository.UpdateAsync(id, toUpdate);
        if (updated is null)
            throw new NotFoundException($"תלמיד עם מזהה {id} אינו קיים.");

        await SyncEducationPlaceStatusAfterStudentChangeAsync(
            existing.EducationPlaceId,
            dto.EducationPlaceId);
        return updated;
    }

    /// <inheritdoc />
    public async Task DeleteAsync(int id)
    {
        var student = await studentRepository.GetByIdAsync(id);
        if (student is null)
            throw new NotFoundException($"תלמיד עם מזהה {id} אינו קיים.");

        if (!await studentRepository.DeleteAsync(id))
            throw new NotFoundException($"תלמיד עם מזהה {id} אינו קיים.");

        await SyncEducationPlaceStatusAfterStudentChangeAsync(student.EducationPlaceId);
    }

    /// <inheritdoc />
    public async Task<StudentDto> UpsertStudentAsync(UpsertStudentDto dto)
    {
        StudentDto? prior = null;
        if (dto.Id is > 0)
            prior = await studentRepository.GetByIdAsync(dto.Id.Value);

        string idNorm;
        if (prior is null)
        {
            idNorm = NormalizeAndValidateStudentInput(
                dto.Name ?? string.Empty,
                dto.IdentityNumber,
                dto.EducationPlaceId);
            ValidateAge(dto.Age);
        }
        else
        {
            var nameTrim = (dto.Name ?? string.Empty).Trim();
            if (!string.Equals(nameTrim, prior.Name.Trim(), StringComparison.Ordinal))
                BusinessInputValidators.ValidateStudentName(dto.Name ?? string.Empty);
            if (dto.Age != prior.Age)
                ValidateAge(dto.Age);
            if (dto.EducationPlaceId <= 0)
                throw new ValidationException("מזהה פנימייה חייב להיות ערך חיובי תקף.");
            idNorm = ResolveIdentityNumberForUpdate(dto.IdentityNumber, prior.IdentityNumber);
        }

        await EnsurePlaceAcceptsEnrollmentAsync(dto.EducationPlaceId);
        await EnsureIdentityUnique(idNorm, dto.Id);

        if (dto.Id is > 0 && prior is null)
            throw new NotFoundException($"תלמיד עם מזהה {dto.Id} אינו קיים.");

        var nameForRow = (dto.Name ?? string.Empty).Trim();
        var toUpsert = dto with { IdentityNumber = idNorm, Name = nameForRow };
        var result = await studentRepository.UpsertAsync(toUpsert);

        await SyncEducationPlaceStatusAfterStudentChangeAsync(
            prior?.EducationPlaceId ?? result.EducationPlaceId,
            result.EducationPlaceId);

        return result;
    }

    /// <summary>
    /// יצירה: שם + ת״ז מלאים (כולל ספרת ביקורת).
    /// </summary>
    private static string NormalizeAndValidateStudentInput(
        string name,
        string identityNumber,
        int educationPlaceId)
    {
        BusinessInputValidators.ValidateStudentName(name);
        if (educationPlaceId <= 0)
            throw new ValidationException("מזהה פנימייה חייב להיות ערך חיובי תקף.");
        return BusinessInputValidators.NormalizeIsraeliIdentityNumber(identityNumber);
    }

    /// <summary>
    /// עדכון: אם הת״ז זהה למה שכבר במסד (אותן ספרות אחרי מילוי לאפסים), לא מריצים שוב בדיקת ספרת ביקורת —
    /// כדי לא לחסום העברה/עריכה כשיש רשומות ישנות שלא עמדו בולידציה הנוכחית.
    /// </summary>
    private static string ResolveIdentityNumberForUpdate(string dtoIdentity, string existingIdentity)
    {
        static string Digits(string? s) => new string((s ?? string.Empty).Where(char.IsAsciiDigit).ToArray());

        var d = Digits(dtoIdentity);
        var e = Digits(existingIdentity);
        if (d.Length is >= 5 and <= 9 && e.Length is >= 5 and <= 9)
        {
            var dPad = d.PadLeft(9, '0');
            var ePad = e.PadLeft(9, '0');
            if (dPad == ePad)
                return dPad;
        }

        return BusinessInputValidators.NormalizeIsraeliIdentityNumber(dtoIdentity);
    }

    private static void ValidateAge(int age)
    {
        if (age < MinAge || age > MaxAge)
            throw new ValidationException($"גיל חייב להיות בין {MinAge} ל-{MaxAge}.");
    }

    /// <summary>שיבוץ מותר לפנימייה «פעילה» או «בהשהייה» (ללא תלמידים); לא ל«לא פעילה».</summary>
    private async Task EnsurePlaceAcceptsEnrollmentAsync(int educationPlaceId)
    {
        var status = await educationPlaceRepository.GetStatusIfExistsAsync(educationPlaceId);
        if (status is null)
            throw new NotFoundException($"פנימייה עם מזהה {educationPlaceId} אינה קיימת.");
        if (status == EducationPlaceStatus.Inactive)
            throw new ValidationException(
                "לא ניתן לשבץ או לעדכן תלמיד לפנימייה במצב «לא פעילה».");
    }

    private async Task EnsureIdentityUnique(string identityNumber, int? excludeId)
    {
        if (await studentRepository.IdentityNumberExistsAsync(identityNumber, excludeId))
            throw new ValidationException($"תעודת זהות '{identityNumber}' כבר קיימת במערכת.");
    }

    private async Task SyncEducationPlaceStatusAfterStudentChangeAsync(params int[] educationPlaceIds)
    {
        foreach (var pid in educationPlaceIds.Distinct())
        {
            await educationPlaceRepository.TryPromoteSuspendedToActiveWhenHasStudentsAsync(pid);
            await educationPlaceRepository.SetSuspendedIfNoStudentsAsync(pid);
        }
    }
}
