using DentalFlow.API.Models.DTOs;
using DentalFlow.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace DentalFlow.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class PacientesController : ControllerBase
{
    private readonly IPacienteService _pacienteService;

    public PacientesController(IPacienteService pacienteService)
    {
        _pacienteService = pacienteService;
    }

    /// <summary>
    /// HU01: Obtiene el listado de pacientes con filtro de búsqueda opcional.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<PacienteResponseDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<PacienteResponseDto>>> ObtenerPacientes([FromQuery] string? busqueda)
    {
        var pacientes = await _pacienteService.ObtenerTodosAsync(busqueda);
        return Ok(pacientes);
    }

    /// <summary>
    /// HU01: Obtiene un paciente por su identificador único.
    /// </summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(PacienteResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PacienteResponseDto>> ObtenerPorId(int id)
    {
        var paciente = await _pacienteService.ObtenerPorIdAsync(id);
        if (paciente == null)
        {
            return NotFound(new { mensaje = $"No se encontró ningún paciente con el ID {id}." });
        }
        return Ok(paciente);
    }

    /// <summary>
    /// HU01: Busca un paciente por su Documento / CI.
    /// </summary>
    [HttpGet("buscar/{ci}")]
    [ProducesResponseType(typeof(PacienteResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PacienteResponseDto>> ObtenerPorDocumento(string ci)
    {
        var paciente = await _pacienteService.ObtenerPorDocumentoAsync(ci);
        if (paciente == null)
        {
            return NotFound(new { mensaje = $"No se encontró ningún paciente con el CI '{ci}'." });
        }
        return Ok(paciente);
    }

    /// <summary>
    /// HU01: Valida disponibilidad de Documento / CI en tiempo real.
    /// </summary>
    [HttpGet("existe/{ci}")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<IActionResult> ExisteDocumento(string ci, [FromQuery] int? excluirId)
    {
        var existe = await _pacienteService.ExisteDocumentoAsync(ci, excluirId);
        return Ok(new { existe, ci });
    }

    /// <summary>
    /// HU01: Registra un nuevo paciente en el expediente clínico (CrearPaciente).
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(PacienteResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<PacienteResponseDto>> RegistrarPaciente([FromBody] CrearPacienteDto dto)
    {
        var creado = await _pacienteService.RegistrarPacienteAsync(dto);
        return CreatedAtAction(nameof(ObtenerPorId), new { id = creado.Id }, creado);
    }

    /// <summary>
    /// HU01: Actualiza datos de un paciente.
    /// </summary>
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(PacienteResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PacienteResponseDto>> ActualizarPaciente(int id, [FromBody] ActualizarPacienteDto dto)
    {
        var actualizado = await _pacienteService.ActualizarPacienteAsync(id, dto);
        return Ok(actualizado);
    }

    /// <summary>
    /// HU01: Elimina un paciente del expediente.
    /// </summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> EliminarPaciente(int id)
    {
        await _pacienteService.EliminarPacienteAsync(id);
        return NoContent();
    }
}
