using DentalFlow.API.Models.DTOs;

namespace DentalFlow.API.Services;

public interface IFinanzasService
{
    Task<IEnumerable<PlanTratamientoResponseDto>> ObtenerPlanesAsync(int? pacienteId = null);
    Task<PlanTratamientoResponseDto> ObtenerPlanPorIdAsync(int id);
    Task<PlanTratamientoResponseDto> CrearPlanAsync(CrearPlanTratamientoDto dto);
    Task<PlanTratamientoResponseDto> ActualizarPlanAsync(int id, ActualizarPlanTratamientoDto dto);
    Task<ComprobantePagoResponseDto> RegistrarAbonoAsync(RegistrarAbonoDto dto);
    Task<bool> EliminarPlanAsync(int id);
}
