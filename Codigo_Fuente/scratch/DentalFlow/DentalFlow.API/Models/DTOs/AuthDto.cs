using System.ComponentModel.DataAnnotations;

namespace DentalFlow.API.Models.DTOs;

public class LoginRequestDto
{
    [Required(ErrorMessage = "El correo electrónico es obligatorio.")]
    [EmailAddress(ErrorMessage = "Formato de correo electrónico inválido.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "La contraseña es obligatoria.")]
    public string Password { get; set; } = string.Empty;
}

public class RegistrarOdontologoDto
{
    [Required(ErrorMessage = "El nombre del profesional es obligatorio.")]
    [StringLength(50, MinimumLength = 2, ErrorMessage = "El nombre debe tener entre 2 y 50 caracteres.")]
    public string Nombre { get; set; } = string.Empty;

    [Required(ErrorMessage = "El apellido del profesional es obligatorio.")]
    [StringLength(50, MinimumLength = 2, ErrorMessage = "El apellido debe tener entre 2 y 50 caracteres.")]
    public string Apellido { get; set; } = string.Empty;

    [Required(ErrorMessage = "La especialidad odontológica es obligatoria.")]
    [StringLength(100, ErrorMessage = "La especialidad no puede exceder 100 caracteres.")]
    public string Especialidad { get; set; } = "Odontología General";

    [Required(ErrorMessage = "La matrícula profesional del Colegio de Odontólogos es obligatoria.")]
    [StringLength(30, MinimumLength = 4, ErrorMessage = "La matrícula debe tener entre 4 y 30 caracteres.")]
    public string MatriculaProfesional { get; set; } = string.Empty;

    [Required(ErrorMessage = "El correo electrónico clínico es obligatorio.")]
    [EmailAddress(ErrorMessage = "Formato de correo electrónico inválido.")]
    [StringLength(100, ErrorMessage = "El email no puede superar 100 caracteres.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "La contraseña es obligatoria.")]
    [StringLength(100, MinimumLength = 6, ErrorMessage = "La contraseña debe tener al menos 6 caracteres.")]
    public string Password { get; set; } = string.Empty;

    [StringLength(5, ErrorMessage = "Las iniciales no pueden superar 5 caracteres.")]
    public string? Iniciales { get; set; }

    [StringLength(30, ErrorMessage = "El rol no puede superar 30 caracteres.")]
    public string? Rol { get; set; } = "Odontólogo";
}

public class OdontologoDto
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Apellido { get; set; } = string.Empty;
    public string NombreCompleto { get; set; } = string.Empty;
    public string Especialidad { get; set; } = string.Empty;
    public string MatriculaProfesional { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Iniciales { get; set; } = string.Empty;
    public string Rol { get; set; } = string.Empty;
}

public class LoginResponseDto
{
    public string Token { get; set; } = string.Empty;
    public OdontologoDto Usuario { get; set; } = new();
    public DateTime Expiracion { get; set; }
}
