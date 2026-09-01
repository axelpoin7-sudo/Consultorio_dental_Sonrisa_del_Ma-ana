namespace DentalFlow.API.Models.Enums;

public enum EstadoCara
{
    Sano = 0,
    PatologiaRojo = 1,
    TratamientoAzul = 2,
    PlanificadoVerde = 3
}

public enum EstadoCita
{
    Pendiente = 0,
    Confirmada = 1,
    EnAtencion = 2,
    Completada = 3,
    Cancelada = 4
}

public enum EstadoPlan
{
    Propuesto = 0,
    EnProceso = 1,
    Concluido = 2,
    Cancelado = 3
}

public enum MetodoPago
{
    Efectivo = 0,
    QR = 1,
    Tarjeta = 2,
    Transferencia = 3
}
