using DentalFlow.API.Data;
using DentalFlow.API.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace DentalFlow.API.Repositories;

public class OdontogramaRepository : IOdontogramaRepository
{
    private readonly DentalFlowDbContext _context;

    public OdontogramaRepository(DentalFlowDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Odontograma>> ObtenerPorPacienteIdAsync(int pacienteId)
    {
        return await _context.Odontogramas
            .Include(o => o.DetallesDiente)
            .Include(o => o.Paciente)
            .Where(o => o.PacienteId == pacienteId)
            .OrderByDescending(o => o.FechaCreacion)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<Odontograma?> ObtenerUltimoPorPacienteIdAsync(int pacienteId)
    {
        return await _context.Odontogramas
            .Include(o => o.DetallesDiente)
            .Include(o => o.Paciente)
            .Where(o => o.PacienteId == pacienteId)
            .OrderByDescending(o => o.FechaCreacion)
            .AsNoTracking()
            .FirstOrDefaultAsync();
    }

    public async Task<Odontograma?> ObtenerPorIdAsync(int id)
    {
        return await _context.Odontogramas
            .Include(o => o.DetallesDiente)
            .Include(o => o.Paciente)
            .AsNoTracking()
            .FirstOrDefaultAsync(o => o.Id == id);
    }

    public async Task<Odontograma> InsertarAsync(Odontograma odontograma)
    {
        await _context.Odontogramas.AddAsync(odontograma);
        await _context.SaveChangesAsync();
        return odontograma;
    }
}
