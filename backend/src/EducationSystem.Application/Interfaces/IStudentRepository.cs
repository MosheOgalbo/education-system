using EducationSystem.Application.DTOs;

namespace EducationSystem.Application.Interfaces;

public interface IStudentRepository
{
    Task<IEnumerable<StudentDto>> GetAllAsync(int? educationPlaceId);
    Task<StudentDto?> GetByIdAsync(int id);
    Task<StudentDto> InsertAsync(CreateStudentDto dto);
    Task<StudentDto?> UpdateAsync(int id, UpdateStudentDto dto);
    Task<bool> DeleteAsync(int id);
    Task<StudentDto> UpsertAsync(UpsertStudentDto dto);
    Task<bool> IdentityNumberExistsAsync(string identityNumber, int? excludeId = null);
}
