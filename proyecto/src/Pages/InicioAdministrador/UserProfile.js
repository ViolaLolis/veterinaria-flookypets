import React, { useState, useEffect } from 'react';
import './Styles/Admin.css';

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

  const handleSave = async () => {
    try {
      const response = await fetch(`http://localhost:5000/usuarios/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(currentUser)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
        setEditMode(false);
        setSuccess('Perfil actualizado correctamente');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Error al actualizar perfil');
      }
    } catch (error) {
      setError('Error de conexión con el servidor');
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/usuarios/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess('Contraseña actualizada correctamente');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Error al actualizar contraseña');
      }
    } catch (error) {
      setError('Error de conexión con el servidor');
    }
  };

  return (
    <div className="user-profile">
      <h2>Mi Perfil</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <div className="profile-section">
        <div className="profile-header">
          <h3>Información Personal</h3>
          {!editMode && (
            <button onClick={() => setEditMode(true)} className="edit-btn">
              <i className="fas fa-edit"></i> Editar
            </button>
          )}
        </div>
        
        {editMode ? (
          <div className="edit-form">
            <div className="form-row">
              <div className="form-group">
                <label>Nombre:</label>
                <input
                  type="text"
                  name="nombre"
                  value={currentUser.nombre}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label>Apellido:</label>
                <input
                  type="text"
                  name="apellido"
                  value={currentUser.apellido || ''}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={currentUser.email}
                disabled
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Teléfono:</label>
                <input
                  type="text"
                  name="telefono"
                  value={currentUser.telefono}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label>Dirección:</label>
                <input
                  type="text"
                  name="direccion"
                  value={currentUser.direccion || ''}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="form-actions">
              <button onClick={handleSave} className="save-btn">
                Guardar Cambios
              </button>
              <button onClick={() => setEditMode(false)} className="cancel-btn">
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="profile-info">
            <div className="info-row">
              <span className="info-label">Nombre:</span>
              <span className="info-value">{user.nombre} {user.apellido}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Email:</span>
              <span className="info-value">{user.email}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Teléfono:</span>
              <span className="info-value">{user.telefono}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Dirección:</span>
              <span className="info-value">{user.direccion || 'No especificada'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Rol:</span>
              <span className="info-value">Administrador</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="password-section">
        <h3>Cambiar Contraseña</h3>
        
        <form onSubmit={handlePasswordUpdate} className="password-form">
          <div className="form-group">
            <label>Contraseña Actual:</label>
            <input
              type="password"
              name="currentPassword"
              value={passwordForm.currentPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Nueva Contraseña:</label>
            <input
              type="password"
              name="newPassword"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Confirmar Contraseña:</label>
            <input
              type="password"
              name="confirmPassword"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>
          
          <button type="submit" className="save-btn">
            Cambiar Contraseña
          </button>
        </form>
      </div>
    </div>
  );
}

export default UserProfile;