import React, { useState } from 'react';
import { FaUserCog, FaSave, FaTimes, FaLock } from 'react-icons/fa';
import './Styles/Admin.css';

function AdminProfile({ user, setUser }) {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.nombre || 'Admin Principal',
    email: user?.email || 'admin@flookypets.com',
    phone: user?.telefono || '3001234567',
    address: user?.direccion || 'Calle Admin 123'
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // Validación y guardado de datos
    if (!formData.name || !formData.email || !formData.phone) {
      setError('Nombre, email y teléfono son obligatorios');
      return;
    }

    // Simular actualización
    setTimeout(() => {
      setUser({ ...user, ...formData });
      setEditMode(false);
      setSuccess('Perfil actualizado correctamente');
      setTimeout(() => setSuccess(''), 3000);
    }, 1000);
  };

  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    // Simular actualización de contraseña
    setTimeout(() => {
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setSuccess('Contraseña actualizada correctamente');
      setError('');
      setTimeout(() => setSuccess(''), 3000);
    }, 1000);
  };

  return (
    <div className="admin-profile-container">
      <div className="admin-content-header">
        <h2>
          <FaUserCog className="header-icon" />
          Mi Perfil
        </h2>
        {!editMode && (
          <button className="btn-primary" onClick={() => setEditMode(true)}>
            Editar Perfil
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="profile-section">
        <h3>Información Personal</h3>
        
        {editMode ? (
          <div className="edit-form">
            <div className="form-group">
              <label>Nombre Completo</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Teléfono</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label>Dirección</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="form-actions">
              <button className="btn-primary" onClick={handleSave}>
                <FaSave /> Guardar Cambios
              </button>
              <button className="btn-secondary" onClick={() => setEditMode(false)}>
                <FaTimes /> Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="profile-info">
            <div className="info-item">
              <span className="info-label">Nombre:</span>
              <span className="info-value">{formData.name}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Email:</span>
              <span className="info-value">{formData.email}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Teléfono:</span>
              <span className="info-value">{formData.phone}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Dirección:</span>
              <span className="info-value">{formData.address}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Rol:</span>
              <span className="info-value">Administrador</span>
            </div>
          </div>
        )}
      </div>

      <div className="password-section">
        <h3><FaLock /> Cambiar Contraseña</h3>
        
        <form onSubmit={handlePasswordUpdate} className="password-form">
          <div className="form-group">
            <label>Contraseña Actual</label>
            <input
              type="password"
              name="currentPassword"
              value={passwordForm.currentPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Nueva Contraseña</label>
            <input
              type="password"
              name="newPassword"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Confirmar Contraseña</label>
            <input
              type="password"
              name="confirmPassword"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>
          
          <button type="submit" className="btn-primary">
            Actualizar Contraseña
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminProfile;