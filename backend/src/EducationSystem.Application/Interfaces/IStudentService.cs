using EducationSystem.Application.DTOs;

namespace EducationSystem.Application.Interfaces;

public interface IStudentService
{
    Task<StudentDto> UpsertStudentAsync(UpsertStudentDto dto);
}
