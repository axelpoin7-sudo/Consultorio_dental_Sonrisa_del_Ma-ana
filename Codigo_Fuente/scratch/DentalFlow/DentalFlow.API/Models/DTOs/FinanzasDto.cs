using System.ComponentModel.DataAnnotations;

namespace DentalFlow.API.Models.DTOs;

public class CrearPlanTratamientoDto
{
    [Required(ErrorMessage = "El ID del paciente es requerido.")]
    public int PacienteId { get; set; }

    public int? CitaId { get; set; }

    [Required(ErrorMessage = "La descripción del plan de tratamiento es requerida.")]
    [MaxLength(255, ErrorMessage = "La descripción no puede superar 255 caracteres.")]
    public string Descripcion { get; set; } = string.Empty;

    [Required(ErrorMessage = "El costo total es requerido.")]
    [Range(0.01, 1000000, ErrorMessage = "El costo total debe ser mayor a 0.")]
    public decimal CostoTotal { get; set; }

    [MaxLength(20, ErrorMessage = "El estado del plan no puede exceder 20 caracteres.")]
    public string EstadoPlan { get; set; } = "Propuesto";

    public DateTime? FechaInicio { get; set; }
}

public class ActualizarPlanTratamientoDto
{
    [MaxLength(255, ErrorMessage = "La descripción no puede superar 255 caracteres.")]
    public string? Descripcion { get; set; }

    [Range(0.01, 1000000, ErrorMessage = "El costo total debe ser mayor a 0.")]
    public decimal? CostoTotal { get; set; }

    [MaxLength(20, ErrorMessage = "El estado del plan no puede exceder 20 caracteres.")]
    public string? EstadoPlan { get; set; }
}

public class RegistrarAbonoDto
{
    [Required(ErrorMessage = "El ID del plan de tratamiento es requerido.")]
    public int PlanTratamientoId { get; set; }

    [Required(ErrorMessage = "El monto a abonar es requerido.")]
    [Range(0.01, 1000000, ErrorMessage = "El monto a abonar debe ser mayor a 0.")]
    public decimal MontoAbonado { get; set; }

    [Required(ErrorMessage = "El método de pago es requerido.")]
    [MaxLength(30, ErrorMessage = "El método de pago no puede exceder 30 caracteres.")]
    public string MetodoPago { get; set; } = "QR";
}

public class PagoAbonoResponseDto
{
    public int Id { get; set; }
    public int PlanTratamientoId { get; set; }
    public decimal MontoAbonado { get; set; }
    public string MetodoPago { get; set; } = string.Empty;
    public DateTime FechaPago { get; set; }
}

public class PlanTratamientoResponseDto
{
    public int Id { get; set; }
    public int PacienteId { get; set; }
    public string PacienteNombreCompleto { get; set; } = string.Empty;
    public string PacienteCi { get; set; } = string.Empty;
    public int? CitaId { get; set; }
    public string Descripcion { get; set; } = string.Empty;
    public decimal CostoTotal { get; set; }
    public decimal SaldoPendiente { get; set; }
    public string EstadoPlan { get; set; } = string.Empty;
    public DateTime FechaInicio { get; set; }
    public ICollection<PagoAbonoResponseDto> Abonos { get; set; } = new List<PagoAbonoResponseDto>();
}

public class ComprobantePagoResponseDto
{
    public string NroRecibo { get; set; } = string.Empty;
    public int PagoId { get; set; }
    public int PlanTratamientoId { get; set; }
    public string PacienteNombreCompleto { get; set; } = string.Empty;
    public string PacienteCi { get; set; } = string.Empty;
    public string DescripcionPlan { get; set; } = string.Empty;
    public decimal MontoAbonado { get; set; }
    public string MetodoPago { get; set; } = string.Empty;
    public decimal SaldoRestante { get; set; }
    public decimal CostoTotal { get; set; }
    public string EstadoPlan { get; set; } = string.Empty;
    public DateTime FechaPago { get; set; }
}
