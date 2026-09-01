using DentalFlow.API.Models.Entities;

namespace DentalFlow.API.Repositories;

public interface IPlanTratamientoRepository
{
    Task<IEnumerable<PlanTratamiento>> ObtenerTodosAsync(int? pacienteId = null);
    Task<PlanTratamiento?> ObtenerPorIdAsync(int id);
    Task<PlanTratamiento> InsertarPlanAsync(PlanTratamiento plan);
    Task<PlanTratamiento> ActualizarPlanAsync(PlanTratamiento plan);
    Task<PagoAbono> InsertarAbonoAsync(PagoAbono abono);
    Task<bool> EliminarPlanAsync(int id);
}
