import axios from 'axios';

// 1. Apuntamos al puerto de tu servidor Node.js
const api = axios.create({
    baseURL: 'http://localhost:3000/api', 
});

// 2. Interceptor: Actúa como un "portero" ANTES de que la petición salga hacia el backend
api.interceptors.request.use(
    (config) => {
        // Buscamos si el usuario ya tiene un token guardado
        const token = localStorage.getItem('token');
        
        if (token) {
            // Si hay token, armamos la cabecera exacta que espera nuestro auth.middleware.js
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;