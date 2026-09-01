using System.ComponentModel.DataAnnotations;

namespace DentalFlow.API.Models.DTOs;

public class CrearDetalleDienteDto
{
    [Required(ErrorMessage = "El número de diente es obligatorio según notación FDI.")]
    [Range(11, 85, ErrorMessage = "El número de diente debe ser un código FDI válido (11-48 permanente, 51-85 pediátrico).")]
    public int NumeroDiente { get; set; }

    [Required(ErrorMessage = "La cara del diente es obligatoria.")]
    [StringLength(20, ErrorMessage = "La cara del diente no puede exceder 20 caracteres.")]
    public string CaraDiente { get; set; } = string.Empty;

    [Required(ErrorMessage = "La condición hallada es obligatoria.")]
    [StringLength(100, ErrorMessage = "La condición no puede exceder 100 caracteres.")]
    public string CondicionHallada { get; set; } = string.Empty;
}

public class CrearOdontogramaDto
{
    [Required(ErrorMessage = "El identificador del paciente es obligatorio.")]
    public int PacienteId { get; set; }

    [StringLength(500, ErrorMessage = "Las observaciones no pueden superar los 500 caracteres.")]
    public string? ObservacionesGenerales { get; set; }

    public List<CrearDetalleDienteDto> Detalles { get; set; } = new();
}

public class DetalleDienteResponseDto
{
    public int Id { get; set; }
    public int NumeroDiente { get; set; }
    public string CaraDiente { get; set; } = string.Empty;
    public string CondicionHallada { get; set; } = string.Empty;
}

public class OdontogramaResponseDto
{
    public int Id { get; set; }
    public int PacienteId { get; set; }
    public string NombrePaciente { get; set; } = string.Empty;
    public DateTime FechaCreacion { get; set; }
    public string? ObservacionesGenerales { get; set; }
    public List<DetalleDienteResponseDto> Detalles { get; set; } = new();
}
