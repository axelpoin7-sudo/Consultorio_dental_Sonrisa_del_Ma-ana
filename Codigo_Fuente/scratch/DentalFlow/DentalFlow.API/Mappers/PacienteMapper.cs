using DentalFlow.API.Models.DTOs;
using DentalFlow.API.Models.Entities;

namespace DentalFlow.API.Mappers;

public interface IPacienteMapper
{
    Paciente ToEntity(CrearPacienteDto dto);
    void UpdateEntity(Paciente paciente, ActualizarPacienteDto dto);
    PacienteResponseDto ToResponseDto(Paciente paciente);
    IEnumerable<PacienteResponseDto> ToResponseDtoList(IEnumerable<Paciente> pacientes);
}

public class PacienteMapper : IPacienteMapper
{
    public Paciente ToEntity(CrearPacienteDto dto)
    {
        // Regla SMART HU01: Alergias asigna "Ninguna conocida" si está vacío
        var alergiasNormalizadas = string.IsNullOrWhiteSpace(dto.Alergias)
            ? "Ninguna conocida"
            : dto.Alergias.Trim();

        return new Paciente
        {
            CI = dto.CI.Trim(),
            Nombre = dto.Nombre.Trim(),
            Apellido = dto.Apellido.Trim(),
            FechaNacimiento = dto.FechaNacimiento.Date,
            Telefono = dto.Telefono.Trim(),
            Email = string.IsNullOrWhiteSpace(dto.Email) ? null : dto.Email.Trim().ToLower(),
            Direccion = string.IsNullOrWhiteSpace(dto.Direccion) ? null : dto.Direccion.Trim(),
            Alergias = alergiasNormalizadas,
            FechaRegistro = DateTime.UtcNow
        };
    }

    public void UpdateEntity(Paciente paciente, ActualizarPacienteDto dto)
    {
        paciente.Nombre = dto.Nombre.Trim();
        paciente.Apellido = dto.Apellido.Trim();
        paciente.FechaNacimiento = dto.FechaNacimiento.Date;
        paciente.Telefono = dto.Telefono.Trim();
        paciente.Email = string.IsNullOrWhiteSpace(dto.Email) ? null : dto.Email.Trim().ToLower();
        paciente.Direccion = string.IsNullOrWhiteSpace(dto.Direccion) ? null : dto.Direccion.Trim();
        paciente.Alergias = string.IsNullOrWhiteSpace(dto.Alergias) ? "Ninguna conocida" : dto.Alergias.Trim();
    }

    public PacienteResponseDto ToResponseDto(Paciente p)
    {
        return new PacienteResponseDto
        {
            Id = p.Id,
            CI = p.CI,
            Nombre = p.Nombre,
            Apellido = p.Apellido,
            FechaNacimiento = p.FechaNacimiento,
            Telefono = p.Telefono,
            Email = p.Email,
            Direccion = p.Direccion,
            Alergias = p.Alergias,
            FechaRegistro = p.FechaRegistro,
            TotalOdontogramas = p.Odontogramas?.Count ?? 0,
            TotalCitas = p.Citas?.Count ?? 0,
            TotalPlanes = p.PlanesTratamiento?.Count ?? 0
        };
    }

    public IEnumerable<PacienteResponseDto> ToResponseDtoList(IEnumerable<Paciente> pacientes)
    {
        return pacientes.Select(ToResponseDto);
    }
}
