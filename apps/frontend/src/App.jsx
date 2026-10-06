import React from 'react';
import DashboardPage from './pages/DashboardPage.jsx';
import UsersPage from './pages/UsersPage.jsx';

function App() {
  if (window.location.pathname === '/usuarios') {
    return <UsersPage />;
  }

  return <DashboardPage />;
}

export default App;
