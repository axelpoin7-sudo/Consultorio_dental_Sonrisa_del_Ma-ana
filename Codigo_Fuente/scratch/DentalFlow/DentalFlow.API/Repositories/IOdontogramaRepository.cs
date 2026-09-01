using DentalFlow.API.Models.Entities;

namespace DentalFlow.API.Repositories;

public interface IOdontogramaRepository
{
    Task<IEnumerable<Odontograma>> ObtenerPorPacienteIdAsync(int pacienteId);
    Task<Odontograma?> ObtenerUltimoPorPacienteIdAsync(int pacienteId);
    Task<Odontograma?> ObtenerPorIdAsync(int id);
    Task<Odontograma> InsertarAsync(Odontograma odontograma);
}
