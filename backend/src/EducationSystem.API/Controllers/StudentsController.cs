using EducationSystem.Application.DTOs;
using EducationSystem.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace EducationSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class StudentsController(IStudentService service) : ControllerBase
{
    /// <summary>Insert or update a student (upsert by Id).</summary>
    [HttpPost("upsert")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Upsert([FromBody] UpsertStudentDto dto)
        => Ok(await service.UpsertStudentAsync(dto));
}
