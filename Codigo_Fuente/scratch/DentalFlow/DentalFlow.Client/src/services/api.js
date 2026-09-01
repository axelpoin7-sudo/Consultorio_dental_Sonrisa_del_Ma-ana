const configuredUrl = import.meta.env?.VITE_API_BASE_URL;

const candidateBaseUrls = [
  configuredUrl,
  'http://localhost:5271/api',
  'http://localhost:5000/api'
].filter(Boolean);

let activeBaseUrl = candidateBaseUrls[0] || 'http://localhost:5271/api';

async function safeFetch(path, options = {}) {
  try {
    const res = await fetch(`${activeBaseUrl}${path}`, options);
    return res;
  } catch (err) {
    // Si falla la conexión inicial, intentar con los puertos alternativos
    for (const candidate of candidateBaseUrls) {
      if (candidate !== activeBaseUrl) {
        try {
          const res = await fetch(`${candidate}${path}`, options);
          activeBaseUrl = candidate; // Recordar la URL activa exitosa
          return res;
        } catch {
          // Seguir intentando
        }
      }
    }
    throw err;
  }
}

const extractErrorMessage = (data, defaultMsg) => {
  if (!data) return defaultMsg;
  if (data.errores && typeof data.errores === 'object') {
    const errorList = Object.values(data.errores).flat();
    if (errorList.length > 0) return errorList.join(' ');
  }
  if (data.errors && typeof data.errors === 'object') {
    const errorList = Object.values(data.errors).flat();
    if (errorList.length > 0) return errorList.join(' ');
  }
  if (data.detail && data.detail !== "Se encontraron uno o más errores de validación de negocio.") return data.detail;
  if (data.detail) return data.detail;
  if (data.error) return data.error;
  if (data.title) return data.title;
  return defaultMsg;
};

export const ApiService = {
  // HU01: Pacientes
  async getPacientes(busqueda = '') {
    const query = busqueda ? `?busqueda=${encodeURIComponent(busqueda)}` : '';
    const res = await safeFetch(`/pacientes${query}`);
    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error(extractErrorMessage(errData, 'Error al obtener la lista de pacientes'));
    }
    return res.json();
  },

  async getPacienteById(id) {
    const res = await safeFetch(`/pacientes/${id}`);
    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error(extractErrorMessage(errData, 'Paciente no encontrado'));
    }
    return res.json();
  },

  async verificarExisteCI(ci, excluirId = null) {
    const query = excluirId ? `?excluirId=${excluirId}` : '';
    try {
      const res = await safeFetch(`/pacientes/existe/${encodeURIComponent(ci)}${query}`);
      if (!res.ok) return { existe: false };
      return res.json();
    } catch {
      return { existe: false };
    }
  },

  async registrarPaciente(pacienteDto) {
    const res = await safeFetch('/pacientes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pacienteDto)
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(extractErrorMessage(data, 'Error al registrar el paciente'));
    }
    return data;
  },

  async actualizarPaciente(id, pacienteDto) {
    const res = await safeFetch(`/pacientes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pacienteDto)
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(extractErrorMessage(data, 'Error al actualizar el paciente'));
    }
    return data;
  },

  async eliminarPaciente(id) {
    const res = await safeFetch(`/pacientes/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error(extractErrorMessage(errData, 'Error al eliminar paciente'));
    }
    return true;
  },

  // ═══════════════════════════════════════════════════
  // HU02 — Odontograma Digital Interactivo
  // ═══════════════════════════════════════════════════

  async getOdontogramaByPacienteId(pacienteId) {
    const res = await safeFetch(`/odontogramas/paciente/${pacienteId}`);
    if (res.status === 404) {
      return null;
    }
    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error(extractErrorMessage(errData, 'Error al obtener odontograma del paciente'));
    }
    return res.json();
  },

  async getHistorialOdontogramas(pacienteId) {
    const res = await safeFetch(`/odontogramas/paciente/${pacienteId}/historial`);
    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error(extractErrorMessage(errData, 'Error al obtener historial de odontogramas'));
    }
    return res.json();
  },

  async guardarOdontograma(dto) {
    const res = await safeFetch('/odontogramas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(extractErrorMessage(data, 'Error al guardar el snapshot del odontograma'));
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  },

  // ═══════════════════════════════════════════════════
  // HU03 — Citas (Agenda Inteligente)
  // ═══════════════════════════════════════════════════

  async getCitas(fecha = null, odontologoId = null) {
    const params = new URLSearchParams();
    if (fecha) params.append('fecha', fecha);
    if (odontologoId) params.append('odontologoId', odontologoId);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const res = await safeFetch(`/citas${queryString}`);
    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error(extractErrorMessage(errData, 'Error al obtener las citas'));
    }
    return res.json();
  },

  async getCitaById(id) {
    const res = await safeFetch(`/citas/${id}`);
    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error(extractErrorMessage(errData, 'Cita no encontrada'));
    }
    return res.json();
  },

  /**
   * @param {{ pacienteId: number, fechaHoraInicio: string, fechaHoraFin: string, estado: string, motivoConsulta: string }} dto
   * @throws {Error} con mensaje del servidor (incluye 409 Conflict si hay traslape)
   */
  async crearCita(dto) {
    const res = await safeFetch('/citas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(extractErrorMessage(data, 'Error al crear la cita'));
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  },

  async actualizarCita(id, dto) {
    const res = await safeFetch(`/citas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(extractErrorMessage(data, 'Error al actualizar la cita'));
      err.status = res.status;
      throw err;
    }
    return data;
  },

  async eliminarCita(id) {
    const res = await safeFetch(`/citas/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error(extractErrorMessage(errData, 'Error al eliminar la cita'));
    }
    return true;
  },

  // ═══════════════════════════════════════════════════
  // HU04 — Finanzas, Presupuestos y Abonos
  // ═══════════════════════════════════════════════════

  async getPlanesTratamiento(pacienteId = null) {
    const query = pacienteId ? `?pacienteId=${pacienteId}` : '';
    const res = await safeFetch(`/finanzas/planes${query}`);
    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error(extractErrorMessage(errData, 'Error al obtener los planes de tratamiento'));
    }
    return res.json();
  },

  async getPlanTratamientoById(id) {
    const res = await safeFetch(`/finanzas/planes/${id}`);
    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error(extractErrorMessage(errData, 'Plan de tratamiento no encontrado'));
    }
    return res.json();
  },

  async crearPlanTratamiento(dto) {
    const res = await safeFetch('/finanzas/planes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(extractErrorMessage(data, 'Error al crear el plan de tratamiento'));
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  },

  async registrarAbono(dto) {
    const res = await safeFetch('/finanzas/abonos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(extractErrorMessage(data, 'Error al registrar el abono'));
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  },

  async actualizarPlanTratamiento(id, dto) {
    const res = await safeFetch(`/finanzas/planes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(extractErrorMessage(data, 'Error al actualizar el plan de tratamiento'));
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  },

  async eliminarPlanTratamiento(id) {
    const res = await safeFetch(`/finanzas/planes/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error(extractErrorMessage(errData, 'Error al eliminar el plan de tratamiento'));
    }
    return true;
  },

  // ═══════════════════════════════════════════════════
  // Autenticación de Odontólogos / Doctores
  // ═══════════════════════════════════════════════════

  async login(email, password) {
    const res = await safeFetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(extractErrorMessage(data, 'Credenciales incorrectas'));
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  },

  async registrarOdontologo(doctorDto) {
    const res = await safeFetch('/auth/registro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doctorDto)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(extractErrorMessage(data, 'Error al registrar profesional'));
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  },

  async getOdontologos() {
    const res = await safeFetch('/auth/odontologos');
    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error(extractErrorMessage(errData, 'Error al obtener odontólogos'));
    }
    return res.json();
  },

  async getPerfil(id) {
    const res = await safeFetch(`/auth/perfil/${id}`);
    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error(extractErrorMessage(errData, 'Error al obtener perfil'));
    }
    return res.json();
  },

  async logout() {
    try {
      await safeFetch('/auth/logout', { method: 'POST' });
    } catch {
      // Ignorar error de red al cerrar sesión localmente
    }
    return true;
  },

  // Health
  async getHealth() {
    try {
      const res = await safeFetch('/health');
      return res.ok ? await res.json() : null;
    } catch {
      return null;
    }
  }
};
