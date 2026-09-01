using DentalFlow.API.Models.Entities;

namespace DentalFlow.API.Repositories;

public interface IPacienteRepository
{
    Task<IEnumerable<Paciente>> ObtenerTodosAsync(string? busqueda = null);
    Task<Paciente?> ObtenerPorIdAsync(int id);
    Task<Paciente?> BuscarPorDocumentoAsync(string ci);
    Task<bool> ExistePorDocumentoAsync(string ci, int? excluirId = null);
    Task<Paciente> InsertarAsync(Paciente paciente);
    Task<Paciente> ActualizarAsync(Paciente paciente);
    Task<bool> EliminarAsync(int id);
}
