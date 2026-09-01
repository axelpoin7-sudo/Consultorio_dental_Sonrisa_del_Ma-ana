using System.ComponentModel.DataAnnotations;

namespace DentalFlow.API.Models.DTOs;

public class CrearPacienteDto
{
    [Required(ErrorMessage = "El CI / Documento es obligatorio.")]
    [StringLength(15, MinimumLength = 3, ErrorMessage = "El CI debe tener entre 3 y 15 caracteres.")]
    public string CI { get; set; } = string.Empty;

    [Required(ErrorMessage = "El nombre es obligatorio.")]
    [StringLength(50, MinimumLength = 2, ErrorMessage = "El nombre debe tener entre 2 y 50 caracteres.")]
    public string Nombre { get; set; } = string.Empty;

    [Required(ErrorMessage = "El apellido es obligatorio.")]
    [StringLength(50, MinimumLength = 2, ErrorMessage = "El apellido debe tener entre 2 y 50 caracteres.")]
    public string Apellido { get; set; } = string.Empty;

    [Required(ErrorMessage = "La fecha de nacimiento es obligatoria.")]
    public DateTime FechaNacimiento { get; set; }

    [Required(ErrorMessage = "El teléfono de contacto es obligatorio.")]
    [StringLength(15, MinimumLength = 6, ErrorMessage = "El teléfono debe tener entre 6 y 15 caracteres.")]
    public string Telefono { get; set; } = string.Empty;

    [EmailAddress(ErrorMessage = "El correo electrónico no tiene un formato válido.")]
    [StringLength(100, ErrorMessage = "El email no puede exceder los 100 caracteres.")]
    public string? Email { get; set; }

    [StringLength(150, ErrorMessage = "La dirección no puede exceder los 150 caracteres.")]
    public string? Direccion { get; set; }

    public string? Alergias { get; set; }
}

public class ActualizarPacienteDto
{
    [Required(ErrorMessage = "El nombre es obligatorio.")]
    [StringLength(50, MinimumLength = 2)]
    public string Nombre { get; set; } = string.Empty;

    [Required(ErrorMessage = "El apellido es obligatorio.")]
    [StringLength(50, MinimumLength = 2)]
    public string Apellido { get; set; } = string.Empty;

    [Required]
    public DateTime FechaNacimiento { get; set; }

    [Required]
    [StringLength(15)]
    public string Telefono { get; set; } = string.Empty;

    [EmailAddress]
    [StringLength(100)]
    public string? Email { get; set; }

    [StringLength(150)]
    public string? Direccion { get; set; }

    public string? Alergias { get; set; }
}

public class PacienteResponseDto
{
    public int Id { get; set; }
    public string CI { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string Apellido { get; set; } = string.Empty;
    public string NombreCompleto => $"{Nombre} {Apellido}";
    public DateTime FechaNacimiento { get; set; }
    public int Edad => DateTime.Today.Year - FechaNacimiento.Year - (DateTime.Today.DayOfYear < FechaNacimiento.DayOfYear ? 1 : 0);
    public string Telefono { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Direccion { get; set; }
    public string Alergias { get; set; } = "Ninguna conocida";
    public DateTime FechaRegistro { get; set; }
    public int TotalOdontogramas { get; set; }
    public int TotalCitas { get; set; }
    public int TotalPlanes { get; set; }
}
