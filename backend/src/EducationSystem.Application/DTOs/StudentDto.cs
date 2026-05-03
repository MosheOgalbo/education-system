namespace EducationSystem.Application.DTOs;

/// <summary>
/// תלמיד כפי שמוחזר מה-API (קריאות GET/POST/PUT).
/// </summary>
/// <param name="Id">מזהה ייחודי במסד.</param>
/// <param name="Name">שם מלא.</param>
/// <param name="IdentityNumber">תעודת זהות — ייחודית במערכת.</param>
/// <param name="Age">גיל (בשרת: בדרך כלל 5–25).</param>
/// <param name="EducationPlaceId">מזהה הפנימייה המשויכת.</param>
/// <param name="IsActive">האם התלמיד נחשב פעיל (משפיע על סטטיסטיקות פנימייה).</param>
public sealed record StudentDto(
    int    Id,
    string Name,
    string IdentityNumber,
    int    Age,
    int    EducationPlaceId,
    bool   IsActive
);
