// src/api.js
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

/**
 * Función para obtener el token de autenticación del localStorage.
 * @returns {string|null} El token JWT o null si no se encuentra.
 */
const getAuthToken = () => {
  return localStorage.getItem('token');
};

/**
 * Función para realizar peticiones fetch con autenticación.
 * Incluye el token JWT en el encabezado de autorización.
 * @param {string} url - La URL del endpoint de la API.
 * @param {Object} options - Opciones para la petición fetch (método, headers, body, etc.).
 * @returns {Promise<Object>} La respuesta de la API en formato JSON.
 * @throws {Error} Si la petición falla o la respuesta no es exitosa.
 */
export const authFetch = async (url, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Error en la petición: ${response.statusText}`);
  }

  return response.json();
};

