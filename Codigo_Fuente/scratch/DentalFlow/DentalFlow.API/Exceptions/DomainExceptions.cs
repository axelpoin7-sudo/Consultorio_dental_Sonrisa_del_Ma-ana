namespace DentalFlow.API.Exceptions;

public abstract class DentalFlowException : Exception
{
    protected DentalFlowException(string message) : base(message) { }
}

public class DocumentoDuplicadoException : DentalFlowException
{
    public string Documento { get; }

    public DocumentoDuplicadoException(string documento)
        : base($"El documento de identidad / CI '{documento}' ya se encuentra registrado en el sistema.")
    {
        Documento = documento;
    }
}

public class RecursoNoEncontradoException : DentalFlowException
{
    public RecursoNoEncontradoException(string nombreRecurso, object identificador)
        : base($"No se encontró ningún registro de tipo '{nombreRecurso}' con el identificador '{identificador}'.")
    {
    }
}

public class ValidacionNegocioException : DentalFlowException
{
    public IDictionary<string, string[]> Errores { get; }

    public ValidacionNegocioException(string mensaje) : base(mensaje)
    {
        Errores = new Dictionary<string, string[]>();
    }

    public ValidacionNegocioException(string campo, string mensaje) : base(mensaje)
    {
        Errores = new Dictionary<string, string[]>
        {
            { campo, new[] { mensaje } }
        };
    }

    public ValidacionNegocioException(IDictionary<string, string[]> errores)
        : base("Se encontraron uno o más errores de validación de negocio.")
    {
        Errores = errores;
    }
}

public class ConflictoHorarioException : DentalFlowException
{
    public DateTime? Inicio { get; }
    public DateTime? Fin { get; }

    public ConflictoHorarioException(string mensaje, DateTime inicio, DateTime fin)
        : base(mensaje)
    {
        Inicio = inicio;
        Fin = fin;
    }

    public ConflictoHorarioException(string mensaje)
        : base(mensaje)
    {
    }
}
