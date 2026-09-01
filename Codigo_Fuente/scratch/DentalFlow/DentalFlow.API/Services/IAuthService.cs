using DentalFlow.API.Models.DTOs;

namespace DentalFlow.API.Services;

public interface IAuthService
{
    Task<LoginResponseDto> LoginAsync(LoginRequestDto request);
    Task<LoginResponseDto> RegistrarAsync(RegistrarOdontologoDto request);
    Task<OdontologoDto> ObtenerPerfilAsync(int id);
    Task<IEnumerable<OdontologoDto>> ObtenerOdontologosAsync();
}
