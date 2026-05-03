using EducationSystem.Application.DTOs;
using EducationSystem.Application.Enums;
using EducationSystem.Application.Exceptions;
using EducationSystem.Application.Interfaces;

namespace EducationSystem.Application.Services;

/// <summary>
/// שירות תלמידים: ולידציה עסקית לפני כתיבה למסד (גיל, פנימייה פעילה/בהשהייה, ייחודיות ת״ז),
/// כללי הסרה (גיל להסרה מהמערכת), וסנכרון סטטוס פנימייה (השהייה כשאין תלמידים, חזרה לפעילה כשיש).
/// </summary>
public sealed class StudentService(
    IStudentRepository         studentRepository,
    IEducationPlaceRepository  educationPlaceRepository) : IStudentService
{
    private const int MinAge = 5;
    private const int MaxAge = 25;

    /// <summary>גיל מקסימלי להסרת תלמיד מהמערכת (מחיקה) — כלל עסקי.</summary>
    private const int MaxAgeEligibleForPermanentRemoval = 19;

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
        ValidateCommonStudentFields(dto.Name, dto.IdentityNumber, dto.EducationPlaceId);
        ValidateAge(dto.Age);
        await EnsurePlaceAcceptsEnrollmentAsync(dto.EducationPlaceId);
        await EnsureIdentityUnique(dto.IdentityNumber, excludeId: null);

        var created = await studentRepository.InsertAsync(dto);
        await SyncEducationPlaceStatusAfterStudentChangeAsync(dto.EducationPlaceId);
        return created;
    }

    /// <inheritdoc />
    public async Task<StudentDto> UpdateAsync(int id, UpdateStudentDto dto)
    {
        var existing = await studentRepository.GetByIdAsync(id);
        if (existing is null)
            throw new NotFoundException($"תלמיד עם מזהה {id} אינו קיים.");

        ValidateCommonStudentFields(dto.Name, dto.IdentityNumber, dto.EducationPlaceId);
        ValidateAge(dto.Age);
        await EnsurePlaceAcceptsEnrollmentAsync(dto.EducationPlaceId);
        await EnsureIdentityUnique(dto.IdentityNumber, excludeId: id);

        var updated = await studentRepository.UpdateAsync(id, dto);
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

        ValidateEligibleForPermanentRemoval(student);

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

        ValidateCommonStudentFields(dto.Name, dto.IdentityNumber, dto.EducationPlaceId);
        ValidateAge(dto.Age);
        await EnsurePlaceAcceptsEnrollmentAsync(dto.EducationPlaceId);
        await EnsureIdentityUnique(dto.IdentityNumber, dto.Id);

        if (dto.Id is > 0 && prior is null)
            throw new NotFoundException($"תלמיד עם מזהה {dto.Id} אינו קיים.");

        var result = await studentRepository.UpsertAsync(dto);

        await SyncEducationPlaceStatusAfterStudentChangeAsync(
            prior?.EducationPlaceId ?? result.EducationPlaceId,
            result.EducationPlaceId);

        return result;
    }

    private static void ValidateEligibleForPermanentRemoval(StudentDto student)
    {
        if (student.Age > MaxAgeEligibleForPermanentRemoval)
            throw new ValidationException(
                $"לא ניתן להסיר תלמיד מהמערכת שגילו מעל {MaxAgeEligibleForPermanentRemoval}. " +
                "ניתן לעדכן פרטים או להפוך את הרישום ללא פעיל.");
    }

    private static void ValidateCommonStudentFields(
        string name,
        string identityNumber,
        int educationPlaceId)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ValidationException("שם התלמיד הוא שדה חובה.");
        if (name.Trim().Length > 200)
            throw new ValidationException("שם התלמיד ארוך מדי.");

        if (string.IsNullOrWhiteSpace(identityNumber))
            throw new ValidationException("מספר זהות הוא שדה חובה.");
        var idTrim = identityNumber.Trim();
        if (idTrim.Length < 5 || idTrim.Length > 20)
            throw new ValidationException("מספר הזהות אינו בתבנית חוקית.");

        if (educationPlaceId <= 0)
            throw new ValidationException("מזהה פנימייה חייב להיות ערך חיובי תקף.");
    }

    private void ValidateAge(int age)
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
