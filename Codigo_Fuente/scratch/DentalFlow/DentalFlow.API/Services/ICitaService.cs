using DentalFlow.API.Models.DTOs;

namespace DentalFlow.API.Services;

public interface ICitaService
{
    Task<IEnumerable<CitaResponseDto>> ObtenerTodasAsync(DateTime? fecha = null, int? odontologoId = null);
    Task<CitaResponseDto> ObtenerPorIdAsync(int id);
    Task<CitaResponseDto> CrearAsync(CrearCitaDto dto);
    Task<CitaResponseDto> ActualizarAsync(int id, ActualizarCitaDto dto);
    Task<bool> EliminarAsync(int id);
}
