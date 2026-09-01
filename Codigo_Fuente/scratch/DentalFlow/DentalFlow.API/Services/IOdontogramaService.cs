using DentalFlow.API.Models.DTOs;

namespace DentalFlow.API.Services;

public interface IOdontogramaService
{
    Task<IEnumerable<OdontogramaResponseDto>> ObtenerHistorialPorPacienteAsync(int pacienteId);
    Task<OdontogramaResponseDto?> ObtenerUltimoPorPacienteAsync(int pacienteId);
    Task<OdontogramaResponseDto?> ObtenerPorIdAsync(int id);
    Task<OdontogramaResponseDto> GuardarSnapshotAsync(CrearOdontogramaDto dto);
}
