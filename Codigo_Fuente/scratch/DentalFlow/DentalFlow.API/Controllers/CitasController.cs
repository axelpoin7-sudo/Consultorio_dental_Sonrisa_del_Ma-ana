using DentalFlow.API.Models.DTOs;
using DentalFlow.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace DentalFlow.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class CitasController : ControllerBase
{
    private readonly ICitaService _service;
    private readonly ILogger<CitasController> _logger;

    public CitasController(ICitaService service, ILogger<CitasController> logger)
    {
        _service = service;
        _logger = logger;
    }

    // GET /api/citas?fecha=2026-08-31&odontologoId=1
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<CitaResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ObtenerTodas([FromQuery] DateTime? fecha = null, [FromQuery] int? odontologoId = null)
    {
        var citas = await _service.ObtenerTodasAsync(fecha, odontologoId);
        return Ok(citas);
    }

    // GET /api/citas/{id}
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(CitaResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ObtenerPorId(int id)
    {
        var cita = await _service.ObtenerPorIdAsync(id);
        return Ok(cita);
    }

    // POST /api/citas  →  201 Created | 400 Bad Request | 409 Conflict
    [HttpPost]
    [ProducesResponseType(typeof(CitaResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Crear([FromBody] CrearCitaDto dto)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        var citaCreada = await _service.CrearAsync(dto);

        return CreatedAtAction(
            nameof(ObtenerPorId),
            new { id = citaCreada.Id },
            citaCreada
        );
    }

    // PUT /api/citas/{id}
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(CitaResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Actualizar(int id, [FromBody] ActualizarCitaDto dto)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        var citaActualizada = await _service.ActualizarAsync(id, dto);
        return Ok(citaActualizada);
    }

    // DELETE /api/citas/{id}
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Eliminar(int id)
    {
        await _service.EliminarAsync(id);
        return NoContent();
    }
}
