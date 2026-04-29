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

    public async Task<StudentDto> UpsertStudentAsync(UpsertStudentDto dto)
    {
        if (dto.Age < MinAge || dto.Age > MaxAge)
            throw new ValidationException($"גיל חייב להיות בין {MinAge} ל-{MaxAge}.");

        if (!await educationPlaceRepository.ExistsAsync(dto.EducationPlaceId))
            throw new NotFoundException($"פנימייה עם מזהה {dto.EducationPlaceId} אינה קיימת.");

        if (await studentRepository.IdentityNumberExistsAsync(dto.IdentityNumber, dto.Id))
            throw new ValidationException($"תעודת זהות '{dto.IdentityNumber}' כבר קיימת במערכת.");

        return await studentRepository.UpsertAsync(dto);
    }
}
