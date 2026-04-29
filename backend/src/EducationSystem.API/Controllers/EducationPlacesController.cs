using EducationSystem.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace EducationSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class EducationPlacesController(IEducationPlaceService service) : ControllerBase
{
    /// <summary>Returns all boarding schools with active student count and average age.</summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
        => Ok(await service.GetAllWithStatsAsync());
}
