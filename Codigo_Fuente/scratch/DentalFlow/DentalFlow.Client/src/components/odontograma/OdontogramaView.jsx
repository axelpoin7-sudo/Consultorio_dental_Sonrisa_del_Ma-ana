import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  ShieldCheck, 
  RefreshCw, 
  Save, 
  CheckCircle2, 
  Info, 
  User, 
  AlertTriangle,
  History,
  Calendar,
  Layers,
  FileText,
  RotateCcw,
  Clock,
  ChevronDown
} from 'lucide-react';
import { ApiService } from '../../services/api';

export const OdontogramaView = ({ pacienteSeleccionado }) => {
  const [pacientesList, setPacientesList] = useState([]);
  const [pacienteActivo, setPacienteActivo] = useState(pacienteSeleccionado || null);
  const [selectedTooth, setSelectedTooth] = useState(null);
  const [selectedFace, setSelectedFace] = useState(null);
  const [selectedCondition, setSelectedCondition] = useState('patologia');
  const [denticionTipo, setDenticionTipo] = useState('permanente'); // 'permanente' | 'pediatrica'
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [observaciones, setObservaciones] = useState('');
  const [historial, setHistorial] = useState([]);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [snapshotActivo, setSnapshotActivo] = useState(null);

  // Dientes permanentes (FDI 11 a 48 - 32 piezas)
  const maxilarSuperiorPermanente = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
  const maxilarInferiorPermanente = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

  // Dientes pediátricos / temporales (FDI 51 a 85 - 20 piezas)
  const maxilarSuperiorPediatrico = [55, 54, 53, 52, 51, 61, 62, 63, 64, 65];
  const maxilarInferiorPediatrico = [85, 84, 83, 82, 81, 71, 72, 73, 74, 75];

  // Estado dinámico del odontograma conectado con la API
  const [teethState, setTeethState] = useState({});

  // Cargar lista de pacientes si no hay uno seleccionado por props
  useEffect(() => {
    if (!pacienteSeleccionado) {
      ApiService.getPacientes()
        .then(data => {
          setPacientesList(data);
          if (data && data.length > 0 && !pacienteActivo) {
            setPacienteActivo(data[0]);
          }
        })
        .catch(err => console.error("Error al cargar pacientes:", err));
    } else {
      setPacienteActivo(pacienteSeleccionado);
    }
  }, [pacienteSeleccionado]);

  // Cargar Odontograma del paciente activo desde la API
  const cargarOdontogramaPaciente = async (pacienteId) => {
    if (!pacienteId) return;
    setLoading(true);
    setError(null);
    try {
      // 1. Obtener último odontograma activo
      const odonto = await ApiService.getOdontogramaByPacienteId(pacienteId);
      if (odonto && odonto.detalles) {
        const state = {};
        odonto.detalles.forEach(d => {
          let cara = d.caraDiente;
          const caraLower = cara.toLowerCase();
          if (caraLower.includes('ocl') || caraLower.includes('ocu')) cara = 'Oclusal';
          else if (caraLower.includes('vest')) cara = 'Vestibular';
          else if (caraLower.includes('ling') || caraLower.includes('palat')) cara = 'Lingual';
          else if (caraLower.includes('mes')) cara = 'Mesial';
          else if (caraLower.includes('dist')) cara = 'Distal';
          else if (caraLower.includes('gen')) cara = 'General';

          let color = '#ffffff';
          const cond = (d.condicionHallada || '').toLowerCase();
          if (cond.includes('patolog') || cond.includes('caries')) color = '#ef4444';
          else if (cond.includes('realiz') || cond.includes('obturaci')) color = '#0284c7';
          else if (cond.includes('planific') || cond.includes('endodon')) color = '#10b981';

          state[`${d.numeroDiente}-${cara}`] = color;
        });
        setTeethState(state);
        setObservaciones(odonto.observacionesGenerales || '');
        setSnapshotActivo(odonto);
      } else {
        setTeethState({});
        setObservaciones('');
        setSnapshotActivo(null);
      }

      // 2. Obtener historial de evoluciones
      const hist = await ApiService.getHistorialOdontogramas(pacienteId).catch(() => []);
      setHistorial(hist || []);
    } catch (err) {
      console.warn("Aviso al cargar odontograma:", err.message);
      setTeethState({});
      setObservaciones('');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pacienteActivo?.id) {
      cargarOdontogramaPaciente(pacienteActivo.id);
    }
  }, [pacienteActivo?.id]);

  const handleFaceClick = (tooth, face) => {
    setSelectedTooth(tooth);
    setSelectedFace(face);
  };

  const handleKeyDownFace = (e, tooth, face) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleFaceClick(tooth, face);
    }
  };

  const applyCondition = () => {
    if (!selectedTooth || !selectedFace) return;
    const key = `${selectedTooth}-${selectedFace}`;
    const colorMap = {
      patologia: '#ef4444', // Rojo (Patología)
      realizado: '#0284c7', // Azul (Realizado)
      planificado: '#10b981', // Verde (Planificado)
      sano: '#ffffff'
    };

    setTeethState(prev => ({
      ...prev,
      [key]: colorMap[selectedCondition]
    }));
  };

  const applyDirectCondition = (tooth, face) => {
    handleFaceClick(tooth, face);
    const key = `${tooth}-${face}`;
    const colorMap = {
      patologia: '#ef4444',
      realizado: '#0284c7',
      planificado: '#10b981',
      sano: '#ffffff'
    };
    setTeethState(prev => ({
      ...prev,
      [key]: colorMap[selectedCondition]
    }));
  };

  const handleGuardarSnapshot = async () => {
    if (!pacienteActivo?.id) {
      alert('Por favor selecciona un paciente antes de guardar el odontograma.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Convertir teethState a lista de detalles
      const detalles = [];
      Object.entries(teethState).forEach(([key, color]) => {
        if (!color || color === '#ffffff') return;
        const parts = key.split('-');
        const num = parseInt(parts[0], 10);
        const face = parts[1] || 'General';

        let condicion = 'Patología (Caries)';
        if (color === '#0284c7') condicion = 'Tratamiento Realizado (Obturación)';
        else if (color === '#10b981') condicion = 'Planificado (Tratamiento)';
        else if (color === '#ef4444') condicion = 'Patología (Caries)';

        detalles.push({
          numeroDiente: num,
          caraDiente: face,
          condicionHallada: condicion
        });
      });

      const payload = {
        pacienteId: pacienteActivo.id,
        observacionesGenerales: observaciones.trim() || 'Evaluación y registro clínico digital del estado dental.',
        detalles: detalles
      };

      const creado = await ApiService.guardarOdontograma(payload);
      setSnapshotActivo(creado);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 5000);

      // Recargar historial
      const hist = await ApiService.getHistorialOdontogramas(pacienteActivo.id).catch(() => []);
      setHistorial(hist || []);
    } catch (err) {
      setError('Error al guardar el snapshot en la base de datos: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCargarSnapshotHistorico = (item) => {
    const state = {};
    if (item.detalles) {
      item.detalles.forEach(d => {
        let cara = d.caraDiente;
        const caraLower = cara.toLowerCase();
        if (caraLower.includes('ocl') || caraLower.includes('ocu')) cara = 'Oclusal';
        else if (caraLower.includes('vest')) cara = 'Vestibular';
        else if (caraLower.includes('ling') || caraLower.includes('palat')) cara = 'Lingual';
        else if (caraLower.includes('mes')) cara = 'Mesial';
        else if (caraLower.includes('dist')) cara = 'Distal';
        else if (caraLower.includes('gen')) cara = 'General';

        let color = '#ffffff';
        const cond = (d.condicionHallada || '').toLowerCase();
        if (cond.includes('patolog') || cond.includes('caries')) color = '#ef4444';
        else if (cond.includes('realiz') || cond.includes('obturaci')) color = '#0284c7';
        else if (cond.includes('planific') || cond.includes('endodon')) color = '#10b981';

        state[`${d.numeroDiente}-${cara}`] = color;
      });
    }
    setTeethState(state);
    setObservaciones(item.observacionesGenerales || '');
    setSnapshotActivo(item);
  };

  const handleLimpiarLienzo = () => {
    if (window.confirm('¿Desea limpiar todas las marcas del odontograma en pantalla?')) {
      setTeethState({});
    }
  };

  // Helper para renderizar un diente SVG interactivo y accesible
  const renderToothSVG = (num) => {
    const isSelected = selectedTooth === num;
    const vColor = teethState[`${num}-Vestibular`] || '#ffffff';
    const lColor = teethState[`${num}-Lingual`] || '#ffffff';
    const mColor = teethState[`${num}-Mesial`] || '#ffffff';
    const dColor = teethState[`${num}-Distal`] || '#ffffff';
    const oColor = teethState[`${num}-Oclusal`] || '#ffffff';
    const genColor = teethState[`${num}-General`];

    const hasAnyCondition = vColor !== '#ffffff' || lColor !== '#ffffff' || mColor !== '#ffffff' || dColor !== '#ffffff' || oColor !== '#ffffff' || genColor;

    return (
      <div 
        key={num} 
        className="tooth-item"
        style={{ 
          padding: '6px', 
          border: isSelected ? '2px solid #0284c7' : hasAnyCondition ? '1px solid #94a3b8' : '1px solid #e2e8f0',
          borderRadius: '8px',
          background: genColor ? `${genColor}20` : 'white',
          boxShadow: isSelected ? '0 0 0 2px rgba(2, 132, 199, 0.2)' : 'none',
          transition: 'all 0.15s ease'
        }}
      >
        <svg 
          width="46" 
          height="46" 
          viewBox="0 0 100 100" 
          role="group" 
          aria-label={`Pieza dental ${num}`}
        >
          {/* Vestibular (Top) */}
          <polygon 
            points="0,0 100,0 75,25 25,25" 
            fill={vColor} 
            stroke="#475569" 
            strokeWidth="2"
            role="button"
            tabIndex={0}
            aria-label={`Pieza ${num} - Cara Vestibular`}
            onClick={() => applyDirectCondition(num, 'Vestibular')}
            onKeyDown={(e) => handleKeyDownFace(e, num, 'Vestibular')}
            style={{ cursor: 'pointer', transition: 'fill 0.15s' }}
          >
            <title>{`Pieza ${num} - Cara Vestibular`}</title>
          </polygon>

          {/* Lingual / Palatino (Bottom) */}
          <polygon 
            points="25,75 75,75 100,100 0,100" 
            fill={lColor} 
            stroke="#475569" 
            strokeWidth="2"
            role="button"
            tabIndex={0}
            aria-label={`Pieza ${num} - Cara Lingual/Palatino`}
            onClick={() => applyDirectCondition(num, 'Lingual')}
            onKeyDown={(e) => handleKeyDownFace(e, num, 'Lingual')}
            style={{ cursor: 'pointer', transition: 'fill 0.15s' }}
          >
            <title>{`Pieza ${num} - Cara Lingual / Palatino`}</title>
          </polygon>

          {/* Mesial (Left) */}
          <polygon 
            points="0,0 25,25 25,75 0,100" 
            fill={mColor} 
            stroke="#475569" 
            strokeWidth="2"
            role="button"
            tabIndex={0}
            aria-label={`Pieza ${num} - Cara Mesial`}
            onClick={() => applyDirectCondition(num, 'Mesial')}
            onKeyDown={(e) => handleKeyDownFace(e, num, 'Mesial')}
            style={{ cursor: 'pointer', transition: 'fill 0.15s' }}
          >
            <title>{`Pieza ${num} - Cara Mesial`}</title>
          </polygon>

          {/* Distal (Right) */}
          <polygon 
            points="100,0 100,100 75,75 75,25" 
            fill={dColor} 
            stroke="#475569" 
            strokeWidth="2"
            role="button"
            tabIndex={0}
            aria-label={`Pieza ${num} - Cara Distal`}
            onClick={() => applyDirectCondition(num, 'Distal')}
            onKeyDown={(e) => handleKeyDownFace(e, num, 'Distal')}
            style={{ cursor: 'pointer', transition: 'fill 0.15s' }}
          >
            <title>{`Pieza ${num} - Cara Distal`}</title>
          </polygon>

          {/* Oclusal / Incisal (Center) */}
          <rect 
            x="25" 
            y="25" 
            width="50" 
            height="50" 
            fill={oColor} 
            stroke="#475569" 
            strokeWidth="2"
            role="button"
            tabIndex={0}
            aria-label={`Pieza ${num} - Cara Oclusal/Incisal`}
            onClick={() => applyDirectCondition(num, 'Oclusal')}
            onKeyDown={(e) => handleKeyDownFace(e, num, 'Oclusal')}
            style={{ cursor: 'pointer', transition: 'fill 0.15s' }}
          >
            <title>{`Pieza ${num} - Cara Oclusal / Incisal`}</title>
          </rect>
        </svg>
        <div className="tooth-number" style={{ fontWeight: 700 }}>{num}</div>
      </div>
    );
  };

  const maxilarSuperior = denticionTipo === 'permanente' ? maxilarSuperiorPermanente : maxilarSuperiorPediatrico;
  const maxilarInferior = denticionTipo === 'permanente' ? maxilarInferiorPermanente : maxilarInferiorPediatrico;

  return (
    <div className="page-body">
      {/* Patient Context Banner & Selector */}
      <div 
        className="card" 
        style={{ 
          marginBottom: '20px', 
          background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)', 
          border: '1px solid #bae6fd',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <div className="doctor-avatar" style={{ width: '44px', height: '44px', background: 'linear-gradient(135deg, #0284c7, #0369a1)' }}>
            <User size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.85rem', color: '#0369a1', fontWeight: 600 }}>Paciente del Expediente:</span>
              {pacientesList.length > 0 && (
                <select
                  value={pacienteActivo?.id || ''}
                  onChange={(e) => {
                    const sel = pacientesList.find(p => p.id === parseInt(e.target.value, 10));
                    if (sel) setPacienteActivo(sel);
                  }}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    border: '1px solid #93c5fd',
                    fontWeight: 700,
                    color: '#075985',
                    background: 'white',
                    fontSize: '0.9rem'
                  }}
                >
                  {pacientesList.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nombreCompleto} (CI: {p.ci})
                    </option>
                  ))}
                </select>
              )}
            </div>
            {pacienteActivo && (
              <div style={{ fontSize: '0.82rem', color: '#075985', display: 'flex', gap: '10px', marginTop: '4px', flexWrap: 'wrap' }}>
                <span><b>CI:</b> {pacienteActivo.ci}</span>
                <span>•</span>
                <span><b>Edad:</b> {pacienteActivo.edad} años</span>
                <span>•</span>
                <span><b>Alergias:</b> {pacienteActivo.alergias}</span>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button 
            className="btn btn-secondary" 
            style={{ padding: '6px 12px', fontSize: '0.82rem', background: 'white' }}
            onClick={() => setMostrarHistorial(!mostrarHistorial)}
            title="Ver evolución histórica de odontogramas"
          >
            <History size={16} color="#0284c7" />
            Evoluciones ({historial.length})
          </button>
          <span className="badge badge-blue" style={{ fontWeight: 700 }}>
            Expediente Activo (Ley N° 3131)
          </span>
        </div>
      </div>

      {/* Historial Panel (si está activo) */}
      {mostrarHistorial && (
        <div className="card" style={{ marginBottom: '20px', border: '1px solid #cbd5e1', background: '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} color="#0284c7" />
              Historial de Snapshots Clínicos Inmutables
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Conservación legal conforme a Ley N° 3131 / NTS N° 021
            </span>
          </div>

          {historial.length === 0 ? (
            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', padding: '12px 0' }}>
              No existen snapshots clínicos previos registrados para este paciente. Al guardar, se creará el primer registro.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
              {historial.map((snap) => (
                <div 
                  key={snap.id} 
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: snapshotActivo?.id === snap.id ? '2px solid #0284c7' : '1px solid #e2e8f0',
                    background: snapshotActivo?.id === snap.id ? '#f0f9ff' : '#f8fafc',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleCargarSnapshotHistorico(snap)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span className="badge badge-blue" style={{ fontSize: '0.75rem' }}>Snapshot #{snap.id}</span>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      {new Date(snap.fechaCreacion).toLocaleString('es-BO')}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                    {snap.observacionesGenerales || 'Sin observaciones'}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#0284c7' }}>
                    {snap.detalles?.length || 0} hallazgos registrados
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Odontograma Digital Interactivo</h1>
          <p className="page-description">
            Marcación anatómica por caras dentales bajo notación FDI e inalterabilidad de registros clínicos (Ley N° 3131 / NTS 021).
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn btn-secondary" 
            onClick={handleLimpiarLienzo}
            title="Limpiar todas las caras dentales seleccionadas"
          >
            <RotateCcw size={16} />
            Limpiar Lienzo
          </button>
          <button 
            className="btn btn-primary"
            onClick={handleGuardarSnapshot}
            disabled={saving || !pacienteActivo}
            aria-label="Guardar snapshot clínico del odontograma"
          >
            {saving ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                Guardando en Base de Datos...
              </>
            ) : (
              <>
                <Save size={18} />
                Guardar Snapshot Clínico
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          <AlertTriangle size={20} />
          <span>{error}</span>
        </div>
      )}

      {savedSuccess && (
        <div className="alert alert-success" role="status" aria-live="polite">
          <CheckCircle2 size={20} />
          <span>¡Snapshot de odontograma registrado exitosamente en la base de datos como documento inmutable según la Ley N° 3131 y Ley N° 164!</span>
        </div>
      )}

      {/* Controls & Condition Palette */}
      <div className="card" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        {/* Dentition Type Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)' }}>Tipo de Dentición:</span>
          <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '8px', gap: '4px' }}>
            <button
              type="button"
              className="btn"
              style={{
                padding: '6px 14px',
                fontSize: '0.82rem',
                background: denticionTipo === 'permanente' ? '#0284c7' : 'transparent',
                color: denticionTipo === 'permanente' ? 'white' : '#475569',
                boxShadow: denticionTipo === 'permanente' ? 'var(--shadow-sm)' : 'none'
              }}
              onClick={() => setDenticionTipo('permanente')}
            >
              Permanente (32 piezas)
            </button>
            <button
              type="button"
              className="btn"
              style={{
                padding: '6px 14px',
                fontSize: '0.82rem',
                background: denticionTipo === 'pediatrica' ? '#0284c7' : 'transparent',
                color: denticionTipo === 'pediatrica' ? 'white' : '#475569',
                boxShadow: denticionTipo === 'pediatrica' ? 'var(--shadow-sm)' : 'none'
              }}
              onClick={() => setDenticionTipo('pediatrica')}
            >
              Pediátrica (20 piezas)
            </button>
          </div>
        </div>

        {/* Condition Picker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>Condición Activa:</span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button 
              type="button"
              className="btn" 
              style={{ 
                background: '#fee2e2', 
                color: '#991b1b', 
                border: selectedCondition === 'patologia' ? '2px solid #ef4444' : '1px solid #fecdd3',
                fontWeight: selectedCondition === 'patologia' ? 700 : 500,
                transform: selectedCondition === 'patologia' ? 'scale(1.03)' : 'scale(1)'
              }}
              onClick={() => setSelectedCondition('patologia')}
              aria-pressed={selectedCondition === 'patologia'}
            >
              🔴 Patología (Rojo)
            </button>
            <button 
              type="button"
              className="btn" 
              style={{ 
                background: '#e0f2fe', 
                color: '#075985', 
                border: selectedCondition === 'realizado' ? '2px solid #0284c7' : '1px solid #bae6fd',
                fontWeight: selectedCondition === 'realizado' ? 700 : 500,
                transform: selectedCondition === 'realizado' ? 'scale(1.03)' : 'scale(1)'
              }}
              onClick={() => setSelectedCondition('realizado')}
              aria-pressed={selectedCondition === 'realizado'}
            >
              🔵 Realizado (Azul)
            </button>
            <button 
              type="button"
              className="btn" 
              style={{ 
                background: '#dcfce7', 
                color: '#166534', 
                border: selectedCondition === 'planificado' ? '2px solid #10b981' : '1px solid #bbf7d0',
                fontWeight: selectedCondition === 'planificado' ? 700 : 500,
                transform: selectedCondition === 'planificado' ? 'scale(1.03)' : 'scale(1)'
              }}
              onClick={() => setSelectedCondition('planificado')}
              aria-pressed={selectedCondition === 'planificado'}
            >
              🟢 Planificado (Verde)
            </button>
            <button 
              type="button"
              className="btn btn-secondary"
              style={{
                border: selectedCondition === 'sano' ? '2px solid #64748b' : '1px solid var(--border-color)',
                fontWeight: selectedCondition === 'sano' ? 700 : 500
              }}
              onClick={() => setSelectedCondition('sano')}
              aria-pressed={selectedCondition === 'sano'}
            >
              ⚪ Limpiar (Sano)
            </button>
          </div>
        </div>

        {selectedTooth && selectedFace && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="badge badge-blue">
              Seleccionado: Pieza {selectedTooth} - Cara {selectedFace}
            </span>
            <button 
              type="button" 
              className="btn btn-primary" 
              style={{ padding: '6px 14px' }} 
              onClick={applyCondition}
            >
              Aplicar a Selección
            </button>
          </div>
        )}
      </div>

      {/* Observaciones del snapshot clínico */}
      <div className="card" style={{ marginBottom: '24px', padding: '16px' }}>
        <label htmlFor="odonto-obs" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <FileText size={16} color="#0284c7" />
          Observaciones Clínicas / Diagnóstico General del Odontograma:
        </label>
        <textarea
          id="odonto-obs"
          className="form-input"
          style={{ width: '100%', minHeight: '60px', resize: 'vertical' }}
          placeholder="Describir hallazgos generales, plan recomendado, estado periodontal..."
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
        />
      </div>

      {/* Odontogram SVG Canvas */}
      <div className="card" style={{ padding: '32px 24px', background: '#f8fafc', position: 'relative' }}>
        {loading && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(255,255,255,0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            borderRadius: 'var(--radius-lg)'
          }}>
            <RefreshCw size={36} className="animate-spin" color="#0284c7" />
          </div>
        )}

        <div style={{ textAlign: 'center', marginBottom: '18px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
          MAXILAR SUPERIOR ({denticionTipo === 'permanente' ? 'ARCADA PERMANENTE' : 'ARCADA TEMPORAL'})
        </div>
        
        <div 
          className="odontogram-grid" 
          style={{ 
            marginBottom: '32px',
            gridTemplateColumns: `repeat(${maxilarSuperior.length}, minmax(0, 1fr))` 
          }}
        >
          {maxilarSuperior.map(renderToothSVG)}
        </div>

        <div style={{ height: '2px', background: '#cbd5e1', margin: '24px 0', borderRadius: '2px' }} />

        <div 
          className="odontogram-grid"
          style={{ 
            gridTemplateColumns: `repeat(${maxilarInferior.length}, minmax(0, 1fr))` 
          }}
        >
          {maxilarInferior.map(renderToothSVG)}
        </div>

        <div style={{ textAlign: 'center', marginTop: '18px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
          MAXILAR INFERIOR ({denticionTipo === 'permanente' ? 'ARCADA PERMANENTE' : 'ARCADA TEMPORAL'})
        </div>
      </div>
    </div>
  );
};
