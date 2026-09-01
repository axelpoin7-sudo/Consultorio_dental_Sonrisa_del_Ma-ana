import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  CreditCard, 
  Activity, 
  CheckCircle2, 
  TrendingUp, 
  ShieldCheck, 
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Clock,
  ShieldAlert,
  DollarSign,
  PlusCircle,
  FileText,
  UserCheck,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ApiService } from '../../services/api';

export const DashboardView = ({ setTab }) => {
  const { user } = useAuth();
  const [pacientes, setPacientes] = useState([]);
  const [citas, setCitas] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const cargarDatosDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dataPacientes, dataCitas, dataPlanes] = await Promise.all([
        ApiService.getPacientes().catch(() => []),
        ApiService.getCitas().catch(() => []),
        ApiService.getPlanesTratamiento().catch(() => [])
      ]);

      setPacientes(dataPacientes || []);
      setCitas(dataCitas || []);
      setPlanes(dataPlanes || []);
      setLastUpdated(new Date());
    } catch (err) {
      setError('Error al sincronizar datos del dashboard: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatosDashboard();
  }, []);

  // Cálculos dinámicos de KPIs en tiempo real
  const totalPacientes = pacientes.length;
  const pacientesConAlergia = pacientes.filter(p => p.alergias && p.alergias.toLowerCase() !== 'ninguna conocida');
  
  // Total Odontogramas calculados
  const totalOdontogramas = pacientes.reduce((acc, p) => acc + (p.totalOdontogramas || 0), 0);

  // Citas de hoy y próximas citas
  const hoyStr = new Date().toISOString().split('T')[0];
  const citasHoy = citas.filter(c => {
    if (!c.fechaHoraInicio) return false;
    return c.fechaHoraInicio.startsWith(hoyStr) || new Date(c.fechaHoraInicio).toDateString() === new Date().toDateString();
  });

  // Finanzas: Facturación, Cobrado y Saldo Pendiente
  const totalFacturado = planes.reduce((acc, p) => acc + (Number(p.costoTotal) || 0), 0);
  const totalSaldoPendiente = planes.reduce((acc, p) => acc + (Number(p.saldoPendiente) || 0), 0);
  const totalRecaudado = Math.max(0, totalFacturado - totalSaldoPendiente);
  const porcentajeRecaudado = totalFacturado > 0 ? Math.round((totalRecaudado / totalFacturado) * 100) : 100;

  // Próximas 4 citas ordenadas cronológicamente
  const citasOrdenadas = [...citas].sort((a, b) => new Date(a.fechaHoraInicio) - new Date(b.fechaHoraInicio)).slice(0, 4);

  return (
    <div className="page-body">
      {/* Welcome Banner */}
      <div 
        className="card" 
        style={{ 
          marginBottom: '24px', 
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
          color: 'white',
          padding: '24px 28px',
          border: '1px solid #334155',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.3)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge badge-emerald" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block', marginRight: '4px' }} />
                Sistema En Línea • API Conectada
              </span>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                {lastUpdated.toLocaleDateString('es-BO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '4px 0 6px 0', letterSpacing: '-0.02em' }}>
              Bienvenido/a, {user?.nombreCompleto || 'Dra. Valeria Ramos'}
            </h1>
            <p style={{ fontSize: '0.88rem', color: '#cbd5e1', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span><b>Especialidad:</b> {user?.especialidad || 'Odontología General'}</span>
              <span>•</span>
              <span><b>Matrícula:</b> {user?.matriculaProfesional || 'COB-54219-LP'}</span>
              <span>•</span>
              <span style={{ color: '#38bdf8' }}>Consultorio Sonrisa del Mañana</span>
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              className="btn btn-secondary" 
              onClick={cargarDatosDashboard}
              title="Sincronizar datos"
              style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Actualizar
            </button>
            <button 
              className="btn btn-primary" 
              onClick={() => setTab('agenda')}
              style={{ background: 'linear-gradient(135deg, #0284c7, #0369a1)', border: 'none' }}
            >
              <Calendar size={16} />
              Nueva Cita
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert" style={{ marginBottom: '20px' }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Quick KPI Cards (Vivas con datos de BD) */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        {/* KPI 1: Pacientes */}
        <div 
          className="card" 
          style={{ 
            background: 'linear-gradient(135deg, #0284c7, #0369a1)', 
            color: 'white',
            cursor: 'pointer',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}
          onClick={() => setTab('pacientes')}
          title="Ver Expedientes de Pacientes"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', opacity: 0.9 }}>Expedientes Registrados</span>
            <Users size={22} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, margin: '8px 0' }}>
            {loading ? '...' : `${totalPacientes} Paciente${totalPacientes !== 1 ? 's' : ''}`}
          </div>
          <div style={{ fontSize: '0.78rem', opacity: 0.85, display: 'flex', justifyContent: 'space-between' }}>
            <span>{pacientesConAlergia.length} con alerta médica</span>
            <span>Ver lista →</span>
          </div>
        </div>

        {/* KPI 2: Citas */}
        <div 
          className="card" 
          style={{ 
            background: 'linear-gradient(135deg, #059669, #047857)', 
            color: 'white',
            cursor: 'pointer',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}
          onClick={() => setTab('agenda')}
          title="Ver Agenda de Citas"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', opacity: 0.9 }}>Citas Totales Agendadas</span>
            <Calendar size={22} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, margin: '8px 0' }}>
            {loading ? '...' : `${citas.length} Cita${citas.length !== 1 ? 's' : ''}`}
          </div>
          <div style={{ fontSize: '0.78rem', opacity: 0.85, display: 'flex', justifyContent: 'space-between' }}>
            <span>{citasHoy.length} programadas hoy</span>
            <span>Ver agenda →</span>
          </div>
        </div>

        {/* KPI 3: Odontogramas */}
        <div 
          className="card" 
          style={{ 
            background: 'linear-gradient(135deg, #4f46e5, #4338ca)', 
            color: 'white',
            cursor: 'pointer',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}
          onClick={() => setTab('odontograma')}
          title="Ver Odontograma Digital"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', opacity: 0.9 }}>Odontogramas Clínicos</span>
            <Activity size={22} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, margin: '8px 0' }}>
            {loading ? '...' : `${totalOdontogramas} Activo${totalOdontogramas !== 1 ? 's' : ''}`}
          </div>
          <div style={{ fontSize: '0.78rem', opacity: 0.85, display: 'flex', justifyContent: 'space-between' }}>
            <span>Notación FDI (Ley 3131)</span>
            <span>Abrir canvas →</span>
          </div>
        </div>

        {/* KPI 4: Finanzas */}
        <div 
          className="card" 
          style={{ 
            background: 'linear-gradient(135deg, #d97706, #b45309)', 
            color: 'white',
            cursor: 'pointer',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}
          onClick={() => setTab('finanzas')}
          title="Ver Finanzas y Abonos"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', opacity: 0.9 }}>Recaudación por Abonos</span>
            <CreditCard size={22} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, margin: '8px 0' }}>
            {loading ? '...' : `Bs. ${totalRecaudado.toFixed(2)}`}
          </div>
          <div style={{ fontSize: '0.78rem', opacity: 0.85, display: 'flex', justifyContent: 'space-between' }}>
            <span>Saldo por cobrar: Bs. {totalSaldoPendiente.toFixed(2)}</span>
            <span>Finanzas →</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Próximas Citas y Alertas Clínicas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        {/* Panel 1: Próximas Citas */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} color="#0284c7" />
              Próximas Citas en Agenda
            </h3>
            <button 
              className="btn-icon" 
              onClick={() => setTab('agenda')}
              title="Ver todas las citas"
              style={{ fontSize: '0.8rem', color: '#0284c7', padding: '4px 8px' }}
            >
              Ver todas <ChevronRight size={14} />
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
              <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 8px', display: 'block', color: '#0284c7' }} />
              Cargando agenda...
            </div>
          ) : citasOrdenadas.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '28px', color: 'var(--text-muted)' }}>
              <Calendar size={32} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
              <p style={{ margin: 0, fontSize: '0.88rem' }}>No hay citas agendadas próximamente.</p>
              <button className="btn btn-primary" style={{ marginTop: '12px', padding: '6px 14px', fontSize: '0.82rem' }} onClick={() => setTab('agenda')}>
                Agendar Cita
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {citasOrdenadas.map((c) => {
                const fecha = new Date(c.fechaHoraInicio);
                const horaInicio = fecha.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' });
                const isConfirmada = c.estado === 'Confirmada';

                return (
                  <div 
                    key={c.id} 
                    style={{
                      padding: '12px 14px',
                      borderRadius: '8px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        background: isConfirmada ? '#e0f2fe' : '#fef3c7', 
                        color: isConfirmada ? '#0369a1' : '#b45309',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        textAlign: 'center'
                      }}>
                        {horaInicio}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
                          {c.nombrePaciente || `Paciente #${c.pacienteId}`}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {c.motivoConsulta || 'Consulta odontológica'}
                        </div>
                      </div>
                    </div>

                    <span className={`badge ${isConfirmada ? 'badge-emerald' : 'badge-amber'}`} style={{ fontSize: '0.72rem' }}>
                      {c.estado}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Panel 2: Alertas Clínicas y Seguridad del Paciente */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: '#991b1b' }}>
              <ShieldAlert size={18} color="#e11d48" />
              Alertas Médicas & Alergias Activas
            </h3>
            <span className="badge badge-rose" style={{ fontSize: '0.72rem' }}>
              Ley N° 3131
            </span>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
              <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 8px', display: 'block', color: '#e11d48' }} />
              Verificando antecedentes...
            </div>
          ) : pacientesConAlergia.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '28px', color: '#059669', background: '#ecfdf5', borderRadius: '8px' }}>
              <ShieldCheck size={32} style={{ margin: '0 auto 8px', display: 'block' }} />
              <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>Todos los pacientes registrados sin alergias de riesgo.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {pacientesConAlergia.map((p) => (
                <div 
                  key={p.id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    background: '#fff1f2',
                    border: '1px solid #fecdd3',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#9f1239' }}>
                      {p.nombreCompleto}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#881337', marginTop: '2px' }}>
                      <b>Alergia:</b> {p.alergias}
                    </div>
                  </div>

                  <span className="badge badge-blue" style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                    CI: {p.ci}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: '16px', background: '#f8fafc', padding: '10px 12px', borderRadius: '6px', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            ⚠️ <b>Aviso Clínico:</b> Siempre verifique alergias a anestésicos locales y antibióticos antes de iniciar cualquier procedimiento quirúrgico u obturación.
          </div>
        </div>
      </div>

      {/* Panel Financiero y Módulos de Acceso Directo */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {/* Resumen Financiero Rápido */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={18} color="#059669" />
              Estado de Planes de Tratamiento
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Progreso de Recaudación:</span>
              <span style={{ fontWeight: 700, color: '#059669' }}>{porcentajeRecaudado}%</span>
            </div>
            
            {/* Progress bar */}
            <div style={{ width: '100%', height: '10px', background: '#e2e8f0', borderRadius: '6px', overflow: 'hidden', marginBottom: '16px' }}>
              <div 
                style={{ 
                  width: `${porcentajeRecaudado}%`, 
                  height: '100%', 
                  background: 'linear-gradient(90deg, #10b981, #059669)',
                  transition: 'width 0.5s ease'
                }} 
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
              <div style={{ background: '#f0fdf4', padding: '10px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                <div style={{ fontSize: '0.75rem', color: '#166534' }}>Total Cobrado</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#15803d' }}>Bs. {totalRecaudado.toFixed(2)}</div>
              </div>
              <div style={{ background: '#fffbeb', padding: '10px', borderRadius: '8px', border: '1px solid #fef3c7' }}>
                <div style={{ fontSize: '0.75rem', color: '#92400e' }}>Por Amortizar</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#b45309' }}>Bs. {totalSaldoPendiente.toFixed(2)}</div>
              </div>
            </div>
          </div>

          <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setTab('finanzas')}>
            Gestionar Presupuestos y Abonos
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Acceso Rápido: Odontograma Digital */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={18} color="#4f46e5" />
              Odontograma Digital Interactivo
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: '1.4' }}>
              Marcación anatómica por caras dentales (Vestibular, Lingual, Oclusal, Mesial, Distal) con soporte permanente y pediátrico e historial inmutable.
            </p>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
              <span className="badge badge-rose" style={{ fontSize: '0.72rem' }}>🔴 Patología</span>
              <span className="badge badge-blue" style={{ fontSize: '0.72rem' }}>🔵 Realizado</span>
              <span className="badge badge-emerald" style={{ fontSize: '0.72rem' }}>🟢 Planificado</span>
            </div>
          </div>

          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', background: 'linear-gradient(135deg, #4f46e5, #4338ca)', border: 'none' }} onClick={() => setTab('odontograma')}>
            Abrir Odontograma FDI
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Acceso Rápido: Expediente de Pacientes */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} color="#0284c7" />
              Expedientes Clínicos Centralizados
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: '1.4' }}>
              Validación de Cédula de Identidad con sufijo departamental, integración directa con WhatsApp y cumplimiento de la Ley N° 3131.
            </p>
            <div style={{ fontSize: '0.78rem', color: '#0369a1', background: '#f0f9ff', padding: '8px 10px', borderRadius: '6px', marginBottom: '16px' }}>
              💡 Atajo rápido: Presione <b>Alt + N</b> para nuevo paciente
            </div>
          </div>

          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setTab('pacientes')}>
            Explorar Expedientes
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
