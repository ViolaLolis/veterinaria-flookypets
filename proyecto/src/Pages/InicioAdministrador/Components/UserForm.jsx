import React, { useState} from 'react';
import axios from 'axios';
import "../Styles/AdminTables.css";

const UserForm = ({ user, onClose, onRefresh }) => {
  const [formData, setFormData] = useState({
    email: user?.email || '',
    password: '',
    nombre: user?.nombre || '',
    apellido: user?.apellido || '',
    telefono: user?.telefono || '',
    direccion: user?.direccion || '',
    tipo_documento: user?.tipo_documento || 'CC',
    numero_documento: user?.numero_documento || '',
    fecha_nacimiento: user?.fecha_nacimiento?.split('T')[0] || '',
    role: user?.role || 'usuario'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isEditMode] = useState(!!user);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const payload = { ...formData };
      // No actualizar la contraseña si no se cambió
      if (isEditMode && !payload.password) {
        delete payload.password;
      }

      if (isEditMode) {
        await axios.put(`http://localhost:5000/admin/users/${user.id}`, payload);
      } else {
        await axios.post('http://localhost:5000/admin/users', payload);
      }
      
      onRefresh();
      onClose();
    } catch (err) {
      console.error('Error saving user:', err);
      setError(err.response?.data?.message || 'Error al guardar el usuario');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-modal">
      <div className="form-content">
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>{isEditMode ? 'Editar Usuario' : 'Añadir Nuevo Usuario'}</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Nombre:</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                maxLength="50"
              />
            </div>
            
            <div className="form-group">
              <label>Apellido:</label>
              <input
                type="text"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                maxLength="50"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              maxLength="100"
              disabled={isEditMode}
            />
          </div>
          
          <div className="form-group">
            <label>{isEditMode ? 'Nueva Contraseña:' : 'Contraseña:'}</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required={!isEditMode}
              minLength="6"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Teléfono:</label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                required
                maxLength="20"
              />
            </div>
            
            <div className="form-group">
              <label>Rol:</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="admin">Administrador</option>
                <option value="veterinario">Veterinario</option>
                <option value="recepcionista">Recepcionista</option>
                <option value="asistente">Asistente</option>
                <option value="usuario">Usuario</option>
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label>Dirección:</label>
            <input
              type="text"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              maxLength="100"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Tipo de Documento:</label>
              <select
                name="tipo_documento"
                value={formData.tipo_documento}
                onChange={handleChange}
              >
                <option value="CC">Cédula de Ciudadanía</option>
                <option value="TI">Tarjeta de Identidad</option>
                <option value="CE">Cédula de Extranjería</option>
                <option value="PA">Pasaporte</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Número de Documento:</label>
              <input
                type="text"
                name="numero_documento"
                value={formData.numero_documento}
                onChange={handleChange}
                maxLength="20"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Fecha de Nacimiento:</label>
            <input
              type="date"
              name="fecha_nacimiento"
              value={formData.fecha_nacimiento}
              onChange={handleChange}
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
              {isSubmitting ? 'Guardando...' : 'Guardar Usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;