import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, 
  Lock, 
  Mail, 
  ShieldCheck, 
  AlertCircle, 
  Loader2, 
  UserCheck, 
  Eye, 
  EyeOff, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ApiService } from '../../services/api';

export const LoginView = () => {
  const { login, loginDirecto } = useAuth();

  const [email, setEmail] = useState('valeria.ramos@dentalflow.bo');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const [odontologos, setOdontologos] = useState([
    {
      id: 1,
      nombre: 'Valeria',
      apellido: 'Ramos',
      nombreCompleto: 'Dra. Valeria Ramos',
      especialidad: 'Odontología General y Estética',
      matriculaProfesional: 'COB-54219-LP',
      email: 'valeria.ramos@dentalflow.bo',
      iniciales: 'VR',
      rol: 'Odontólogo Titular'
    },
    {
      id: 2,
      nombre: 'Carlos',
      apellido: 'Guzmán Flores',
      nombreCompleto: 'Dr. Carlos Guzmán',
      especialidad: 'Ortodoncia y Cirugía Maxilofacial',
      matriculaProfesional: 'COB-61042-SC',
      email: 'carlos.guzman@dentalflow.bo',
      iniciales: 'CG',
      rol: 'Especialista Ortodoncia'
    },
    {
      id: 3,
      nombre: 'Sofía',
      apellido: 'Morales Arteaga',
      nombreCompleto: 'Dra. Sofía Morales',
      especialidad: 'Endodoncia y Prótesis',
      matriculaProfesional: 'COB-48192-CB',
      email: 'sofia.morales@dentalflow.bo',
      iniciales: 'SM',
      rol: 'Especialista Endodoncia'
    },
    {
      id: 4,
      nombre: 'Mateo',
      apellido: 'Villarroel Paz',
      nombreCompleto: 'Dr. Mateo Villarroel',
      especialidad: 'Odontopediatría y Prevención',
      matriculaProfesional: 'COB-72310-LP',
      email: 'mateo.villarroel@dentalflow.bo',
      iniciales: 'MV',
      rol: 'Especialista Odontopediatría'
    },
    {
      id: 5,
      nombre: 'Andrea',
      apellido: 'Claros Torrico',
      nombreCompleto: 'Dra. Andrea Claros',
      especialidad: 'Periodoncia e Implantología',
      matriculaProfesional: 'COB-80415-SC',
      email: 'andrea.claros@dentalflow.bo',
      iniciales: 'AC',
      rol: 'Especialista Periodoncia'
    }
  ]);

  useEffect(() => {
    // Intentar cargar lista de odontólogos desde la API
    ApiService.getOdontologos()
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setOdontologos(data);
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setCargando(true);

    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err.message || 'Credenciales incorrectas. Verifique su correo y contraseña.');
    } finally {
      setCargando(false);
    }
  };

  const seleccionarOdontologoRapido = (doc) => {
    setEmail(doc.email);
    setPassword('password123');
    setError(null);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0369a1 100%)',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Elementos de fondo decorativos */}
      <div style={{
        position: 'absolute',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(2, 132, 199, 0.15) 0%, rgba(0,0,0,0) 70%)',
        top: '-100px',
        right: '-100px',
        pointerEvents: 'none'
      }} />

      <div style={{
        width: '100%',
        maxWidth: '460px',
        background: 'rgba(255, 255, 255, 0.96)',
        backdropFilter: 'blur(16px)',
        borderRadius: '20px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.2)',
        padding: '36px 32px',
        position: 'relative',
        zIndex: 10
      }}>
        {/* Cabecera / Branding */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #0284c7, #0369a1)',
            color: 'white',
            boxShadow: '0 8px 16px rgba(2, 132, 199, 0.35)',
            marginBottom: '14px'
          }}>
            <Stethoscope size={30} />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
            DentalFlow
          </h2>
          <div style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '4px', fontWeight: 500 }}>
            Consultorio Dental Sonrisa del Mañana
          </div>
        </div>

        {/* Selector Rápido de Odontólogo */}
        <div style={{ marginBottom: '22px' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
            Acceso Rápido por Especialista:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {odontologos.map(doc => {
              const isSelected = email === doc.email;
              return (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => seleccionarOdontologoRapido(doc)}
                  style={{
                    padding: '10px',
                    borderRadius: '12px',
                    border: isSelected ? '2px solid #0284c7' : '1px solid #e2e8f0',
                    background: isSelected ? '#f0f9ff' : '#f8fafc',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '8px',
                      background: isSelected ? '#0284c7' : '#cbd5e1',
                      color: 'white',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {doc.iniciales || 'DR'}
                    </div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {doc.nombreCompleto || `Dr(a). ${doc.nombre}`}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 600, marginTop: '2px' }}>
                    {doc.especialidad}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Alerta de Error */}
        {error && (
          <div className="alert alert-danger" role="alert" style={{ marginBottom: '18px', fontSize: '0.84rem', padding: '10px 14px' }}>
            <AlertCircle size={17} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Formulario de Login */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div className="form-group">
            <label htmlFor="login-email-input" className="form-label" style={{ fontSize: '0.84rem', fontWeight: 600 }}>
              Correo Electrónico Clínico
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={17} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                id="login-email-input"
                type="email"
                className="form-input"
                style={{ paddingLeft: '38px', height: '42px', fontSize: '0.9rem' }}
                placeholder="doctor@dentalflow.bo"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="login-password-input" className="form-label" style={{ fontSize: '0.84rem', fontWeight: 600 }}>
              Contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={17} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                id="login-password-input"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                style={{ paddingLeft: '38px', paddingRight: '38px', height: '42px', fontSize: '0.9rem' }}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="btn-icon"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '8px', top: '7px', padding: '4px' }}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={cargando}
            style={{
              height: '44px',
              fontSize: '0.95rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '8px',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
            }}
          >
            {cargando ? (
              <><Loader2 size={18} className="spin" /> Verificando...</>
            ) : (
              <>Ingresar al Consultorio <ArrowRight size={17} /></>
            )}
          </button>
        </form>

        {/* Footer Legal */}
        <div style={{
          marginTop: '24px',
          paddingTop: '16px',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#64748b',
          fontSize: '0.74rem'
        }}>
          <ShieldCheck size={18} color="#10b981" style={{ flexShrink: 0 }} />
          <span>
            Acceso seguro con firma y matrícula profesional conforme a la <b>Ley N° 3131</b> y <b>Ley N° 164</b>.
          </span>
        </div>
      </div>
    </div>
  );
};
