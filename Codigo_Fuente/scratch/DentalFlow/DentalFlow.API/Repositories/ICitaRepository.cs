using DentalFlow.API.Models.Entities;

namespace DentalFlow.API.Repositories;

public interface ICitaRepository
{
    Task<IEnumerable<Cita>> ObtenerTodasAsync(DateTime? fecha = null, int? odontologoId = null);
    Task<Cita?> ObtenerPorIdAsync(int id);
    Task<Cita?> BuscarCitaTraslapadaAsync(DateTime inicio, DateTime fin, int? excluirCitaId = null, int? odontologoId = null);
    Task<Cita> InsertarAsync(Cita cita);
    Task<Cita> ActualizarAsync(Cita cita);
    Task<bool> EliminarAsync(int id);
}
