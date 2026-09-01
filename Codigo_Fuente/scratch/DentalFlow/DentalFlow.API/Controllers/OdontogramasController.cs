using DentalFlow.API.Models.DTOs;
using DentalFlow.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace DentalFlow.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class OdontogramasController : ControllerBase
{
    private readonly IOdontogramaService _odontogramaService;

    public OdontogramasController(IOdontogramaService odontogramaService)
    {
        _odontogramaService = odontogramaService;
    }

    /// <summary>
    /// HU02: Obtiene el último odontograma clínico registrado de un paciente.
    /// </summary>
    [HttpGet("paciente/{pacienteId:int}")]
    [ProducesResponseType(typeof(OdontogramaResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<OdontogramaResponseDto>> ObtenerUltimoPorPaciente(int pacienteId)
    {
        var odontograma = await _odontogramaService.ObtenerUltimoPorPacienteAsync(pacienteId);
        if (odontograma == null)
        {
            return NotFound(new { mensaje = $"No se encontró ningún odontograma registrado para el paciente con ID {pacienteId}." });
        }
        return Ok(odontograma);
    }

    /// <summary>
    /// HU02: Obtiene el historial completo de odontogramas / evoluciones clínicas de un paciente.
    /// </summary>
    [HttpGet("paciente/{pacienteId:int}/historial")]
    [ProducesResponseType(typeof(IEnumerable<OdontogramaResponseDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<OdontogramaResponseDto>>> ObtenerHistorialPorPaciente(int pacienteId)
    {
        var historial = await _odontogramaService.ObtenerHistorialPorPacienteAsync(pacienteId);
        return Ok(historial);
    }

    /// <summary>
    /// HU02: Obtiene un snapshot de odontograma específico por su identificador único.
    /// </summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(OdontogramaResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<OdontogramaResponseDto>> ObtenerPorId(int id)
    {
        var odontograma = await _odontogramaService.ObtenerPorIdAsync(id);
        if (odontograma == null)
        {
            return NotFound(new { mensaje = $"No se encontró ningún odontograma con el ID {id}." });
        }
        return Ok(odontograma);
    }

    /// <summary>
    /// HU02: Guarda un nuevo snapshot inmutable del odontograma para el expediente del paciente (Ley N° 3131).
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(OdontogramaResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<OdontogramaResponseDto>> GuardarSnapshot([FromBody] CrearOdontogramaDto dto)
    {
        var creado = await _odontogramaService.GuardarSnapshotAsync(dto);
        return CreatedAtAction(nameof(ObtenerPorId), new { id = creado.Id }, creado);
    }
}
