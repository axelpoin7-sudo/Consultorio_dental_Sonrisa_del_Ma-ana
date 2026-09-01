using DentalFlow.API.Exceptions;
using DentalFlow.API.Models.DTOs;
using DentalFlow.API.Repositories;

namespace DentalFlow.API.Validators;

public class FinanzasValidator : IFinanzasValidator
{
    private readonly IPlanTratamientoRepository _planRepository;
    private readonly IPacienteRepository _pacienteRepository;

    private static readonly HashSet<string> EstadosPlanValidos = new(StringComparer.OrdinalIgnoreCase)
    {
        "Propuesto", "Aprobado", "En Proceso", "Concluido", "Cancelado"
    };

    private static readonly HashSet<string> MetodosPagoValidos = new(StringComparer.OrdinalIgnoreCase)
    {
        "QR", "Efectivo", "Tarjeta", "Transferencia"
    };

    public FinanzasValidator(IPlanTratamientoRepository planRepository, IPacienteRepository pacienteRepository)
    {
        _planRepository = planRepository;
        _pacienteRepository = pacienteRepository;
    }

    public async Task ValidarCrearPlanAsync(CrearPlanTratamientoDto dto)
    {
        var errores = new Dictionary<string, string[]>();

        // 1. Validar que el paciente exista
        var paciente = await _pacienteRepository.ObtenerPorIdAsync(dto.PacienteId);
        if (paciente == null)
        {
            throw new RecursoNoEncontradoException("Paciente", dto.PacienteId);
        }

        // 2. Validar costo total
        if (dto.CostoTotal <= 0)
        {
            errores["CostoTotal"] = new[] { "El costo total del presupuesto debe ser mayor a Bs. 0.00." };
        }

        // 3. Validar descripción
        if (string.IsNullOrWhiteSpace(dto.Descripcion))
        {
            errores["Descripcion"] = new[] { "La descripción del plan de tratamiento es obligatoria." };
        }

        // 4. Validar estado
        if (!string.IsNullOrEmpty(dto.EstadoPlan) && !EstadosPlanValidos.Contains(dto.EstadoPlan))
        {
            errores["EstadoPlan"] = new[] { $"El estado '{dto.EstadoPlan}' no es válido. Permitidos: {string.Join(", ", EstadosPlanValidos)}." };
        }

        if (errores.Any())
        {
            throw new ValidacionNegocioException(errores);
        }
    }

    public async Task ValidarRegistrarAbonoAsync(RegistrarAbonoDto dto)
    {
        var errores = new Dictionary<string, string[]>();

        // 1. Validar monto positivo
        if (dto.MontoAbonado <= 0)
        {
            errores["MontoAbonado"] = new[] { "El monto del abono debe ser un valor numérico positivo mayor a 0." };
        }

        // 2. Validar método de pago
        if (string.IsNullOrWhiteSpace(dto.MetodoPago) || !MetodosPagoValidos.Contains(dto.MetodoPago))
        {
            errores["MetodoPago"] = new[] { $"Método de pago inválido. Métodos aceptados: {string.Join(", ", MetodosPagoValidos)}." };
        }

        if (errores.Any())
        {
            throw new ValidacionNegocioException(errores);
        }

        // 3. Validar existencia del plan y saldo pendiente (Regla de Integridad Financiera)
        var plan = await _planRepository.ObtenerPorIdAsync(dto.PlanTratamientoId);
        if (plan == null)
        {
            throw new RecursoNoEncontradoException("Plan de Tratamiento", dto.PlanTratamientoId);
        }

        if (plan.SaldoPendiente <= 0)
        {
            throw new ValidacionNegocioException("MontoAbonado", $"El plan de tratamiento #{plan.Id} ya se encuentra completamente saldado (Saldo: Bs. 0.00). No admite más abonos.");
        }

        if (dto.MontoAbonado > plan.SaldoPendiente)
        {
            throw new ValidacionNegocioException("MontoAbonado", $"El monto ingresado (Bs. {dto.MontoAbonado:F2}) supera el saldo pendiente de amortización (Bs. {plan.SaldoPendiente:F2}).");
        }
    }
}
