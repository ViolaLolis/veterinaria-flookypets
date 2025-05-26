import React, { useState } from 'react';
import axios from 'axios';
import './Styles/AdminProfile.css';

const AdminProfile = ({ setUser }) => {
  const [profile, setProfile] = useState({
    name: 'Admin',
    email: 'admin@flookypets.com',
    phone: '3001234567',
    address: 'Calle Admin 123',
    password: '',
    confirmPassword: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (profile.password !== profile.confirmPassword) {
      setMessage('Las contraseñas no coinciden');
      return;
    }
    
    try {
      // Aquí iría la llamada a la API para actualizar el perfil
      const response = await axios.put('/api/admin/profile', profile);
      setUser(response.data.user);
      setIsEditing(false);
      setMessage('Perfil actualizado correctamente');
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Error al actualizar el perfil');
    }
  };

  return (
    <div className="admin-profile-container">
      <h2>Mi Perfil</h2>
      
      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}
      
      {!isEditing ? (
        <div className="profile-view">
          <div className="profile-info">
            <div className="info-item">
              <span className="label">Nombre:</span>
              <span className="value">{profile.name}</span>
            </div>
            <div className="info-item">
              <span className="label">Email:</span>
              <span className="value">{profile.email}</span>
            </div>
            <div className="info-item">
              <span className="label">Teléfono:</span>
              <span className="value">{profile.phone}</span>
            </div>
            <div className="info-item">
              <span className="label">Dirección:</span>
              <span className="value">{profile.address}</span>
            </div>
          </div>
          
          <button 
            className="edit-btn"
            onClick={() => setIsEditing(true)}
          >
            Editar Perfil
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label>Nombre:</label>
            <input
              type="text"
              name="name"
              value={profile.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={profile.email}
              onChange={handleChange}
              required
              disabled
            />
          </div>
          
          <div className="form-group">
            <label>Teléfono:</label>
            <input
              type="tel"
              name="phone"
              value={profile.phone}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Dirección:</label>
            <input
              type="text"
              name="address"
              value={profile.address}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label>Nueva Contraseña:</label>
            <input
              type="password"
              name="password"
              value={profile.password}
              onChange={handleChange}
              placeholder="Dejar en blanco para no cambiar"
            />
          </div>
          
          {profile.password && (
            <div className="form-group">
              <label>Confirmar Contraseña:</label>
              <input
                type="password"
                name="confirmPassword"
                value={profile.confirmPassword}
                onChange={handleChange}
              />
            </div>
          )}
          
          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-btn"
              onClick={() => setIsEditing(false)}
            >
              Cancelar
            </button>
            <button type="submit" className="save-btn">
              Guardar Cambios
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AdminProfile;