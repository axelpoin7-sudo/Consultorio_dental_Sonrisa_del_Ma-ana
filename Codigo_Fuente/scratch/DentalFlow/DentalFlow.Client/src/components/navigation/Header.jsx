import React, { useState, useEffect } from 'react';
import { Search, Bell, ShieldCheck, Stethoscope, ChevronDown } from 'lucide-react';
import { ApiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const Header = ({ onSearch, searchTerm }) => {
  const { user, loginDirecto } = useAuth();
  const [dbStatus, setDbStatus] = useState('Verificando...');
  const [isOnline, setIsOnline] = useState(true);
  const [doctores, setDoctores] = useState([]);
  const [mostrarMenuDoctores, setMostrarMenuDoctores] = useState(false);

  useEffect(() => {
    const checkApi = async () => {
      const health = await ApiService.getHealth();
      if (health) {
        setDbStatus('Servidor Online');
        setIsOnline(true);
      } else {
        setDbStatus('Modo Offline / Local');
        setIsOnline(false);
      }
    };
    checkApi();
    const interval = setInterval(checkApi, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    ApiService.getOdontologos()
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setDoctores(data);
        }
      })
      .catch(() => {});
  }, []);

  const handleCambiarDoctor = (doc) => {
    loginDirecto(doc);
    setMostrarMenuDoctores(false);
  };

  return (
    <header className="topbar">
      {/* Global search */}
      <div className="topbar-search">
        <Search size={18} color="#94a3b8" />
        <input 
          id="global-search-input"
          type="text" 
          placeholder="Buscar por CI, nombre, apellido o teléfono..."
          aria-label="Buscar pacientes por CI, nombre, apellido o teléfono"
          value={searchTerm}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      {/* Right actions */}
      <div className="topbar-actions">
        {/* Selector Rápido de Especialista Activo */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setMostrarMenuDoctores(!mostrarMenuDoctores)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              fontSize: '0.82rem',
              borderRadius: '8px',
              background: '#f0f9ff',
              borderColor: '#bae6fd',
              color: '#0369a1',
              fontWeight: 600
            }}
            title="Cambiar profesional en atención"
          >
            <Stethoscope size={15} color="#0284c7" />
            <span>{user?.nombreCompleto || 'Especialista Activo'}</span>
            <ChevronDown size={14} />
          </button>

          {mostrarMenuDoctores && (
            <div style={{
              position: 'absolute',
              top: '110%',
              right: 0,
              width: '280px',
              background: 'white',
              borderRadius: '10px',
              boxShadow: 'var(--shadow-xl)',
              border: '1px solid #cbd5e1',
              zIndex: 1000,
              padding: '8px 0'
            }}>
              <div style={{ padding: '6px 14px', fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                Cambiar Especialista en Sesión
              </div>
              {doctores.map(doc => {
                const isCurrent = user?.id === doc.id;
                return (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => handleCambiarDoctor(doc)}
                    style={{
                      width: '100%',
                      padding: '8px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      border: 'none',
                      background: isCurrent ? '#f0f9ff' : 'transparent',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '0.82rem',
                      color: isCurrent ? '#0284c7' : '#1e293b',
                      fontWeight: isCurrent ? 700 : 500
                    }}
                  >
                    <span style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      background: isCurrent ? '#0284c7' : '#e2e8f0',
                      color: isCurrent ? 'white' : '#475569',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {doc.iniciales || 'DR'}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {doc.nombreCompleto || `Dr(a). ${doc.nombre}`}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                        {doc.especialidad}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Status Badge */}
        <div className="status-badge" role="status" aria-live="polite">
          <div className="pulse-dot" style={{ background: isOnline ? '#10b981' : '#f59e0b' }} />
          <span>{dbStatus}</span>
        </div>

        {/* Legal badge */}
        <div className="badge badge-purple" style={{ padding: '6px 12px', fontSize: '0.8rem' }} title="Cumplimiento de la Ley N° 3131 del Ejercicio Profesional Médico">
          <ShieldCheck size={14} style={{ marginRight: '4px' }} />
          <span>Ley N° 3131 | Expediente Seguro</span>
        </div>

        {/* Notification Bell */}
        <button className="btn-icon" title="Notificaciones del sistema" aria-label="Notificaciones del sistema">
          <Bell size={20} />
        </button>
      </div>
    </header>
  );
};
