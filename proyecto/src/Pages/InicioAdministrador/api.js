/**
 * Obtiene el token de autenticación del localStorage.
 * @returns {string|null} El token JWT o null si no se encuentra.
 */
const getAuthToken = () => {
    return localStorage.getItem('token');
};

/**
 * Realiza una petición fetch a la API con autenticación JWT.
 * @param {string} endpoint - El endpoint de la API (ej: '/usuarios/veterinarios', '/api/admin/administrators').
 * Se asume que es una ruta relativa a 'http://localhost:5000'.
 * @param {object} options - Opciones para la petición fetch (método, body, headers adicionales).
 * @returns {Promise<object>} Los datos de la respuesta JSON.
 * @throws {Error} Si no se encuentra el token o la respuesta de la red no es OK.
 */
export const authFetch = async (endpoint, options = {}) => {
    const token = getAuthToken();
    if (!token) {
        // Lanzar un error si el token no está presente
        throw new Error('No se encontró token de autenticación. Por favor, inicie sesión nuevamente.');
    }

    const defaultHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Incluye el token JWT en el encabezado Authorization
    };

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers // Permite sobrescribir o añadir encabezados adicionales
        }
    };

    // Si hay un cuerpo en la petición, asegúrate de que sea JSON stringificado
    if (options.body) {
        config.body = JSON.stringify(options.body);
    }

    // Realiza la petición a tu servidor backend
    const response = await fetch(`http://localhost:5000${endpoint}`, config);

    if (!response.ok) {
        // Intenta parsear el error del servidor, si existe
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Error ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
    }

    // Retorna la respuesta JSON si la petición fue exitosa
    return response.json();
};
