using DentalFlow.API.Exceptions;
using DentalFlow.API.Models.DTOs;
using DentalFlow.API.Models.Entities;
using DentalFlow.API.Repositories;

namespace DentalFlow.API.Services;

public class OdontogramaService : IOdontogramaService
{
    private readonly IOdontogramaRepository _odontogramaRepository;
    private readonly IPacienteRepository _pacienteRepository;

    public OdontogramaService(
        IOdontogramaRepository odontogramaRepository,
        IPacienteRepository pacienteRepository)
    {
        _odontogramaRepository = odontogramaRepository;
        _pacienteRepository = pacienteRepository;
    }

    public async Task<IEnumerable<OdontogramaResponseDto>> ObtenerHistorialPorPacienteAsync(int pacienteId)
    {
        var odontogramas = await _odontogramaRepository.ObtenerPorPacienteIdAsync(pacienteId);
        return odontogramas.Select(MapToResponseDto);
    }

    public async Task<OdontogramaResponseDto?> ObtenerUltimoPorPacienteAsync(int pacienteId)
    {
        var odontograma = await _odontogramaRepository.ObtenerUltimoPorPacienteIdAsync(pacienteId);
        return odontograma == null ? null : MapToResponseDto(odontograma);
    }

    public async Task<OdontogramaResponseDto?> ObtenerPorIdAsync(int id)
    {
        var odontograma = await _odontogramaRepository.ObtenerPorIdAsync(id);
        return odontograma == null ? null : MapToResponseDto(odontograma);
    }

    public async Task<OdontogramaResponseDto> GuardarSnapshotAsync(CrearOdontogramaDto dto)
    {
        // 1. Validar que el paciente existe
        var paciente = await _pacienteRepository.ObtenerPorIdAsync(dto.PacienteId);
        if (paciente == null)
        {
            throw new RecursoNoEncontradoException("Paciente", dto.PacienteId);
        }

        // 2. Construir entidad inmutable Odontograma con sus detalles
        var nuevoOdontograma = new Odontograma
        {
            PacienteId = dto.PacienteId,
            FechaCreacion = DateTime.UtcNow,
            ObservacionesGenerales = string.IsNullOrWhiteSpace(dto.ObservacionesGenerales) 
                ? "Registro clínico del estado dental (Ley N° 3131 / NTS N° 021)"
                : dto.ObservacionesGenerales.Trim()
        };

        if (dto.Detalles != null && dto.Detalles.Count > 0)
        {
            foreach (var det in dto.Detalles)
            {
                nuevoOdontograma.DetallesDiente.Add(new DetalleDiente
                {
                    NumeroDiente = det.NumeroDiente,
                    CaraDiente = det.CaraDiente.Trim(),
                    CondicionHallada = det.CondicionHallada.Trim()
                });
            }
        }

        // 3. Persistir en la base de datos
        var creado = await _odontogramaRepository.InsertarAsync(nuevoOdontograma);
        creado.Paciente = paciente;

        return MapToResponseDto(creado);
    }

    private static OdontogramaResponseDto MapToResponseDto(Odontograma o)
    {
        return new OdontogramaResponseDto
        {
            Id = o.Id,
            PacienteId = o.PacienteId,
            NombrePaciente = o.Paciente != null ? o.Paciente.NombreCompleto : string.Empty,
            FechaCreacion = o.FechaCreacion,
            ObservacionesGenerales = o.ObservacionesGenerales,
            Detalles = o.DetallesDiente.Select(d => new DetalleDienteResponseDto
            {
                Id = d.Id,
                NumeroDiente = d.NumeroDiente,
                CaraDiente = d.CaraDiente,
                CondicionHallada = d.CondicionHallada
            }).ToList()
        };
    }
}
