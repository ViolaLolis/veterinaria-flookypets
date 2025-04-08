import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "../Styles/Settings.css";

function Settings({ user, onUpdateUser }) {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });

  useEffect(() => {
    // Cargar preferencias del usuario
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    const savedNotifications = localStorage.getItem('notifications') !== 'false';
    
    setDarkMode(savedDarkMode);
    setNotifications(savedNotifications);
    applyDarkMode(savedDarkMode);
  }, []);

  const applyDarkMode = (isDark) => {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  };

  const handleDarkModeChange = (e) => {
    const isDark = e.target.checked;
    setDarkMode(isDark);
    localStorage.setItem('darkMode', isDark);
    applyDarkMode(isDark);
  };

  const handleNotificationsChange = (e) => {
    const isEnabled = e.target.checked;
    setNotifications(isEnabled);
    localStorage.setItem('notifications', isEnabled);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdateUser(formData);
    alert('Perfil actualizado correctamente');
  };

  return (
    <div className="settings-container">
      <h1>Configuración</h1>
      
      <div className="settings-section">
        <h2>Apariencia</h2>
        <div className="setting-item">
          <label>
            <input 
              type="checkbox" 
              checked={darkMode} 
              onChange={handleDarkModeChange} 
            />
            <span>Modo oscuro</span>
          </label>
        </div>
      </div>
      
      <div className="settings-section">
        <h2>Notificaciones</h2>
        <div className="setting-item">
          <label>
            <input 
              type="checkbox" 
              checked={notifications} 
              onChange={handleNotificationsChange} 
            />
            <span>Recibir notificaciones</span>
          </label>
        </div>
      </div>
      
      <div className="settings-section">
        <h2>Perfil</h2>
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label>Nombre completo</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Correo electrónico</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Teléfono</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="form-group">
            <label>Dirección</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              rows="3"
            />
          </div>
          
          <div className="form-actions">
            <button type="submit" className="save-button">
              Guardar cambios
            </button>
            <button 
              type="button" 
              className="cancel-button"
              onClick={() => navigate('/usuario')}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
      
      <div className="settings-section danger-zone">
        <h2>Zona peligrosa</h2>
        <button 
          className="delete-account-button"
          onClick={() => {
            if (window.confirm('¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.')) {
              // Lógica para eliminar cuenta
              navigate('/');
            }
          }}
        >
          Eliminar mi cuenta
        </button>
      </div>
    </div>
  );
}

export default Settings;