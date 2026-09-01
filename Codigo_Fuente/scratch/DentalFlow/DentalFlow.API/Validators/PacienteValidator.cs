using DentalFlow.API.Exceptions;
using DentalFlow.API.Models.DTOs;
using DentalFlow.API.Repositories;

namespace DentalFlow.API.Validators;

public interface IPacienteValidator
{
    Task ValidarCreacionAsync(CrearPacienteDto dto);
    Task ValidarActualizacionAsync(int id, ActualizarPacienteDto dto);
    void ValidarDocumentoFormato(string ci);
}

public class PacienteValidator : IPacienteValidator
{
    private readonly IPacienteRepository _repository;

    public PacienteValidator(IPacienteRepository repository)
    {
        _repository = repository;
    }

    public async Task ValidarCreacionAsync(CrearPacienteDto dto)
    {
        var errores = new Dictionary<string, string[]>();

        // 1. Validar formato básico
        if (string.IsNullOrWhiteSpace(dto.CI))
        {
            errores["CI"] = new[] { "El número de documento / CI es requerido." };
        }
        else if (dto.CI.Trim().Length < 3 || dto.CI.Trim().Length > 15)
        {
            errores["CI"] = new[] { "El CI debe tener entre 3 y 15 caracteres." };
        }

        // 2. Validar fecha de nacimiento
        if (dto.FechaNacimiento > DateTime.UtcNow)
        {
            errores["FechaNacimiento"] = new[] { "La fecha de nacimiento no puede ser una fecha futura." };
        }

        if (errores.Any())
        {
            throw new ValidacionNegocioException(errores);
        }

        // 3. Validar unicidad en repositorio (HU01 / Criterio de Aceptación)
        var documentoLimpio = dto.CI.Trim();
        var existe = await _repository.ExistePorDocumentoAsync(documentoLimpio);
        if (existe)
        {
            throw new DocumentoDuplicadoException(documentoLimpio);
        }
    }

    public Task ValidarActualizacionAsync(int id, ActualizarPacienteDto dto)
    {
        var errores = new Dictionary<string, string[]>();

        if (dto.FechaNacimiento > DateTime.UtcNow)
        {
            errores["FechaNacimiento"] = new[] { "La fecha de nacimiento no puede ser una fecha futura." };
        }

        if (errores.Any())
        {
            throw new ValidacionNegocioException(errores);
        }

        return Task.CompletedTask;
    }

    public void ValidarDocumentoFormato(string ci)
    {
        if (string.IsNullOrWhiteSpace(ci) || ci.Trim().Length < 3)
        {
            throw new ValidacionNegocioException("CI", "El documento consultado no tiene una longitud válida (mínimo 3 caracteres).");
        }
    }
}
