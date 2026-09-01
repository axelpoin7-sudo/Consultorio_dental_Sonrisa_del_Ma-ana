using DentalFlow.API.Exceptions;
using DentalFlow.API.Models.DTOs;
using DentalFlow.API.Models.Entities;
using DentalFlow.API.Repositories;
using DentalFlow.API.Validators;

namespace DentalFlow.API.Services;

public class FinanzasService : IFinanzasService
{
    private readonly IPlanTratamientoRepository _planRepository;
    private readonly IFinanzasValidator _validator;
    private readonly ILogger<FinanzasService> _logger;

    public FinanzasService(
        IPlanTratamientoRepository planRepository,
        IFinanzasValidator validator,
        ILogger<FinanzasService> logger)
    {
        _planRepository = planRepository;
        _validator = validator;
        _logger = logger;
    }

    public async Task<IEnumerable<PlanTratamientoResponseDto>> ObtenerPlanesAsync(int? pacienteId = null)
    {
        var planes = await _planRepository.ObtenerTodosAsync(pacienteId);
        return planes.Select(MapearPlanADto);
    }

    public async Task<PlanTratamientoResponseDto> ObtenerPlanPorIdAsync(int id)
    {
        var plan = await _planRepository.ObtenerPorIdAsync(id)
            ?? throw new RecursoNoEncontradoException("Plan de Tratamiento", id);

        return MapearPlanADto(plan);
    }

    public async Task<PlanTratamientoResponseDto> CrearPlanAsync(CrearPlanTratamientoDto dto)
    {
        await _validator.ValidarCrearPlanAsync(dto);

        var plan = new PlanTratamiento
        {
            PacienteId = dto.PacienteId,
            CitaId = dto.CitaId,
            Descripcion = dto.Descripcion.Trim(),
            CostoTotal = dto.CostoTotal,
            SaldoPendiente = dto.CostoTotal, // Saldo inicial igual al costo total
            EstadoPlan = string.IsNullOrWhiteSpace(dto.EstadoPlan) ? "Propuesto" : dto.EstadoPlan,
            FechaInicio = dto.FechaInicio ?? DateTime.UtcNow.Date
        };

        var planGuardado = await _planRepository.InsertarPlanAsync(plan);

        _logger.LogInformation("Presupuesto/Plan #{Id} creado para PacienteId={PacId} por Bs. {Costo}",
            planGuardado.Id, planGuardado.PacienteId, planGuardado.CostoTotal);

        return MapearPlanADto(planGuardado);
    }

    public async Task<PlanTratamientoResponseDto> ActualizarPlanAsync(int id, ActualizarPlanTratamientoDto dto)
    {
        var plan = await _planRepository.ObtenerPorIdAsync(id)
            ?? throw new RecursoNoEncontradoException("Plan de Tratamiento", id);

        if (!string.IsNullOrWhiteSpace(dto.Descripcion))
            plan.Descripcion = dto.Descripcion.Trim();

        if (dto.CostoTotal.HasValue && dto.CostoTotal.Value > 0)
        {
            var totalAbonado = plan.PagosAbonos.Sum(a => a.MontoAbonado);
            plan.CostoTotal = dto.CostoTotal.Value;
            plan.SaldoPendiente = Math.Max(0, plan.CostoTotal - totalAbonado);
        }

        if (!string.IsNullOrWhiteSpace(dto.EstadoPlan))
            plan.EstadoPlan = dto.EstadoPlan.Trim();

        if (plan.SaldoPendiente == 0)
            plan.EstadoPlan = "Concluido";

        await _planRepository.ActualizarPlanAsync(plan);

        return MapearPlanADto(plan);
    }

    public async Task<ComprobantePagoResponseDto> RegistrarAbonoAsync(RegistrarAbonoDto dto)
    {
        await _validator.ValidarRegistrarAbonoAsync(dto);

        var plan = await _planRepository.ObtenerPorIdAsync(dto.PlanTratamientoId)
            ?? throw new RecursoNoEncontradoException("Plan de Tratamiento", dto.PlanTratamientoId);

        // 1. Crear el registro de abono
        var abono = new PagoAbono
        {
            PlanTratamientoId = plan.Id,
            MontoAbonado = dto.MontoAbonado,
            MetodoPago = dto.MetodoPago.Trim(),
            FechaPago = DateTime.UtcNow
        };

        // 2. Amortización atómica del saldo pendiente
        plan.SaldoPendiente -= dto.MontoAbonado;

        if (plan.SaldoPendiente <= 0)
        {
            plan.SaldoPendiente = 0;
            plan.EstadoPlan = "Concluido";
        }
        else if (plan.EstadoPlan == "Propuesto" || plan.EstadoPlan == "Aprobado")
        {
            plan.EstadoPlan = "En Proceso";
        }

        // 3. Persistir en la base de datos
        await _planRepository.InsertarAbonoAsync(abono);
        await _planRepository.ActualizarPlanAsync(plan);

        _logger.LogInformation("Abono #{PagoId} registrado: Bs. {Monto} al Plan #{PlanId}. Saldo restante: Bs. {Saldo}",
            abono.Id, abono.MontoAbonado, plan.Id, plan.SaldoPendiente);

        // 4. Emitir comprobante oficial
        return new ComprobantePagoResponseDto
        {
            NroRecibo = $"REC-{DateTime.UtcNow:yyyyMMdd}-{abono.Id:D4}",
            PagoId = abono.Id,
            PlanTratamientoId = plan.Id,
            PacienteNombreCompleto = plan.Paciente != null
                ? $"{plan.Paciente.Nombre} {plan.Paciente.Apellido}".Trim()
                : $"Paciente #{plan.PacienteId}",
            PacienteCi = plan.Paciente?.CI ?? string.Empty,
            DescripcionPlan = plan.Descripcion,
            MontoAbonado = dto.MontoAbonado,
            MetodoPago = dto.MetodoPago,
            SaldoRestante = plan.SaldoPendiente,
            CostoTotal = plan.CostoTotal,
            EstadoPlan = plan.EstadoPlan,
            FechaPago = abono.FechaPago
        };
    }

    public async Task<bool> EliminarPlanAsync(int id)
    {
        var existe = await _planRepository.ObtenerPorIdAsync(id)
            ?? throw new RecursoNoEncontradoException("Plan de Tratamiento", id);

        return await _planRepository.EliminarPlanAsync(id);
    }

    private static PlanTratamientoResponseDto MapearPlanADto(PlanTratamiento p) => new()
    {
        Id = p.Id,
        PacienteId = p.PacienteId,
        PacienteNombreCompleto = p.Paciente != null
            ? $"{p.Paciente.Nombre} {p.Paciente.Apellido}".Trim()
            : string.Empty,
        PacienteCi = p.Paciente?.CI ?? string.Empty,
        CitaId = p.CitaId,
        Descripcion = p.Descripcion,
        CostoTotal = p.CostoTotal,
        SaldoPendiente = p.SaldoPendiente,
        EstadoPlan = p.EstadoPlan,
        FechaInicio = p.FechaInicio,
        Abonos = p.PagosAbonos.Select(a => new PagoAbonoResponseDto
        {
            Id = a.Id,
            PlanTratamientoId = a.PlanTratamientoId,
            MontoAbonado = a.MontoAbonado,
            MetodoPago = a.MetodoPago,
            FechaPago = a.FechaPago
        }).OrderByDescending(a => a.FechaPago).ToList()
    };
}
