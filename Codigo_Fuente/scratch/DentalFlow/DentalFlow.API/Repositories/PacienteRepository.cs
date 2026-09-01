using DentalFlow.API.Data;
using DentalFlow.API.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace DentalFlow.API.Repositories;

public class PacienteRepository : IPacienteRepository
{
    private readonly DentalFlowDbContext _context;

    public PacienteRepository(DentalFlowDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Paciente>> ObtenerTodosAsync(string? busqueda = null)
    {
        var query = _context.Pacientes
            .Include(p => p.Odontogramas)
            .Include(p => p.Citas)
            .Include(p => p.PlanesTratamiento)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(busqueda))
        {
            var term = busqueda.Trim().ToLower();
            query = query.Where(p =>
                p.CI.ToLower().Contains(term) ||
                p.Nombre.ToLower().Contains(term) ||
                p.Apellido.ToLower().Contains(term) ||
                p.Telefono.Contains(term));
        }

        return await query.OrderByDescending(p => p.FechaRegistro).ToListAsync();
    }

    public async Task<Paciente?> ObtenerPorIdAsync(int id)
    {
        return await _context.Pacientes
            .Include(p => p.Odontogramas)
                .ThenInclude(o => o.DetallesDiente)
            .Include(p => p.Citas)
            .Include(p => p.PlanesTratamiento)
                .ThenInclude(pt => pt.PagosAbonos)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<Paciente?> BuscarPorDocumentoAsync(string ci)
    {
        if (string.IsNullOrWhiteSpace(ci)) return null;
        var normalized = ci.Trim().ToLower();
        return await _context.Pacientes
            .Include(p => p.Odontogramas)
            .Include(p => p.Citas)
            .Include(p => p.PlanesTratamiento)
            .FirstOrDefaultAsync(p => p.CI.ToLower() == normalized);
    }

    public async Task<bool> ExistePorDocumentoAsync(string ci, int? excluirId = null)
    {
        if (string.IsNullOrWhiteSpace(ci)) return false;
        var normalized = ci.Trim().ToLower();

        var query = _context.Pacientes.Where(p => p.CI.ToLower() == normalized);
        if (excluirId.HasValue)
        {
            query = query.Where(p => p.Id != excluirId.Value);
        }

        return await query.AnyAsync();
    }

    public async Task<Paciente> InsertarAsync(Paciente paciente)
    {
        await _context.Pacientes.AddAsync(paciente);
        await _context.SaveChangesAsync();
        return paciente;
    }

    public async Task<Paciente> ActualizarAsync(Paciente paciente)
    {
        _context.Pacientes.Update(paciente);
        await _context.SaveChangesAsync();
        return paciente;
    }

    public async Task<bool> EliminarAsync(int id)
    {
        var paciente = await _context.Pacientes.FindAsync(id);
        if (paciente == null) return false;

        _context.Pacientes.Remove(paciente);
        await _context.SaveChangesAsync();
        return true;
    }
}
