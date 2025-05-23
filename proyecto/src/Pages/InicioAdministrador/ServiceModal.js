import React, { useState } from 'react';
import './Styles/InicioAdministrador.css';

const ServiceModal = ({ service, onClose, onSave, isEditing }) => {
  const [editedService, setEditedService] = useState(service || {
    nombre: '',
    descripción: '',
    precio: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedService(prev => ({ ...prev, [name]: value }));
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!editedService.nombre) newErrors.nombre = 'El nombre es requerido';
    if (!editedService.descripción) newErrors.descripción = 'La descripción es requerida';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSave(editedService);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3>{isEditing ? 'Editar Servicio' : 'Agregar Nuevo Servicio'}</h3>
          <button onClick={onClose} className="modal-close-btn">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Nombre:</label>
            <input
              type="text"
              name="nombre"
              value={editedService.nombre}
              onChange={handleChange}
              className={errors.nombre ? 'input-error' : ''}
            />
            {errors.nombre && <span className="error-message">{errors.nombre}</span>}
          </div>
          
          <div className="form-group">
            <label>Descripción:</label>
            <textarea
              name="descripción"
              value={editedService.descripción}
              onChange={handleChange}
              className={errors.descripción ? 'input-error' : ''}
            />
            {errors.descripción && <span className="error-message">{errors.descripción}</span>}
          </div>
          
          <div className="form-group">
            <label>Precio:</label>
            <input
              type="text"
              name="precio"
              value={editedService.precio}
              onChange={handleChange}
            />
          </div>
          
          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              {isEditing ? 'Actualizar' : 'Agregar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceModal;