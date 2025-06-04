import React, { useState, useEffect } from 'react';
import { FaEdit, FaSave, FaTimes, FaLock, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaShieldAlt } from 'react-icons/fa';
import './Styles/UserProfile.css';

function UserProfile({ user, setUser }) {
  const [editMode, setEditMode] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const showNotification = (message, type = 'success') => {
    if (type === 'success') {
      setSuccess(message);
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      // Simulación de API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setUser(currentUser);
      localStorage.setItem('user', JSON.stringify(currentUser));
      setEditMode(false);
      showNotification('Perfil actualizado correctamente');
    } catch (error) {
      showNotification('Error al actualizar perfil', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showNotification('Las contraseñas no coinciden', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      // Simulación de API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      showNotification('Contraseña actualizada correctamente');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordForm(false);
    } catch (error) {
      showNotification('Error al actualizar contraseña', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="user-profile-container">
      {/* Notificaciones */}
      {error && (
        <div className="notification error">
          {error}
        </div>
      )}
      
      {success && (
        <div className="notification success">
          {success}
        </div>
      )}

      <div className="profile-header">
        <h2>
          <FaUser className="header-icon" />
          Mi Perfil
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
              >
                <FaEdit /> Editar
              </button>
            ) : (
              <button 
                onClick={() => setEditMode(false)} 
                className="cancel-btn"
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
                    value={currentUser.nombre}
                    onChange={handleInputChange}
                    placeholder="Tu nombre"
                  />
                </div>
                
                <div className="form-group">
                  <label>Apellido</label>
                  <input
                    type="text"
                    name="apellido"
                    value={currentUser.apellido || ''}
                    onChange={handleInputChange}
                    placeholder="Tu apellido"
                  />
                </div>
                
                <div className="form-group">
                  <label>Email</label>
                  <div className="disabled-input">
                    {currentUser.email}
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Teléfono</label>
                  <input
                    type="text"
                    name="telefono"
                    value={currentUser.telefono}
                    onChange={handleInputChange}
                    placeholder="Tu teléfono"
                  />
                </div>
                
                <div className="form-group">
                  <label>Dirección</label>
                  <input
                    type="text"
                    name="direccion"
                    value={currentUser.direccion || ''}
                    onChange={handleInputChange}
                    placeholder="Tu dirección"
                  />
                </div>
              </div>
              
              <button 
                onClick={handleSave} 
                className="save-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Guardando...' : <><FaSave /> Guardar Cambios</>}
              </button>
            </div>
          ) : (
            <div className="profile-info">
              <div className="info-item">
                <FaUser className="info-icon" />
                <div>
                  <span className="info-label">Nombre completo</span>
                  <span className="info-value">{user.nombre} {user.apellido}</span>
                </div>
              </div>
              
              <div className="info-item">
                <FaEnvelope className="info-icon" />
                <div>
                  <span className="info-label">Email</span>
                  <span className="info-value">{user.email}</span>
                </div>
              </div>
              
              <div className="info-item">
                <FaPhone className="info-icon" />
                <div>
                  <span className="info-label">Teléfono</span>
                  <span className="info-value">{user.telefono || 'No especificado'}</span>
                </div>
              </div>
              
              <div className="info-item">
                <FaMapMarkerAlt className="info-icon" />
                <div>
                  <span className="info-label">Dirección</span>
                  <span className="info-value">{user.direccion || 'No especificada'}</span>
                </div>
              </div>
              
              <div className="info-item">
                <FaShieldAlt className="info-icon" />
                <div>
                  <span className="info-label">Rol</span>
                  <span className="info-value">Administrador</span>
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
            <button 
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className={`toggle-btn ${showPasswordForm ? 'active' : ''}`}
            >
              {showPasswordForm ? 'Cancelar' : 'Cambiar Contraseña'}
            </button>
          </div>
          
          {showPasswordForm && (
            <form onSubmit={handlePasswordUpdate} className="password-form">
              <div className="form-group">
                <label>Contraseña Actual</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  required
                  placeholder="Ingresa tu contraseña actual"
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
                  placeholder="Ingresa tu nueva contraseña"
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
                  placeholder="Confirma tu nueva contraseña"
                />
              </div>
              
              <button 
                type="submit" 
                className="save-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Actualizando...' : 'Actualizar Contraseña'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserProfile;