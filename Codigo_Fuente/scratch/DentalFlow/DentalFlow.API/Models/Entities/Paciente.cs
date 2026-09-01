using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DentalFlow.API.Models.Entities;

[Table("PACIENTE")]
public class Paciente
{
    [Key]
    [Column("id_paciente")]
    public int Id { get; set; }

    [Required]
    [MaxLength(15)]
    [Column("ci")]
    public string CI { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    [Column("nombre")]
    public string Nombre { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    [Column("apellido")]
    public string Apellido { get; set; } = string.Empty;

    [Required]
    [Column("fecha_nacimiento", TypeName = "date")]
    public DateTime FechaNacimiento { get; set; }

    [Required]
    [MaxLength(15)]
    [Column("telefono")]
    public string Telefono { get; set; } = string.Empty;

    [MaxLength(100)]
    [Column("email")]
    public string? Email { get; set; }

    [MaxLength(150)]
    [Column("direccion")]
    public string? Direccion { get; set; }

    [Column("alergias")]
    public string Alergias { get; set; } = "Ninguna conocida";

    [Column("fecha_registro")]
    public DateTime FechaRegistro { get; set; } = DateTime.UtcNow;

    // Propiedad calculada (no mapeada a columna)
    [System.ComponentModel.DataAnnotations.Schema.NotMapped]
    public string NombreCompleto => $"{Nombre} {Apellido}".Trim();

    // Relaciones de navegación
    public ICollection<Odontograma> Odontogramas { get; set; } = new List<Odontograma>();
    public ICollection<Cita> Citas { get; set; } = new List<Cita>();
    public ICollection<PlanTratamiento> PlanesTratamiento { get; set; } = new List<PlanTratamiento>();
}
