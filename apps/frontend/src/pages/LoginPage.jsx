import React, { useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { iniciarSesion } from '../services/auth.service.js'; // 1. Importamos tu servicio

function LoginPage() {
  // 2. Creamos los estados para capturar lo que el usuario escribe
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [mensajeError, setMensajeError] = useState(null);

  // 3. Función que se ejecuta al darle click al botón "Entrar"
  const manejarSubmit = async (e) => {
    e.preventDefault(); // Evita que la página se recargue sola
    setMensajeError(null); // Limpiamos errores previos

    try {
      // Enviamos las credenciales al backend
      const usuario = await iniciarSesion(correo, password);
      console.log("¡Conexión exitosa!", usuario);
      
      // Si el login es correcto, lo mandamos al Dashboard
      window.location.href = '/dashboard'; 
    } catch (error) {
      // Si falla (ej. contraseña incorrecta), mostramos el error
      setMensajeError(error.message);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <section className="w-full max-w-sm rounded bg-white p-6 shadow-sm">
        <h1 className="mb-6 text-xl font-semibold text-slate-900">Iniciar sesión</h1>

        {/* 4. Conectamos el formulario con nuestra función manejarSubmit */}
        <form className="space-y-4" onSubmit={manejarSubmit}>
          
          {/* Pequeña alerta si hay un error de login */}
          {mensajeError && (
            <div className="text-red-600 bg-red-100 p-2 rounded text-sm text-center">
              {mensajeError}
            </div>
          )}

          <TextField 
            fullWidth 
            label="Correo" 
            name="email" 
            type="email" 
            size="small" 
            value={correo} // Enlazamos el valor al estado
            onChange={(e) => setCorreo(e.target.value)} // Guardamos cada tecla que presiona
          />
          <TextField 
            fullWidth 
            label="Contraseña" 
            name="password" 
            type="password" 
            size="small" 
            value={password} // Enlazamos el valor al estado
            onChange={(e) => setPassword(e.target.value)} // Guardamos cada tecla que presiona
          />
          <Button fullWidth type="submit" variant="contained">
            Entrar
          </Button>
        </form>
      </section>
    </main>
  );
}

export default LoginPage;