import React, { useState, useEffect, useCallback } from 'react';
import { 
  CreditCard, 
  DollarSign, 
  Receipt, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  RefreshCw, 
  Loader2, 
  User, 
  FileText, 
  History, 
  X,
  Printer,
  Edit,
  Check
} from 'lucide-react';
import { ApiService } from '../../services/api';

export const FinanzasView = () => {
  const [planes, setPlanes] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState(null);
  const [successToast, setSuccessToast] = useState(null);

  // Formulario de Abono
  const [pagoForm, setPagoForm] = useState({
    planId: '',
    monto: '',
    metodo: 'QR'
  });

  const [procesandoPago, setProcesandoPago] = useState(false);
  const [reciboEmitido, setReciboEmitido] = useState(null);
  const [errorPago, setErrorPago] = useState(null);

  // Modal para Nuevo Presupuesto
  const [modalNuevoPlan, setModalNuevoPlan] = useState(false);
  const [guardandoPlan, setGuardandoPlan] = useState(false);
  const [errorNuevoPlan, setErrorNuevoPlan] = useState(null);
  const [nuevoPlanForm, setNuevoPlanForm] = useState({
    pacienteId: '',
    descripcion: '',
    costoTotal: '',
    estadoPlan: 'Propuesto'
  });

  // Modal para Editar Presupuesto
  const [modalEditarPlan, setModalEditarPlan] = useState(null);
  const [guardandoEdicionPlan, setGuardandoEdicionPlan] = useState(false);
  const [errorEdicionPlan, setErrorEdicionPlan] = useState(null);
  const [formEdicionPlan, setFormEdicionPlan] = useState({
    descripcion: '',
    costoTotal: '',
    estadoPlan: 'Propuesto'
  });

  // Modal de Historial de Abonos
  const [planSeleccionadoHistorial, setPlanSeleccionadoHistorial] = useState(null);

  // ─── Cargar Datos desde la API ──────────────────────────────────────────────
  const cargarDatos = useCallback(async (mostrarToast = false) => {
    setCargando(true);
    setErrorCarga(null);
    try {
      const [planesData, pacientesData] = await Promise.all([
        ApiService.getPlanesTratamiento(),
        ApiService.getPacientes().catch(() => [])
      ]);
      
      setPlanes(planesData);
      setPacientes(pacientesData);

      // Auto-seleccionar el primer plan con saldo pendiente si no hay uno seleccionado
      if (planesData.length > 0) {
        const existeSeleccionado = planesData.some(p => String(p.id) === String(pagoForm.planId));
        if (!existeSeleccionado || !pagoForm.planId) {
          const primerPendiente = planesData.find(p => p.saldoPendiente > 0) || planesData[0];
          setPagoForm(prev => ({
            ...prev,
            planId: String(primerPendiente.id)
          }));
        }
      }

      if (pacientesData.length > 0 && !nuevoPlanForm.pacienteId) {
        setNuevoPlanForm(prev => ({ ...prev, pacienteId: String(pacientesData[0].id) }));
      }

      if (mostrarToast) {
        setSuccessToast('✓ Datos de planes de tratamiento y abonos actualizados desde el servidor.');
        setTimeout(() => setSuccessToast(null), 4000);
      }
    } catch (err) {
      setErrorCarga(err.message || 'Error al conectar con el servidor financiero.');
    } finally {
      setCargando(false);
    }
  }, [nuevoPlanForm.pacienteId, pagoForm.planId]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // ─── Registrar Abono ────────────────────────────────────────────────────────
  const handleRegistrarAbono = async (e) => {
    e.preventDefault();
    setErrorPago(null);

    const planIdNum = Number(pagoForm.planId);
    const plan = planes.find(p => p.id === planIdNum);
    if (!plan) {
      setErrorPago('Seleccione un plan de tratamiento válido.');
      return;
    }

    const montoNum = parseFloat(pagoForm.monto);
    if (isNaN(montoNum) || montoNum <= 0) {
      setErrorPago('Ingrese un monto válido mayor a Bs. 0.00.');
      return;
    }

    if (plan.saldoPendiente <= 0) {
      setErrorPago('Este plan de tratamiento ya se encuentra completamente pagado (Saldo Bs. 0.00).');
      return;
    }

    if (montoNum > plan.saldoPendiente) {
      setErrorPago(`El monto ingresado (Bs. ${montoNum.toFixed(2)}) supera el saldo pendiente (Bs. ${plan.saldoPendiente.toFixed(2)}).`);
      return;
    }

    setProcesandoPago(true);
    try {
      const comprobante = await ApiService.registrarAbono({
        planTratamientoId: planIdNum,
        montoAbonado: montoNum,
        metodoPago: pagoForm.metodo
      });

      setReciboEmitido(comprobante);
      setPagoForm(prev => ({ ...prev, monto: '' }));

      // Recargar lista actualizada de la base de datos
      await cargarDatos();
    } catch (err) {
      setErrorPago(err.message || 'Error al registrar el abono.');
    } finally {
      setProcesandoPago(false);
    }
  };

  // ─── Crear Nuevo Plan de Tratamiento ────────────────────────────────────────
  const handleCrearPlan = async (e) => {
    e.preventDefault();
    setErrorNuevoPlan(null);

    const pacIdNum = Number(nuevoPlanForm.pacienteId);
    const costoNum = parseFloat(nuevoPlanForm.costoTotal);

    if (!pacIdNum || isNaN(pacIdNum)) {
      setErrorNuevoPlan('Seleccione un paciente válido.');
      return;
    }

    if (isNaN(costoNum) || costoNum <= 0) {
      setErrorNuevoPlan('Ingrese un costo total válido mayor a Bs. 0.00.');
      return;
    }

    if (!nuevoPlanForm.descripcion.trim()) {
      setErrorNuevoPlan('Ingrese la descripción del tratamiento.');
      return;
    }

    setGuardandoPlan(true);
    try {
      await ApiService.crearPlanTratamiento({
        pacienteId: pacIdNum,
        descripcion: nuevoPlanForm.descripcion.trim(),
        costoTotal: costoNum,
        estadoPlan: nuevoPlanForm.estadoPlan
      });

      setModalNuevoPlan(false);
      setNuevoPlanForm(prev => ({
        ...prev,
        descripcion: '',
        costoTotal: '',
        estadoPlan: 'Propuesto'
      }));

      await cargarDatos();
      setSuccessToast('✓ Nuevo presupuesto creado exitosamente.');
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err) {
      setErrorNuevoPlan(err.message || 'Error al crear el presupuesto.');
    } finally {
      setGuardandoPlan(false);
    }
  };

  // ─── Abrir Modal de Edición de Plan ────────────────────────────────────────
  const abrirModalEditarPlan = (plan) => {
    setFormEdicionPlan({
      descripcion: plan.descripcion,
      costoTotal: plan.costoTotal,
      estadoPlan: plan.estadoPlan
    });
    setErrorEdicionPlan(null);
    setModalEditarPlan(plan);
  };

  // ─── Guardar Edición de Plan (PUT /api/finanzas/planes/{id}) ───────────────
  const handleActualizarPlan = async (e) => {
    e.preventDefault();
    if (!modalEditarPlan) return;

    setErrorEdicionPlan(null);
    const costoNum = parseFloat(formEdicionPlan.costoTotal);

    if (isNaN(costoNum) || costoNum <= 0) {
      setErrorEdicionPlan('Ingrese un costo total válido mayor a Bs. 0.00.');
      return;
    }

    if (!formEdicionPlan.descripcion.trim()) {
      setErrorEdicionPlan('La descripción no puede estar vacía.');
      return;
    }

    setGuardandoEdicionPlan(true);
    try {
      await ApiService.actualizarPlanTratamiento(modalEditarPlan.id, {
        descripcion: formEdicionPlan.descripcion.trim(),
        costoTotal: costoNum,
        estadoPlan: formEdicionPlan.estadoPlan
      });

      setModalEditarPlan(null);
      await cargarDatos();
      setSuccessToast('✓ Plan de tratamiento actualizado exitosamente.');
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err) {
      setErrorEdicionPlan(err.message || 'Error al actualizar el presupuesto.');
    } finally {
      setGuardandoEdicionPlan(false);
    }
  };

  const planSeleccionado = planes.find(p => p.id === Number(pagoForm.planId));

  return (
    <div className="page-body">
      {/* ─── Encabezado ───────────────────────────────────────────── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Planes de Tratamiento y Control de Abonos</h1>
          <p className="page-description">
            Gestión de presupuestos clínicos, amortización atómica de saldos y emisión de comprobantes bajo principio de integridad (Ley N° 164).
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn btn-secondary" 
            onClick={() => cargarDatos(true)}
            disabled={cargando}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={15} className={cargando ? 'spin' : ''} />
            Actualizar
          </button>
          <button 
            className="btn btn-primary" 
            onClick={() => setModalNuevoPlan(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={16} />
            Nuevo Presupuesto
          </button>
        </div>
      </div>

      {successToast && (
        <div className="alert alert-success" role="status" aria-live="polite">
          <CheckCircle2 size={20} />
          <span>{successToast}</span>
        </div>
      )}

      {errorCarga && (
        <div className="alert alert-danger" role="alert">
          <AlertCircle size={20} />
          <span>{errorCarga}</span>
        </div>
      )}

      {/* ─── Comprobante de Pago Emitido (Recibo) ──────────────────── */}
      {reciboEmitido && (
        <div className="card" style={{ marginBottom: '24px', background: '#ecfdf5', borderColor: '#a7f3d0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
              <div style={{ background: '#d1fae5', padding: '12px', borderRadius: '12px' }}>
                <Receipt size={32} color="#059669" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h4 style={{ color: '#065f46', margin: 0 }}>Comprobante de Pago Emitido</h4>
                  <span className="badge badge-emerald">{reciboEmitido.nroRecibo}</span>
                </div>
                <div style={{ fontSize: '0.9rem', color: '#047857', marginTop: '4px' }}>
                  Paciente: <b>{reciboEmitido.pacienteNombreCompleto}</b> | Concepto: <i>{reciboEmitido.descripcionPlan}</i>
                </div>
                <div style={{ fontSize: '0.86rem', color: '#065f46', marginTop: '4px' }}>
                  Abono Registrado: <b>Bs. {Number(reciboEmitido.montoAbonado).toFixed(2)}</b> ({reciboEmitido.metodoPago}) | 
                  Saldo Restante: <b style={{ color: reciboEmitido.saldoRestante === 0 ? '#059669' : '#b91c1c' }}>Bs. {Number(reciboEmitido.saldoRestante).toFixed(2)}</b> | 
                  Estado: <b className="badge badge-emerald" style={{ marginLeft: 4 }}>{reciboEmitido.estadoPlan}</b>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => window.print()}
                title="Imprimir Comprobante"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Printer size={15} />
                Imprimir
              </button>
              <button className="btn btn-secondary" onClick={() => setReciboEmitido(null)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        
        {/* ─── Tabla de Planes de Tratamiento ───────────────────────── */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} color="#0284c7" />
              Presupuestos y Planes Activos ({planes.length})
            </h3>
            {cargando && <Loader2 size={18} className="spin" />}
          </div>

          {!cargando && planes.length === 0 && (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '32px 0', fontSize: '0.9rem' }}>
              No hay planes de tratamiento registrados. Cree uno con el botón "+ Nuevo Presupuesto".
            </p>
          )}

          <div className="table-responsive">
            <table className="table-custom">
              <thead>
                <tr>
                  <th>Paciente</th>
                  <th>Descripción</th>
                  <th>Costo Total</th>
                  <th>Saldo Pendiente</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {planes.map(p => {
                  const pagado = p.costoTotal - p.saldoPendiente;
                  const porcentaje = p.costoTotal > 0 ? Math.round((pagado / p.costoTotal) * 100) : 0;
                  const isConcluido = p.saldoPendiente === 0;

                  return (
                    <tr key={p.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{p.pacienteNombreCompleto || `Paciente #${p.pacienteId}`}</div>
                        {p.pacienteCi && <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>CI: {p.pacienteCi}</div>}
                      </td>
                      <td style={{ fontSize: '0.84rem' }}>
                        <div>{p.descripcion}</div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Progreso: {porcentaje}% pagado ({p.abonos?.length || 0} abonos)
                        </div>
                      </td>
                      <td style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>Bs. {Number(p.costoTotal).toFixed(2)}</td>
                      <td style={{ fontWeight: 700, color: isConcluido ? '#059669' : '#e11d48', whiteSpace: 'nowrap' }}>
                        Bs. {Number(p.saldoPendiente).toFixed(2)}
                      </td>
                      <td>
                        <span className={`badge ${isConcluido ? 'badge-emerald' : p.estadoPlan === 'En Proceso' ? 'badge-amber' : 'badge-sky'}`}>
                          {p.estadoPlan}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '4px 7px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '3px' }}
                            onClick={() => abrirModalEditarPlan(p)}
                            title="Editar presupuesto o estado"
                          >
                            <Edit size={12} />
                            Editar
                          </button>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '4px 7px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '3px' }}
                            onClick={() => setPlanSeleccionadoHistorial(p)}
                            title="Ver historial de abonos"
                          >
                            <History size={12} />
                            Abonos
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ─── Formulario de Registro de Abono ──────────────────────── */}
        <div className="card">
          <h3 style={{ fontSize: '1.05rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <DollarSign size={20} color="#0284c7" />
            Registrar Abono / Pago Parcial
          </h3>

          {errorPago && (
            <div className="alert alert-danger" role="alert" style={{ fontSize: '0.85rem' }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{errorPago}</span>
            </div>
          )}

          <form onSubmit={handleRegistrarAbono} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            <div className="form-group">
              <label htmlFor="finanzas-plan-select" className="form-label">
                Seleccionar Plan de Tratamiento <span className="required">*</span>
              </label>
              <select 
                id="finanzas-plan-select"
                className="form-select"
                value={pagoForm.planId}
                onChange={e => {
                  setPagoForm({ ...pagoForm, planId: e.target.value });
                  setErrorPago(null);
                }}
                required
              >
                {planes.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.pacienteNombreCompleto || `Paciente #${p.pacienteId}`} - {p.descripcion} (Saldo: Bs. {Number(p.saldoPendiente).toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            {planSeleccionado && (
              <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Costo Total:</span>
                  <b>Bs. {Number(planSeleccionado.costoTotal).toFixed(2)}</b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Saldo Amortizable:</span>
                  <b style={{ color: planSeleccionado.saldoPendiente > 0 ? '#e11d48' : '#059669', fontSize: '0.95rem' }}>
                    Bs. {Number(planSeleccionado.saldoPendiente).toFixed(2)}
                  </b>
                </div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="finanzas-monto-input" className="form-label">
                Monto del Abono (Bs.) <span className="required">*</span>
              </label>
              <input 
                id="finanzas-monto-input"
                type="number" 
                step="0.50" 
                min="0.50"
                max={planSeleccionado ? planSeleccionado.saldoPendiente : undefined}
                className="form-input" 
                placeholder="Ej. 200.00"
                value={pagoForm.monto}
                onChange={e => {
                  setPagoForm({ ...pagoForm, monto: e.target.value });
                  setErrorPago(null);
                }}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="finanzas-metodo-select" className="form-label">
                Método de Pago <span className="required">*</span>
              </label>
              <select 
                id="finanzas-metodo-select"
                className="form-select"
                value={pagoForm.metodo}
                onChange={e => setPagoForm({ ...pagoForm, metodo: e.target.value })}
              >
                <option value="QR">📱 Pago QR Simple (Bancario)</option>
                <option value="Efectivo">💵 Efectivo</option>
                <option value="Tarjeta">💳 Tarjeta de Débito / Crédito</option>
                <option value="Transferencia">🏦 Transferencia Bancaria</option>
              </select>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={procesandoPago || !planSeleccionado || planSeleccionado.saldoPendiente <= 0}
              style={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              {procesandoPago 
                ? <><Loader2 size={16} className="spin" /> Procesando Abono en BD…</>
                : <><DollarSign size={16} /> Procesar y Emitir Recibo</>
              }
            </button>
          </form>
        </div>
      </div>

      {/* ─── Modal: Crear Nuevo Presupuesto ───────────────────────── */}
      {modalNuevoPlan && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <Plus size={20} color="#0284c7" />
                Registrar Nuevo Presupuesto / Plan
              </h3>
              <button 
                className="btn-icon" 
                onClick={() => setModalNuevoPlan(false)}
                aria-label="Cerrar modal"
              >
                <X size={20} />
              </button>
            </div>

            {errorNuevoPlan && (
              <div className="alert alert-danger" style={{ margin: '16px', fontSize: '0.85rem' }}>
                <AlertCircle size={18} />
                <span>{errorNuevoPlan}</span>
              </div>
            )}

            <form onSubmit={handleCrearPlan} style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label htmlFor="nuevo-plan-paciente" className="form-label">
                  Paciente <span className="required">*</span>
                </label>
                {pacientes.length > 0 ? (
                  <select
                    id="nuevo-plan-paciente"
                    className="form-select"
                    value={nuevoPlanForm.pacienteId}
                    onChange={e => setNuevoPlanForm({ ...nuevoPlanForm, pacienteId: e.target.value })}
                    required
                  >
                    {pacientes.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} {p.apellido} (CI: {p.ci})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id="nuevo-plan-paciente"
                    type="number"
                    className="form-input"
                    placeholder="ID del Paciente"
                    value={nuevoPlanForm.pacienteId}
                    onChange={e => setNuevoPlanForm({ ...nuevoPlanForm, pacienteId: e.target.value })}
                    required
                  />
                )}
              </div>

              <div className="form-group">
                <label htmlFor="nuevo-plan-desc" className="form-label">
                  Descripción del Tratamiento <span className="required">*</span>
                </label>
                <textarea
                  id="nuevo-plan-desc"
                  className="form-input"
                  rows="3"
                  placeholder="Ej. Restauración estética en pieza 16 + Endodoncia 24 + Limpieza Ultrasónica"
                  value={nuevoPlanForm.descripcion}
                  onChange={e => setNuevoPlanForm({ ...nuevoPlanForm, descripcion: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="nuevo-plan-costo" className="form-label">
                  Costo Total (Bs.) <span className="required">*</span>
                </label>
                <input
                  id="nuevo-plan-costo"
                  type="number"
                  step="0.50"
                  min="1"
                  className="form-input"
                  placeholder="Ej. 1200.00"
                  value={nuevoPlanForm.costoTotal}
                  onChange={e => setNuevoPlanForm({ ...nuevoPlanForm, costoTotal: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="nuevo-plan-estado" className="form-label">
                  Estado Inicial
                </label>
                <select
                  id="nuevo-plan-estado"
                  className="form-select"
                  value={nuevoPlanForm.estadoPlan}
                  onChange={e => setNuevoPlanForm({ ...nuevoPlanForm, estadoPlan: e.target.value })}
                >
                  <option value="Propuesto">Propuesto</option>
                  <option value="Aprobado">Aprobado</option>
                  <option value="En Proceso">En Proceso</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setModalNuevoPlan(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={guardandoPlan}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {guardandoPlan ? <><Loader2 size={16} className="spin" /> Guardando…</> : 'Crear Presupuesto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Modal: Editar Presupuesto / Plan ──────────────────────── */}
      {modalEditarPlan && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <Edit size={18} color="#0284c7" />
                Editar Presupuesto #{modalEditarPlan.id}
              </h3>
              <button 
                className="btn-icon" 
                onClick={() => setModalEditarPlan(null)}
                aria-label="Cerrar modal"
              >
                <X size={20} />
              </button>
            </div>

            {errorEdicionPlan && (
              <div className="alert alert-danger" style={{ margin: '16px', fontSize: '0.85rem' }}>
                <AlertCircle size={18} />
                <span>{errorEdicionPlan}</span>
              </div>
            )}

            <form onSubmit={handleActualizarPlan} style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', fontSize: '0.88rem' }}>
                Paciente: <b>{modalEditarPlan.pacienteNombreCompleto || `ID #${modalEditarPlan.pacienteId}`}</b>
              </div>

              <div className="form-group">
                <label htmlFor="editar-plan-desc" className="form-label">
                  Descripción del Tratamiento <span className="required">*</span>
                </label>
                <textarea
                  id="editar-plan-desc"
                  className="form-input"
                  rows="3"
                  value={formEdicionPlan.descripcion}
                  onChange={e => setFormEdicionPlan({ ...formEdicionPlan, descripcion: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="editar-plan-costo" className="form-label">
                  Costo Total (Bs.) <span className="required">*</span>
                </label>
                <input
                  id="editar-plan-costo"
                  type="number"
                  step="0.50"
                  min="1"
                  className="form-input"
                  value={formEdicionPlan.costoTotal}
                  onChange={e => setFormEdicionPlan({ ...formEdicionPlan, costoTotal: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="editar-plan-estado" className="form-label">
                  Estado del Plan
                </label>
                <select
                  id="editar-plan-estado"
                  className="form-select"
                  value={formEdicionPlan.estadoPlan}
                  onChange={e => setFormEdicionPlan({ ...formEdicionPlan, estadoPlan: e.target.value })}
                >
                  <option value="Propuesto">Propuesto</option>
                  <option value="Aprobado">Aprobado</option>
                  <option value="En Proceso">En Proceso</option>
                  <option value="Concluido">Concluido</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setModalEditarPlan(null)}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={guardandoEdicionPlan}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {guardandoEdicionPlan ? <><Loader2 size={16} className="spin" /> Guardando…</> : <><Check size={16} /> Guardar Cambios</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Modal: Historial de Abonos del Plan ───────────────────── */}
      {planSeleccionadoHistorial && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-content" style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <History size={20} color="#0284c7" />
                Historial de Abonos: Plan #{planSeleccionadoHistorial.id}
              </h3>
              <button 
                className="btn-icon" 
                onClick={() => setPlanSeleccionadoHistorial(null)}
                aria-label="Cerrar modal"
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '16px' }}>
              <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', marginBottom: '16px', fontSize: '0.86rem' }}>
                <div><b>Paciente:</b> {planSeleccionadoHistorial.pacienteNombreCompleto || `ID #${planSeleccionadoHistorial.pacienteId}`}</div>
                <div><b>Tratamiento:</b> {planSeleccionadoHistorial.descripcion}</div>
                <div style={{ marginTop: '6px', display: 'flex', gap: '16px' }}>
                  <span>Costo Total: <b>Bs. {Number(planSeleccionadoHistorial.costoTotal).toFixed(2)}</b></span>
                  <span>Saldo Pendiente: <b style={{ color: planSeleccionadoHistorial.saldoPendiente > 0 ? '#e11d48' : '#059669' }}>Bs. {Number(planSeleccionadoHistorial.saldoPendiente).toFixed(2)}</b></span>
                </div>
              </div>

              <h4 style={{ fontSize: '0.95rem', marginBottom: '10px' }}>Desglose de Pagos Registrados</h4>

              {(!planSeleccionadoHistorial.abonos || planSeleccionadoHistorial.abonos.length === 0) ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', textAlign: 'center', padding: '16px 0' }}>
                  Aún no se han registrado abonos para este plan de tratamiento.
                </p>
              ) : (
                <table className="table-custom" style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Método</th>
                      <th style={{ textAlign: 'right' }}>Monto Abonado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {planSeleccionadoHistorial.abonos.map(a => (
                      <tr key={a.id}>
                        <td style={{ fontSize: '0.82rem' }}>
                          {new Date(a.fechaPago).toLocaleString('es-BO', { dateStyle: 'short', timeStyle: 'short' })}
                        </td>
                        <td>
                          <span className="badge badge-sky">{a.metodoPago}</span>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: '#059669' }}>
                          + Bs. {Number(a.montoAbonado).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button className="btn btn-secondary" onClick={() => setPlanSeleccionadoHistorial(null)}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
