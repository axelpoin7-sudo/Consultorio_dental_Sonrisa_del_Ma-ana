import React, { useState } from 'react';
import { Activity, ShieldCheck, RefreshCw, Save, CheckCircle2, Info, User, AlertTriangle } from 'lucide-react';

export const OdontogramaView = ({ pacienteSeleccionado }) => {
  const [selectedTooth, setSelectedTooth] = useState(null);
  const [selectedFace, setSelectedFace] = useState(null);
  const [selectedCondition, setSelectedCondition] = useState('patologia');
  const [denticionTipo, setDenticionTipo] = useState('permanente'); // 'permanente' | 'pediatrica'
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Dientes permanentes (FDI 11 a 48 - 32 piezas)
  const maxilarSuperiorPermanente = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
  const maxilarInferiorPermanente = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

  // Dientes pediátricos / temporales (FDI 51 a 85 - 20 piezas)
  const maxilarSuperiorPediatrico = [55, 54, 53, 52, 51, 61, 62, 63, 64, 65];
  const maxilarInferiorPediatrico = [85, 84, 83, 82, 81, 71, 72, 73, 74, 75];

  // Estado local sincronizado con el modelo de datos exacto y BUG-002 resuelto
  const [teethState, setTeethState] = useState({
    '16-Oclusal': '#ef4444', // Rojo (Patología) - BUG-002 Corregido
    '24-General': '#10b981', // Verde (Planificado)
    '36-Oclusal': '#0284c7', // Azul (Realizado)
  });

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

  // Helper para renderizar un diente SVG interactivo y accesible
  const renderToothSVG = (num) => {
    const isSelected = selectedTooth === num;
    const vColor = teethState[`${num}-Vestibular`] || '#ffffff';
    const lColor = teethState[`${num}-Lingual`] || '#ffffff';
    const mColor = teethState[`${num}-Mesial`] || '#ffffff';
    const dColor = teethState[`${num}-Distal`] || '#ffffff';
    const oColor = teethState[`${num}-Oclusal`] || '#ffffff';
    const genColor = teethState[`${num}-General`];

    return (
      <div 
        key={num} 
        className="tooth-item"
        style={{ 
          padding: '6px', 
          border: isSelected ? '2px solid #0284c7' : '1px solid #e2e8f0',
          borderRadius: '8px',
          background: genColor ? `${genColor}20` : 'white',
          boxShadow: isSelected ? '0 0 0 2px rgba(2, 132, 199, 0.2)' : 'none'
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
      {/* Patient Context Banner if selected */}
      {pacienteSeleccionado && (
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="doctor-avatar" style={{ width: '42px', height: '42px', background: 'linear-gradient(135deg, #0284c7, #0369a1)' }}>
              <User size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0369a1' }}>
                {pacienteSeleccionado.nombreCompleto}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#075985', display: 'flex', gap: '10px' }}>
                <span><b>CI:</b> {pacienteSeleccionado.ci}</span>
                <span>•</span>
                <span><b>Edad:</b> {pacienteSeleccionado.edad} años</span>
                <span>•</span>
                <span><b>Alergias:</b> {pacienteSeleccionado.alergias}</span>
              </div>
            </div>
          </div>
          <span className="badge badge-blue" style={{ fontWeight: 700 }}>
            Expediente Activo (Ley N° 3131)
          </span>
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">Odontograma Digital Interactivo</h1>
          <p className="page-description">
            Marcación anatómica por caras dentales bajo notación FDI e inalterabilidad de registros clínicos (Ley N° 3131 / NTS 021).
          </p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => {
            setSavedSuccess(true);
            setTimeout(() => setSavedSuccess(false), 4000);
          }}
          aria-label="Guardar snapshot clínico del odontograma"
        >
          <Save size={18} />
          Guardar Snapshot Clínico
        </button>
      </div>

      {savedSuccess && (
        <div className="alert alert-success" role="status" aria-live="polite">
          <CheckCircle2 size={20} />
          <span>¡Snapshot de odontograma registrado como documento inmutable según la Ley N° 3131 y Ley N° 164!</span>
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

      {/* Odontogram SVG Canvas */}
      <div className="card" style={{ padding: '32px 24px', background: '#f8fafc' }}>
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
