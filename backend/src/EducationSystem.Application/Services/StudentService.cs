using EducationSystem.Application.DTOs;
using EducationSystem.Application.Exceptions;
using EducationSystem.Application.Interfaces;

namespace EducationSystem.Application.Services;

public sealed class StudentService(
    IStudentRepository         studentRepository,
    IEducationPlaceRepository  educationPlaceRepository) : IStudentService
{
    private const int MinAge = 5;
    private const int MaxAge = 25;

    public Task<IEnumerable<StudentDto>> GetAllAsync(int? educationPlaceId)
        => studentRepository.GetAllAsync(educationPlaceId);

    public async Task<StudentDto> GetByIdAsync(int id)
    {
        var student = await studentRepository.GetByIdAsync(id);
        if (student is null)
            throw new NotFoundException($"תלמיד עם מזהה {id} אינו קיים.");
        return student;
    }

    public async Task<StudentDto> CreateAsync(CreateStudentDto dto)
    {
        ValidateAge(dto.Age);
        await EnsurePlaceExists(dto.EducationPlaceId);
        await EnsureIdentityUnique(dto.IdentityNumber, excludeId: null);

        return await studentRepository.InsertAsync(dto);
    }

    public async Task<StudentDto> UpdateAsync(int id, UpdateStudentDto dto)
    {
        ValidateAge(dto.Age);
        await EnsurePlaceExists(dto.EducationPlaceId);
        await EnsureIdentityUnique(dto.IdentityNumber, excludeId: id);

        var updated = await studentRepository.UpdateAsync(id, dto);
        if (updated is null)
            throw new NotFoundException($"תלמיד עם מזהה {id} אינו קיים.");

        return updated;
    }

    public async Task DeleteAsync(int id)
    {
        if (!await studentRepository.DeleteAsync(id))
            throw new NotFoundException($"תלמיד עם מזהה {id} אינו קיים.");
    }

    public async Task<StudentDto> UpsertStudentAsync(UpsertStudentDto dto)
    {
        ValidateAge(dto.Age);
        await EnsurePlaceExists(dto.EducationPlaceId);
        await EnsureIdentityUnique(dto.IdentityNumber, dto.Id);

        if (dto.Id is > 0 && await studentRepository.GetByIdAsync(dto.Id.Value) is null)
            throw new NotFoundException($"תלמיד עם מזהה {dto.Id} אינו קיים.");

        return await studentRepository.UpsertAsync(dto);
    }

    private void ValidateAge(int age)
    {
        if (age < MinAge || age > MaxAge)
            throw new ValidationException($"גיל חייב להיות בין {MinAge} ל-{MaxAge}.");
    }

    private async Task EnsurePlaceExists(int educationPlaceId)
    {
        if (!await educationPlaceRepository.ExistsAsync(educationPlaceId))
            throw new NotFoundException($"פנימייה עם מזהה {educationPlaceId} אינה קיימת.");
    }

    private async Task EnsureIdentityUnique(string identityNumber, int? excludeId)
    {
        if (await studentRepository.IdentityNumberExistsAsync(identityNumber, excludeId))
            throw new ValidationException($"תעודת זהות '{identityNumber}' כבר קיימת במערכת.");
    }
}
