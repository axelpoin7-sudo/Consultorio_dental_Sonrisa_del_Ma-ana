using System.Security.Cryptography;
using System.Text;
using DentalFlow.API.Exceptions;
using DentalFlow.API.Models.DTOs;
using DentalFlow.API.Models.Entities;
using DentalFlow.API.Repositories;

namespace DentalFlow.API.Services;

public class AuthService : IAuthService
{
    private readonly IOdontologoRepository _odontologoRepository;
    private readonly ILogger<AuthService> _logger;

    public AuthService(IOdontologoRepository odontologoRepository, ILogger<AuthService> logger)
    {
        _odontologoRepository = odontologoRepository;
        _logger = logger;
    }

    public async Task<LoginResponseDto> LoginAsync(LoginRequestDto request)
    {
        var odontologo = await _odontologoRepository.ObtenerPorEmailAsync(request.Email);
        
        if (odontologo == null || !VerificarPassword(request.Password, odontologo.PasswordHash))
        {
            _logger.LogWarning("Intento de login fallido para: {Email}", request.Email);
            throw new ValidacionNegocioException("Credenciales", "Correo electrónico o contraseña incorrectos.");
        }

        var expiracion = DateTime.UtcNow.AddDays(7);
        var token = GenerarSessionToken(odontologo, expiracion);

        _logger.LogInformation("Login exitoso para: {NombreCompleto} ({Email})", odontologo.NombreCompleto, odontologo.Email);

        return new LoginResponseDto
        {
            Token = token,
            Expiracion = expiracion,
            Usuario = MapearADto(odontologo)
        };
    }

    public async Task<LoginResponseDto> RegistrarAsync(RegistrarOdontologoDto request)
    {
        // 1. Validar unicidad de correo electrónico clínico
        if (await _odontologoRepository.ExisteEmailAsync(request.Email))
        {
            throw new ValidacionNegocioException("Email", $"El correo electrónico '{request.Email}' ya se encuentra registrado en el sistema.");
        }

        // 2. Validar unicidad de matrícula profesional COB (Ley N° 3131)
        if (await _odontologoRepository.ExisteMatriculaAsync(request.MatriculaProfesional))
        {
            throw new ValidacionNegocioException("MatriculaProfesional", $"La matrícula profesional '{request.MatriculaProfesional}' ya está registrada para otro profesional.");
        }

        // 3. Generar iniciales automáticas si no fueron proporcionadas
        var nombre = request.Nombre.Trim();
        var apellido = request.Apellido.Trim();
        var iniciales = !string.IsNullOrWhiteSpace(request.Iniciales)
            ? request.Iniciales.Trim().ToUpperInvariant()
            : $"{(nombre.Length > 0 ? nombre[0] : 'D')}{(apellido.Length > 0 ? apellido[0] : 'R')}".ToUpperInvariant();

        // 4. Crear entidad de odontólogo
        var nuevoOdontologo = new Odontologo
        {
            Nombre = nombre,
            Apellido = apellido,
            Especialidad = string.IsNullOrWhiteSpace(request.Especialidad) ? "Odontología General" : request.Especialidad.Trim(),
            MatriculaProfesional = request.MatriculaProfesional.Trim().ToUpperInvariant(),
            Email = request.Email.Trim().ToLowerInvariant(),
            PasswordHash = HashPassword(request.Password),
            Iniciales = iniciales,
            Rol = string.IsNullOrWhiteSpace(request.Rol) ? "Odontólogo" : request.Rol.Trim(),
            Activo = true,
            FechaRegistro = DateTime.UtcNow
        };

        var guardado = await _odontologoRepository.InsertarAsync(nuevoOdontologo);
        _logger.LogInformation("Nuevo odontólogo registrado exitosamente: {NombreCompleto} (Matrícula: {Matricula})", guardado.NombreCompleto, guardado.MatriculaProfesional);

        // 5. Generar token de sesión inmediata
        var expiracion = DateTime.UtcNow.AddDays(7);
        var token = GenerarSessionToken(guardado, expiracion);

        return new LoginResponseDto
        {
            Token = token,
            Expiracion = expiracion,
            Usuario = MapearADto(guardado)
        };
    }

    public async Task<OdontologoDto> ObtenerPerfilAsync(int id)
    {
        var odontologo = await _odontologoRepository.ObtenerPorIdAsync(id)
            ?? throw new RecursoNoEncontradoException("Odontólogo", id);

        return MapearADto(odontologo);
    }

    public async Task<IEnumerable<OdontologoDto>> ObtenerOdontologosAsync()
    {
        var lista = await _odontologoRepository.ObtenerTodosAsync(soloActivos: true);
        return lista.Select(MapearADto);
    }

    private static string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
        return Convert.ToHexString(bytes).ToLowerInvariant();
    }

    private static bool VerificarPassword(string passwordIngresado, string hashAlmacenado)
    {
        if (string.Equals(passwordIngresado, hashAlmacenado, StringComparison.Ordinal))
            return true;

        using var sha256 = SHA256.Create();
        var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(passwordIngresado));
        var hashHex = Convert.ToHexString(bytes).ToLowerInvariant();

        return string.Equals(hashHex, hashAlmacenado, StringComparison.OrdinalIgnoreCase);
    }

    private static string GenerarSessionToken(Odontologo o, DateTime expiracion)
    {
        var rawData = $"{o.Id}:{o.Email}:{expiracion.Ticks}:{Guid.NewGuid():N}";
        return Convert.ToBase64String(Encoding.UTF8.GetBytes(rawData));
    }

    private static OdontologoDto MapearADto(Odontologo o) => new()
    {
        Id = o.Id,
        Nombre = o.Nombre,
        Apellido = o.Apellido,
        NombreCompleto = o.NombreCompleto,
        Especialidad = o.Especialidad,
        MatriculaProfesional = o.MatriculaProfesional,
        Email = o.Email,
        Iniciales = o.Iniciales,
        Rol = o.Rol
    };
}
