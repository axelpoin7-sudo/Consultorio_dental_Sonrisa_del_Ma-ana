using DentalFlow.API.Models.DTOs;
using DentalFlow.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace DentalFlow.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    /// <summary>
    /// Inicia sesión para un odontólogo / profesional registrado.
    /// </summary>
    [HttpPost("login")]
    [ProducesResponseType(typeof(LoginResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        var respuesta = await _authService.LoginAsync(request);
        return Ok(respuesta);
    }

    /// <summary>
    /// Registra un nuevo odontólogo / especialista en la clínica (Ley N° 3131).
    /// </summary>
    [HttpPost("registro")]
    [ProducesResponseType(typeof(LoginResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Registrar([FromBody] RegistrarOdontologoDto request)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        var respuesta = await _authService.RegistrarAsync(request);
        return CreatedAtAction(nameof(ObtenerPerfil), new { id = respuesta.Usuario.Id }, respuesta);
    }

    /// <summary>
    /// Obtiene la lista de odontólogos activos del consultorio.
    /// </summary>
    [HttpGet("odontologos")]
    [ProducesResponseType(typeof(IEnumerable<OdontologoDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ObtenerOdontologos()
    {
        var lista = await _authService.ObtenerOdontologosAsync();
        return Ok(lista);
    }

    /// <summary>
    /// Obtiene el perfil de un odontólogo por su ID.
    /// </summary>
    [HttpGet("perfil/{id:int}")]
    [ProducesResponseType(typeof(OdontologoDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ObtenerPerfil(int id)
    {
        var perfil = await _authService.ObtenerPerfilAsync(id);
        return Ok(perfil);
    }

    /// <summary>
    /// Cierra la sesión activa del profesional.
    /// </summary>
    [HttpPost("logout")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public IActionResult Logout()
    {
        return Ok(new { mensaje = "Sesión cerrada correctamente." });
    }
}
