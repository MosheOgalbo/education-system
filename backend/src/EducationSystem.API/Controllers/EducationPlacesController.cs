using EducationSystem.Application.DTOs;
using EducationSystem.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace EducationSystem.API.Controllers;

/// <summary>REST API for education places (boarding schools): CRUD and aggregated student statistics.</summary>
[ApiController]
[Route("api/[controller]")]
public sealed class EducationPlacesController(IEducationPlaceService service) : ControllerBase
{
    /// <summary>
    /// שולפת את כל הפנימיות הרשומות במערכת.
    /// מחזירה מערך JSON: לכל פנימייה מזהה, שם, עיר, מספר תלמידים פעילים, וגיל ממוצע של התלמידים הפעילים בלבד.
    /// </summary>
    /// <remarks>
    /// No request body. HTTP 200: array of <c>EducationPlaceStatsDto</c>.
    /// Data source: stored procedure <c>sp_GetEducationPlacesWithStats</c> (JOIN + GROUP BY).
    /// </remarks>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
        => Ok(await service.GetAllWithStatsAsync());

    /// <summary>
    /// שולפת פנימייה אחת לפי מזהה מספרי.
    /// מחזירה אובייקט JSON יחיד עם אותם שדות סטטיסטיקה כמו בקריאת הרשימה המלאה.
    /// </summary>
    /// <remarks>HTTP 404 when no <c>EducationPlace</c> exists for route <paramref name="id"/>.</remarks>
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
    /// HTTP 201 <c>Created</c> with body <c>EducationPlaceDto</c>; <c>Location</c> header references GET by id.
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
    /// <remarks>HTTP 404 if <paramref name="id"/> is unknown. Use GET endpoints for statistics fields.</remarks>
    [HttpPut("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateEducationPlaceDto dto)
        => Ok(await service.UpdateAsync(id, dto));

    /// <summary>
    /// מוחקת פנימייה מהמסד. במצב הצלחה אין תוכן בגוף התשובה.
    /// </summary>
    /// <remarks>
    /// HTTP 204 No Content on success.
    /// HTTP 400 when students are still linked (FK / business rule).
    /// HTTP 404 when <paramref name="id"/> does not exist.
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
