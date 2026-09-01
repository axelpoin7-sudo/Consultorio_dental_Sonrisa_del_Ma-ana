using System.Net;
using System.Text.Json;
using DentalFlow.API.Exceptions;
using Microsoft.AspNetCore.Mvc;

namespace DentalFlow.API.Middleware;

public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var statusCode = HttpStatusCode.InternalServerError;
        var problemDetails = new ProblemDetails
        {
            Instance = context.Request.Path,
            Status = (int)statusCode,
            Title = "Error interno del servidor",
            Detail = "Ocurrió un error inesperado al procesar la solicitud."
        };

        switch (exception)
        {
            case DocumentoDuplicadoException docEx:
                statusCode = HttpStatusCode.BadRequest;
                problemDetails.Status = (int)statusCode;
                problemDetails.Title = "Documento Duplicado";
                problemDetails.Detail = docEx.Message;
                problemDetails.Extensions["tipo"] = "DOCUMENTO_DUPLICADO";
                problemDetails.Extensions["documento"] = docEx.Documento;
                _logger.LogWarning("Intento de registro con documento duplicado: {Doc}", docEx.Documento);
                break;

            case RecursoNoEncontradoException notFoundEx:
                statusCode = HttpStatusCode.NotFound;
                problemDetails.Status = (int)statusCode;
                problemDetails.Title = "Recurso No Encontrado";
                problemDetails.Detail = notFoundEx.Message;
                _logger.LogInformation("Recurso no encontrado: {Msg}", notFoundEx.Message);
                break;

            case ValidacionNegocioException valEx:
                statusCode = HttpStatusCode.BadRequest;
                problemDetails.Status = (int)statusCode;
                problemDetails.Title = "Error de Validación de Negocio";
                problemDetails.Detail = valEx.Message;
                if (valEx.Errores.Any())
                {
                    problemDetails.Extensions["errores"] = valEx.Errores;
                }
                _logger.LogWarning("Validación de negocio fallida: {Msg}", valEx.Message);
                break;

            case ConflictoHorarioException conflictEx:
                statusCode = HttpStatusCode.Conflict;
                problemDetails.Status = (int)statusCode;
                problemDetails.Title = "Conflicto de Horario";
                problemDetails.Detail = conflictEx.Message;
                problemDetails.Extensions["tipo"] = "CONFLICTO_HORARIO";
                if (conflictEx.Inicio.HasValue) problemDetails.Extensions["inicio"] = conflictEx.Inicio.Value;
                if (conflictEx.Fin.HasValue) problemDetails.Extensions["fin"] = conflictEx.Fin.Value;
                _logger.LogWarning("Conflicto de traslape de citas detectado: {Msg}", conflictEx.Message);
                break;

            case InvalidOperationException invOpEx:
                statusCode = HttpStatusCode.BadRequest;
                problemDetails.Status = (int)statusCode;
                problemDetails.Title = "Solicitud No Procesable";
                problemDetails.Detail = invOpEx.Message;
                _logger.LogWarning("Operación no procesable: {Msg}", invOpEx.Message);
                break;

            default:
                _logger.LogError(exception, "Excepción no controlada en la API");
                break;
        }

        context.Response.ContentType = "application/problem+json";
        context.Response.StatusCode = (int)statusCode;

        var json = JsonSerializer.Serialize(problemDetails, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await context.Response.WriteAsync(json);
    }
}
