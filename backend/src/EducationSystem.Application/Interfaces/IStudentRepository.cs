using EducationSystem.Application.DTOs;

namespace EducationSystem.Application.Interfaces;

/// <summary>
/// גישה לנתוני תלמידים במסד (Dapper) — ללא לוגיקה עסקית.
/// </summary>
public interface IStudentRepository
{
    /// <summary>כל התלמידים, או מסוננים לפי פנימייה.</summary>
    Task<IEnumerable<StudentDto>> GetAllAsync(int? educationPlaceId);

    /// <summary>תלמיד לפי מזהה או null אם לא קיים.</summary>
    Task<StudentDto?> GetByIdAsync(int id);

    /// <summary>הוספת רשומה; מחזיר את השורה שנוצרה (כולל Id).</summary>
    Task<StudentDto> InsertAsync(CreateStudentDto dto);

    /// <summary>עדכון; null אם לא נמצאה שורה לעדכון.</summary>
    Task<StudentDto?> UpdateAsync(int id, UpdateStudentDto dto);

    /// <summary>true אם נמחקה שורה אחת לפחות.</summary>
    Task<bool> DeleteAsync(int id);

    /// <summary>INSERT או UPDATE לפי UpsertStudentDto.Id.</summary>
    Task<StudentDto> UpsertAsync(UpsertStudentDto dto);

    /// <summary>בדיקת כפילות תעודת זהות; excludeId לעדכון (להתעלם מהרשומה הנוכחית).</summary>
    Task<bool> IdentityNumberExistsAsync(string identityNumber, int? excludeId = null);
}
