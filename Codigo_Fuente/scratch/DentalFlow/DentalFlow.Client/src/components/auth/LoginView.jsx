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
  ArrowRight,
  UserPlus,
  Award,
  IdCard,
  CheckCircle2,
  ChevronLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ApiService } from '../../services/api';

const ESPECIALIDADES_ODONTO = [
  'Odontología General',
  'Ortodoncia y Cirugía',
  'Endodoncia',
  'Periodoncia e Implantología',
  'Odontopediatría',
  'Rehabilitación Oral y Estética',
  'Cirugía Maxilofacial'
];

export const LoginView = () => {
  const { login, register } = useAuth();

  const [modo, setModo] = useState('login'); // 'login' | 'registro'
  const [email, setEmail] = useState('valeria.ramos@dentalflow.bo');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [registroExitoso, setRegistroExitoso] = useState(false);

  // Formulario de Registro de Nuevo Odontólogo
  const [registroData, setRegistroData] = useState({
    nombre: '',
    apellido: '',
    especialidad: 'Odontología General',
    matriculaProfesional: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

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

  const cargarOdontologos = () => {
    ApiService.getOdontologos()
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setOdontologos(data);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    cargarOdontologos();
  }, []);

  const handleLoginSubmit = async (e) => {
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

  const handleRegistroSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (registroData.password !== registroData.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (registroData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setCargando(true);

    try {
      const payload = {
        nombre: registroData.nombre.trim(),
        apellido: registroData.apellido.trim(),
        especialidad: registroData.especialidad.trim(),
        matriculaProfesional: registroData.matriculaProfesional.trim().toUpperCase(),
        email: registroData.email.trim().toLowerCase(),
        password: registroData.password,
        rol: 'Odontólogo Especialista'
      };

      await register(payload);
      setRegistroExitoso(true);
      cargarOdontologos();
    } catch (err) {
      setError(err.message || 'Error al registrar profesional en la base de datos.');
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
        width: '550px',
        height: '550px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(2, 132, 199, 0.18) 0%, rgba(0,0,0,0) 70%)',
        top: '-120px',
        right: '-120px',
        pointerEvents: 'none'
      }} />

      <div style={{
        width: '100%',
        maxWidth: modo === 'registro' ? '540px' : '480px',
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.3)',
        padding: '36px 32px',
        position: 'relative',
        zIndex: 10,
        transition: 'max-width 0.3s ease'
      }}>
        {/* Cabecera / Branding */}
        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
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
            marginBottom: '12px'
          }}>
            <Stethoscope size={30} />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
            DentalFlow
          </h2>
          <div style={{ fontSize: '0.86rem', color: '#64748b', marginTop: '4px', fontWeight: 500 }}>
            Consultorio Dental Sonrisa del Mañana
          </div>
        </div>

        {/* Tab Switcher: Iniciar Sesión vs Registrar Profesional */}
        <div style={{
          display: 'flex',
          background: '#f1f5f9',
          borderRadius: '12px',
          padding: '4px',
          marginBottom: '20px',
          gap: '4px'
        }}>
          <button
            type="button"
            onClick={() => { setModo('login'); setError(null); }}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: modo === 'login' ? 'white' : 'transparent',
              color: modo === 'login' ? '#0284c7' : '#64748b',
              boxShadow: modo === 'login' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => { setModo('registro'); setError(null); }}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: modo === 'registro' ? 'white' : 'transparent',
              color: modo === 'registro' ? '#0284c7' : '#64748b',
              boxShadow: modo === 'registro' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <UserPlus size={15} />
            Nuevo Profesional
          </button>
        </div>

        {/* Alerta de Error */}
        {error && (
          <div className="alert alert-danger" role="alert" style={{ marginBottom: '18px', fontSize: '0.84rem', padding: '10px 14px' }}>
            <AlertCircle size={17} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* VISTA 1: INICIAR SESIÓN */}
        {modo === 'login' && (
          <>
            {/* Selector Rápido de Odontólogo */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Acceso Rápido por Especialista ({odontologos.length}):
                </span>
              </div>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
                gap: '8px',
                maxHeight: '160px',
                overflowY: 'auto',
                paddingRight: '2px'
              }}>
                {odontologos.map(doc => {
                  const isSelected = email.toLowerCase() === doc.email.toLowerCase();
                  return (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => seleccionarOdontologoRapido(doc)}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '10px',
                        border: isSelected ? '2px solid #0284c7' : '1px solid #e2e8f0',
                        background: isSelected ? '#f0f9ff' : '#f8fafc',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '6px',
                          background: isSelected ? '#0284c7' : '#cbd5e1',
                          color: 'white',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {doc.iniciales || 'DR'}
                        </div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {doc.nombreCompleto || `Dr(a). ${doc.nombre}`}
                        </div>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#0284c7', fontWeight: 600, paddingLeft: '32px' }}>
                        {doc.especialidad}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Formulario de Login */}
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
                  marginTop: '6px',
                  boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
                }}
              >
                {cargando ? (
                  <><Loader2 size={18} className="spin" /> Verificando sesión...</>
                ) : (
                  <>Ingresar al Consultorio <ArrowRight size={17} /></>
                )}
              </button>
            </form>
          </>
        )}

        {/* VISTA 2: REGISTRO DE NUEVO PROFESIONAL */}
        {modo === 'registro' && (
          <form onSubmit={handleRegistroSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                  Nombres <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej. Ana María"
                  value={registroData.nombre}
                  onChange={e => setRegistroData(prev => ({ ...prev, nombre: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                  Apellidos <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej. Torres Salinas"
                  value={registroData.apellido}
                  onChange={e => setRegistroData(prev => ({ ...prev, apellido: e.target.value }))}
                  required
                />
              </div>
            </div>

            {/* Especialidad & Matrícula COB */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                  Especialidad Odontológica
                </label>
                <select
                  className="form-input"
                  value={registroData.especialidad}
                  onChange={e => setRegistroData(prev => ({ ...prev, especialidad: e.target.value }))}
                >
                  {ESPECIALIDADES_ODONTO.map(esp => (
                    <option key={esp} value={esp}>{esp}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                  Matrícula COB <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="COB-78210-LP"
                  value={registroData.matriculaProfesional}
                  onChange={e => setRegistroData(prev => ({ ...prev, matriculaProfesional: e.target.value }))}
                  required
                />
              </div>
            </div>

            {/* Email Clínico */}
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                Correo Electrónico Clínico <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: '36px' }}
                  placeholder="ana.torres@dentalflow.bo"
                  value={registroData.email}
                  onChange={e => setRegistroData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
            </div>

            {/* Contraseñas */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                  Contraseña <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Mínimo 6 caract."
                  value={registroData.password}
                  onChange={e => setRegistroData(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                  Confirmar <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Repetir contraseña"
                  value={registroData.confirmPassword}
                  onChange={e => setRegistroData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                />
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
                marginTop: '6px',
                background: 'linear-gradient(135deg, #059669, #047857)',
                border: 'none',
                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
              }}
            >
              {cargando ? (
                <><Loader2 size={18} className="spin" /> Registrando en Colegio de Odontólogos...</>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  Dar de Alta Especialista
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer Legal */}
        <div style={{
          marginTop: '20px',
          paddingTop: '14px',
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
