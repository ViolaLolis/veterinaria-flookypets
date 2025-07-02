// src/api.js

/**
 * Función de utilidad para realizar fetch requests autenticadas.
 * Incluye el token JWT del localStorage en el header de autorización.
 * También maneja la respuesta JSON y errores.
 *
 * @param {string} url - La URL del endpoint de la API.
 * @param {Object} options - Opciones estándar para fetch (method, headers, body, etc.).
 * @returns {Promise<Object>} - Una promesa que resuelve con el objeto de respuesta del servidor (success, message, data).
 */
export const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem('token'); // Obtener el token JWT del localStorage
  
  // Inicializar headers.
  // Si el body es FormData, NO establecer Content-Type,
  // el navegador lo hará automáticamente y correctamente.
  // De lo contrario, por defecto a application/json.
  const headers = {};

  if (options.body instanceof FormData) {
    // No establecer Content-Type. El navegador lo hará automáticamente para FormData.
    // Si options.headers ya tiene Content-Type, lo respetará.
  } else {
    headers['Content-Type'] = 'application/json';
  }

  // Fusionar los headers proporcionados en las opciones,
  // permitiendo que sobrescriban el Content-Type por defecto si es necesario.
  Object.assign(headers, options.headers);

  if (token) {
    headers['Authorization'] = `Bearer ${token}`; // Añadir el token al header de autorización
  }

  try {
    // Asegúrate de que process.env.REACT_APP_API_BASE_URL esté definido en tu archivo .env
    // Por ejemplo: REACT_APP_API_BASE_URL=http://localhost:5000
    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}${url}`, {
      ...options,
      headers,
    });

    // Si la respuesta no es OK (ej. 401 Unauthorized, 403 Forbidden), lanzar un error
    if (!response.ok) {
      const errorData = await response.json();
      // Si el token es inválido o expiró, redirigir al login
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login'; // Redirigir al login
      }
      throw new Error(errorData.message || `Error en la petición: ${response.statusText}`);
    }

    const data = await response.json();
    return data; // Devolver la respuesta del servidor (ej. { success: true, data: [...] })
  } catch (error) {
    console.error("Error en authFetch:", error);
    return { success: false, message: error.message || 'Error de red o del servidor.' };
  }
};
