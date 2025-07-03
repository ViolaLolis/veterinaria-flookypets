// src/utils/api.js
// Esta función centraliza las llamadas a la API con autenticación JWT.

// URL base de tu backend (asegúrate de que sea la correcta para tu entorno)
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

/**
 * Realiza una solicitud HTTP autenticada a la API.
 * @param {string} endpoint La ruta de la API (ej. '/usuarios', '/citas/123').
 * @param {object} options Opciones de la solicitud (method, body, headers, etc.).
 * @returns {Promise<object>} La respuesta parseada del servidor.
 */
export const authFetch = async (endpoint, options = {}) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = user ? user.token : null;

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers, // Permite sobrescribir headers si es necesario
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Si el método es GET o HEAD, el body no debe enviarse.
  // Si el body es un objeto, lo stringify. Si es FormData, no lo stringify.
  let body = options.body;
  if (body && typeof body === 'object' && !(body instanceof FormData)) {
    body = JSON.stringify(body);
  } else if (options.method === 'GET' || options.method === 'HEAD') {
    body = undefined; // Asegura que no se envíe body con GET/HEAD
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      body: body,
    });

    // Si la respuesta es 204 No Content, no intentes parsear JSON
    if (response.status === 204) {
      return { success: true, message: "Operación completada sin contenido de respuesta." };
    }

    const data = await response.json();

    if (!response.ok) {
      // Manejo de errores específicos de la API (ej. 401, 403)
      if (response.status === 401 || response.status === 403) {
        // Aquí podrías añadir lógica para cerrar sesión automáticamente
        // si el token es inválido o ha expirado.
        // Por ahora, solo logueamos el error.
        console.error("Error de autenticación/autorización:", data.message);
        // Podrías disparar un evento o usar un contexto de autenticación para un logout global
        // Por ejemplo: if (typeof window !== 'undefined' && localStorage.getItem('user')) { /* logout logic */ }
      }
      return { success: false, message: data.message || `Error: ${response.statusText}` };
    }

    return { success: true, data: data.data, message: data.message };

  } catch (error) {
    console.error(`Error en authFetch para ${endpoint}:`, error);
    return { success: false, message: `Error de conexión: ${error.message}` };
  }
};
