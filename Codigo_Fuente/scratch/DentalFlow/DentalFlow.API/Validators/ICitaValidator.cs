using DentalFlow.API.Models.DTOs;

namespace DentalFlow.API.Validators;

public interface ICitaValidator
{
    Task ValidarCreacionAsync(CrearCitaDto dto);
    Task ValidarActualizacionAsync(int id, ActualizarCitaDto dto);
}
