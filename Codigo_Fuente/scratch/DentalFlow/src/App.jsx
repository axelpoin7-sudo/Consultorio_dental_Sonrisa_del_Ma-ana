import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginView } from './components/auth/LoginView';
import { Sidebar } from './components/navigation/Sidebar';
import { Header } from './components/navigation/Header';
import { PacientesView } from './components/pacientes/PacientesView';
import { OdontogramaView } from './components/odontograma/OdontogramaView';
import { AgendaView } from './components/agenda/AgendaView';
import { FinanzasView } from './components/finanzas/FinanzasView';
import { DashboardView } from './components/dashboard/DashboardView';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [pacienteOdonto, setPacienteOdonto] = useState(null);

  if (!isAuthenticated) {
    return <LoginView />;
  }

  const handleOpenOdontogramaParaPaciente = (paciente) => {
    setPacienteOdonto(paciente);
    setCurrentTab('odontograma');
  };

  const handleAgendarParaPaciente = (paciente) => {
    setCurrentTab('agenda');
  };

  const handleFinanzasParaPaciente = (paciente) => {
    setCurrentTab('finanzas');
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar currentTab={currentTab} setTab={setCurrentTab} />

      {/* Main Container */}
      <main className="main-content">
        <Header onSearch={setSearchTerm} searchTerm={searchTerm} />

        {/* Tab Routing */}
        {currentTab === 'dashboard' && <DashboardView setTab={setCurrentTab} />}
        {currentTab === 'pacientes' && (
          <PacientesView 
            searchTerm={searchTerm} 
            onSelectPacienteOdontograma={handleOpenOdontogramaParaPaciente}
            onAgendarCita={handleAgendarParaPaciente}
            onIrAFinanzas={handleFinanzasParaPaciente}
          />
        )}
        {currentTab === 'odontograma' && (
          <OdontogramaView pacienteSeleccionado={pacienteOdonto} />
        )}
        {currentTab === 'agenda' && <AgendaView />}
        {currentTab === 'finanzas' && <FinanzasView />}
      </main>
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
