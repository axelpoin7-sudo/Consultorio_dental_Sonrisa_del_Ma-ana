import React from 'react';
import { X, User, Phone, Mail, MapPin, ShieldAlert, Calendar, Activity, FileText, CreditCard, Clock, ShieldCheck, Lock } from 'lucide-react';

export const DetallePacienteModal = ({ 
  paciente, 
  isOpen, 
  onClose, 
  onOpenOdontograma,
  onAgendarCita,
  onIrAFinanzas 
}) => {
  if (!isOpen || !paciente) return null;

  const tieneAlergias = paciente.alergias && paciente.alergias.toLowerCase() !== 'ninguna conocida';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '680px' }}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="doctor-avatar" style={{ width: '44px', height: '44px', fontSize: '1.1rem' }}>
              {paciente.nombre[0]}{paciente.apellido[0]}
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>{paciente.nombreCompleto}</h3>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '2px' }}>
                <span className="badge badge-blue">CI: {paciente.ci}</span>
                <span className="badge badge-purple">{paciente.edad} años</span>
                <span className="badge badge-emerald" style={{ fontSize: '0.72rem' }}>
                  <Lock size={12} style={{ marginRight: '2px' }} /> Custodia Legal 10 Años
                </span>
              </div>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Cerrar modal de detalle">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Alergias Banner */}
          <div 
            style={{
              padding: '14px 16px',
              borderRadius: 'var(--radius-md)',
              background: tieneAlergias ? '#fff1f2' : '#ecfdf5',
              border: `1px solid ${tieneAlergias ? '#fecdd3' : '#a7f3d0'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <ShieldAlert size={22} color={tieneAlergias ? '#e11d48' : '#059669'} />
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: tieneAlergias ? '#9f1239' : '#065f46' }}>
                {tieneAlergias ? '¡ALERTA CLÍNICA: ALERGIAS REGISTRADAS!' : 'Condición Médica Segura'}
              </div>
              <div style={{ fontSize: '0.9rem', color: tieneAlergias ? '#be123c' : '#047857', fontWeight: 600 }}>
                {paciente.alergias}
              </div>
            </div>
          </div>

          {/* Datos Personales Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Phone size={18} color="#64748b" />
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Teléfono</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{paciente.telefono}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Mail size={18} color="#64748b" />
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Correo Electrónico</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{paciente.email || 'No registrado'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Calendar size={18} color="#64748b" />
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Fecha de Nacimiento</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                  {new Date(paciente.fechaNacimiento).toLocaleDateString('es-BO')}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <MapPin size={18} color="#64748b" />
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Dirección</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{paciente.direccion || 'No especificada'}</div>
              </div>
            </div>
          </div>

          {/* Historial Resumen */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '10px' }}>
              Resumen Clínico y Actividad Acumulada
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0284c7' }}>{paciente.totalOdontogramas}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Odontogramas</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#10b981' }}>{paciente.totalCitas}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Citas Totales</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#6366f1' }}>{paciente.totalPlanes}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Planes de Tratamiento</div>
              </div>
            </div>
          </div>

          {/* Marco Legal y Derechos ARCO / Habeas Data */}
          <div style={{ background: '#f1f5f9', padding: '12px 14px', borderRadius: '8px', fontSize: '0.78rem', color: '#475569', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <ShieldCheck size={20} color="#0284c7" style={{ flexShrink: 0 }} />
            <div>
              <b>Marco Legal & Habeas Data (Art. 130 CPE / Ley N° 3131):</b> Expediente médico custodiado con confidencialidad. Cumplimiento de derechos ARCO (Acceso, Rectificación, Cancelación, Oposición) y conservación por 10 años según NTS N° 021.
            </div>
          </div>
        </div>

        {/* Modal Footer with Direct Actions (Usability Dim. 1 & 4) */}
        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {onAgendarCita && (
              <button 
                className="btn btn-secondary" 
                style={{ padding: '8px 12px', fontSize: '0.82rem' }}
                onClick={() => {
                  onClose();
                  onAgendarCita(paciente);
                }}
              >
                <Clock size={16} color="#0284c7" />
                Agendar Cita
              </button>
            )}
            {onIrAFinanzas && (
              <button 
                className="btn btn-secondary" 
                style={{ padding: '8px 12px', fontSize: '0.82rem' }}
                onClick={() => {
                  onClose();
                  onIrAFinanzas(paciente);
                }}
              >
                <CreditCard size={16} color="#059669" />
                Ver Finanzas / Abonos
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary" onClick={onClose}>
              Cerrar
            </button>
            <button 
              className="btn btn-primary"
              onClick={() => {
                onClose();
                if (onOpenOdontograma) onOpenOdontograma(paciente);
              }}
            >
              <Activity size={18} />
              Abrir Odontograma Digital
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
