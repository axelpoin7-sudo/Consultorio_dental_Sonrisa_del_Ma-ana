import React, { useState, useEffect, useCallback } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  RefreshCw, 
  Loader2, 
  User,
  Edit,
  X,
  Check,
  Stethoscope,
  Filter,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ApiService } from '../../services/api';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Convierte "HH:MM" + Date string "YYYY-MM-DD" a ISO 8601 UTC string */
const toIsoDateTime = (dateStr, timeStr) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [h, m] = timeStr.split(':').map(Number);
  const d = new Date(year, month - 1, day, h, m, 0, 0);
  return d.toISOString();
};

/** Formatea un ISO date-string a "HH:MM" */
const toHoraStr = (isoStr) =>
  new Date(isoStr).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', hour12: false });

/** Formatea un ISO date-string a "YYYY-MM-DD" */
const toDateInputStr = (isoStr) => {
  const d = new Date(isoStr);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// ─── Componente Principal ────────────────────────────────────────────────────

export const AgendaView = () => {
  const { user } = useAuth();
  const hoy = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

  const [citas, setCitas] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [doctores, setDoctores] = useState([]);
  const [filtroDoctor, setFiltroDoctor] = useState('todos'); // 'todos' | doctorId string
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState(null);

  // Formulario para Nueva Cita (Especialista Obligatorio sin fallback silencioso)
  const [nuevaCita, setNuevaCita] = useState({
    pacienteId: '',
    odontologoId: '', // Obligatorio: debe ser seleccionado explícitamente
    fecha: hoy,
    horaInicio: '09:00',
    duracion: 60,
    motivo: '',
    estado: 'Confirmada'
  });

  const [guardando, setGuardando] = useState(false);
  const [conflictError, setConflictError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Modal para Editar / Actualizar Cita
  const [modalEditarCita, setModalEditarCita] = useState(null);
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);
  const [errorEdicion, setErrorEdicion] = useState(null);
  const [formEdicion, setFormEdicion] = useState({
    odontologoId: '',
    fecha: hoy,
    horaInicio: '09:00',
    duracion: 60,
    motivo: '',
    estado: 'Confirmada'
  });

  // ── Cargar doctores al iniciar ─────────────────────────────────────────────
  useEffect(() => {
    ApiService.getOdontologos()
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setDoctores(data);
        }
      })
      .catch(() => {});
  }, []);

  // ── Cargar citas y pacientes desde la API ──────────────────────────────────
  const cargarDatos = useCallback(async (fechaFiltro, doctorFiltro, mostrarToast = false) => {
    setCargando(true);
    setErrorCarga(null);
    try {
      const docIdParam = doctorFiltro && doctorFiltro !== 'todos' ? Number(doctorFiltro) : null;
      const [citasData, pacientesData] = await Promise.all([
        ApiService.getCitas(fechaFiltro, docIdParam),
        ApiService.getPacientes().catch(() => [])
      ]);
      
      // Filtrar citas que correspondan al día seleccionado en hora local
      const citasDelDia = (citasData || []).filter(c => {
        if (!fechaFiltro) return true;
        const fechaLocalCita = toDateInputStr(c.fechaHoraInicio);
        return fechaLocalCita === fechaFiltro;
      });

      setCitas(citasDelDia.sort((a, b) => new Date(a.fechaHoraInicio) - new Date(b.fechaHoraInicio)));

      if (Array.isArray(pacientesData)) {
        setPacientes(pacientesData);
        if (pacientesData.length > 0 && !nuevaCita.pacienteId) {
          setNuevaCita(prev => ({ ...prev, pacienteId: String(pacientesData[0].id) }));
        }
      }

      if (mostrarToast) {
        setSuccessMessage('✓ Agenda de citas actualizada correctamente desde el servidor.');
        setTimeout(() => setSuccessMessage(null), 4000);
      }
    } catch (err) {
      setErrorCarga(err.message || 'No se pudo conectar con el servidor de la clínica.');
    } finally {
      setCargando(false);
    }
  }, [nuevaCita.pacienteId]);

  useEffect(() => {
    cargarDatos(nuevaCita.fecha, filtroDoctor);
  }, [cargarDatos, nuevaCita.fecha, filtroDoctor]);

  // ── Guardar cita vía POST /api/citas ──────────────────────────────────────
  const handleAgendar = async (e) => {
    e.preventDefault();
    setConflictError(null);
    setSuccessMessage(null);

    if (!nuevaCita.odontologoId || isNaN(Number(nuevaCita.odontologoId)) || Number(nuevaCita.odontologoId) <= 0) {
      setConflictError('⚠️ Debe seleccionar obligatoriamente un Especialista / Doctor Tratante para agendar la cita y equilibrar la atención clínica.');
      return;
    }

    if (!nuevaCita.pacienteId || isNaN(Number(nuevaCita.pacienteId))) {
      setConflictError('Seleccione o ingrese un paciente válido.');
      return;
    }

    const [h, m] = nuevaCita.horaInicio.split(':').map(Number);
    const totalMinFin = h * 60 + m + Number(nuevaCita.duracion);
    const hFin = String(Math.floor(totalMinFin / 60)).padStart(2, '0');
    const mFin = String(totalMinFin % 60).padStart(2, '0');
    const horaFin = `${hFin}:${mFin}`;

    const dto = {
      pacienteId: Number(nuevaCita.pacienteId),
      odontologoId: Number(nuevaCita.odontologoId),
      fechaHoraInicio: toIsoDateTime(nuevaCita.fecha, nuevaCita.horaInicio),
      fechaHoraFin: toIsoDateTime(nuevaCita.fecha, horaFin),
      estado: nuevaCita.estado,
      motivoConsulta: nuevaCita.motivo.trim() || 'Consulta Odontológica General'
    };

    setGuardando(true);
    try {
      const citaGuardada = await ApiService.crearCita(dto);
      
      // Actualizar lista y notificar
      await cargarDatos(nuevaCita.fecha, filtroDoctor);
      
      const pacNombre = citaGuardada.pacienteNombreCompleto || `Paciente #${citaGuardada.pacienteId}`;
      const docNombre = citaGuardada.doctor || 'Especialista';
      setSuccessMessage(`✓ Cita agendada exitosamente con ${docNombre} para ${pacNombre} a las ${toHoraStr(citaGuardada.fechaHoraInicio)}.`);
      
      setNuevaCita(prev => ({
        ...prev,
        horaInicio: horaFin,
        motivo: ''
      }));
      
      setTimeout(() => setSuccessMessage(null), 6000);
    } catch (err) {
      if (err.status === 409 || err.message?.includes('Conflicto')) {
        setConflictError(err.message);
      } else {
        setConflictError(`Error al guardar cita: ${err.message}`);
      }
    } finally {
      setGuardando(false);
    }
  };

  // ── Abrir Modal de Edición ─────────────────────────────────────────────────
  const abrirModalEditar = (cita) => {
    const dInicio = new Date(cita.fechaHoraInicio);
    const dFin = new Date(cita.fechaHoraFin);
    const duracionMin = Math.round((dFin - dInicio) / (1000 * 60)) || 60;

    setFormEdicion({
      odontologoId: cita.odontologoId ? String(cita.odontologoId) : '1',
      fecha: toDateInputStr(cita.fechaHoraInicio),
      horaInicio: toHoraStr(cita.fechaHoraInicio),
      duracion: duracionMin,
      motivo: cita.motivoConsulta,
      estado: cita.estado
    });
    setErrorEdicion(null);
    setModalEditarCita(cita);
  };

  // ── Guardar Cambios de Edición (PUT /api/citas/{id}) ────────────────────────
  const handleActualizarCita = async (e) => {
    e.preventDefault();
    if (!modalEditarCita) return;

    setErrorEdicion(null);

    const [h, m] = formEdicion.horaInicio.split(':').map(Number);
    const totalMinFin = h * 60 + m + Number(formEdicion.duracion);
    const hFin = String(Math.floor(totalMinFin / 60)).padStart(2, '0');
    const mFin = String(totalMinFin % 60).padStart(2, '0');
    const horaFin = `${hFin}:${mFin}`;

    const dto = {
      odontologoId: formEdicion.odontologoId ? Number(formEdicion.odontologoId) : null,
      fechaHoraInicio: toIsoDateTime(formEdicion.fecha, formEdicion.horaInicio),
      fechaHoraFin: toIsoDateTime(formEdicion.fecha, horaFin),
      estado: formEdicion.estado,
      motivoConsulta: formEdicion.motivo.trim()
    };

    setGuardandoEdicion(true);
    try {
      await ApiService.actualizarCita(modalEditarCita.id, dto);
      setModalEditarCita(null);
      await cargarDatos(nuevaCita.fecha, filtroDoctor);
      setSuccessMessage('✓ Cita actualizada exitosamente en el sistema.');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      setErrorEdicion(err.message || 'Error al actualizar la cita.');
    } finally {
      setGuardandoEdicion(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="page-body">
      <div className="page-header">
        <div>
          <h1 className="page-title">Agenda Multiprofesional de Citas</h1>
          <p className="page-description">
            Gestión inteligente de turnos por especialista con verificación de disponibilidad en tiempo real y asignación de sillones (HU03 / Ley N° 3131).
          </p>
        </div>
        <button
          className="btn btn-secondary"
          onClick={() => cargarDatos(nuevaCita.fecha, filtroDoctor, true)}
          disabled={cargando}
          aria-label="Actualizar citas"
          title="Refrescar listado desde el servidor"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <RefreshCw size={15} className={cargando ? 'spin' : ''} />
          Actualizar
        </button>
      </div>

      {successMessage && (
        <div className="alert alert-success" role="status" aria-live="polite">
          <CheckCircle2 size={20} />
          <span>{successMessage}</span>
        </div>
      )}

      {errorCarga && (
        <div className="alert alert-danger" role="alert">
          <XCircle size={20} />
          <span>{errorCarga}</span>
        </div>
      )}

      {/* ─── Filtro por Especialista / Doctor Tratante ───────────────────── */}
      <div className="card" style={{ marginBottom: '20px', padding: '14px 18px', background: '#f8fafc', border: '1px solid #cbd5e1' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Stethoscope size={18} color="#0284c7" />
            <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-main)' }}>Filtrar por Especialista:</span>
          </div>

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn"
              onClick={() => {
                setFiltroDoctor('todos');
              }}
              style={{
                padding: '5px 12px',
                fontSize: '0.82rem',
                borderRadius: '8px',
                border: filtroDoctor === 'todos' ? '2px solid #0284c7' : '1px solid #cbd5e1',
                background: filtroDoctor === 'todos' ? '#0284c7' : 'white',
                color: filtroDoctor === 'todos' ? 'white' : '#475569',
                fontWeight: filtroDoctor === 'todos' ? 700 : 500,
                boxShadow: filtroDoctor === 'todos' ? 'var(--shadow-sm)' : 'none'
              }}
            >
              👨‍⚕️ Todos ({citas.length})
            </button>

            {doctores.map(doc => {
              const isSelected = filtroDoctor === String(doc.id);
              const citasDoctorDelDia = citas.filter(c => c.odontologoId === doc.id).length;
              return (
                <button
                  key={doc.id}
                  type="button"
                  className="btn"
                  onClick={() => {
                    setFiltroDoctor(String(doc.id));
                    // Sincronizar formulario de nueva cita para agendar con este especialista
                    setNuevaCita(prev => ({ ...prev, odontologoId: String(doc.id) }));
                    setConflictError(null);
                  }}
                  title={`Ver agenda y agendar con ${doc.nombreCompleto || doc.nombre} (${citasDoctorDelDia} citas hoy)`}
                  style={{
                    padding: '5px 12px',
                    fontSize: '0.82rem',
                    borderRadius: '8px',
                    border: isSelected ? '2px solid #0284c7' : '1px solid #cbd5e1',
                    background: isSelected ? '#0284c7' : 'white',
                    color: isSelected ? 'white' : '#475569',
                    fontWeight: isSelected ? 700 : 500,
                    boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '4px',
                    background: isSelected ? 'white' : '#e0f2fe',
                    color: isSelected ? '#0284c7' : '#0369a1',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {doc.iniciales || 'DR'}
                  </span>
                  <span>{doc.nombreCompleto || `Dr(a). ${doc.nombre}`}</span>
                  <span style={{
                    fontSize: '0.7rem',
                    padding: '1px 5px',
                    borderRadius: '10px',
                    background: isSelected ? 'rgba(255,255,255,0.25)' : (citasDoctorDelDia > 3 ? '#fee2e2' : '#f1f5f9'),
                    color: isSelected ? 'white' : (citasDoctorDelDia > 3 ? '#b91c1c' : '#64748b'),
                    fontWeight: 700
                  }}>
                    {citasDoctorDelDia}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>

        {/* ─── Lista de Citas del Día ───────────────────────────────────────── */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CalendarIcon size={18} color="#0284c7" />
              Citas del{' '}
              <input
                type="date"
                value={nuevaCita.fecha}
                onChange={e => setNuevaCita(p => ({ ...p, fecha: e.target.value }))}
                className="form-input"
                style={{ fontSize: '0.85rem', padding: '4px 8px', width: 'auto', display: 'inline-block', marginLeft: '4px' }}
                aria-label="Seleccionar fecha"
              />
            </h3>
            {cargando && <Loader2 size={18} className="spin" aria-label="Cargando…" />}
          </div>

          {!cargando && citas.length === 0 && !errorCarga && (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '32px 0', fontSize: '0.9rem' }}>
              No hay citas programadas para esta fecha ({nuevaCita.fecha}){filtroDoctor !== 'todos' ? ' con el especialista seleccionado.' : '.'}
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {citas.map(c => {
              const inicio = toHoraStr(c.fechaHoraInicio);
              const fin = toHoraStr(c.fechaHoraFin);
              const isConfirmada = c.estado === 'Confirmada';
              const isCompletada = c.estado === 'Completada';
              const isEnAtencion = c.estado === 'En atención';

              let badgeClass = 'badge-amber';
              if (isConfirmada || isCompletada) badgeClass = 'badge-emerald';
              if (isEnAtencion) badgeClass = 'badge-sky';

              const doctorNombre = c.doctor || 'Dra. Valeria Ramos';
              const doctorEspecialidad = c.doctorEspecialidad || 'Odontología General';
              const doctorIniciales = c.doctorIniciales || 'DR';

              return (
                <div
                  key={c.id}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    background: '#f8fafc',
                    borderLeft: `4px solid ${isConfirmada || isCompletada ? '#10b981' : isEnAtencion ? '#0284c7' : '#f59e0b'}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                  role="listitem"
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {c.pacienteNombreCompleto || `Paciente #${c.pacienteId}`}
                      {c.pacienteCi && (
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>
                          (CI: {c.pacienteCi})
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {c.motivoConsulta}
                    </div>
                    
                    {/* Badge del Doctor Asignado */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                      <span style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                        color: 'white',
                        fontSize: '0.64rem',
                        fontWeight: 800,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {doctorIniciales}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: '#0369a1', fontWeight: 600 }}>
                        {doctorNombre}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        • {doctorEspecialidad}
                      </span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                    <div style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '1rem', color: '#0f172a' }}>
                      <Clock size={13} style={{ verticalAlign: 'middle', marginRight: 3 }} />
                      {inicio} – {fin}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className={`badge ${badgeClass}`}>
                        {c.estado}
                      </span>
                      <button
                        className="btn btn-secondary"
                        onClick={() => abrirModalEditar(c)}
                        title="Modificar o cambiar estado de la cita"
                        style={{ padding: '3px 7px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '3px' }}
                      >
                        <Edit size={12} />
                        Editar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── Formulario de Nueva Cita ─────────────────────────────── */}
        <div className="card">
          <h3 style={{ fontSize: '1.05rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} color="#0284c7" />
            Programar Nueva Cita
          </h3>

          {conflictError && (
            <div className="alert alert-danger" role="alert" style={{ fontSize: '0.84rem' }}>
              <AlertTriangle size={18} style={{ flexShrink: 0 }} />
              <span>{conflictError}</span>
            </div>
          )}

          <form onSubmit={handleAgendar} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {/* Selector de Doctor Asignado (Obligatorio) */}
            <div className="form-group">
              <label htmlFor="agenda-doctor-select" className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Stethoscope size={15} color="#0284c7" />
                  <span>Especialista / Doctor Tratante <span className="required">*</span></span>
                </span>
                {nuevaCita.odontologoId && (
                  <span style={{ fontSize: '0.75rem', color: '#0369a1', fontWeight: 600 }}>
                    ✓ Asignado
                  </span>
                )}
              </label>
              <select
                id="agenda-doctor-select"
                className="form-select"
                value={nuevaCita.odontologoId}
                onChange={e => {
                  setNuevaCita({ ...nuevaCita, odontologoId: e.target.value });
                  setConflictError(null);
                }}
                required
                style={{
                  borderColor: !nuevaCita.odontologoId ? '#cbd5e1' : '#0284c7',
                  background: !nuevaCita.odontologoId ? '#fff' : '#f0f9ff'
                }}
              >
                <option value="">-- Seleccionar Especialista Obligatorio * --</option>
                {doctores.map(doc => {
                  const citasCount = citas.filter(c => c.odontologoId === doc.id).length;
                  const cargaTexto = citasCount === 0 ? 'Disponible' : `${citasCount} cita(s) hoy`;
                  return (
                    <option key={doc.id} value={doc.id}>
                      {doc.nombreCompleto || `Dr(a). ${doc.nombre}`} — {doc.especialidad} [{cargaTexto}]
                    </option>
                  );
                })}
              </select>
              {!nuevaCita.odontologoId && (
                <div style={{ fontSize: '0.76rem', color: '#e11d48', marginTop: '4px', fontWeight: 500 }}>
                  * Campo requerido para balancear la carga y evitar saturación en una sola persona.
                </div>
              )}
            </div>

            {/* Selector de Paciente */}
            <div className="form-group">
              <label htmlFor="agenda-paciente-select" className="form-label">
                Paciente <span className="required">*</span>
              </label>
              {pacientes.length > 0 ? (
                <select
                  id="agenda-paciente-select"
                  className="form-select"
                  value={nuevaCita.pacienteId}
                  onChange={e => {
                    setNuevaCita({ ...nuevaCita, pacienteId: e.target.value });
                    setConflictError(null);
                  }}
                  required
                >
                  <option value="">-- Seleccionar Paciente --</option>
                  {pacientes.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} {p.apellido} (CI: {p.ci})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id="agenda-paciente-select"
                  type="number"
                  className="form-input"
                  placeholder="ID de Paciente (ej. 1)"
                  min={1}
                  value={nuevaCita.pacienteId}
                  onChange={e => {
                    setNuevaCita({ ...nuevaCita, pacienteId: e.target.value });
                    setConflictError(null);
                  }}
                  required
                />
              )}
            </div>

            <div className="form-group">
              <label htmlFor="agenda-hora-input" className="form-label">
                Hora de Inicio <span className="required">*</span>
              </label>
              <input
                id="agenda-hora-input"
                type="time"
                className="form-input"
                value={nuevaCita.horaInicio}
                onChange={e => {
                  setNuevaCita({ ...nuevaCita, horaInicio: e.target.value });
                  setConflictError(null);
                }}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="agenda-duracion-select" className="form-label">
                Duración Estimada <span className="required">*</span>
              </label>
              <select
                id="agenda-duracion-select"
                className="form-select"
                value={nuevaCita.duracion}
                onChange={e => setNuevaCita({ ...nuevaCita, duracion: Number(e.target.value) })}
              >
                <option value={30}>30 minutos</option>
                <option value={45}>45 minutos</option>
                <option value={60}>60 minutos (1 hora)</option>
                <option value={90}>90 minutos (1.5 horas)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="agenda-estado-select" className="form-label">
                Estado Inicial
              </label>
              <select
                id="agenda-estado-select"
                className="form-select"
                value={nuevaCita.estado}
                onChange={e => setNuevaCita({ ...nuevaCita, estado: e.target.value })}
              >
                <option value="Confirmada">Confirmada</option>
                <option value="Pendiente">Pendiente</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="agenda-motivo-input" className="form-label">
                Motivo de Consulta <span className="required">*</span>
              </label>
              <input
                id="agenda-motivo-input"
                type="text"
                className="form-input"
                placeholder="Ej. Extracción de cordales, Limpieza profiláctica"
                value={nuevaCita.motivo}
                onChange={e => {
                  setNuevaCita({ ...nuevaCita, motivo: e.target.value });
                  setConflictError(null);
                }}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={guardando}
              style={{ marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              {guardando
                ? <><Loader2 size={16} className="spin" /> Guardando en Base de Datos…</>
                : <><Plus size={16} /> Validar y Agendar Cita</>
              }
            </button>
          </form>
        </div>
      </div>

      {/* ─── Modal: Editar / Modificar Cita ───────────────────────── */}
      {modalEditarCita && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <Edit size={18} color="#0284c7" />
                Actualizar Cita #{modalEditarCita.id}
              </h3>
              <button 
                className="btn-icon" 
                onClick={() => setModalEditarCita(null)}
                aria-label="Cerrar modal"
              >
                <X size={20} />
              </button>
            </div>

            {errorEdicion && (
              <div className="alert alert-danger" style={{ margin: '16px', fontSize: '0.85rem' }}>
                <AlertTriangle size={18} />
                <span>{errorEdicion}</span>
              </div>
            )}

            <form onSubmit={handleActualizarCita} style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', fontSize: '0.88rem' }}>
                Paciente: <b>{modalEditarCita.pacienteNombreCompleto || `ID #${modalEditarCita.pacienteId}`}</b>
              </div>

              {/* Reasignar Doctor */}
              <div className="form-group">
                <label htmlFor="editar-doctor-select" className="form-label">
                  Doctor / Especialista Tratante <span className="required">*</span>
                </label>
                <select
                  id="editar-doctor-select"
                  className="form-select"
                  value={formEdicion.odontologoId}
                  onChange={e => setFormEdicion({ ...formEdicion, odontologoId: e.target.value })}
                  required
                >
                  {doctores.map(doc => (
                    <option key={doc.id} value={doc.id}>
                      {doc.nombreCompleto || `Dr(a). ${doc.nombre}`} — {doc.especialidad}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="editar-estado-select" className="form-label">
                  Estado de la Cita <span className="required">*</span>
                </label>
                <select
                  id="editar-estado-select"
                  className="form-select"
                  value={formEdicion.estado}
                  onChange={e => setFormEdicion({ ...formEdicion, estado: e.target.value })}
                  required
                >
                  <option value="Confirmada">Confirmada</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="En atención">En atención</option>
                  <option value="Completada">Completada</option>
                  <option value="Cancelada">Cancelada</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="editar-fecha-input" className="form-label">
                  Fecha <span className="required">*</span>
                </label>
                <input
                  id="editar-fecha-input"
                  type="date"
                  className="form-input"
                  value={formEdicion.fecha}
                  onChange={e => setFormEdicion({ ...formEdicion, fecha: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="editar-hora-input" className="form-label">
                  Hora de Inicio <span className="required">*</span>
                </label>
                <input
                  id="editar-hora-input"
                  type="time"
                  className="form-input"
                  value={formEdicion.horaInicio}
                  onChange={e => setFormEdicion({ ...formEdicion, horaInicio: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="editar-duracion-select" className="form-label">
                  Duración Estimada <span className="required">*</span>
                </label>
                <select
                  id="editar-duracion-select"
                  className="form-select"
                  value={formEdicion.duracion}
                  onChange={e => setFormEdicion({ ...formEdicion, duracion: Number(e.target.value) })}
                >
                  <option value={30}>30 minutos</option>
                  <option value={45}>45 minutos</option>
                  <option value={60}>60 minutos (1 hora)</option>
                  <option value={90}>90 minutos (1.5 horas)</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="editar-motivo-input" className="form-label">
                  Motivo de Consulta <span className="required">*</span>
                </label>
                <input
                  id="editar-motivo-input"
                  type="text"
                  className="form-input"
                  value={formEdicion.motivo}
                  onChange={e => setFormEdicion({ ...formEdicion, motivo: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setModalEditarCita(null)}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={guardandoEdicion}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {guardandoEdicion ? <><Loader2 size={16} className="spin" /> Guardando…</> : <><Check size={16} /> Guardar Cambios</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
