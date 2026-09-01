using DentalFlow.API.Data;
using DentalFlow.API.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace DentalFlow.API.Repositories;

public class OdontologoRepository : IOdontologoRepository
{
    private readonly DentalFlowDbContext _context;

    public OdontologoRepository(DentalFlowDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Odontologo>> ObtenerTodosAsync(bool soloActivos = true)
    {
        var query = _context.Odontologos.AsNoTracking();
        if (soloActivos)
        {
            query = query.Where(o => o.Activo);
        }
        return await query.OrderBy(o => o.Id).ToListAsync();
    }

    public async Task<Odontologo?> ObtenerPorIdAsync(int id)
    {
        return await _context.Odontologos.FirstOrDefaultAsync(o => o.Id == id && o.Activo);
    }

    public async Task<Odontologo?> ObtenerPorEmailAsync(string email)
    {
        if (string.IsNullOrWhiteSpace(email)) return null;
        var emailNormalizado = email.Trim().ToLowerInvariant();
        return await _context.Odontologos
            .FirstOrDefaultAsync(o => o.Email.ToLower() == emailNormalizado && o.Activo);
    }

    public async Task<Odontologo?> ObtenerPorMatriculaAsync(string matricula)
    {
        if (string.IsNullOrWhiteSpace(matricula)) return null;
        var matNormalizada = matricula.Trim().ToLowerInvariant();
        return await _context.Odontologos
            .FirstOrDefaultAsync(o => o.MatriculaProfesional.ToLower() == matNormalizada && o.Activo);
    }

    public async Task<bool> ExisteEmailAsync(string email, int? excluirId = null)
    {
        if (string.IsNullOrWhiteSpace(email)) return false;
        var emailNormalizado = email.Trim().ToLowerInvariant();
        var query = _context.Odontologos.Where(o => o.Email.ToLower() == emailNormalizado);
        if (excluirId.HasValue)
        {
            query = query.Where(o => o.Id != excluirId.Value);
        }
        return await query.AnyAsync();
    }

    public async Task<bool> ExisteMatriculaAsync(string matricula, int? excluirId = null)
    {
        if (string.IsNullOrWhiteSpace(matricula)) return false;
        var matNormalizada = matricula.Trim().ToLowerInvariant();
        var query = _context.Odontologos.Where(o => o.MatriculaProfesional.ToLower() == matNormalizada);
        if (excluirId.HasValue)
        {
            query = query.Where(o => o.Id != excluirId.Value);
        }
        return await query.AnyAsync();
    }

    public async Task<Odontologo> InsertarAsync(Odontologo odontologo)
    {
        await _context.Odontologos.AddAsync(odontologo);
        await _context.SaveChangesAsync();
        return odontologo;
    }
}
