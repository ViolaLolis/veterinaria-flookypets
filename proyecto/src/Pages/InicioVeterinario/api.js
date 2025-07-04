// src/utils/api.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const getAuthToken = () => {
    // Intenta obtener el token del localStorage.
    // Asume que el token se guarda directamente o dentro de un objeto 'user'.
    const user = localStorage.getItem('user');
    if (user) {
        try {
            const parsedUser = JSON.parse(user);
            return parsedUser.token;
        } catch (e) {
            console.error("Error parsing user from localStorage:", e);
            return null;
        }
    }
    return localStorage.getItem('token'); // Fallback por si se guarda directamente
};

/**
 * Función de utilidad para realizar solicitudes fetch autenticadas.
 * Maneja la inclusión del token JWT, parseo de JSON y errores comunes.
 * @param {string} endpoint - La ruta de la API (ej. '/usuarios').
 * @param {object} options - Opciones estándar de fetch (method, body, headers, etc.).
 * @returns {Promise<object>} Un objeto con { success: boolean, data?: any, message?: string, status?: number, error?: Error }.
 */
export const authFetch = async (endpoint, options = {}) => {
    const token = getAuthToken();
    if (!token) {
        return { success: false, message: 'No se encontró token de autenticación. Por favor, inicia sesión de nuevo.', status: 401 };
    }

    const defaultHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`AuthFetch: Realizando solicitud a: ${url} con método: ${options.method || 'GET'}`);

    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers,
            },
        });

        // Intenta parsear JSON primero, incluso en errores, ya que el backend podría enviar mensajes de error en JSON
        let data = null;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else {
            // Si no es JSON, intenta leer como texto para depuración
            const text = await response.text();
            console.warn(`AuthFetch: Respuesta no es JSON para el endpoint: ${endpoint}. Contenido: ${text.substring(0, 200)}...`);
            // Para respuestas no JSON, considéralo un fallo a menos que se maneje explícitamente
            return { success: false, message: `Respuesta inesperada del servidor (no JSON). Estado: ${response.status}.`, status: response.status };
        }

        if (!response.ok) { // response.ok es true para códigos de estado 2xx
            // Si la respuesta no es OK, pero obtuvimos JSON, es un error del backend
            const errorMessage = data.message || `Error del servidor (estado ${response.status}).`;
            console.error(`AuthFetch: Error del servidor para el endpoint: ${endpoint}. Mensaje: ${errorMessage}`);
            return { success: false, message: errorMessage, status: response.status, errorData: data };
        }

        // Si la respuesta es OK y JSON, devuelve éxito con los datos
        // Algunos backends pueden envolver los datos en una propiedad 'data'
        return { success: true, data: data.data || data };
    } catch (error) {
        console.error(`AuthFetch: Error en la solicitud a ${endpoint}:`, error);
        // Captura errores de red o problemas con el parseo de .json() si se llamó en una respuesta no JSON
        return { success: false, message: `Error de red o respuesta no válida del servidor: ${error.message}.`, error: error };
    }
};
