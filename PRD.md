Este es el Documento de Requisitos del Producto (PRD) detallado para el proyecto
DentalFlow, estructurado para un equipo de desarrollo de alto nivel.

Product Requirements Document (PRD): DentalFlow

Versión: 1.0
Estado: Listo para Desarrollo (Sprint 1)
Product Manager: Senior PM AI

1. Visión del Producto

1.1 Resumen Ejecutivo

DentalFlow es un sistema integrado de gestión dental diseñado para eliminar las
ineficiencias operativas de las clínicas odontológicas locales que dependen de
procesos manuales. El sistema centraliza la gestión clínica (Odontograma
Digital), administrativa (Agenda Inteligente) y financiera (Control de Abonos)
en una única plataforma web escalable.

1.2 Objetivos Estratégicos (SMART)

  - Reducción de Errores: Disminuir en un 80% los traslapes de citas mediante
    validación en tiempo real.
  - Digitalización: Eliminar el 100% de la pérdida de historiales clínicos
    físicos.
  - Eficiencia Financiera: Automatizar la conciliación de pagos y saldos
    pendientes en planes de tratamiento de larga duración.
  - Tiempo de Entrega: Despliegue del MVP funcional en un periodo de 3 semanas.

2. Stack Tecnológico

  - Backend: API Web en ASP.NET Core (Arquitectura en capas: Controller,
    Service, Repository).
  - Frontend: Cliente interactivo en React.js con manipulación de gráficos
    vectoriales (SVG) para el Odontograma.
  - Base de Datos: SQL Server o PostgreSQL (Relacional, normalizada en 3FN).
  - Modelado: PlantUML para documentación técnica viva.
  - Infraestructura: Soporte para contenedores y despliegue en entornos cloud.

3. Modelo de Datos Exacto

El sistema sigue un modelo relacional estricto para garantizar la integridad
referencial y la trazabilidad cronológica.

3.1 Diccionario de Datos Principal

| Tabla              | Descripción                                    | Clave Primaria      | Relaciones Clave                 |
| :----------------- | :--------------------------------------------- | :------------------ | :------------------------------- |
| `PACIENTE`         | Datos demográficos y clínicos básicos.         | `id_paciente`       | N/A                              |
| `ODONTOGRAMA`      | Encabezado del historial visual por sesión.    | `id_odontograma`    | `FK: id_paciente`                |
| `DETALLE_DIENTE`   | Registro atómico por cara y pieza dental.      | `id_detalle_diente` | `FK: id_odontograma`             |
| `CITAS`            | Gestión de agenda y estados de atención.       | `id_cita`           | `FK: id_paciente`                |
| `PLAN_TRATAMIENTO` | Presupuesto y servicios agrupados.             | `id_plan`           | `FK: id_paciente`, `FK: id_cita` |
| `PAGOS_ABONOS`     | Transacciones financieras vinculadas a planes. | `id_pago`           | `FK: id_plan`                    |

3.2 Restricciones de Dominio (Check Constraints)

  - Piezas Dentales: Rango permitido entre 11 y 85 (Notación ISO/FDI).
  - Caras Dentales: ['Vestibular', 'Palatino/Lingual', 'Ocusal/Incisal',
    'Mesial', 'Distal', 'General'].
  - Estados de Cita: ['Pendiente', 'Confirmada', 'En atención', 'Completada',
    'Cancelada'].
  - Codificación de Colores: Rojo (Patología), Azul (Realizado), Verde
    (Planificado).

4. Reglas de Negocio y Cumplimiento Legal

4.1 Lógica de Negocio Crítica

1.  Validación de Agenda: Una cita solo puede crearse si el rango de tiempo
    [Inicio, Fin] no se interseca con otra cita del mismo odontólogo o sillón.
    Lógica: (Inicio1 < Fin2) AND (Fin1 > Inicio2).
2.  Integridad del Odontograma: Las versiones históricas del odontograma son
    inalterables (Snapshots). Solo se permiten nuevas entradas para reflejar la
    evolución del paciente.
3.  Control Financiero: No se puede registrar un abono que supere el
    SaldoPendiente del Plan_Tratamiento. El saldo debe actualizarse de forma
    atómica tras cada pago.

4.2 Marco Legal Boliviano

El software debe alinearse con las siguientes normativas:

  - Ley N° 3131 (Ley del Ejercicio Profesional Médico): El odontograma y el
    expediente clínico se consideran documentos médico-legales. DentalFlow
    garantiza la custodia y confidencialidad de estos datos.
  - Norma Técnica de Salud N° 021: Cumplimiento de estándares de manejo de
    expedientes clínicos y consentimiento informado (implícito en el flujo de
    registro).
  - Ley N° 164 (Ley General de Telecomunicaciones y TICs): Protección de datos
    personales y validez de registros electrónicos.
  - Ley N° 045 (Contra el Racismo y Toda Forma de Discriminación): El sistema de
    registro no admite campos que promuevan la segregación en el acceso a la
    salud.
  - Normativas del SIN (Servicio de Impuestos Nacionales): Aunque la facturación
    electrónica está fuera del MVP (Fase 2), el diseño de la tabla PAGOS_ABONOS
    prevé los campos necesarios para la futura integración con el Sistema de
    Facturación Virtual (SFV).

5. Backlog de Historias de Usuario (MVP)

Sprint 1: Núcleo y Gestión de Pacientes

  - HU01 - Registro de Expediente: Como Recepcionista, quiero registrar un
    paciente con datos personales y alergias para evitar duplicidad y
    centralizar la información.
      - Criterio de Aceptación: Validación de CI único y asignación por defecto
        de "Ninguna conocida" en alergias.
  - HU04 (Parte A) - Creación de Plan de Tratamiento: Como Odontólogo, quiero
    generar un presupuesto inicial para que el paciente conozca el costo total
    de su tratamiento.

Sprint 2: Agenda y Odontograma Digital

  - HU02 - Interacción con Odontograma SVG: Como Odontólogo, quiero seleccionar
    caras de dientes y asignar condiciones por colores para visualizar el estado
    bucal del paciente de forma intuitiva.
      - Criterio de Aceptación: Renderizado dinámico de 32 dientes adultos y 20
        pediátricos.
  - HU03 - Agendamiento Inteligente: Como Recepcionista, quiero programar citas
    validando disponibilidad en tiempo real para evitar traslapes de horario.
      - Criterio de Aceptación: Error 409 (Conflict) si el horario está ocupado.

Sprint 3: Control Financiero y Cierre de MVP

  - HU04 (Parte B) - Registro de Abonos: Como Contador/Recepcionista, quiero
    registrar pagos parciales para descontar automáticamente el saldo pendiente
    del plan de tratamiento.
  - HU05 - Historial de Consultas (Snapshots): Como Odontólogo, quiero ver la
    evolución cronológica del odontograma para comparar el estado inicial vs. el
    estado actual tras el tratamiento.

6. Límites y Exclusiones (Out of Scope para MVP)

  1.  Facturación Electrónica: No se generarán facturas con QR de impuestos
    nacionales en esta etapa.
  2.  Hardware: No hay integración directa con sensores de Rayos X periféricos.
  3.  WhatsApp: La confirmación de citas será manual/visual dentro de la app, sin
    envío automático por API de terceros en el MVP.

7. Marco Legal y Ética de Datos

  - Habeas Data (Art. 130 CPE): El sistema implementa el derecho de los
    pacientes a conocer, actualizar y rectificar sus datos personales. Se
    incluye una tabla de "Solicitudes ARCO" (Acceso, Rectificación, Cancelación
    y Oposición) y un estado de "Anonimización" para casos donde el paciente
    solicite baja, pero la Ley 3131 obligue a conservar el historial clínico
    por 10 años.
  - Ley 164 (Telecomunicaciones y TICs): DentalFlow adopta el principio de
    Integridad y No Repudio. Se implementan hashes de seguridad en los registros
    de pagos y auditoría para garantizar que la información financiera y clínica
    no haya sido alterada retroactivamente.
  - Seguridad y Auditoría: Siguiendo estándares de la ASFI (aplicados por
    analogía a la protección financiera), el sistema registra cada acceso a
    datos sensibles (CI, Teléfono, Montos) en una tabla de logs inalterable. La
    información sensible se almacena mediante técnicas de enmascaramiento o
    cifrado.
