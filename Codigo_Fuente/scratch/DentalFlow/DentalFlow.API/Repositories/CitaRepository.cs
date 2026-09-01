using DentalFlow.API.Data;
using DentalFlow.API.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace DentalFlow.API.Repositories;

public class CitaRepository : ICitaRepository
{
    private readonly DentalFlowDbContext _context;

    public CitaRepository(DentalFlowDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Cita>> ObtenerTodasAsync(DateTime? fecha = null, int? odontologoId = null)
    {
        var query = _context.Citas
            .Include(c => c.Paciente)
            .Include(c => c.Odontologo)
            .AsNoTracking();

        if (fecha.HasValue)
        {
            var f = fecha.Value.Date;
            var desde = f.AddDays(-1);
            var hasta = f.AddDays(2);
            query = query.Where(c => c.FechaHoraInicio >= desde && c.FechaHoraInicio < hasta);
        }

        if (odontologoId.HasValue && odontologoId.Value > 0)
        {
            query = query.Where(c => c.OdontologoId == odontologoId.Value);
        }

        return await query.OrderBy(c => c.FechaHoraInicio).ToListAsync();
    }

    public async Task<Cita?> ObtenerPorIdAsync(int id)
    {
        return await _context.Citas
            .Include(c => c.Paciente)
            .Include(c => c.Odontologo)
            .FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<Cita?> BuscarCitaTraslapadaAsync(DateTime inicio, DateTime fin, int? excluirCitaId = null, int? odontologoId = null)
    {
        var query = _context.Citas
            .Include(c => c.Paciente)
            .Include(c => c.Odontologo)
            .AsNoTracking()
            .Where(c => c.Estado != "Cancelada");

        if (excluirCitaId.HasValue)
        {
            query = query.Where(c => c.Id != excluirCitaId.Value);
        }

        // Si se especifica el odontólogo, verificar traslape para ESE doctor
        if (odontologoId.HasValue && odontologoId.Value > 0)
        {
            query = query.Where(c => c.OdontologoId == odontologoId.Value);
        }

        // Regla de Negocio HU03 (PRD): (Inicio1 < Fin2) AND (Fin1 > Inicio2)
        return await query.FirstOrDefaultAsync(c => c.FechaHoraInicio < fin && c.FechaHoraFin > inicio);
    }

    public async Task<Cita> InsertarAsync(Cita cita)
    {
        await _context.Citas.AddAsync(cita);
        await _context.SaveChangesAsync();
        
        // Recargar con navegación Paciente y Odontologo si no están cargados
        if (cita.Paciente == null && cita.PacienteId > 0)
        {
            await _context.Entry(cita).Reference(c => c.Paciente).LoadAsync();
        }

        if (cita.Odontologo == null && cita.OdontologoId.HasValue)
        {
            await _context.Entry(cita).Reference(c => c.Odontologo).LoadAsync();
        }
        
        return cita;
    }

    public async Task<Cita> ActualizarAsync(Cita cita)
    {
        _context.Citas.Update(cita);
        await _context.SaveChangesAsync();

        if (cita.Paciente == null && cita.PacienteId > 0)
        {
            await _context.Entry(cita).Reference(c => c.Paciente).LoadAsync();
        }

        if (cita.Odontologo == null && cita.OdontologoId.HasValue)
        {
            await _context.Entry(cita).Reference(c => c.Odontologo).LoadAsync();
        }

        return cita;
    }

    public async Task<bool> EliminarAsync(int id)
    {
        var cita = await _context.Citas.FindAsync(id);
        if (cita == null) return false;

        _context.Citas.Remove(cita);
        await _context.SaveChangesAsync();
        return true;
    }
}
