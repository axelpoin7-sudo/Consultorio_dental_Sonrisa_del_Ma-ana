using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DentalFlow.API.Models.Entities;

[Table("ODONTOLOGOS")]
public class Odontologo
{
    [Key]
    [Column("id_odontologo")]
    public int Id { get; set; }

    [Required]
    [MaxLength(50)]
    [Column("nombre")]
    public string Nombre { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    [Column("apellido")]
    public string Apellido { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    [Column("especialidad")]
    public string Especialidad { get; set; } = "Odontología General";

    [Required]
    [MaxLength(30)]
    [Column("matricula_profesional")]
    public string MatriculaProfesional { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    [Column("email")]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    [Column("password_hash")]
    public string PasswordHash { get; set; } = string.Empty;

    [Required]
    [MaxLength(5)]
    [Column("iniciales")]
    public string Iniciales { get; set; } = "DR";

    [Required]
    [MaxLength(30)]
    [Column("rol")]
    public string Rol { get; set; } = "Odontologo";

    [Column("activo")]
    public bool Activo { get; set; } = true;

    [Column("fecha_registro")]
    public DateTime FechaRegistro { get; set; } = DateTime.UtcNow;

    [NotMapped]
    public string NombreCompleto => $"Dr(a). {Nombre} {Apellido}".Trim();
}
