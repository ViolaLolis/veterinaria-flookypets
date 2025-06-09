import React, { useState, useEffect } from 'react';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaTimes, FaSave, FaSpinner } from 'react-icons/fa';
import './Styles/ServicesManagement.css';

function ServicesManagement({ user }) {
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentService, setCurrentService] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setIsLoading(true);
      // Simulación de carga con datos de ejemplo
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setServices([
        { id_servicio: 1, nombre: 'Consulta General', descripcion: 'Revisión médica básica para tu mascota.', precio: '$50.000' },
        { id_servicio: 2, nombre: 'Vacunación', descripcion: 'Programas de vacunación personalizados para proteger a tu compañero.', precio: '$30.000' },
        { id_servicio: 3, nombre: 'Estética Canina y Felina', descripcion: 'Baño, corte de pelo y otros tratamientos de belleza.', precio: '$40.000' },
        { id_servicio: 4, nombre: 'Cirugía', descripcion: 'Procedimientos quirúrgicos con equipo moderno y veterinarios especializados.', precio: 'Consultar' },
        { id_servicio: 5, nombre: 'Diagnóstico por Imagen', descripcion: 'Rayos X, ecografías y otros métodos de diagnóstico avanzado.', precio: 'Consultar' },
        { id_servicio: 6, nombre: 'Laboratorio Clínico', descripcion: 'Análisis de sangre, orina y otros fluidos corporales.', precio: '$25.000' }
      ]);
    } catch (error) {
      setError('Error de conexión con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (service) => {
    setCurrentService(service);
    setIsFormOpen(true);
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setCurrentService(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentService(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      // Simulación de API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setServices(services.map(s => 
        s.id_servicio === currentService.id_servicio ? currentService : s
      ));
      showNotification('Servicio actualizado correctamente');
      setIsFormOpen(false);
    } catch (error) {
      setError('Error al actualizar servicio');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este servicio?')) {
      try {
        // Simulación de API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setServices(services.filter(s => s.id_servicio !== id));
        showNotification('Servicio eliminado correctamente');
      } catch (error) {
        setError('Error al eliminar servicio');
      }
    }
  };

  const handleAddNew = () => {
    setCurrentService({
      nombre: '',
      descripcion: '',
      precio: ''
    });
    setIsFormOpen(true);
  };

  const handleCreate = async () => {
    try {
      setIsSubmitting(true);
      // Simulación de API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newService = {
        ...currentService,
        id_servicio: Math.max(...services.map(s => s.id_servicio)) + 1
      };
      
      setServices([...services, newService]);
      showNotification('Servicio creado correctamente');
      setIsFormOpen(false);
    } catch (error) {
      setError('Error al crear servicio');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredServices = services.filter(service =>
    service.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <div className="services-management">
      {/* Notificación */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* Modal de formulario */}
      {isFormOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-modal" onClick={handleCancel}>
              <FaTimes />
            </button>
            <h3>{currentService?.id_servicio ? 'Editar Servicio' : 'Nuevo Servicio'}</h3>
            
            <div className="form-group">
              <label>Nombre:</label>
              <input
                type="text"
                name="nombre"
                value={currentService?.nombre || ''}
                onChange={handleInputChange}
                placeholder="Ej: Consulta General"
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
              <button onClick={handleCancel} className="cancel-btn">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="management-header">
        <h2>Gestión de Servicios</h2>
        <div className="header-actions">
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Buscar servicios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="clear-search" onClick={() => setSearchTerm('')}>
                <FaTimes />
              </button>
            )}
          </div>
          <button onClick={handleAddNew} className="add-btn">
            <FaPlus /> Nuevo Servicio
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="services-grid">
        {filteredServices.length > 0 ? (
          filteredServices.map(service => (
            <div key={service.id_servicio} className="service-card">
              <div className="card-header">
                <h3>{service.nombre}</h3>
                <span className="price-badge">{service.precio}</span>
              </div>
              <div className="card-body">
                <p>{service.descripcion}</p>
              </div>
              <div className="card-footer">
                <button 
                  onClick={() => handleEdit(service)} 
                  className="edit-btn"
                >
                  <FaEdit /> Editar
                </button>
                <button 
                  onClick={() => handleDelete(service.id_servicio)} 
                  className="delete-btn"
                >
                  <FaTrash /> Eliminar
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            No se encontraron servicios
          </div>
        )}
      </div>
    </div>
  );
}

export default ServicesManagement;