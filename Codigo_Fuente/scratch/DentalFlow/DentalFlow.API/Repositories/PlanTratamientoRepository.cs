using DentalFlow.API.Data;
using DentalFlow.API.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace DentalFlow.API.Repositories;

public class PlanTratamientoRepository : IPlanTratamientoRepository
{
    private readonly DentalFlowDbContext _context;

    public PlanTratamientoRepository(DentalFlowDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<PlanTratamiento>> ObtenerTodosAsync(int? pacienteId = null)
    {
        var query = _context.PlanesTratamiento
            .Include(p => p.Paciente)
            .Include(p => p.PagosAbonos)
            .AsNoTracking();

        if (pacienteId.HasValue)
        {
            query = query.Where(p => p.PacienteId == pacienteId.Value);
        }

        return await query.OrderByDescending(p => p.FechaInicio).ToListAsync();
    }

    public async Task<PlanTratamiento?> ObtenerPorIdAsync(int id)
    {
        return await _context.PlanesTratamiento
            .Include(p => p.Paciente)
            .Include(p => p.PagosAbonos)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<PlanTratamiento> InsertarPlanAsync(PlanTratamiento plan)
    {
        await _context.PlanesTratamiento.AddAsync(plan);
        await _context.SaveChangesAsync();

        if (plan.Paciente == null)
        {
            await _context.Entry(plan).Reference(p => p.Paciente).LoadAsync();
        }

        return plan;
    }

    public async Task<PlanTratamiento> ActualizarPlanAsync(PlanTratamiento plan)
    {
        _context.PlanesTratamiento.Update(plan);
        await _context.SaveChangesAsync();
        return plan;
    }

    public async Task<PagoAbono> InsertarAbonoAsync(PagoAbono abono)
    {
        await _context.PagosAbonos.AddAsync(abono);
        await _context.SaveChangesAsync();
        return abono;
    }

    public async Task<bool> EliminarPlanAsync(int id)
    {
        var plan = await _context.PlanesTratamiento.FindAsync(id);
        if (plan == null) return false;

        _context.PlanesTratamiento.Remove(plan);
        await _context.SaveChangesAsync();
        return true;
    }
}
