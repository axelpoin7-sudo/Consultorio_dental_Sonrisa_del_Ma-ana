import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  Search, 
  Eye, 
  Trash2, 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle, 
  Users, 
  RefreshCw,
  Clock,
  Sparkles,
  Phone,
  MessageCircle,
  Copy,
  Check,
  Filter,
  X
} from 'lucide-react';
import { ApiService } from '../../services/api';
import { RegistrarPacienteModal } from './RegistrarPacienteModal';
import { DetallePacienteModal } from './DetallePacienteModal';

export const PacientesView = ({ 
  searchTerm, 
  onSelectPacienteOdontograma,
  onAgendarCita,
  onIrAFinanzas 
}) => {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [selectedPaciente, setSelectedPaciente] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [filtroAlergia, setFiltroAlergia] = useState('todos'); // 'todos', 'con-alergias', 'sin-alergias'
  const [copiedCi, setCopiedCi] = useState(null);

  const cargarPacientes = async (term = '') => {
    setLoading(true);
    setError(null);
    try {
      const data = await ApiService.getPacientes(term);
      setPacientes(data);
    } catch (err) {
      setError('No se pudo conectar con el servidor API de ASP.NET Core: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPacientes(searchTerm);
  }, [searchTerm]);

  // Atajo global: Alt+N para nuevo paciente
  useEffect(() => {
    const handleGlobalKeys = (e) => {
      if (e.altKey && (e.key === 'n' || e.key === 'N')) {
        e.preventDefault();
        setIsRegisterOpen(true);
      }
    };
    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, []);

  const handlePacienteCreado = (nuevo) => {
    setPacientes(prev => [nuevo, ...prev]);
    setToastMessage(`¡Paciente ${nuevo.nombreCompleto} (CI: ${nuevo.ci}) registrado con éxito en el expediente!`);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const handleVerDetalle = (paciente) => {
    setSelectedPaciente(paciente);
    setIsDetailOpen(true);
  };

  const handleCopyCi = (ci) => {
    navigator.clipboard.writeText(ci);
    setCopiedCi(ci);
    setTimeout(() => setCopiedCi(null), 2000);
  };

  const handleEliminar = async (id, nombre) => {
    if (window.confirm(`¿Está seguro de eliminar el registro de ${nombre}? Esta acción no se puede deshacer.`)) {
      try {
        await ApiService.eliminarPaciente(id);
        setPacientes(prev => prev.filter(p => p.id !== id));
        setToastMessage(`Paciente eliminado del expediente clínico.`);
        setTimeout(() => setToastMessage(null), 3000);
      } catch (err) {
        alert('Error al eliminar paciente: ' + err.message);
      }
    }
  };

  // Filtrado reactivo en memoria
  const pacientesFiltrados = pacientes.filter(p => {
    const tieneAlergias = p.alergias && p.alergias.toLowerCase() !== 'ninguna conocida';
    if (filtroAlergia === 'con-alergias') return tieneAlergias;
    if (filtroAlergia === 'sin-alergias') return !tieneAlergias;
    return true;
  });

  return (
    <div className="page-body">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="alert alert-success" role="status" aria-live="polite" style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000, boxShadow: 'var(--shadow-lg)' }}>
          <CheckCircle2 size={20} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Expediente de Pacientes</h1>
          <p className="page-description">
            Registro clínico centralizado, validación de documento único y gestión de antecedentes médicos (Ley N° 3131).
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={() => cargarPacientes(searchTerm)} title="Recargar lista">
            <RefreshCw size={17} className={loading ? 'animate-spin' : ''} />
            Actualizar
          </button>
          <button className="btn btn-primary" onClick={() => setIsRegisterOpen(true)} title="Nuevo Paciente (Atajo: Alt+N)">
            <UserPlus size={18} />
            Registrar Paciente
          </button>
        </div>
      </div>

      {/* Stats Cards Responsive */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: '#e0f2fe', color: '#0284c7', padding: '12px', borderRadius: '12px' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{pacientes.length}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pacientes Registrados</div>
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: '#fff1f2', color: '#e11d48', padding: '12px', borderRadius: '12px' }}>
            <ShieldAlert size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>
              {pacientes.filter(p => p.alergias && p.alergias.toLowerCase() !== 'ninguna conocida').length}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Alertas por Alergias</div>
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: '#fef3c7', color: '#d97706', padding: '12px', borderRadius: '12px' }}>
            <Sparkles size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>
              {pacientes.reduce((acc, p) => acc + (p.totalOdontogramas || 0), 0)}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Odontogramas Activos</div>
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: '#ede9fe', color: '#6366f1', padding: '12px', borderRadius: '12px' }}>
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>100%</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Expedientes Digitales</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs and Quick Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            type="button"
            className="btn" 
            style={{ 
              padding: '6px 14px', 
              fontSize: '0.84rem',
              background: filtroAlergia === 'todos' ? '#0284c7' : 'white',
              color: filtroAlergia === 'todos' ? 'white' : '#475569',
              border: '1px solid var(--border-color)'
            }}
            onClick={() => setFiltroAlergia('todos')}
          >
            Todos ({pacientes.length})
          </button>
          <button 
            type="button"
            className="btn" 
            style={{ 
              padding: '6px 14px', 
              fontSize: '0.84rem',
              background: filtroAlergia === 'con-alergias' ? '#e11d48' : 'white',
              color: filtroAlergia === 'con-alergias' ? 'white' : '#475569',
              border: '1px solid var(--border-color)'
            }}
            onClick={() => setFiltroAlergia('con-alergias')}
          >
            ⚠️ Con Alergias ({pacientes.filter(p => p.alergias && p.alergias.toLowerCase() !== 'ninguna conocida').length})
          </button>
          <button 
            type="button"
            className="btn" 
            style={{ 
              padding: '6px 14px', 
              fontSize: '0.84rem',
              background: filtroAlergia === 'sin-alergias' ? '#10b981' : 'white',
              color: filtroAlergia === 'sin-alergias' ? 'white' : '#475569',
              border: '1px solid var(--border-color)'
            }}
            onClick={() => setFiltroAlergia('sin-alergias')}
          >
            ✓ Sin Alergias ({pacientes.filter(p => !p.alergias || p.alergias.toLowerCase() === 'ninguna conocida').length})
          </button>
        </div>

        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Mostrando <b>{pacientesFiltrados.length}</b> expediente(s)
        </div>
      </div>

      {/* Table Card */}
      <div className="card">
        {error ? (
          <div className="alert alert-danger" role="alert" style={{ margin: '16px' }}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        ) : loading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
            <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 12px', display: 'block', color: '#0284c7' }} />
            <div>Cargando expediente de pacientes desde la API...</div>
          </div>
        ) : pacientesFiltrados.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
            <Users size={44} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>No se encontraron pacientes</h3>
            <p style={{ fontSize: '0.88rem', marginTop: '4px' }}>
              {searchTerm ? `No hay resultados para "${searchTerm}"` : 'Comienza registrando al primer paciente en el sistema.'}
            </p>
            <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => setIsRegisterOpen(true)}>
              <UserPlus size={17} /> Registrar Paciente
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table-custom">
              <thead>
                <tr>
                  <th>Cédula (CI)</th>
                  <th>Nombre Completo</th>
                  <th>Edad / Nacimiento</th>
                  <th>Contacto & WhatsApp</th>
                  <th>Alergias / Antecedentes</th>
                  <th>Registro</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pacientesFiltrados.map((p) => {
                  const tieneAlergias = p.alergias && p.alergias.toLowerCase() !== 'ninguna conocida';
                  const telefonoLimpio = p.telefono.replace(/\D/g, '');
                  const whatsappUrl = `https://wa.me/591${telefonoLimpio}?text=${encodeURIComponent(`Hola ${p.nombre}, le escribimos del Consultorio Dental Sonrisa del Mañana.`)}`;

                  return (
                    <tr key={p.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className="badge badge-blue" style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                            {p.ci}
                          </span>
                          <button
                            type="button"
                            className="btn-icon"
                            style={{ padding: '4px' }}
                            title="Copiar CI"
                            aria-label={`Copiar CI ${p.ci}`}
                            onClick={() => handleCopyCi(p.ci)}
                          >
                            {copiedCi === p.ci ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                          </button>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                          {p.nombreCompleto}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {p.email || 'Sin correo'}
                        </div>
                      </td>
                      <td>
                        <div>{p.edad} años</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {new Date(p.fechaNacimiento).toLocaleDateString('es-BO')}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 500 }}>{p.telefono}</span>
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="badge badge-emerald"
                            style={{ textDecoration: 'none', padding: '3px 8px', gap: '4px' }}
                            title="Abrir chat de WhatsApp"
                            aria-label={`Contactar por WhatsApp a ${p.nombreCompleto}`}
                          >
                            <MessageCircle size={13} />
                            WhatsApp
                          </a>
                        </div>
                      </td>
                      <td>
                        {tieneAlergias ? (
                          <span className="badge badge-rose" style={{ gap: '6px' }}>
                            <ShieldAlert size={13} />
                            {p.alergias}
                          </span>
                        ) : (
                          <span className="badge badge-emerald">
                            {p.alergias}
                          </span>
                        )}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {new Date(p.fechaRegistro).toLocaleDateString('es-BO')}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button 
                            type="button"
                            className="btn-icon" 
                            title="Ver expediente clínico completo"
                            aria-label={`Ver expediente de ${p.nombreCompleto}`}
                            onClick={() => handleVerDetalle(p)}
                          >
                            <Eye size={17} color="#0284c7" />
                          </button>
                          <button 
                            type="button"
                            className="btn-icon" 
                            title="Eliminar registro"
                            aria-label={`Eliminar registro de ${p.nombreCompleto}`}
                            onClick={() => handleEliminar(p.id, p.nombreCompleto)}
                          >
                            <Trash2 size={17} color="#ef4444" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <RegistrarPacienteModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onPacienteCreado={handlePacienteCreado}
      />

      <DetallePacienteModal
        isOpen={isDetailOpen}
        paciente={selectedPaciente}
        onClose={() => setIsDetailOpen(false)}
        onOpenOdontograma={onSelectPacienteOdontograma}
        onAgendarCita={onAgendarCita}
        onIrAFinanzas={onIrAFinanzas}
      />
    </div>
  );
};
