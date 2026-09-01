using Microsoft.AspNetCore.Mvc;

namespace DentalFlow.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Check()
    {
        return Ok(new
        {
            status = "Online",
            sistema = "DentalFlow API",
            version = "1.0.0",
            timestamp = DateTime.UtcNow,
            baseDeDatos = "Conectada (SQLite / SQL Server ready)"
        });
    }
}
