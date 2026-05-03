namespace EducationSystem.Domain.Entities;

/// <summary>
/// ישות דומיין של פנימייה (מקבילה לטבלת EducationPlace במסד).
/// </summary>
public sealed class EducationPlace
{
    public int      Id        { get; set; }
    public string   Name      { get; set; } = string.Empty;
    public string   City      { get; set; } = string.Empty;
    /// <summary>0=Active, 1=Suspended, 2=Inactive — תואם <c>EducationPlaceStatus</c> בשכבת Application.</summary>
    public byte     Status    { get; set; }
    public DateTime CreatedAt { get; set; }
}
