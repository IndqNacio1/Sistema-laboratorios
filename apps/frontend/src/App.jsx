import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage'; // Asegúrate de que el nombre coincida

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta para el inicio de sesión */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Ruta para el panel principal */}
        <Route path="/dashboard" element={<DashboardPage />} />
        
        {/* Si alguien entra a la raíz ("/") o a una ruta que no existe, lo mandamos al login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;