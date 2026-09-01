using DentalFlow.API.Data;
using DentalFlow.API.Mappers;
using DentalFlow.API.Middleware;
using DentalFlow.API.Repositories;
using DentalFlow.API.Services;
using DentalFlow.API.Validators;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Configuración de CORS para el Frontend (React / Vite)
builder.Services.AddCors(options =>
{
    options.AddPolicy("DentalFlowFrontendPolicy", policy =>
    {
        policy.SetIsOriginAllowed(origin => 
        {
            if (string.IsNullOrEmpty(origin)) return false;
            try
            {
                var uri = new Uri(origin);
                return uri.Host == "localhost" || uri.Host == "127.0.0.1";
            }
            catch
            {
                return false;
            }
        })
        .AllowAnyMethod()
        .AllowAnyHeader();
    });
});

// Configuración de la Base de Datos (SQLite / SQL Server)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Data Source=DentalFlow.db";

builder.Services.AddDbContext<DentalFlowDbContext>(options =>
{
    options.UseSqlite(connectionString);
});

// Inyección de dependencias (Principios SOLID - DIP & SRP)
builder.Services.AddScoped<IPacienteRepository, PacienteRepository>();
builder.Services.AddScoped<IPacienteValidator, PacienteValidator>();
builder.Services.AddScoped<IPacienteMapper, PacienteMapper>();
builder.Services.AddScoped<IPacienteService, PacienteService>();

// HU02 — Odontograma Digital
builder.Services.AddScoped<IOdontogramaRepository, OdontogramaRepository>();
builder.Services.AddScoped<IOdontogramaService, OdontogramaService>();

// HU03 — Citas
builder.Services.AddScoped<ICitaRepository, CitaRepository>();
builder.Services.AddScoped<ICitaValidator, CitaValidator>();
builder.Services.AddScoped<ICitaService, CitaService>();

// HU04 — Finanzas y Abonos
builder.Services.AddScoped<IPlanTratamientoRepository, PlanTratamientoRepository>();
builder.Services.AddScoped<IFinanzasValidator, FinanzasValidator>();
builder.Services.AddScoped<IFinanzasService, FinanzasService>();

// Seguridad y Autenticación de Odontólogos
builder.Services.AddScoped<IOdontologoRepository, OdontologoRepository>();
builder.Services.AddScoped<IAuthService, AuthService>();

// Controladores y formato JSON
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

// Swagger / OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "DentalFlow API - Sistema Odontológico (SOLID Architecture)",
        Version = "v1",
        Description = "API RESTful desacoplada con validadores de dominio, mapeadores y middleware centralizado."
    });
});

var app = builder.Build();

app.UseCors("DentalFlowFrontendPolicy");

// Middleware global de manejo de excepciones (RFC 7807)
app.UseMiddleware<GlobalExceptionMiddleware>();

// Inicializar la base de datos automáticamente con datos semilla
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<DentalFlowDbContext>();
    // Crear tablas que no existan (no destruye la BD existente)
    dbContext.Database.EnsureCreated();

    // Crear tabla ODONTOLOGOS si no existe (para BDs creadas antes de este módulo)
    dbContext.Database.ExecuteSqlRaw(@"
        CREATE TABLE IF NOT EXISTS ""ODONTOLOGOS"" (
            ""id_odontologo"" INTEGER NOT NULL CONSTRAINT ""PK_ODONTOLOGOS"" PRIMARY KEY AUTOINCREMENT,
            ""nombre"" TEXT NOT NULL,
            ""apellido"" TEXT NOT NULL,
            ""especialidad"" TEXT NOT NULL DEFAULT 'Odontología General',
            ""matricula_profesional"" TEXT NOT NULL,
            ""email"" TEXT NOT NULL,
            ""password_hash"" TEXT NOT NULL,
            ""iniciales"" TEXT NOT NULL DEFAULT 'DR',
            ""rol"" TEXT NOT NULL DEFAULT 'Odontologo',
            ""activo"" INTEGER NOT NULL DEFAULT 1,
            ""fecha_registro"" TEXT NOT NULL DEFAULT (datetime('now'))
        );
    ");

    // Sembrar odontólogos si la tabla está vacía
    var count = dbContext.Odontologos.Count();
    if (count == 0)
    {
        dbContext.Database.ExecuteSqlRaw(@"
            INSERT INTO ""ODONTOLOGOS"" 
                (""nombre"", ""apellido"", ""especialidad"", ""matricula_profesional"", ""email"", ""password_hash"", ""iniciales"", ""rol"", ""activo"", ""fecha_registro"")
            VALUES
                ('Valeria', 'Ramos', 'Odontología General', 'COB-54219-LP', 'valeria.ramos@dentalflow.bo', 'password123', 'VR', 'Odontólogo Titular', 1, '2026-01-15 10:00:00'),
                ('Carlos', 'Guzmán Flores', 'Ortodoncia y Cirugía', 'COB-61042-SC', 'carlos.guzman@dentalflow.bo', 'password123', 'CG', 'Especialista Ortodoncia', 1, '2026-01-15 10:00:00');
        ");
    }

    // Asegurar columna id_odontologo en tabla CITAS
    try
    {
        dbContext.Database.ExecuteSqlRaw(@"ALTER TABLE ""CITAS"" ADD COLUMN ""id_odontologo"" INTEGER NULL;");
    }
    catch
    {
        // La columna ya existe
    }
}

// Configuración del pipeline HTTP
if (app.Environment.IsDevelopment() || true)
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "DentalFlow API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseAuthorization();

app.MapControllers();

app.Run();
