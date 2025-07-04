// api.js

/**
 * URL base de tu backend.
 * Asegúrate de que esta URL apunte a tu servidor Node.js.
 * Se recomienda usar una variable de entorno para esto.
 */
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

/**
 * Función auxiliar para obtener el token JWT del localStorage.
 * @returns {string|null} El token JWT si existe, de lo contrario null.
 */
const getToken = () => {
    try {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user).token : null;
    } catch (error) {
        console.error("Error al parsear el usuario del localStorage:", error);
        return null;
    }
};

/**
 * Realiza una petición fetch a la API con autenticación JWT.
 * Agrega automáticamente el token de autorización y maneja errores de respuesta HTTP.
 *
 * @param {string} endpoint - El endpoint de la API (ej. '/admin/users', '/citas/123').
 * @param {object} options - Opciones para la petición fetch (método, body, headers adicionales).
 * @returns {Promise<object>} Los datos de la respuesta JSON.
 * @throws {Error} Si no se encuentra el token, la respuesta de la red no es OK, o hay un error en el servidor.
 */
export const authFetch = async (endpoint, options = {}) => {
    const token = getToken();

    // Si el endpoint no es de login o registro, y no hay token, denegar acceso.
    // Las rutas de login y registro no requieren token.
    if (!token && endpoint !== '/login' && endpoint !== '/register' && !endpoint.startsWith('/forgot-password') && !endpoint.startsWith('/reset-password') && !endpoint.startsWith('/verify-reset-code')) {
        console.warn(`AuthFetch: Acceso denegado. No se encontró token para el endpoint: ${endpoint}`);
        // En un entorno real, aquí podrías forzar un logout o redirigir al login.
        // Por ahora, lanzamos un error que el componente llamador puede manejar.
        throw new Error('No autorizado. Por favor, inicie sesión.');
    }

    // Configuración de cabeceras por defecto
    const defaultHeaders = {
        // 'Content-Type': 'application/json', // Se elimina para permitir FormData en cargas de archivos
        'Authorization': `Bearer ${token}`
    };

    // Si el cuerpo de la petición es un FormData (para subida de archivos),
    // no establecer 'Content-Type', el navegador lo hará automáticamente.
    // De lo contrario, establecerlo a 'application/json'.
    if (!(options.body instanceof FormData)) {
        defaultHeaders['Content-Type'] = 'application/json';
    }

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers // Permite sobrescribir cabeceras por defecto
        }
    };

    // Si el cuerpo no es FormData, lo stringify.
    if (options.body && !(options.body instanceof FormData)) {
        config.body = JSON.stringify(options.body);
    }

    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`AuthFetch: Realizando solicitud a: ${url} con método: ${config.method || 'GET'}`);

    try {
        const response = await fetch(url, config);

        // Intenta parsear el cuerpo de la respuesta como JSON, incluso si no es exitosa.
        // Algunos errores del servidor pueden devolver JSON con mensajes de error.
        let responseData;
        try {
            responseData = await response.json();
        } catch (jsonError) {
            // Si no se puede parsear como JSON, es un error de red o una respuesta no JSON.
            console.error(`AuthFetch: No se pudo parsear la respuesta como JSON para ${endpoint}.`, jsonError);
            throw new Error(`Error de red o respuesta no JSON del servidor (${response.status}): ${response.statusText}`);
        }

        if (!response.ok) {
            // Si la respuesta no es OK (ej. 4xx, 5xx), lanza un error con el mensaje del servidor.
            const errorMessage = responseData.message || `Error del servidor: ${response.status} ${response.statusText}`;
            console.error(`AuthFetch: Error en la respuesta para ${endpoint}:`, responseData);
            throw new Error(errorMessage);
        }

        return responseData; // Devuelve la respuesta parseada (que ya debería tener { success: true, data: ... } o similar)

    } catch (err) {
        // Captura errores de red, errores al parsear JSON, o errores lanzados desde response.ok
        console.error(`AuthFetch: Error en la solicitud a ${endpoint}:`, err);
        throw err; // Re-lanza el error para que el componente llamador lo maneje
    }
};
