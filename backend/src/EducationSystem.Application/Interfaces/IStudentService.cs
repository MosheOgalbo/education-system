using EducationSystem.Application.DTOs;

namespace EducationSystem.Application.Interfaces;

public interface IStudentService
{
    Task<IEnumerable<StudentDto>> GetAllAsync(int? educationPlaceId);
    Task<StudentDto> GetByIdAsync(int id);
    Task<StudentDto> CreateAsync(CreateStudentDto dto);
    Task<StudentDto> UpdateAsync(int id, UpdateStudentDto dto);
    Task DeleteAsync(int id);
    Task<StudentDto> UpsertStudentAsync(UpsertStudentDto dto);
}
