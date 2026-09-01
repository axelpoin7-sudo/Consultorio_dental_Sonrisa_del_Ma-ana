using DentalFlow.API.Exceptions;
using DentalFlow.API.Models.DTOs;
using DentalFlow.API.Repositories;

namespace DentalFlow.API.Validators;

public class CitaValidator : ICitaValidator
{
    private readonly ICitaRepository _citaRepository;
    private readonly IPacienteRepository _pacienteRepository;
    private readonly IOdontologoRepository _odontologoRepository;

    private static readonly HashSet<string> EstadosValidos = new(StringComparer.OrdinalIgnoreCase)
    {
        "Pendiente", "Confirmada", "En atención", "Completada", "Cancelada"
    };

    public CitaValidator(
        ICitaRepository citaRepository, 
        IPacienteRepository pacienteRepository,
        IOdontologoRepository odontologoRepository)
    {
        _citaRepository = citaRepository;
        _pacienteRepository = pacienteRepository;
        _odontologoRepository = odontologoRepository;
    }

    public async Task ValidarCreacionAsync(CrearCitaDto dto)
    {
        var errores = new Dictionary<string, string[]>();

        // 1. Validar que el paciente exista
        var paciente = await _pacienteRepository.ObtenerPorIdAsync(dto.PacienteId);
        if (paciente == null)
        {
            throw new RecursoNoEncontradoException("Paciente", dto.PacienteId);
        }

        // 2. Validar que el odontólogo sea obligatorio y exista activo en la clínica
        if (dto.OdontologoId <= 0)
        {
            errores["OdontologoId"] = new[] { "Debe seleccionar un odontólogo / especialista válido para la cita." };
        }
        else
        {
            var doctor = await _odontologoRepository.ObtenerPorIdAsync(dto.OdontologoId);
            if (doctor == null || !doctor.Activo)
            {
                errores["OdontologoId"] = new[] { $"No se encontró ningún especialista activo con el ID {dto.OdontologoId} en el consultorio." };
            }
        }

        // 3. Validar rango de fechas
        if (dto.FechaHoraInicio >= dto.FechaHoraFin)
        {
            errores["FechaHoraFin"] = new[] { "La fecha/hora de fin debe ser posterior a la fecha/hora de inicio." };
        }

        // 4. Validar estado
        if (!string.IsNullOrEmpty(dto.Estado) && !EstadosValidos.Contains(dto.Estado))
        {
            errores["Estado"] = new[] { $"El estado '{dto.Estado}' no es válido. Estados permitidos: {string.Join(", ", EstadosValidos)}." };
        }

        if (errores.Any())
        {
            throw new ValidacionNegocioException(errores);
        }

        // 5. Verificar traslape de horario por Odontólogo Tratante (HU03 PRD)
        var citaConflicto = await _citaRepository.BuscarCitaTraslapadaAsync(
            dto.FechaHoraInicio, 
            dto.FechaHoraFin, 
            odontologoId: dto.OdontologoId
        );

        if (citaConflicto != null)
        {
            var pacienteConflicto = citaConflicto.Paciente?.NombreCompleto ?? $"Paciente #{citaConflicto.PacienteId}";
            var doctorConflicto = citaConflicto.Odontologo?.NombreCompleto ?? "el profesional asignado";
            var inicio = citaConflicto.FechaHoraInicio.ToString("HH:mm");
            var fin = citaConflicto.FechaHoraFin.ToString("HH:mm");
            throw new ConflictoHorarioException(
                $"Conflicto de horario: {doctorConflicto} ya tiene agendada la cita de {pacienteConflicto} ({inicio} – {fin}). Por favor elija otro horario u otro especialista disponible.",
                citaConflicto.FechaHoraInicio,
                citaConflicto.FechaHoraFin
            );
        }
    }

    public async Task ValidarActualizacionAsync(int id, ActualizarCitaDto dto)
    {
        var errores = new Dictionary<string, string[]>();

        if (dto.OdontologoId.HasValue && dto.OdontologoId.Value > 0)
        {
            var doctor = await _odontologoRepository.ObtenerPorIdAsync(dto.OdontologoId.Value);
            if (doctor == null)
            {
                errores["OdontologoId"] = new[] { $"No se encontró ningún odontólogo activo con el ID {dto.OdontologoId.Value}." };
            }
        }

        if (dto.FechaHoraInicio.HasValue && dto.FechaHoraFin.HasValue &&
            dto.FechaHoraInicio.Value >= dto.FechaHoraFin.Value)
        {
            errores["FechaHoraFin"] = new[] { "La fecha/hora de fin debe ser posterior a la fecha/hora de inicio." };
        }

        if (!string.IsNullOrEmpty(dto.Estado) && !EstadosValidos.Contains(dto.Estado))
        {
            errores["Estado"] = new[] { $"El estado '{dto.Estado}' no es válido. Estados permitidos: {string.Join(", ", EstadosValidos)}." };
        }

        if (errores.Any())
        {
            throw new ValidacionNegocioException(errores);
        }

        // Verificar traslape excluyendo la cita actual
        if (dto.FechaHoraInicio.HasValue && dto.FechaHoraFin.HasValue)
        {
            var citaConflicto = await _citaRepository.BuscarCitaTraslapadaAsync(
                dto.FechaHoraInicio.Value,
                dto.FechaHoraFin.Value,
                excluirCitaId: id,
                odontologoId: dto.OdontologoId
            );

            if (citaConflicto != null)
            {
                var pacienteConflicto = citaConflicto.Paciente?.NombreCompleto ?? $"Paciente #{citaConflicto.PacienteId}";
                var doctorConflicto = citaConflicto.Odontologo?.NombreCompleto ?? "el profesional asignado";
                var inicio = citaConflicto.FechaHoraInicio.ToString("HH:mm");
                var fin = citaConflicto.FechaHoraFin.ToString("HH:mm");
                throw new ConflictoHorarioException(
                    $"Conflicto de horario: {doctorConflicto} ya tiene agendada la cita de {pacienteConflicto} ({inicio} – {fin}).",
                    citaConflicto.FechaHoraInicio,
                    citaConflicto.FechaHoraFin
                );
            }
        }
    }
}
