using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using DentalFlow.API.Models.Enums;

namespace DentalFlow.API.Models.Entities;

[Table("CITAS")]
public class Cita
{
    [Key]
    [Column("id_cita")]
    public int Id { get; set; }

    [Column("fecha_hora_inicio")]
    public DateTime FechaHoraInicio { get; set; }

    [Column("fecha_hora_fin")]
    public DateTime FechaHoraFin { get; set; }

    [Required]
    [MaxLength(20)]
    [Column("estado")]
    public string Estado { get; set; } = "Pendiente";

    [Required]
    [MaxLength(255)]
    [Column("motivo_consulta")]
    public string MotivoConsulta { get; set; } = string.Empty;

    [Column("id_paciente")]
    public int PacienteId { get; set; }

    [ForeignKey(nameof(PacienteId))]
    public Paciente? Paciente { get; set; }

    [Column("id_odontologo")]
    public int? OdontologoId { get; set; }

    [ForeignKey(nameof(OdontologoId))]
    public Odontologo? Odontologo { get; set; }

    public ICollection<PlanTratamiento> PlanesTratamiento { get; set; } = new List<PlanTratamiento>();
}

[Table("PLAN_TRATAMIENTO")]
public class PlanTratamiento
{
    [Key]
    [Column("id_plan")]
    public int Id { get; set; }

    [Required]
    [Column("descripcion")]
    public string Descripcion { get; set; } = string.Empty;

    [Column("costo_total", TypeName = "decimal(10,2)")]
    public decimal CostoTotal { get; set; }

    [Column("saldo_pendiente", TypeName = "decimal(10,2)")]
    public decimal SaldoPendiente { get; set; }

    [Required]
    [MaxLength(20)]
    [Column("estado_plan")]
    public string EstadoPlan { get; set; } = "Propuesto";

    [Column("fecha_inicio", TypeName = "date")]
    public DateTime FechaInicio { get; set; } = DateTime.UtcNow.Date;

    [Column("id_paciente")]
    public int PacienteId { get; set; }

    [ForeignKey(nameof(PacienteId))]
    public Paciente? Paciente { get; set; }

    [Column("id_cita")]
    public int? CitaId { get; set; }

    [ForeignKey(nameof(CitaId))]
    public Cita? Cita { get; set; }

    public ICollection<PagoAbono> PagosAbonos { get; set; } = new List<PagoAbono>();
}

[Table("PAGOS_ABONOS")]
public class PagoAbono
{
    [Key]
    [Column("id_pago")]
    public int Id { get; set; }

    [Column("fecha_pago")]
    public DateTime FechaPago { get; set; } = DateTime.UtcNow;

    [Column("monto_abonado", TypeName = "decimal(10,2)")]
    public decimal MontoAbonado { get; set; }

    [Required]
    [MaxLength(30)]
    [Column("metodo_pago")]
    public string MetodoPago { get; set; } = "Efectivo";

    [Column("id_plan")]
    public int PlanTratamientoId { get; set; }

    [ForeignKey(nameof(PlanTratamientoId))]
    public PlanTratamiento? PlanTratamiento { get; set; }
}
