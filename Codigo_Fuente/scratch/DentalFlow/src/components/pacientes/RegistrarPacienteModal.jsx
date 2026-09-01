import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  UserPlus, 
  AlertCircle, 
  CheckCircle2, 
  ShieldAlert, 
  Sparkles, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  FileText 
} from 'lucide-react';
import { ApiService } from '../../services/api';

const DEPARTAMENTOS_BO = ['LP', 'SC', 'CB', 'OR', 'PT', 'TJ', 'CH', 'BE', 'PA'];
const ALERGIAS_COMUNES = ['Ninguna conocida', 'Penicilina', 'Látex', 'Aspirina / AINEs', 'Anestesia local', 'Sulfas'];

export const RegistrarPacienteModal = ({ isOpen, onClose, onPacienteCreado }) => {
  const [formData, setFormData] = useState({
    ci: '',
    nombre: '',
    apellido: '',
    fechaNacimiento: '',
    telefono: '',
    email: '',
    direccion: '',
    alergias: 'Ninguna conocida'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [ciStatus, setCiStatus] = useState({ checking: false, available: null });
  const ciInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => ciInputRef.current?.focus(), 100);
      setFormData({
        ci: '',
        nombre: '',
        apellido: '',
        fechaNacimiento: '',
        telefono: '',
        email: '',
        direccion: '',
        alergias: 'Ninguna conocida'
      });
      setErrors({});
      setApiError(null);
      setCiStatus({ checking: false, available: null });
    }
  }, [isOpen]);

  // Atajo de teclado: Escape para cerrar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
    setApiError(null);
  };

  const handleSuffixClick = (ext) => {
    let currentCi = formData.ci.trim();
    // Remover extensión previa si existía
    currentCi = currentCi.replace(/-[A-Z]{2}$/i, '');
    const newCi = `${currentCi}-${ext}`;
    setFormData(prev => ({ ...prev, ci: newCi }));
    checkCiAvailability(newCi);
  };

  const handleAllergyChipClick = (alergia) => {
    if (alergia === 'Ninguna conocida') {
      setFormData(prev => ({ ...prev, alergias: 'Ninguna conocida' }));
      return;
    }

    setFormData(prev => {
      if (prev.alergias === 'Ninguna conocida' || !prev.alergias) {
        return { ...prev, alergias: alergia };
      }
      const lista = prev.alergias.split(',').map(s => s.trim());
      if (lista.includes(alergia)) {
        const filtrada = lista.filter(item => item !== alergia);
        return { ...prev, alergias: filtrada.length ? filtrada.join(', ') : 'Ninguna conocida' };
      } else {
        return { ...prev, alergias: `${prev.alergias}, ${alergia}` };
      }
    });
  };

  const checkCiAvailability = async (ciValue) => {
    const ciVal = (ciValue || formData.ci).trim();
    if (ciVal.length >= 3) {
      setCiStatus({ checking: true, available: null });
      try {
        const res = await ApiService.verificarExisteCI(ciVal);
        setCiStatus({ checking: false, available: !res.existe });
        if (res.existe) {
          setErrors(prev => ({ ...prev, ci: `El CI '${ciVal}' ya está registrado en el expediente clínico.` }));
        } else {
          setErrors(prev => ({ ...prev, ci: null }));
        }
      } catch {
        setCiStatus({ checking: false, available: null });
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.ci.trim()) {
      newErrors.ci = 'El CI / Documento es obligatorio.';
    } else if (formData.ci.trim().length > 15) {
      newErrors.ci = 'El CI no puede exceder 15 caracteres.';
    }

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio.';
    } else if (formData.nombre.trim().length > 50) {
      newErrors.nombre = 'El nombre no puede exceder 50 caracteres.';
    }

    if (!formData.apellido.trim()) {
      newErrors.apellido = 'El apellido es obligatorio.';
    } else if (formData.apellido.trim().length > 50) {
      newErrors.apellido = 'El apellido no puede exceder 50 caracteres.';
    }

    if (!formData.fechaNacimiento) {
      newErrors.fechaNacimiento = 'La fecha de nacimiento es obligatoria.';
    } else {
      const fecha = new Date(formData.fechaNacimiento);
      if (fecha > new Date()) {
        newErrors.fechaNacimiento = 'La fecha de nacimiento no puede ser futura.';
      }
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es obligatorio.';
    } else if (formData.telefono.trim().length > 15) {
      newErrors.telefono = 'El teléfono no puede exceder 15 caracteres.';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Formato de correo electrónico inválido.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setApiError(null);

    try {
      const payload = {
        ci: formData.ci.trim(),
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        fechaNacimiento: new Date(formData.fechaNacimiento).toISOString(),
        telefono: formData.telefono.trim(),
        email: formData.email ? formData.email.trim() : null,
        direccion: formData.direccion ? formData.direccion.trim() : null,
        alergias: formData.alergias.trim() || 'Ninguna conocida'
      };

      const nuevoPaciente = await ApiService.registrarPaciente(payload);
      onPacienteCreado(nuevoPaciente);
      onClose();
    } catch (err) {
      setApiError(err.message || 'Error al registrar el paciente');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '720px' }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="logo-badge" style={{ width: '40px', height: '40px' }}>
              <UserPlus size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>Registrar Nuevo Paciente</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Expediente clínico digital conforme a la Ley N° 3131 y Norma Técnica de Salud N° 021
              </p>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Cerrar modal (Esc)">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {apiError && (
              <div className="alert alert-danger" role="alert">
                <AlertCircle size={20} style={{ flexShrink: 0 }} />
                <span>{apiError}</span>
              </div>
            )}

            {/* Fila 1: CI y Teléfono */}
            <div className="form-grid">
              {/* Documento / CI con Suffix Chips */}
              <div className="form-group">
                <label htmlFor="reg-ci-input" className="form-label">
                  Cédula de Identidad (CI) <span className="required">*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    ref={ciInputRef}
                    id="reg-ci-input"
                    type="text"
                    name="ci"
                    className={`form-input ${errors.ci ? 'error' : ''}`}
                    placeholder="Ej. 8472910"
                    value={formData.ci}
                    onChange={handleChange}
                    onBlur={() => checkCiAvailability()}
                    style={{ width: '100%', paddingRight: '90px' }}
                    required
                  />
                  <div style={{ position: 'absolute', right: '10px', top: '9px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {ciStatus.checking && (
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Verificando...</span>
                    )}
                    {ciStatus.available === true && (
                      <span className="badge badge-emerald" style={{ padding: '2px 6px', fontSize: '0.72rem' }}>
                        <CheckCircle2 size={12} style={{ marginRight: '2px' }} /> Disponible
                      </span>
                    )}
                  </div>
                </div>
                {errors.ci && <span className="error-text">{errors.ci}</span>}

                {/* Chips de Extensión Departamental */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Extensión:</span>
                  {DEPARTAMENTOS_BO.map(ext => (
                    <button
                      key={ext}
                      type="button"
                      onClick={() => handleSuffixClick(ext)}
                      aria-label={`Extensión departamental ${ext}`}
                      style={{
                        padding: '2px 6px',
                        fontSize: '0.72rem',
                        borderRadius: '4px',
                        border: '1px solid #cbd5e1',
                        background: formData.ci.endsWith(`-${ext}`) ? '#0284c7' : '#f8fafc',
                        color: formData.ci.endsWith(`-${ext}`) ? 'white' : '#475569',
                        cursor: 'pointer',
                        fontWeight: 600
                      }}
                    >
                      -{ext}
                    </button>
                  ))}
                </div>
              </div>

              {/* Teléfono */}
              <div className="form-group">
                <label htmlFor="reg-telefono-input" className="form-label">
                  Teléfono / Celular <span className="required">*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="reg-telefono-input"
                    type="tel"
                    name="telefono"
                    className={`form-input ${errors.telefono ? 'error' : ''}`}
                    placeholder="Ej. 76543210"
                    value={formData.telefono}
                    onChange={handleChange}
                    style={{ width: '100%' }}
                    required
                  />
                </div>
                {errors.telefono && <span className="error-text">{errors.telefono}</span>}
              </div>
            </div>

            {/* Fila 2: Nombres y Apellidos */}
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="reg-nombre-input" className="form-label">
                  Nombres <span className="required">*</span>
                </label>
                <input
                  id="reg-nombre-input"
                  type="text"
                  name="nombre"
                  className={`form-input ${errors.nombre ? 'error' : ''}`}
                  placeholder="Ej. Carlos Andrés"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                />
                {errors.nombre && <span className="error-text">{errors.nombre}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="reg-apellido-input" className="form-label">
                  Apellidos <span className="required">*</span>
                </label>
                <input
                  id="reg-apellido-input"
                  type="text"
                  name="apellido"
                  className={`form-input ${errors.apellido ? 'error' : ''}`}
                  placeholder="Ej. Mendoza Vargas"
                  value={formData.apellido}
                  onChange={handleChange}
                  required
                />
                {errors.apellido && <span className="error-text">{errors.apellido}</span>}
              </div>
            </div>

            {/* Fila 3: Fecha de Nacimiento y Email */}
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="reg-fecha-nacimiento-input" className="form-label">
                  Fecha de Nacimiento <span className="required">*</span>
                </label>
                <input
                  id="reg-fecha-nacimiento-input"
                  type="date"
                  name="fechaNacimiento"
                  className={`form-input ${errors.fechaNacimiento ? 'error' : ''}`}
                  value={formData.fechaNacimiento}
                  onChange={handleChange}
                  required
                />
                {errors.fechaNacimiento && <span className="error-text">{errors.fechaNacimiento}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="reg-email-input" className="form-label">
                  Correo Electrónico (Opcional)
                </label>
                <input
                  id="reg-email-input"
                  type="email"
                  name="email"
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  placeholder="paciente@ejemplo.com"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>
            </div>

            {/* Dirección */}
            <div className="form-group">
              <label htmlFor="reg-direccion-input" className="form-label">
                Dirección Domiciliaria (Opcional)
              </label>
              <input
                id="reg-direccion-input"
                type="text"
                name="direccion"
                className="form-input"
                placeholder="Ej. Av. 6 de Agosto #234, Sopocachi"
                value={formData.direccion}
                onChange={handleChange}
              />
            </div>

            {/* Alergias y Condiciones Médicas (Chips UX) */}
            <div className="form-group" style={{ background: '#f8fafc', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label htmlFor="reg-alergias-input" className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0f172a' }}>
                  <ShieldAlert size={17} color="#e11d48" />
                  <span>Alergias y Alertas Clínicas</span>
                </label>
                <span className="badge badge-blue" style={{ fontSize: '0.72rem' }}>
                  Selección Rápida
                </span>
              </div>

              {/* Quick Allergy Chips */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                {ALERGIAS_COMUNES.map((chip) => {
                  const isSelected = formData.alergias.includes(chip);
                  return (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => handleAllergyChipClick(chip)}
                      aria-label={`Alergia rápida: ${chip}`}
                      style={{
                        padding: '4px 10px',
                        fontSize: '0.78rem',
                        borderRadius: 'var(--radius-full)',
                        border: isSelected ? '1px solid #0284c7' : '1px solid #cbd5e1',
                        background: isSelected ? '#e0f2fe' : 'white',
                        color: isSelected ? '#0369a1' : '#475569',
                        fontWeight: isSelected ? 700 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      {chip === 'Ninguna conocida' ? '✓ Ninguna conocida' : `+ ${chip}`}
                    </button>
                  );
                })}
              </div>

              <input
                id="reg-alergias-input"
                type="text"
                name="alergias"
                className="form-input"
                placeholder="Especificar alergias adicionales o medicamentos..."
                value={formData.alergias}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancelar (Esc)
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Registrando en Expediente...' : 'Guardar Paciente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
