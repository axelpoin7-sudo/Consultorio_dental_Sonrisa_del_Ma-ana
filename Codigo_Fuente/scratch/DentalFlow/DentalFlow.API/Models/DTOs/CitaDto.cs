using System.ComponentModel.DataAnnotations;

namespace DentalFlow.API.Models.DTOs;

public class CrearCitaDto
{
    [Required(ErrorMessage = "El ID del paciente es requerido.")]
    public int PacienteId { get; set; }

    [Required(ErrorMessage = "Debe asignar obligatoriamente un odontólogo / especialista para la cita.")]
    [Range(1, int.MaxValue, ErrorMessage = "Debe seleccionar un especialista válido del consultorio.")]
    public int OdontologoId { get; set; }

    [Required(ErrorMessage = "La fecha y hora de inicio es requerida.")]
    public DateTime FechaHoraInicio { get; set; }

    [Required(ErrorMessage = "La fecha y hora de finalización es requerida.")]
    public DateTime FechaHoraFin { get; set; }

    [MaxLength(20, ErrorMessage = "El estado no puede exceder 20 caracteres.")]
    public string Estado { get; set; } = "Confirmada";

    [Required(ErrorMessage = "El motivo de la consulta es requerido.")]
    [StringLength(255, ErrorMessage = "El motivo de la consulta no puede exceder 255 caracteres.")]
    public string MotivoConsulta { get; set; } = string.Empty;
}

public class ActualizarCitaDto
{
    public int? OdontologoId { get; set; }
    public DateTime? FechaHoraInicio { get; set; }
    public DateTime? FechaHoraFin { get; set; }

    [MaxLength(20, ErrorMessage = "El estado no puede exceder 20 caracteres.")]
    public string? Estado { get; set; }

    [StringLength(255, ErrorMessage = "El motivo de la consulta no puede exceder 255 caracteres.")]
    public string? MotivoConsulta { get; set; }
}

public class CitaResponseDto
{
    public int Id { get; set; }
    public int PacienteId { get; set; }
    public string PacienteNombreCompleto { get; set; } = string.Empty;
    public string PacienteCi { get; set; } = string.Empty;
    public int? OdontologoId { get; set; }
    public string Doctor { get; set; } = string.Empty;
    public string DoctorEspecialidad { get; set; } = string.Empty;
    public string DoctorIniciales { get; set; } = string.Empty;
    public DateTime FechaHoraInicio { get; set; }
    public DateTime FechaHoraFin { get; set; }
    public string Estado { get; set; } = string.Empty;
    public string MotivoConsulta { get; set; } = string.Empty;
}
