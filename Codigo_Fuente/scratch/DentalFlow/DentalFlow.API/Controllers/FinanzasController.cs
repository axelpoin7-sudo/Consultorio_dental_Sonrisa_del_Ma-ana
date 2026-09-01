using DentalFlow.API.Models.DTOs;
using DentalFlow.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace DentalFlow.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class FinanzasController : ControllerBase
{
    private readonly IFinanzasService _finanzasService;
    private readonly ILogger<FinanzasController> _logger;

    public FinanzasController(IFinanzasService finanzasService, ILogger<FinanzasController> logger)
    {
        _finanzasService = finanzasService;
        _logger = logger;
    }

    // GET /api/finanzas/planes?pacienteId=1
    [HttpGet("planes")]
    [ProducesResponseType(typeof(IEnumerable<PlanTratamientoResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ObtenerPlanes([FromQuery] int? pacienteId = null)
    {
        var planes = await _finanzasService.ObtenerPlanesAsync(pacienteId);
        return Ok(planes);
    }

    // GET /api/finanzas/planes/{id}
    [HttpGet("planes/{id:int}")]
    [ProducesResponseType(typeof(PlanTratamientoResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ObtenerPlanPorId(int id)
    {
        var plan = await _finanzasService.ObtenerPlanPorIdAsync(id);
        return Ok(plan);
    }

    // POST /api/finanzas/planes
    [HttpPost("planes")]
    [ProducesResponseType(typeof(PlanTratamientoResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CrearPlan([FromBody] CrearPlanTratamientoDto dto)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        var planCreado = await _finanzasService.CrearPlanAsync(dto);

        return CreatedAtAction(
            nameof(ObtenerPlanPorId),
            new { id = planCreado.Id },
            planCreado
        );
    }

    // PUT /api/finanzas/planes/{id}
    [HttpPut("planes/{id:int}")]
    [ProducesResponseType(typeof(PlanTratamientoResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ActualizarPlan(int id, [FromBody] ActualizarPlanTratamientoDto dto)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        var planActualizado = await _finanzasService.ActualizarPlanAsync(id, dto);
        return Ok(planActualizado);
    }

    // POST /api/finanzas/abonos
    [HttpPost("abonos")]
    [ProducesResponseType(typeof(ComprobantePagoResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RegistrarAbono([FromBody] RegistrarAbonoDto dto)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        var comprobante = await _finanzasService.RegistrarAbonoAsync(dto);
        return Ok(comprobante);
    }

    // DELETE /api/finanzas/planes/{id}
    [HttpDelete("planes/{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> EliminarPlan(int id)
    {
        await _finanzasService.EliminarPlanAsync(id);
        return NoContent();
    }
}
