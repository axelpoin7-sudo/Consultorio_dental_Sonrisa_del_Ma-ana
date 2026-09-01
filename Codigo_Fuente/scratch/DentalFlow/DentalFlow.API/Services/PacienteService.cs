using DentalFlow.API.Exceptions;
using DentalFlow.API.Mappers;
using DentalFlow.API.Models.DTOs;
using DentalFlow.API.Repositories;
using DentalFlow.API.Validators;

namespace DentalFlow.API.Services;

public class PacienteService : IPacienteService
{
    private readonly IPacienteRepository _repository;
    private readonly IPacienteValidator _validator;
    private readonly IPacienteMapper _mapper;

    public PacienteService(
        IPacienteRepository repository,
        IPacienteValidator validator,
        IPacienteMapper mapper)
    {
        _repository = repository;
        _validator = validator;
        _mapper = mapper;
    }

    public async Task<IEnumerable<PacienteResponseDto>> ObtenerTodosAsync(string? busqueda = null)
    {
        var pacientes = await _repository.ObtenerTodosAsync(busqueda);
        return _mapper.ToResponseDtoList(pacientes);
    }

    public async Task<PacienteResponseDto?> ObtenerPorIdAsync(int id)
    {
        var paciente = await _repository.ObtenerPorIdAsync(id);
        return paciente == null ? null : _mapper.ToResponseDto(paciente);
    }

    public async Task<PacienteResponseDto?> ObtenerPorDocumentoAsync(string doc)
    {
        _validator.ValidarDocumentoFormato(doc);
        var paciente = await _repository.BuscarPorDocumentoAsync(doc);
        return paciente == null ? null : _mapper.ToResponseDto(paciente);
    }

    public async Task<bool> ExisteDocumentoAsync(string doc, int? excluirId = null)
    {
        if (string.IsNullOrWhiteSpace(doc)) return false;
        return await _repository.ExistePorDocumentoAsync(doc.Trim(), excluirId);
    }

    public async Task<PacienteResponseDto> RegistrarPacienteAsync(CrearPacienteDto dto)
    {
        // 1. Delegar validaciones a la capa responsable (SRP / OCP)
        await _validator.ValidarCreacionAsync(dto);

        // 2. Mapear a entidad usando el mapper dedicado (SRP)
        var paciente = _mapper.ToEntity(dto);

        // 3. Persistir en la base de datos
        var creado = await _repository.InsertarAsync(paciente);

        // 4. Retornar DTO de respuesta
        return _mapper.ToResponseDto(creado);
    }

    public async Task<PacienteResponseDto?> ActualizarPacienteAsync(int id, ActualizarPacienteDto dto)
    {
        await _validator.ValidarActualizacionAsync(id, dto);

        var paciente = await _repository.ObtenerPorIdAsync(id);
        if (paciente == null)
        {
            throw new RecursoNoEncontradoException("Paciente", id);
        }

        _mapper.UpdateEntity(paciente, dto);
        var actualizado = await _repository.ActualizarAsync(paciente);
        return _mapper.ToResponseDto(actualizado);
    }

    public async Task<bool> EliminarPacienteAsync(int id)
    {
        var existe = await _repository.ObtenerPorIdAsync(id);
        if (existe == null)
        {
            throw new RecursoNoEncontradoException("Paciente", id);
        }

        return await _repository.EliminarAsync(id);
    }
}
