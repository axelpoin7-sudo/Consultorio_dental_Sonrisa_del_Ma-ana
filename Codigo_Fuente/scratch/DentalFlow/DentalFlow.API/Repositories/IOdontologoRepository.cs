using DentalFlow.API.Models.Entities;

namespace DentalFlow.API.Repositories;

public interface IOdontologoRepository
{
    Task<IEnumerable<Odontologo>> ObtenerTodosAsync(bool soloActivos = true);
    Task<Odontologo?> ObtenerPorIdAsync(int id);
    Task<Odontologo?> ObtenerPorEmailAsync(string email);
    Task<Odontologo?> ObtenerPorMatriculaAsync(string matricula);
    Task<bool> ExisteEmailAsync(string email, int? excluirId = null);
    Task<bool> ExisteMatriculaAsync(string matricula, int? excluirId = null);
    Task<Odontologo> InsertarAsync(Odontologo odontologo);
}
