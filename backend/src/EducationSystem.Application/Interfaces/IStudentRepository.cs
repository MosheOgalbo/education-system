using EducationSystem.Application.DTOs;

namespace EducationSystem.Application.Interfaces;

public interface IStudentRepository
{
    Task<StudentDto> UpsertAsync(UpsertStudentDto dto);
    Task<bool> IdentityNumberExistsAsync(string identityNumber, int? excludeId = null);
}
