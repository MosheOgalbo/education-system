namespace EducationSystem.Application.Enums;

/// <summary>
/// סטטוס פנימייה: פעילה, השהייה (אין תלמידים — אוטומטי), לא פעילה (ידני — ניתן למחוק אם אין תלמידים).
/// </summary>
public enum EducationPlaceStatus : byte
{
    Active = 0,
    Suspended = 1,
    Inactive = 2,
}
