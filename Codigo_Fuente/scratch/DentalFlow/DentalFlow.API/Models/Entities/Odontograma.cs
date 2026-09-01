using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DentalFlow.API.Models.Entities;

[Table("ODONTOGRAMA")]
public class Odontograma
{
    [Key]
    [Column("id_odontograma")]
    public int Id { get; set; }

    [Column("fecha_creacion")]
    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

    [Column("observaciones_generales")]
    public string? ObservacionesGenerales { get; set; }

    [Column("id_paciente")]
    public int PacienteId { get; set; }

    [ForeignKey(nameof(PacienteId))]
    public Paciente? Paciente { get; set; }

    public ICollection<DetalleDiente> DetallesDiente { get; set; } = new List<DetalleDiente>();
}

[Table("DETALLE_DIENTE")]
public class DetalleDiente
{
    [Key]
    [Column("id_detalle_diente")]
    public int Id { get; set; }

    [Column("numero_diente")]
    public int NumeroDiente { get; set; }

    [Required]
    [MaxLength(20)]
    [Column("cara_diente")]
    public string CaraDiente { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    [Column("condicion_hallada")]
    public string CondicionHallada { get; set; } = string.Empty;

    [Column("id_odontograma")]
    public int OdontogramaId { get; set; }

    [ForeignKey(nameof(OdontogramaId))]
    public Odontograma? Odontograma { get; set; }
}
