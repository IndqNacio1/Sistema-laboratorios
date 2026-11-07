import api from './api.js';

export const iniciarSesion = async (correo, password) => {
    try {
        // Hacemos el POST a http://localhost:3000/api/auth/login
        const respuesta = await api.post('/auth/login', { correo, password });
        
        // El backend nos responde con el token que programamos hace un momento
        const { token, usuario } = respuesta.data;
        
        // Guardamos el token en la memoria del navegador
        localStorage.setItem('token', token);
        localStorage.setItem('usuario', JSON.stringify(usuario));

        return usuario; 
    } catch (error) {
        // Capturamos el error (ej. "Contraseña incorrecta") para mostrarlo en pantalla
        const mensajeError = error.response?.data?.error || "Error de conexión";
        throw new Error(mensajeError);
    }
};

export const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = '/login'; // Redirige a la pantalla de inicio
};