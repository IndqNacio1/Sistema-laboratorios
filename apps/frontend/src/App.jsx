import React from 'react';
import DashboardPage from './pages/DashboardPage.jsx';
import UsersPage from './pages/UsersPage.jsx';
import PatientsPage from './pages/PatientsPage.jsx';

function App() {
  if (window.location.pathname === '/pacientes') {
    return <PatientsPage />;
  }
  if (window.location.pathname === '/usuarios') {
    return <UsersPage />;
  }

  return <DashboardPage />;
}

export default App;
