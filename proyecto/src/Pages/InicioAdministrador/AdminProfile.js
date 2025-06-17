import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // Importar useNavigate
import { FaEdit, FaUserCog, FaSave, FaTimes, FaLock, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaShieldAlt, FaSpinner, FaInfoCircle } from 'react-icons/fa';
import './Styles/AdminProfile.css'; // Asegúrate de que este CSS exista y sea apropiado

function AdminProfile({ user, setUser }) {
  const navigate = useNavigate(); // Inicializar useNavigate
  const [editMode, setEditMode] = useState(false);
  const [currentAdminData, setCurrentAdminData] = useState(null); // Usar un nombre diferente para el estado local
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState(null); // Para notificaciones de éxito/error
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Función auxiliar para obtener el token de autenticación del localStorage
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  /**
   * Muestra una notificación temporal en la UI.
   * @param {string} message - El mensaje a mostrar.
   * @param {string} type - El tipo de notificación ('success' o 'error').
   */
  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000); // Notificación dura 5 segundos
  }, []); // Dependencias: setNotification (estable)

  /**
   * Función mejorada para realizar peticiones fetch con autenticación JWT.
   * @param {string} endpoint - El endpoint de la API relativo.
   * @param {object} options - Opciones para la petición fetch.
   * @returns {Promise<object>} Los datos de la respuesta JSON.
   * @throws {Error} Si no se encontró el token o la respuesta de la red no es OK.
   */
  const authFetch = useCallback(async (endpoint, options = {}) => {
    const token = getAuthToken();
    if (!token) {
      showNotification('No se encontró token de autenticación. Por favor, inicie sesión nuevamente.', 'error');
      throw new Error('No se encontró token de autenticación.');
    }

    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    };

    if (options.body && typeof options.body !== 'string') {
      config.body = JSON.stringify(options.body);
    }

    const response = await fetch(`http://localhost:5000${endpoint}`, config); 

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || `Error ${response.status}: ${response.statusText}`;
      showNotification(`Error de API: ${errorMessage}`, 'error');
      throw new Error(errorMessage);
    }

    return response.json();
  }, [showNotification]); // Dependencias: showNotification

  /**
   * Carga los datos del perfil del administrador desde el backend.
   */
  const fetchAdminProfile = useCallback(async () => {
    if (!user || !user.id) {
      setError('ID de administrador no disponible para cargar el perfil.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      // Endpoint para obtener el perfil del usuario (admin en este caso)
      const responseData = await authFetch(`/usuarios/${user.id}`); 
      
      if (responseData.success && responseData.data) {
        setCurrentAdminData(responseData.data);
      } else {
        setError(responseData.message || 'Formato de datos de perfil incorrecto.');
      }
    } catch (err) {
      setError(`Error al cargar perfil: ${err.message}`);
      console.error('Error fetching admin profile:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, authFetch, setError, setIsLoading]); // Dependencias: user, authFetch, setError, setIsLoading

  useEffect(() => {
    if (user?.id) { // Solo intenta cargar si el ID del usuario está disponible
      fetchAdminProfile();
    }
  }, [user?.id, fetchAdminProfile]); // Recarga si el ID del usuario cambia o la función fetchAdminProfile cambia

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setCurrentAdminData(prev => ({
      ...prev,
      [name]: value
    }));
  }, [setCurrentAdminData]); // Dependencias: setCurrentAdminData

  const handleSave = useCallback(async () => {
    if (!currentAdminData) return;

    try {
      setIsSubmitting(true);
      setError('');

      const dataToUpdate = {
        nombre: currentAdminData.nombre,
        apellido: currentAdminData.apellido, // Asumiendo que el campo 'apellido' existe
        telefono: currentAdminData.telefono,
        direccion: currentAdminData.direccion
      };

      // Realiza la petición PUT para actualizar el perfil del administrador
      const responseData = await authFetch(`/usuarios/${currentAdminData.id}`, {
        method: 'PUT',
        body: dataToUpdate
      });
      
      if (responseData.success && responseData.data) {
        // Actualiza el estado global 'user' si se modificó en el backend
        setUser({ ...user, ...responseData.data }); 
        localStorage.setItem('user', JSON.stringify({ ...user, ...responseData.data }));

        setEditMode(false);
        showNotification('Perfil actualizado correctamente.');
      } else {
        showNotification(responseData.message || 'Error al actualizar perfil.', 'error');
      }
    } catch (error) {
      showNotification(`Error al actualizar perfil: ${error.message}`, 'error');
      console.error('Error updating admin profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [authFetch, currentAdminData, showNotification, setUser, user, setEditMode, setIsSubmitting, setError]); // Dependencias

  const handlePasswordChangeRedirect = useCallback(() => {
    navigate('/olvidar-contrasena'); // Redirige a la página de "Olvidar Contraseña"
  }, [navigate]); // Dependencias: navigate

  if (isLoading) {
    return (
      <div className="admin-profile-container loading-state">
        <div className="loading-spinner">
          <FaSpinner className="spinner-icon" />
          <p>Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-profile-container error-state">
        <div className="error-message">
          <FaInfoCircle className="info-icon" />
          {error}
        </div>
      </div>
    );
  }

  if (!currentAdminData) {
    return (
      <div className="admin-profile-container no-data-state">
        <div className="info-message">
          <FaInfoCircle className="info-icon" />
          <p>No se pudo cargar la información del perfil del administrador.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-profile-container">
      {/* Notificaciones */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          <FaInfoCircle className="notification-icon" />
          {notification.message}
          <button className="close-notification" onClick={() => setNotification(null)}>
            <FaTimes />
          </button>
        </div>
      )}

      <div className="admin-content-header">
        <h2>
          <FaUserCog className="header-icon" />
          Mi Perfil de Administrador
        </h2>
      </div>

      <div className="profile-card">
        <div className="profile-section">
          <div className="section-header">
            <h3>Información Personal</h3>
            {!editMode ? (
              <button 
                onClick={() => setEditMode(true)} 
                className="edit-btn"
                disabled={isSubmitting}
              >
                <FaEdit /> Editar
              </button>
            ) : (
              <button 
                onClick={() => setEditMode(false)} 
                className="cancel-btn"
                disabled={isSubmitting}
              >
                <FaTimes /> Cancelar
              </button>
            )}
          </div>
          
          {editMode ? (
            <div className="edit-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Nombre</label>
                  <input
                    type="text"
                    name="nombre"
                    value={currentAdminData.nombre || ''}
                    onChange={handleInputChange}
                    placeholder="Tu nombre"
                    disabled={isSubmitting}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Apellido</label>
                  <input
                    type="text"
                    name="apellido"
                    value={currentAdminData.apellido || ''}
                    onChange={handleInputChange}
                    placeholder="Tu apellido"
                    disabled={isSubmitting}
                  />
                </div>
                
                <div className="form-group">
                  <label>Email</label>
                  <div className="disabled-input">
                    {currentAdminData.email} {/* Email no editable directamente aquí */}
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Teléfono</label>
                  <input
                    type="text"
                    name="telefono"
                    value={currentAdminData.telefono || ''}
                    onChange={handleInputChange}
                    placeholder="Tu teléfono"
                    disabled={isSubmitting}
                  />
                </div>
                
                <div className="form-group">
                  <label>Dirección</label>
                  <input
                    type="text"
                    name="direccion"
                    value={currentAdminData.direccion || ''}
                    onChange={handleInputChange}
                    placeholder="Tu dirección"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              
              <button 
                onClick={handleSave} 
                className="save-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? <><FaSpinner className="spinner-icon" /> Guardando...</> : <><FaSave /> Guardar Cambios</>}
              </button>
            </div>
          ) : (
            <div className="profile-info">
              <div className="info-item">
                <FaUser className="info-icon" />
                <div>
                  <span className="info-label">Nombre completo</span>
                  <span className="info-value">{currentAdminData.nombre} {currentAdminData.apellido}</span>
                </div>
              </div>
              
              <div className="info-item">
                <FaEnvelope className="info-icon" />
                <div>
                  <span className="info-label">Email</span>
                  <span className="info-value">{currentAdminData.email}</span>
                </div>
              </div>
              
              <div className="info-item">
                <FaPhone className="info-icon" />
                <div>
                  <span className="info-label">Teléfono</span>
                  <span className="info-value">{currentAdminData.telefono || 'No especificado'}</span>
                </div>
              </div>
              
              <div className="info-item">
                <FaMapMarkerAlt className="info-icon" />
                <div>
                  <span className="info-label">Dirección</span>
                  <span className="info-value">{currentAdminData.direccion || 'No especificada'}</span>
                </div>
              </div>
              
              <div className="info-item">
                <FaShieldAlt className="info-icon" />
                <div>
                  <span className="info-label">Rol</span>
                  <span className="info-value">{currentAdminData.role || 'Administrador'}</span> {/* Muestra el rol real del usuario */}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="password-section">
          <div className="section-header">
            <h3>
              <FaLock className="section-icon" />
              Seguridad
            </h3>
            {/* Botón para redirigir a la página de cambio de contraseña */}
            <button 
              onClick={handlePasswordChangeRedirect}
              className="toggle-btn" // Puedes estilizarlo como quieras
              disabled={isSubmitting}
            >
              Cambiar Contraseña
            </button>
          </div>
          {/* El formulario de cambio de contraseña en línea ha sido eliminado */}
        </div>
      </div>
    </div>
  );
}

export default AdminProfile;
