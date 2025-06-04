import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaConciergeBell, FaClock, FaDollarSign, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import './Styles/Adminservices.css';

function AdminServices({ user }) {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        // Simulación con animación de carga
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const mockServices = [
          { id: 1, name: 'Consulta General', description: 'Revisión médica básica para tu mascota', price: 50000, duration: 30, category: 'Consultas' },
          { id: 2, name: 'Vacunación', description: 'Aplicación de vacunas según programa', price: 30000, duration: 20, category: 'Prevención' },
          { id: 3, name: 'Estética Canina', description: 'Baño, corte de pelo y cuidados estéticos', price: 40000, duration: 60, category: 'Estética' },
          { id: 4, name: 'Cirugía Mayor', description: 'Procedimientos quirúrgicos complejos', price: 0, duration: 0, category: 'Cirugías' },
          { id: 5, name: 'Análisis Clínicos', description: 'Exámenes de laboratorio completos', price: 25000, duration: 15, category: 'Diagnóstico' }
        ];
        
        setServices(mockServices);
        setFilteredServices(mockServices);
        setIsLoading(false);
      } catch (err) {
        setError('Error al cargar los servicios');
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []);

  useEffect(() => {
    const results = services.filter(service =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredServices(results);
  }, [searchTerm, services]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleEdit = (service) => {
    navigate(`/admin/services/edit/${service.id}`);
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este servicio?')) {
      setServices(services.filter(service => service.id !== id));
      showNotification('Servicio eliminado correctamente');
    }
  };

  const handleAddNew = () => {
    navigate('/admin/services/new');
  };

  const formatPrice = (price) => {
    return price > 0 ? `$${price.toLocaleString('es-CO')}` : 'Consultar';
  };

  const formatDuration = (duration) => {
    return duration > 0 ? `${duration} min` : 'Variable';
  };

  if (isLoading) {
    return (
      <motion.div 
        className="loading-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="loading-spinner">
          <div className="spinner-circle"></div>
        </div>
        <p>Cargando servicios...</p>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        className="error-message"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {error}
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="services-dashboard"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Notificación */}
      <AnimatePresence>
        {notification && (
          <motion.div
            className={`notification ${notification.type}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="dashboard-header">
        <div className="header-title">
          <FaConciergeBell className="header-icon" />
          <h2>Gestión de Servicios</h2>
        </div>
        
        <div className="header-actions">
          <div className="search-container">
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Buscar servicios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  className="clear-search"
                  onClick={() => setSearchTerm('')}
                >
                  <FaTimes />
                </button>
              )}
            </div>
            
            <motion.button 
              className="add-btn"
              onClick={handleAddNew}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaPlus /> Nuevo Servicio
            </motion.button>
          </div>
        </div>
      </div>

      <div className="services-container">
        {filteredServices.length > 0 ? (
          <div className="services-grid">
            {filteredServices.map(service => (
              <motion.div 
                key={service.id}
                className="service-card"
                whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0, 172, 193, 0.2)' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="card-header">
                  <h3>{service.name}</h3>
                  <span className="category-badge">{service.category}</span>
                </div>
                
                <div className="card-body">
                  <p className="service-description">{service.description}</p>
                  
                  <div className="service-details">
                    <div className="detail-item">
                      <FaDollarSign className="detail-icon" />
                      <span>{formatPrice(service.price)}</span>
                    </div>
                    
                    <div className="detail-item">
                      <FaClock className="detail-icon" />
                      <span>{formatDuration(service.duration)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="card-footer">
                  <motion.button 
                    className="edit-btn"
                    onClick={() => handleEdit(service)}
                    whileHover={{ backgroundColor: '#00bcd4' }}
                  >
                    <FaEdit /> Editar
                  </motion.button>
                  
                  <motion.button 
                    className="delete-btn"
                    onClick={() => handleDelete(service.id)}
                    whileHover={{ backgroundColor: '#ff5252' }}
                  >
                    <FaTrash /> Eliminar
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div 
            className="no-results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            No se encontraron servicios
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export default AdminServices;