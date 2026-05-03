namespace EducationSystem.Domain.Entities;

/// <summary>
/// ישות דומיין של פנימייה (מקבילה לטבלת EducationPlace במסד).
/// </summary>
public sealed class EducationPlace
{
    public int      Id        { get; set; }
    public string   Name      { get; set; } = string.Empty;
    public string   City      { get; set; } = string.Empty;
    public bool     IsActive  { get; set; } = true;
    public DateTime CreatedAt { get; set; }
}
