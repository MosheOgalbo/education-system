namespace EducationSystem.Domain.Entities;

/// <summary>
/// ישות דומיין של תלמיד (מקבילה לטבלת Student במסד).
/// </summary>
public sealed class Student
{
    public int      Id               { get; set; }
    public string   Name             { get; set; } = string.Empty;
    public string   IdentityNumber   { get; set; } = string.Empty;
    public int      Age              { get; set; }
    public int      EducationPlaceId { get; set; }
    public bool     IsActive         { get; set; }
    public DateTime CreatedAt        { get; set; }
    public DateTime UpdatedAt        { get; set; }
}
