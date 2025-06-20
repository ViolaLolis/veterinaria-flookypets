import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCog, FaEdit, FaSave, FaTimes, FaLock, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaShieldAlt, FaSpinner, FaInfoCircle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion'; // Importar motion y AnimatePresence
import './Styles/AdminProfile.css';

function AdminProfile({ user, setUser }) {
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [currentAdminData, setCurrentAdminData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setTimeout(() => setNotification(null), 5000);
  }, []);

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

    // Logging para depurar la URL que se está solicitando
    console.log(`AuthFetch: Realizando solicitud a: http://localhost:5000${endpoint}`);
    const response = await fetch(`http://localhost:5000${endpoint}`, config); 

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || `Error ${response.status}: ${response.statusText}`;
      showNotification(`Error de API: ${errorMessage}`, 'error');
      throw new Error(errorMessage);
    }

    return response.json();
  }, [showNotification]);

  /**
   * Carga los datos del perfil del administrador desde el backend.
   */
  const fetchAdminProfile = useCallback(async () => {
    if (!user || !user.id) {
      console.warn("AdminProfile: ID de administrador no disponible en el prop 'user'. No se cargará el perfil.");
      setError('ID de administrador no disponible para cargar el perfil.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      // Este es el endpoint al que se está haciendo la llamada.
      // Asegúrate de que tu backend tenga una ruta GET que responda a /usuarios/:id
      const responseData = await authFetch(`/usuarios/${user.id}`); 
      
      if (responseData.success && responseData.data) {
        setCurrentAdminData(responseData.data);
      } else {
        setError(responseData.message || 'Formato de datos de perfil incorrecto recibido del servidor.');
        console.error("Error: Formato de datos de perfil incorrecto:", responseData);
      }
    } catch (err) {
      setError(`Error al cargar perfil: ${err.message}`);
      console.error('Error fetching admin profile:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, authFetch, setError, setIsLoading]);

  useEffect(() => {
    if (user?.id) {
      fetchAdminProfile();
    }
  }, [user?.id, fetchAdminProfile]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setCurrentAdminData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleSave = useCallback(async () => {
    if (!currentAdminData) {
      showNotification('No hay datos para guardar.', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      const dataToUpdate = {
        nombre: currentAdminData.nombre,
        apellido: currentAdminData.apellido,
        telefono: currentAdminData.telefono,
        direccion: currentAdminData.direccion
      };

      const responseData = await authFetch(`/usuarios/${currentAdminData.id}`, {
        method: 'PUT',
        body: dataToUpdate
      });
      
      if (responseData.success && responseData.data) {
        const updatedGlobalUser = { 
            ...user, 
            ...responseData.data 
        };
        setUser(updatedGlobalUser); 
        localStorage.setItem('user', JSON.stringify(updatedGlobalUser));

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
  }, [authFetch, currentAdminData, showNotification, setUser, user, setEditMode, setIsSubmitting, setError]);

  const handlePasswordChangeRedirect = useCallback(() => {
    navigate('/olvidar-contrasena');
  }, [navigate]);

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
      {/* Notificaciones con AnimatePresence para animaciones de entrada/salida */}
      <AnimatePresence>
        {notification && (
          <motion.div
            key="admin-profile-notification" // Clave única para AnimatePresence
            className={`notification ${notification.type}`}
            initial={{ opacity: 0, y: -20, pointerEvents: 'none' }} // Comienza invisible y ligeramente arriba, no interactivo
            animate={{ opacity: 1, y: 0, pointerEvents: 'auto' }} // Anima a visible, posición normal, interactivo
            exit={{ opacity: 0, y: -20, pointerEvents: 'none' }} // Anima a invisible y ligeramente arriba al salir, no interactivo
            transition={{ duration: 0.3 }} // Duración de la transición
          >
            <FaInfoCircle className="notification-icon" />
            {notification.message}
            <button className="close-notification" onClick={() => setNotification(null)}>
              <FaTimes />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

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
                    {currentAdminData.email}
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
                  <span className="info-value">{currentAdminData.role || 'Administrador'}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminProfile;
