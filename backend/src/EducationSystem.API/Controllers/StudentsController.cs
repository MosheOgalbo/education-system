using EducationSystem.Application.DTOs;
using EducationSystem.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace EducationSystem.API.Controllers;

/// <summary>
/// REST לתלמידים: רשימה, CRUD ו-upsert אידמפוטנטי.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public sealed class StudentsController(IStudentService service) : ControllerBase
{
    /// <summary>
    /// שולפת רשימת תלמידים מהמערכת (ממוינת לפי שם).
    /// מחזירה מערך JSON; כל איבר כולל מזהה, שם, תעודת זהות, גיל, מזהה פנימייה וסטטוס פעיל.
    /// </summary>
    /// <param name="educationPlaceId">אופציונלי: סינון לפי מזהה פנימייה.</param>
    /// <remarks>אין גוף. 200: מערך <c>StudentDto</c>.</remarks>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll([FromQuery] int? educationPlaceId)
        => Ok(await service.GetAllAsync(educationPlaceId));

    /// <summary>
    /// שולפת תלמיד יחיד לפי מזהה מספרי.
    /// מחזירה אובייקט תלמיד מלא (אותם שדות כמו פריט ברשימה).
    /// </summary>
    /// <remarks>404 כש-<paramref name="id"/> לא קיים.</remarks>
    [HttpGet("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
        => Ok(await service.GetByIdAsync(id));

    /// <summary>
    /// יוצרת תלמיד חדש לפי גוף הבקשה.
    /// מחזירה את רשומת התלמיד שנוצרה כולל המזהה החדש.
    /// </summary>
    /// <remarks>
    /// ולידציית גיל, ת״ז ייחודית, פנימייה קיימת ופעילה.
    /// 201 + <c>StudentDto</c>; 400 ולידציה; 404 פנימייה לא קיימת.
    /// </remarks>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Create([FromBody] CreateStudentDto dto)
    {
        var created = await service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    /// <summary>
    /// מעדכנת תלמיד קיים; המזהה בנתיב קובע איזו רשומה מתעדכנת.
    /// מחזירה את התלמיד לאחר העדכון.
    /// </summary>
    /// <remarks>אותה ולידציה כמו ביצירה. 404 אם תלמיד או פנימייה חסרים.</remarks>
    [HttpPut("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateStudentDto dto)
        => Ok(await service.UpdateAsync(id, dto));

    /// <summary>
    /// מוחקת תלמיד מהמסד לצמיתות לפי מזהה בנתיב.
    /// במצב הצלחה אין גוף תשובה.
    /// </summary>
    /// <remarks>204 ללא גוף או 404.</remarks>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id)
    {
        await service.DeleteAsync(id);
        return NoContent();
    }

    /// <summary>
    /// יוצרת או מעדכנת תלמיד לפי שדה <c>id</c> בגוף הבקשה: בלי מזהה או עם אפס — יצירה; אחרת — עדכון.
    /// מחזירה תמיד את מצב התלמיד לאחר הפעולה (גם אחרי יצירה).
    /// </summary>
    /// <remarks>
    /// נקודת נוחות ל-upsert בקריאה אחת. תמיד 200 + <c>StudentDto</c> (לא 201 ביצירה).
    /// 400 / 404 על ולידציה או ישות חסרה.
    /// </remarks>
    [HttpPost("upsert")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Upsert([FromBody] UpsertStudentDto dto)
        => Ok(await service.UpsertStudentAsync(dto));
}
