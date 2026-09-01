import React from 'react';
import { 
  Users, 
  Activity, 
  Calendar, 
  CreditCard, 
  LayoutDashboard, 
  FileText,
  Sparkles,
  Stethoscope,
  ShieldCheck,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ currentTab, setTab }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'Principal' },
    { id: 'pacientes', label: 'Expediente Pacientes', icon: Users, section: 'Clínica' },
    { id: 'odontograma', label: 'Odontograma Digital', icon: Activity, section: 'Clínica' },
    { id: 'agenda', label: 'Agenda de Citas', icon: Calendar, section: 'Operaciones' },
    { id: 'finanzas', label: 'Finanzas y Abonos', icon: CreditCard, section: 'Finanzas' },
  ];

  const iniciales = user?.iniciales || (user?.nombre ? `${user.nombre[0]}${user.apellido ? user.apellido[0] : ''}` : 'DR');
  const nombre = user?.nombreCompleto || 'Dra. Valeria Ramos';
  const especialidad = user?.especialidad || 'Odontología General';

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="logo-badge">
          <Stethoscope size={24} />
        </div>
        <div>
          <div className="logo-title">DentalFlow</div>
          <div className="logo-subtitle">Sonrisa del Mañana</div>
        </div>
      </div>

      {/* Navigation */}
      <div className="sidebar-nav">
        <div className="nav-section-title">Navegación del Sistema</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setTab(item.id)}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={19} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span className="badge badge-blue" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="nav-section-title" style={{ marginTop: '16px' }}>Cumplimiento Legal</div>
        <div className="nav-item" style={{ opacity: 0.85, cursor: 'default', fontSize: '0.8rem' }}>
          <ShieldCheck size={18} color="#10b981" />
          <span>Ley N° 3131 / Ley 164</span>
        </div>
      </div>

      {/* Footer / User Profile */}
      <div className="sidebar-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
          <div className="doctor-avatar" style={{ flexShrink: 0 }}>
            {iniciales}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '0.86rem', fontWeight: 600, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {nombre}
            </div>
            <div style={{ fontSize: '0.73rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {especialidad}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={logout}
          className="btn-icon"
          title="Cerrar sesión"
          aria-label="Cerrar sesión"
          style={{ color: '#94a3b8', padding: '6px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)' }}
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
};
