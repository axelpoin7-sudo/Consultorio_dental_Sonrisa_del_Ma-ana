using DentalFlow.API.Models.DTOs;

namespace DentalFlow.API.Services;

public interface IPacienteService
{
    Task<IEnumerable<PacienteResponseDto>> ObtenerTodosAsync(string? busqueda = null);
    Task<PacienteResponseDto?> ObtenerPorIdAsync(int id);
    Task<PacienteResponseDto?> ObtenerPorDocumentoAsync(string doc);
    Task<bool> ExisteDocumentoAsync(string doc, int? excluirId = null);
    Task<PacienteResponseDto> RegistrarPacienteAsync(CrearPacienteDto dto);
    Task<PacienteResponseDto?> ActualizarPacienteAsync(int id, ActualizarPacienteDto dto);
    Task<bool> EliminarPacienteAsync(int id);
}
