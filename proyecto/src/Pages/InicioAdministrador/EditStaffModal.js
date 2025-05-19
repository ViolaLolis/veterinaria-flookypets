import React, { useState } from 'react';
import './Styles/InicioAdministrador.css';

const EditStaffModal = ({ staff, onClose, onSave }) => {
  const [editedStaff, setEditedStaff] = useState(staff);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedStaff(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(editedStaff);
      onClose();
    } catch (error) {
      console.error('Error al guardar:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3>Editar Miembro del Personal</h3>
          <button onClick={onClose} className="modal-close-btn">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Nombre:</label>
            <input
              type="text"
              name="nombre"
              value={editedStaff.nombre}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Apellido:</label>
            <input
              type="text"
              name="apellido"
              value={editedStaff.apellido}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={editedStaff.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Teléfono:</label>
            <input
              type="text"
              name="telefono"
              value={editedStaff.telefono}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Rol:</label>
            <select
              name="role"
              value={editedStaff.role}
              onChange={handleChange}
            >
              <option value="veterinario">Veterinario</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          
          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={isSaving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSaving}
            >
              {isSaving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStaffModal;