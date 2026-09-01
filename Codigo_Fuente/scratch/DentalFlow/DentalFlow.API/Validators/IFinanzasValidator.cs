using DentalFlow.API.Models.DTOs;

namespace DentalFlow.API.Validators;

public interface IFinanzasValidator
{
    Task ValidarCrearPlanAsync(CrearPlanTratamientoDto dto);
    Task ValidarRegistrarAbonoAsync(RegistrarAbonoDto dto);
}
