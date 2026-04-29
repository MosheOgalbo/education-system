using EducationSystem.Application.DTOs;
using EducationSystem.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace EducationSystem.API.Controllers;

/// <summary>REST API for students: list, CRUD, and idempotent upsert.</summary>
[ApiController]
[Route("api/[controller]")]
public sealed class StudentsController(IStudentService service) : ControllerBase
{
    /// <summary>
    /// שולפת רשימת תלמידים מהמערכת (ממוינת לפי שם).
    /// מחזירה מערך JSON; כל איבר כולל מזהה, שם, תעודת זהות, גיל, מזהה פנימייה וסטטוס פעיל.
    /// </summary>
    /// <param name="educationPlaceId">Optional query filter: restrict results to this boarding-school id.</param>
    /// <remarks>No request body. HTTP 200: <c>StudentDto[]</c>.</remarks>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll([FromQuery] int? educationPlaceId)
        => Ok(await service.GetAllAsync(educationPlaceId));

    /// <summary>
    /// שולפת תלמיד יחיד לפי מזהה מספרי.
    /// מחזירה אובייקט תלמיד מלא (אותם שדות כמו פריט ברשימה).
    /// </summary>
    /// <remarks>HTTP 404 when <paramref name="id"/> is not found.</remarks>
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
    /// Validates age band, unique <c>IdentityNumber</c>, existing <c>EducationPlaceId</c>.
    /// HTTP 201 + <c>StudentDto</c>; HTTP 400 validation errors; HTTP 404 unknown place.
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
    /// <remarks>Same validation as create. HTTP 404 if student or place is missing.</remarks>
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
    /// <remarks>HTTP 204 No Content or HTTP 404.</remarks>
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
    /// Convenience endpoint for single-call upsert semantics.
    /// Always HTTP 200 + <c>StudentDto</c> (does not return 201 on insert).
    /// HTTP 400 / 404 on validation or missing entities.
    /// </remarks>
    [HttpPost("upsert")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Upsert([FromBody] UpsertStudentDto dto)
        => Ok(await service.UpsertStudentAsync(dto));
}
