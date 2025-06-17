import React, { useState, useEffect, useCallback } from 'react';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaTimes, FaSave, FaSpinner, FaInfoCircle, FaConciergeBell, FaDollarSign, FaClock } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { authFetch } from './api'; // Importa la función authFetch centralizada
import './Styles/AdminStyles.css'; // Asegúrate de que este archivo CSS existe y contiene los estilos necesarios

function ServicesManagement({ user }) {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentService, setCurrentService] = useState(null); // Servicio para editar o el nuevo
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  /**
   * Muestra una notificación temporal en la UI.
   * @param {string} message - El mensaje a mostrar.
   * @param {string} type - El tipo de notificación ('success' o 'error').
   */
  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  /**
   * Carga la lista de servicios desde el backend.
   */
  const fetchServices = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      // Usar authFetch para obtener los servicios desde la API real
      const responseData = await authFetch('/servicios'); // Endpoint: /servicios

      if (responseData.success && Array.isArray(responseData.data)) {
        setServices(responseData.data);
        setFilteredServices(responseData.data);
      } else {
        setError(responseData.message || 'Formato de datos de servicios incorrecto.');
        showNotification(responseData.message || 'Error al cargar servicios: Formato incorrecto.', 'error');
      }
    } catch (err) {
      setError(`Error al cargar servicios: ${err.message}`);
      console.error('Error fetching services:', err);
    } finally {
      setIsLoading(false);
    }
  }, [authFetch, showNotification, setError, setIsLoading]);

  // useEffect para cargar los servicios al montar el componente
  useEffect(() => {
    if (user && user.token) { // Solo si el usuario está autenticado
      fetchServices();
    } else {
      setIsLoading(false);
      setError('No autorizado. Por favor, inicie sesión.');
      showNotification('No autorizado para ver servicios.', 'error');
    }
  }, [fetchServices, user, showNotification]);

  // useEffect para filtrar la lista de servicios
  useEffect(() => {
    const results = services.filter(service =>
      service.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredServices(results);
  }, [searchTerm, services]);

  /**
   * Prepara el formulario para editar un servicio existente.
   * @param {object} service - El objeto servicio a editar.
   */
  const handleEdit = useCallback((service) => {
    setCurrentService(service);
    setIsFormOpen(true);
    setError('');
  }, [setCurrentService, setIsFormOpen, setError]);

  /**
   * Cierra el modal del formulario y limpia el servicio actual.
   */
  const handleCancel = useCallback(() => {
    setIsFormOpen(false);
    setCurrentService(null);
  }, [setIsFormOpen, setCurrentService]);

  /**
   * Maneja los cambios en los campos del formulario.
   * @param {object} e - El evento de cambio del input.
   */
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setCurrentService(prev => ({
      ...prev,
      [name]: value
    }));
  }, [setCurrentService]);

  /**
   * Maneja la actualización de un servicio.
   */
  const handleSave = useCallback(async () => {
    // Validación básica
    if (!currentService.nombre || !currentService.descripcion || !currentService.precio) {
      showNotification('Nombre, descripción y precio son requeridos.', 'error');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      // Llama a la API para actualizar el servicio
      const responseData = await authFetch(`/servicios/${currentService.id_servicio}`, {
        method: 'PUT',
        body: currentService // Envía los datos completos del servicio
      });

      if (responseData.success && responseData.data) {
        setServices(prevServices => prevServices.map(s =>
          s.id_servicio === currentService.id_servicio ? responseData.data : s
        ));
        showNotification(responseData.message || 'Servicio actualizado correctamente.');
        handleCancel(); // Cierra el modal
      } else {
        showNotification(responseData.message || 'Error al actualizar servicio.', 'error');
      }
    } catch (err) {
      console.error('Error al actualizar servicio:', err);
      showNotification(`Error al actualizar servicio: ${err.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  }, [currentService, authFetch, showNotification, handleCancel, setServices, setError, setIsSubmitting]);

  /**
   * Maneja la eliminación de un servicio.
   * @param {number} id - El ID del servicio a eliminar.
   */
  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este servicio? Esta acción es irreversible.')) {
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      // Llama a la API para eliminar el servicio
      const responseData = await authFetch(`/servicios/${id}`, {
        method: 'DELETE'
      });

      if (responseData.success) {
        setServices(prevServices => prevServices.filter(s => s.id_servicio !== id));
        showNotification(responseData.message || 'Servicio eliminado correctamente.');
      } else {
        showNotification(responseData.message || 'Error al eliminar servicio.', 'error');
      }
    } catch (err) {
      console.error('Error al eliminar servicio:', err);
      showNotification(`Error al eliminar servicio: ${err.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  }, [authFetch, showNotification, setServices, setError, setIsSubmitting]);

  /**
   * Prepara el formulario para agregar un nuevo servicio.
   */
  const handleAddNew = useCallback(() => {
    setCurrentService({
      nombre: '',
      descripcion: '',
      precio: ''
    });
    setIsFormOpen(true);
    setError('');
  }, [setCurrentService, setIsFormOpen, setError]);

  /**
   * Maneja la creación de un nuevo servicio.
   */
  const handleCreate = useCallback(async () => {
    // Validación básica
    if (!currentService.nombre || !currentService.descripcion || !currentService.precio) {
      showNotification('Nombre, descripción y precio son requeridos.', 'error');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      // Llama a la API para crear un nuevo servicio
      const responseData = await authFetch('/servicios', {
        method: 'POST',
        body: currentService
      });

      if (responseData.success && responseData.data && responseData.data.id_servicio) {
        setServices(prevServices => [...prevServices, responseData.data]);
        showNotification(responseData.message || 'Servicio creado correctamente.');
        handleCancel(); // Cierra el modal
      } else {
        showNotification(responseData.message || 'Error al crear servicio.', 'error');
      }
    } catch (err) {
      console.error('Error al crear servicio:', err);
      showNotification(`Error al crear servicio: ${err.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  }, [currentService, authFetch, showNotification, handleCancel, setServices, setError, setIsSubmitting]);

  // Formato de precio y duración (mantengo tus funciones aunque la duración no esté en el modelo actual)
  const formatPrice = useCallback((price) => {
    // Si el precio es una cadena como "$50.000", lo devuelve directamente
    if (typeof price === 'string' && price.startsWith('$')) {
      return price;
    }
    // Si es un número, lo formatea
    if (typeof price === 'number' && price > 0) {
      return `$${price.toLocaleString('es-CO')}`;
    }
    // Si es un número 0 o no válido, devuelve 'Consultar'
    return 'Consultar';
  }, []);

  const formatDuration = useCallback((duration) => {
    return duration > 0 ? `${duration} min` : 'Variable';
  }, []);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <FaSpinner className="spinner-icon" />
        </div>
        <p>Cargando servicios...</p>
      </div>
    );
  }

  if (error && services.length === 0) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="management-section">
      {/* Notificación */}
      <AnimatePresence>
        {notification && (
          <motion.div
            key="service-notification"
            className={`notification ${notification.type}`}
            initial={{ opacity: 0, y: -20, pointerEvents: 'none' }}
            animate={{ opacity: 1, y: 0, pointerEvents: 'auto' }}
            exit={{ opacity: 0, y: -20, pointerEvents: 'none' }}
            transition={{ duration: 0.3 }}
          >
            <FaInfoCircle className="notification-icon" />
            {notification.message}
            <button className="close-notification" onClick={() => setNotification(null)}>
              <FaTimes />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de formulario */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            key="service-form-modal"
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="modal-form"
              initial={{ y: "-100vh", opacity: 0 }}
              animate={{ y: "0", opacity: 1 }}
              exit={{ y: "100vh", opacity: 0 }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
            >
              <button className="close-modal" onClick={handleCancel} disabled={isSubmitting}>
                <FaTimes />
              </button>
              <h3>
                <FaConciergeBell className="form-icon" />
                {currentService?.id_servicio ? 'Editar Servicio' : 'Nuevo Servicio'}
              </h3>
              
              <div className="form-group">
                <label>Nombre:</label>
                <input
                  type="text"
                  name="nombre"
                  value={currentService?.nombre || ''}
                  onChange={handleInputChange}
                  placeholder="Ej: Consulta General"
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="form-group">
                <label>Descripción:</label>
                <textarea
                  name="descripcion"
                  value={currentService?.descripcion || ''}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Descripción detallada del servicio"
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="form-group">
                <label>Precio:</label>
                <input
                  type="text"
                  name="precio"
                  value={currentService?.precio || ''}
                  onChange={handleInputChange}
                  placeholder="Ej: $50.000 o 'Consultar'"
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="form-actions">
                <button
                  onClick={currentService?.id_servicio ? handleSave : handleCreate}
                  className="save-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <FaSpinner className="spinner-icon" /> : <FaSave />}
                  {isSubmitting ? 'Guardando...' : 'Guardar'}
                </button>
                <button onClick={handleCancel} className="cancel-btn" disabled={isSubmitting}>
                  <FaTimes /> Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="management-header">
        <h2><FaConciergeBell className="header-icon" /> Gestión de Servicios</h2>
        <div className="header-actions">
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Buscar servicios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={isLoading}
            />
            {searchTerm && (
              <button className="clear-search" onClick={() => setSearchTerm('')} disabled={isLoading}>
                <FaTimes />
              </button>
            )}
          </div>
          <button onClick={handleAddNew} className="add-btn" disabled={isLoading}>
            <FaPlus /> Nuevo Servicio
          </button>
        </div>
      </div>

      {error && services.length === 0 && <div className="error-message">{error}</div>}
      
      <div className="admin-table-container"> {/* Usando admin-table-container para consistencia */}
        {filteredServices.length > 0 ? (
          <table className="admin-table"> {/* Usando admin-table para consistencia */}
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Precio</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.map(service => (
                <tr key={service.id_servicio}>
                  <td>{service.id_servicio}</td>
                  <td>{service.nombre}</td>
                  <td>{service.descripcion}</td>
                  <td>{formatPrice(service.precio)}</td>
                  <td className="actions-cell">
                    <button
                      onClick={() => handleEdit(service)}
                      className="edit-btn"
                      disabled={isLoading || isSubmitting}
                      title="Editar Servicio"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(service.id_servicio)}
                      className="delete-btn"
                      disabled={isLoading || isSubmitting}
                      title="Eliminar Servicio"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-results">
            <FaInfoCircle className="info-icon" />
            {searchTerm ?
              'No se encontraron servicios que coincidan con la búsqueda.' :
              'No hay servicios registrados.'}
            <button onClick={handleAddNew} className="add-btn" disabled={isLoading}>
              <FaPlus /> Agregar Servicio
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ServicesManagement;
