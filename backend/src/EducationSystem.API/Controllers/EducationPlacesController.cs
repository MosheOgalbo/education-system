using EducationSystem.Application.DTOs;
using EducationSystem.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace EducationSystem.API.Controllers;

/// <summary>
/// REST לפנימיות: CRUD, סטטיסטיקת תלמידים, ועדכון סטטוס פעילות (PATCH).
/// </summary>
[ApiController]
[Route("api/[controller]")]
public sealed class EducationPlacesController(IEducationPlaceService service) : ControllerBase
{
    /// <summary>
    /// שולפת את כל הפנימיות הרשומות במערכת.
    /// מחזירה מערך JSON: לכל פנימייה מזהה, שם, עיר, מספר תלמידים פעילים, וגיל ממוצע של התלמידים הפעילים בלבד.
    /// </summary>
    /// <remarks>
    /// אין גוף. 200: מערך <c>EducationPlaceStatsDto</c>.
    /// מקור נתונים: פרוצדורה <c>sp_GetEducationPlacesWithStats</c>.
    /// </remarks>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
        => Ok(await service.GetAllWithStatsAsync());

    /// <summary>
    /// שולפת פנימייה אחת לפי מזהה מספרי.
    /// מחזירה אובייקט JSON יחיד עם אותם שדות סטטיסטיקה כמו בקריאת הרשימה המלאה.
    /// </summary>
    /// <remarks>404 כשאין פנימייה עם <paramref name="id"/>.</remarks>
    [HttpGet("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
        => Ok(await service.GetWithStatsByIdAsync(id));

    /// <summary>
    /// יוצרת רשומת פנימייה חדשה (שם ועיר מגיעים מגוף הבקשה).
    /// מחזירה את הפנימייה שנוצרה כולל המזהה שנוצר אוטומטית במסד.
    /// </summary>
    /// <remarks>
    /// 201 + גוף <c>EducationPlaceDto</c>; כותרת <c>Location</c> ל-GET לפי מזהה.
    /// </remarks>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateEducationPlaceDto dto)
    {
        var created = await service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    /// <summary>
    /// מעדכנת שם ועיר של פנימייה קיימת לפי המזהה בנתיב.
    /// מחזירה את אובייקט הפנימייה לאחר העדכון (ללא חישוב סטטיסטיקות בגוף התשובה).
    /// </summary>
    /// <remarks>404 אם <paramref name="id"/> לא ידוע. לשדות סטטיסטיקה השתמש ב-GET.</remarks>
    [HttpPut("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateEducationPlaceDto dto)
        => Ok(await service.UpdateAsync(id, dto));

    /// <summary>
    /// מעדכן סטטוס תפעולי: <c>isActive: true</c> — פעילה (אם יש תלמידים) או השהייה (אם אין);
    /// <c>isActive: false</c> — לא פעילה (מאפשר מחיקה לאחר מכן אם אין תלמידים).
    /// </summary>
    /// <remarks>
    /// PATCH נפרד מ-PUT של שם/עיר. גוף נשאר תואם ללקוח קיים: <c>{ "isActive": bool }</c>.
    /// </remarks>
    [HttpPatch("{id:int}/active")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SetActive(int id, [FromBody] SetEducationPlaceActiveDto dto)
        => Ok(await service.SetActiveAsync(id, dto));

    /// <summary>
    /// מוחקת פנימייה מהמסד. במצב הצלחה אין תוכן בגוף התשובה.
    /// </summary>
    /// <remarks>
    /// 204 ללא גוף בהצלחה.
    /// 400 כשהסטטוס אינו «לא פעילה», או כשיש תלמידים משויכים.
    /// 404 כש-<paramref name="id"/> לא קיים.
    /// </remarks>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id)
    {
        await service.DeleteAsync(id);
        return NoContent();
    }
}
