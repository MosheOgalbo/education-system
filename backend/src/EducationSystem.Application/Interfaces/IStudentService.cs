using EducationSystem.Application.DTOs;

namespace EducationSystem.Application.Interfaces;

/// <summary>לוגיקה עסקית לתלמידים — ולידציה לפני הרפוזיטורי.</summary>
public interface IStudentService
{
    Task<IEnumerable<StudentDto>> GetAllAsync(int? educationPlaceId);

    /// <summary>זורק NotFoundException אם לא קיים.</summary>
    Task<StudentDto> GetByIdAsync(int id);

    Task<StudentDto> CreateAsync(CreateStudentDto dto);

    Task<StudentDto> UpdateAsync(int id, UpdateStudentDto dto);

    Task DeleteAsync(int id);

    Task<StudentDto> UpsertStudentAsync(UpsertStudentDto dto);
}
