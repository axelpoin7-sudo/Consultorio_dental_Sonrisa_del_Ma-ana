using DentalFlow.API.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace DentalFlow.API.Data;

public class DentalFlowDbContext : DbContext
{
    public DentalFlowDbContext(DbContextOptions<DentalFlowDbContext> options) : base(options)
    {
    }

    public DbSet<Paciente> Pacientes => Set<Paciente>();
    public DbSet<Odontograma> Odontogramas => Set<Odontograma>();
    public DbSet<DetalleDiente> DetallesDiente => Set<DetalleDiente>();
    public DbSet<Cita> Citas => Set<Cita>();
    public DbSet<PlanTratamiento> PlanesTratamiento => Set<PlanTratamiento>();
    public DbSet<PagoAbono> PagosAbonos => Set<PagoAbono>();
    public DbSet<Odontologo> Odontologos => Set<Odontologo>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // PACIENTE
        modelBuilder.Entity<Paciente>(entity =>
        {
            entity.HasIndex(e => e.CI).IsUnique();
            entity.Property(e => e.Alergias).HasDefaultValue("Ninguna conocida");
            entity.Property(e => e.FechaRegistro).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        // ODONTOGRAMA
        modelBuilder.Entity<Odontograma>(entity =>
        {
            entity.HasOne(d => d.Paciente)
                  .WithMany(p => p.Odontogramas)
                  .HasForeignKey(d => d.PacienteId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // DETALLE_DIENTE
        modelBuilder.Entity<DetalleDiente>(entity =>
        {
            entity.HasOne(d => d.Odontograma)
                  .WithMany(p => p.DetallesDiente)
                  .HasForeignKey(d => d.OdontogramaId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // CITAS
        modelBuilder.Entity<Cita>(entity =>
        {
            entity.HasOne(d => d.Paciente)
                  .WithMany(p => p.Citas)
                  .HasForeignKey(d => d.PacienteId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(d => d.Odontologo)
                  .WithMany()
                  .HasForeignKey(d => d.OdontologoId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        // PLAN_TRATAMIENTO
        modelBuilder.Entity<PlanTratamiento>(entity =>
        {
            entity.HasOne(d => d.Paciente)
                  .WithMany(p => p.PlanesTratamiento)
                  .HasForeignKey(d => d.PacienteId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(d => d.Cita)
                  .WithMany(p => p.PlanesTratamiento)
                  .HasForeignKey(d => d.CitaId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        // PAGOS_ABONOS
        modelBuilder.Entity<PagoAbono>(entity =>
        {
            entity.HasOne(d => d.PlanTratamiento)
                  .WithMany(p => p.PagosAbonos)
                  .HasForeignKey(d => d.PlanTratamientoId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Seed data
        SeedData(modelBuilder);
    }

    private static void SeedData(ModelBuilder modelBuilder)
    {
        var fechaBase = new DateTime(2026, 1, 15, 10, 0, 0, DateTimeKind.Utc);

        modelBuilder.Entity<Paciente>().HasData(
            new Paciente
            {
                Id = 1,
                CI = "8472910-LP",
                Nombre = "Carlos Andrés",
                Apellido = "Mendoza Vargas",
                FechaNacimiento = new DateTime(1992, 5, 14),
                Telefono = "76543210",
                Email = "carlos.mendoza@email.com",
                Direccion = "Av. 6 de Agosto #234, La Paz",
                Alergias = "Penicilina",
                FechaRegistro = fechaBase
            },
            new Paciente
            {
                Id = 2,
                CI = "9348123-CB",
                Nombre = "Mariana",
                Apellido = "Quiroga Soliz",
                FechaNacimiento = new DateTime(1998, 11, 23),
                Telefono = "71234567",
                Email = "mariana.quiroga@email.com",
                Direccion = "Calle España #567, Cochabamba",
                Alergias = "Ninguna conocida",
                FechaRegistro = fechaBase.AddDays(2)
            },
            new Paciente
            {
                Id = 3,
                CI = "6239481-SC",
                Nombre = "Rodrigo",
                Apellido = "Fernández Morales",
                FechaNacimiento = new DateTime(1985, 3, 30),
                Telefono = "69871234",
                Email = "rodrigo.fernandez@email.com",
                Direccion = "Av. Banzer Km 4, Santa Cruz",
                Alergias = "Látex",
                FechaRegistro = fechaBase.AddDays(5)
            }
        );

        modelBuilder.Entity<Odontograma>().HasData(
            new Odontograma
            {
                Id = 1,
                PacienteId = 1,
                FechaCreacion = fechaBase.AddDays(1),
                ObservacionesGenerales = "Evaluación inicial. Presenta caries oclusal en molar 16 y tratamiento de conducto planificado en 24."
            }
        );

        modelBuilder.Entity<DetalleDiente>().HasData(
            new DetalleDiente { Id = 1, OdontogramaId = 1, NumeroDiente = 16, CaraDiente = "Oclusal", CondicionHallada = "Patología (Caries)" },
            new DetalleDiente { Id = 2, OdontogramaId = 1, NumeroDiente = 24, CaraDiente = "General", CondicionHallada = "Planificado (Endodoncia)" },
            new DetalleDiente { Id = 3, OdontogramaId = 1, NumeroDiente = 36, CaraDiente = "Oclusal", CondicionHallada = "Tratamiento Realizado (Obturación)" }
        );

        modelBuilder.Entity<Cita>().HasData(
            new Cita
            {
                Id = 1,
                PacienteId = 1,
                OdontologoId = 1,
                FechaHoraInicio = fechaBase.Date.AddHours(14),
                FechaHoraFin = fechaBase.Date.AddHours(15),
                Estado = "Confirmada",
                MotivoConsulta = "Curación de caries en pieza 16"
            },
            new Cita
            {
                Id = 2,
                PacienteId = 2,
                OdontologoId = 2,
                FechaHoraInicio = fechaBase.Date.AddHours(16),
                FechaHoraFin = fechaBase.Date.AddHours(17),
                Estado = "Pendiente",
                MotivoConsulta = "Evaluación de Ortodoncia y brackets"
            },
            new Cita
            {
                Id = 3,
                PacienteId = 3,
                OdontologoId = 3,
                FechaHoraInicio = fechaBase.Date.AddHours(10),
                FechaHoraFin = fechaBase.Date.AddHours(11),
                Estado = "Confirmada",
                MotivoConsulta = "Endodoncia en molar 24"
            }
        );

        modelBuilder.Entity<PlanTratamiento>().HasData(
            new PlanTratamiento
            {
                Id = 1,
                PacienteId = 1,
                CitaId = 1,
                Descripcion = "Tratamiento Integral: Restauración estética en 16 + Limpieza Ultrasónica",
                CostoTotal = 850.00m,
                SaldoPendiente = 350.00m,
                EstadoPlan = "En Proceso",
                FechaInicio = fechaBase.Date.AddDays(-3)
            }
        );

        modelBuilder.Entity<PagoAbono>().HasData(
            new PagoAbono
            {
                Id = 1,
                PlanTratamientoId = 1,
                MontoAbonado = 500.00m,
                MetodoPago = "QR",
                FechaPago = fechaBase.AddDays(-3)
            }
        );

        modelBuilder.Entity<Odontologo>().HasData(
            new Odontologo
            {
                Id = 1,
                Nombre = "Valeria",
                Apellido = "Ramos",
                Especialidad = "Odontología General y Estética",
                MatriculaProfesional = "COB-54219-LP",
                Email = "valeria.ramos@dentalflow.bo",
                PasswordHash = "password123",
                Iniciales = "VR",
                Rol = "Odontólogo Titular",
                Activo = true,
                FechaRegistro = fechaBase
            },
            new Odontologo
            {
                Id = 2,
                Nombre = "Carlos",
                Apellido = "Guzmán Flores",
                Especialidad = "Ortodoncia y Cirugía Maxilofacial",
                MatriculaProfesional = "COB-61042-SC",
                Email = "carlos.guzman@dentalflow.bo",
                PasswordHash = "password123",
                Iniciales = "CG",
                Rol = "Especialista Ortodoncia",
                Activo = true,
                FechaRegistro = fechaBase
            },
            new Odontologo
            {
                Id = 3,
                Nombre = "Sofía",
                Apellido = "Morales Arteaga",
                Especialidad = "Endodoncia y Prótesis",
                MatriculaProfesional = "COB-48192-CB",
                Email = "sofia.morales@dentalflow.bo",
                PasswordHash = "password123",
                Iniciales = "SM",
                Rol = "Especialista Endodoncia",
                Activo = true,
                FechaRegistro = fechaBase
            },
            new Odontologo
            {
                Id = 4,
                Nombre = "Mateo",
                Apellido = "Villarroel Paz",
                Especialidad = "Odontopediatría y Prevención",
                MatriculaProfesional = "COB-72310-LP",
                Email = "mateo.villarroel@dentalflow.bo",
                PasswordHash = "password123",
                Iniciales = "MV",
                Rol = "Especialista Odontopediatría",
                Activo = true,
                FechaRegistro = fechaBase
            },
            new Odontologo
            {
                Id = 5,
                Nombre = "Andrea",
                Apellido = "Claros Torrico",
                Especialidad = "Periodoncia e Implantología",
                MatriculaProfesional = "COB-80415-SC",
                Email = "andrea.claros@dentalflow.bo",
                PasswordHash = "password123",
                Iniciales = "AC",
                Rol = "Especialista Periodoncia",
                Activo = true,
                FechaRegistro = fechaBase
            }
        );
    }
}
