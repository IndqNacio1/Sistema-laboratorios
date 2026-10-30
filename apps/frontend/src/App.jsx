import React from 'react';
import DashboardPage from './pages/DashboardPage.jsx';
import UsersPage from './pages/UsersPage.jsx';
import PatientsPage from './pages/PatientsPage.jsx';
import ServicesPage from './pages/ServicesPage.jsx';
import BranchesPage from './pages/BranchesPage.jsx';

function App() {
  if (window.location.pathname === '/sucursales') {
    return <BranchesPage />;
  }
  if (['/servicios', '/estudios'].includes(window.location.pathname)) {
    return <ServicesPage />;
  }
  if (window.location.pathname === '/pacientes') {
    return <PatientsPage />;
  }
  if (window.location.pathname === '/usuarios') {
    return <UsersPage />;
  }

  return <DashboardPage />;
}

export default App;
