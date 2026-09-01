import React, { createContext, useContext, useState, useEffect } from 'react';
import { ApiService } from '../services/api';

const AuthContext = createContext(null);

const STORAGE_KEY_USER = 'dentalflow_auth_user';
const STORAGE_KEY_TOKEN = 'dentalflow_auth_token';

// Usuario por defecto para fallback offline (Dra. Valeria Ramos)
const DEFAULT_DOCTOR = {
  id: 1,
  nombre: 'Valeria',
  apellido: 'Ramos',
  nombreCompleto: 'Dra. Valeria Ramos',
  especialidad: 'Odontología General y Estética',
  matriculaProfesional: 'COB-54219-LP',
  email: 'valeria.ramos@dentalflow.bo',
  iniciales: 'VR',
  rol: 'Odontólogo Titular'
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_USER);
      return stored ? JSON.parse(stored) : DEFAULT_DOCTOR;
    } catch {
      return DEFAULT_DOCTOR;
    }
  });

  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_TOKEN) || 'session_active_demo';
    } catch {
      return 'session_active_demo';
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const login = async (email, password) => {
    try {
      const data = await ApiService.login(email, password);
      setUser(data.usuario);
      setToken(data.token);
      setIsAuthenticated(true);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(data.usuario));
      localStorage.setItem(STORAGE_KEY_TOKEN, data.token);
      return data.usuario;
    } catch (err) {
      throw err;
    }
  };

  const logout = async () => {
    try {
      await ApiService.logout();
    } catch {
      // Ignorar error al cerrar sesión
    }
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_TOKEN);
  };

  const loginDirecto = (doctor) => {
    setUser(doctor);
    setToken('token_directo_' + doctor.id);
    setIsAuthenticated(true);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(doctor));
    localStorage.setItem(STORAGE_KEY_TOKEN, 'token_directo_' + doctor.id);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout, loginDirecto }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe utilizarse dentro de un AuthProvider');
  }
  return context;
};
