import React, { useState } from 'react';
import axios from 'axios';
import "../Styles/AdminTables.css";

const ServiceForm = ({ service, onClose, onRefresh }) => {
  const [formData, setFormData] = useState({
    nombre: service?.nombre || '',
    descripcion: service?.descripcion || '',
    precio: service?.precio || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      if (service) {
        // Actualizar servicio existente
        await axios.put(`http://localhost:5000/services/${service.id_servicio}`, formData);
      } else {
        // Crear nuevo servicio
        await axios.post('http://localhost:5000/services', formData);
      }
      
      onRefresh();
      onClose();
    } catch (err) {
      console.error('Error saving service:', err);
      setError(err.response?.data?.message || 'Error al guardar el servicio');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-modal">
      <div className="form-content">
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>{service ? 'Editar Servicio' : 'Añadir Nuevo Servicio'}</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre del Servicio:</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              maxLength="100"
            />
          </div>
          
          <div className="form-group">
            <label>Descripción:</label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              required
              rows="4"
            />
          </div>
          
          <div className="form-group">
            <label>Precio:</label>
            <input
              type="text"
              name="precio"
              value={formData.precio}
              onChange={handleChange}
              required
              maxLength="50"
            />
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-btn"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Servicio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceForm;