using DentalFlow.API.Exceptions;
using DentalFlow.API.Models.DTOs;
using DentalFlow.API.Models.Entities;
using DentalFlow.API.Repositories;
using DentalFlow.API.Validators;

namespace DentalFlow.API.Services;

public class CitaService : ICitaService
{
    private readonly ICitaRepository _citaRepository;
    private readonly ICitaValidator _validator;
    private readonly ILogger<CitaService> _logger;

    public CitaService(
        ICitaRepository citaRepository,
        ICitaValidator validator,
        ILogger<CitaService> logger)
    {
        _citaRepository = citaRepository;
        _validator = validator;
        _logger = logger;
    }

    public async Task<IEnumerable<CitaResponseDto>> ObtenerTodasAsync(DateTime? fecha = null, int? odontologoId = null)
    {
        var citas = await _citaRepository.ObtenerTodasAsync(fecha, odontologoId);
        return citas.Select(MapearADto);
    }

    public async Task<CitaResponseDto> ObtenerPorIdAsync(int id)
    {
        var cita = await _citaRepository.ObtenerPorIdAsync(id)
            ?? throw new RecursoNoEncontradoException("Cita", id);

        return MapearADto(cita);
    }

    public async Task<CitaResponseDto> CrearAsync(CrearCitaDto dto)
    {
        // 1. Validar reglas de dominio y traslapes específicos del doctor
        await _validator.ValidarCreacionAsync(dto);

        // 2. Mapear DTO → Entidad con OdontologoId validado
        var cita = new Cita
        {
            PacienteId    = dto.PacienteId,
            OdontologoId  = dto.OdontologoId,
            FechaHoraInicio = dto.FechaHoraInicio.Kind == DateTimeKind.Unspecified
                ? DateTime.SpecifyKind(dto.FechaHoraInicio, DateTimeKind.Utc)
                : dto.FechaHoraInicio.ToUniversalTime(),
            FechaHoraFin  = dto.FechaHoraFin.Kind == DateTimeKind.Unspecified
                ? DateTime.SpecifyKind(dto.FechaHoraFin, DateTimeKind.Utc)
                : dto.FechaHoraFin.ToUniversalTime(),
            Estado        = dto.Estado,
            MotivoConsulta = dto.MotivoConsulta.Trim()
        };

        // 3. Persistir en la base de datos
        var citaGuardada = await _citaRepository.InsertarAsync(cita);

        _logger.LogInformation("Cita #{Id} creada para PacienteId={PacienteId} con OdontologoId={OdontologoId} | {Inicio} - {Fin}",
            citaGuardada.Id, citaGuardada.PacienteId, citaGuardada.OdontologoId,
            citaGuardada.FechaHoraInicio, citaGuardada.FechaHoraFin);

        return MapearADto(citaGuardada);
    }

    public async Task<CitaResponseDto> ActualizarAsync(int id, ActualizarCitaDto dto)
    {
        var cita = await _citaRepository.ObtenerPorIdAsync(id)
            ?? throw new RecursoNoEncontradoException("Cita", id);

        await _validator.ValidarActualizacionAsync(id, dto);

        if (dto.OdontologoId.HasValue && dto.OdontologoId.Value > 0)
            cita.OdontologoId = dto.OdontologoId.Value;

        if (dto.FechaHoraInicio.HasValue)
            cita.FechaHoraInicio = dto.FechaHoraInicio.Value.Kind == DateTimeKind.Unspecified
                ? DateTime.SpecifyKind(dto.FechaHoraInicio.Value, DateTimeKind.Utc)
                : dto.FechaHoraInicio.Value.ToUniversalTime();

        if (dto.FechaHoraFin.HasValue)
            cita.FechaHoraFin = dto.FechaHoraFin.Value.Kind == DateTimeKind.Unspecified
                ? DateTime.SpecifyKind(dto.FechaHoraFin.Value, DateTimeKind.Utc)
                : dto.FechaHoraFin.Value.ToUniversalTime();

        if (!string.IsNullOrEmpty(dto.Estado))
            cita.Estado = dto.Estado;

        if (!string.IsNullOrEmpty(dto.MotivoConsulta))
            cita.MotivoConsulta = dto.MotivoConsulta.Trim();

        await _citaRepository.ActualizarAsync(cita);

        return MapearADto(cita);
    }

    public async Task<bool> EliminarAsync(int id)
    {
        var existe = await _citaRepository.ObtenerPorIdAsync(id)
            ?? throw new RecursoNoEncontradoException("Cita", id);

        return await _citaRepository.EliminarAsync(id);
    }

    // ─── Mapeador dinámico con datos reales del Odontólogo Tratante ───────────
    private static CitaResponseDto MapearADto(Cita c)
    {
        var doctorNombre = c.Odontologo != null ? c.Odontologo.NombreCompleto : "Especialista Clínico";
        var doctorEspecialidad = c.Odontologo?.Especialidad ?? "Odontología Integral";
        var doctorIniciales = c.Odontologo?.Iniciales ?? "DR";

        return new CitaResponseDto
        {
            Id                     = c.Id,
            PacienteId             = c.PacienteId,
            PacienteNombreCompleto = c.Paciente != null
                ? $"{c.Paciente.Nombre} {c.Paciente.Apellido}".Trim()
                : string.Empty,
            PacienteCi             = c.Paciente?.CI ?? string.Empty,
            OdontologoId           = c.OdontologoId,
            Doctor                 = doctorNombre,
            DoctorEspecialidad     = doctorEspecialidad,
            DoctorIniciales        = doctorIniciales,
            FechaHoraInicio        = c.FechaHoraInicio,
            FechaHoraFin           = c.FechaHoraFin,
            Estado                 = c.Estado,
            MotivoConsulta         = c.MotivoConsulta
        };
    }
}
