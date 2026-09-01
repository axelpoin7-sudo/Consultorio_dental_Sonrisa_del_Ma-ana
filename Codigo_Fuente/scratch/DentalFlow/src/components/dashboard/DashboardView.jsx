import React from 'react';
import { 
  Users, 
  Calendar, 
  CreditCard, 
  Activity, 
  CheckCircle2, 
  TrendingUp, 
  ShieldCheck, 
  AlertCircle,
  ArrowRight
} from 'lucide-react';

export const DashboardView = ({ setTab }) => {
  return (
    <div className="page-body">
      <div className="page-header">
        <div>
          <h1 className="page-title">Panel de Control Clínico</h1>
          <p className="page-description">
            Bienvenido a DentalFlow - Clínica Odontológica "Sonrisa del Mañana". Gestión digital y cumplimiento normativo.
          </p>
        </div>
      </div>

      {/* Quick KPI Cards */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <div className="card" style={{ background: 'linear-gradient(135deg, #0284c7, #0369a1)', color: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', opacity: 0.9 }}>Expedientes Registrados</span>
            <Users size={22} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, margin: '8px 0' }}>3 Pacientes</div>
          <div style={{ fontSize: '0.78rem', opacity: 0.85 }}>100% Digitalizado (Ley N° 3131)</div>
        </div>

        <div className="card" style={{ background: 'linear-gradient(135deg, #059669, #047857)', color: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', opacity: 0.9 }}>Citas Agendadas Hoy</span>
            <Calendar size={22} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, margin: '8px 0' }}>2 Citas</div>
          <div style={{ fontSize: '0.78rem', opacity: 0.85 }}>0 traslapes detectados</div>
        </div>

        <div className="card" style={{ background: 'linear-gradient(135deg, #4f46e5, #4338ca)', color: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', opacity: 0.9 }}>Odontogramas Clínicos</span>
            <Activity size={22} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, margin: '8px 0' }}>1 Activo</div>
          <div style={{ fontSize: '0.78rem', opacity: 0.85 }}>Notación FDI Internacional</div>
        </div>

        <div className="card" style={{ background: 'linear-gradient(135deg, #d97706, #b45309)', color: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', opacity: 0.9 }}>Ingresos por Abonos</span>
            <CreditCard size={22} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, margin: '8px 0' }}>Bs. 500.00</div>
          <div style={{ fontSize: '0.78rem', opacity: 0.85 }}>Amortización Inmediata</div>
        </div>
      </div>

      {/* Core Features Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        <div className="card">
          <h3 style={{ fontSize: '1.15rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={20} color="#0284c7" />
            Gestión de Expedientes Clínicos
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Registro validado con CI único, verificación de alergias automática y búsqueda reactiva con custodia médica.
          </p>
          <button className="btn btn-primary" onClick={() => setTab('pacientes')}>
            Ir a Expedientes
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '1.15rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={20} color="#10b981" />
            Odontograma Digital Interactivo
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Interacción visual por cara dental (Vestibular, Lingual, Oclusal, Mesial, Distal) con soporte permanente y pediátrico.
          </p>
          <button className="btn btn-secondary" onClick={() => setTab('odontograma')}>
            Ver Odontograma
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
