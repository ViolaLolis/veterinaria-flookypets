// src/utils/api.js

/**
 * Función centralizada para realizar peticiones fetch con autenticación JWT.
 * Agrega automáticamente el token de autorización y maneja errores de respuesta HTTP.
 * @param {string} endpoint - El endpoint de la API (ej: '/servicios', '/usuarios/veterinarios').
 * Se asume que es una ruta relativa a 'http://localhost:5000'.
 * @param {object} options - Opciones para la petición fetch (método, cuerpo, encabezados adicionales).
 * @returns {Promise<object>} Los datos de la respuesta JSON.
 * @throws {Error} Si no se encuentra el token o si la respuesta de la red no es OK.
 */
export const authFetch = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    
    // Si no hay token, lanza un error que será capturado por el componente que llama
    if (!token) {
        console.error('Auth Error: No se encontró token de autenticación.');
        throw new Error('No se encontró token de autenticación. Por favor, inicie sesión nuevamente.');
    }

    // Encabezados predeterminados para todas las peticiones autenticadas
    const defaultHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Incluye el token JWT
    };

    // Combina las opciones predeterminadas con las opciones proporcionadas por la llamada
    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers // Permite sobrescribir o añadir encabezados adicionales
        }
    };

    // Si hay un cuerpo en la petición y no es una cadena (ya stringificada)
    if (options.body && typeof options.body !== 'string') {
        config.body = JSON.stringify(options.body);
    }

    try {
        const response = await fetch(`http://localhost:5000${endpoint}`, config);

        // Si la respuesta no es exitosa (ej. 401, 403, 404, 500), lanza un error
        if (!response.ok) {
            let errorData = {};
            try {
                errorData = await response.json(); // Intenta parsear el cuerpo del error
            } catch (jsonError) {
                // Si no se puede parsear JSON, usa el texto de la respuesta o un mensaje genérico
                const textError = await response.text();
                errorData = { message: textError || response.statusText };
            }
            
            const errorMessage = errorData.message || `Error ${response.status}: ${response.statusText}`;
            console.error(`API Error for ${endpoint}:`, errorMessage, errorData);
            throw new Error(errorMessage);
        }

        // Retorna la respuesta JSON si la petición fue exitosa
        return response.json();
    } catch (networkError) {
        console.error(`Network or unexpected error for ${endpoint}:`, networkError);
        throw new Error(`Error de red o conexión: ${networkError.message}`);
    }
};