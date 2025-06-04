import React, { useState } from 'react';
import { FaCog, FaSave, FaBusinessTime, FaMoneyBillWave, FaBell } from 'react-icons/fa';
import './Styles/AdminSettings.css';

function AdminSettings() {
  const [settings, setSettings] = useState({
    businessName: 'Flooky Pets',
    businessHours: 'Lunes a Viernes: 8:00 AM - 6:00 PM\nSábados: 9:00 AM - 2:00 PM',
    currency: 'COP',
    appointmentReminder: true,
    emailNotifications: true,
    smsNotifications: false
  });
  const [isEditing, setIsEditing] = useState(false);
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = () => {
    // Simular guardado de configuración
    setTimeout(() => {
      setIsEditing(false);
      setSuccess('Configuración guardada correctamente');
      setTimeout(() => setSuccess(''), 3000);
    }, 1000);
  };

  return (
    <div className="admin-settings-container">
      <div className="admin-content-header">
        <h2>
          <FaCog className="header-icon" />
          Configuración del Sistema
        </h2>
        {!isEditing ? (
          <button className="btn-primary" onClick={() => setIsEditing(true)}>
            Editar Configuración
          </button>
        ) : (
          <button className="btn-primary" onClick={handleSave}>
            <FaSave /> Guardar Cambios
          </button>
        )}
      </div>

      {success && <div className="success-message">{success}</div>}

      <div className="settings-section">
        <h3>Información General</h3>
        <div className="form-group">
          <label>Nombre del Negocio</label>
          {isEditing ? (
            <input
              type="text"
              name="businessName"
              value={settings.businessName}
              onChange={handleInputChange}
            />
          ) : (
            <div className="setting-value">{settings.businessName}</div>
          )}
        </div>
        
        <div className="form-group">
          <label>
            <FaBusinessTime className="icon" /> Horario de Atención
          </label>
          {isEditing ? (
            <textarea
              name="businessHours"
              value={settings.businessHours}
              onChange={handleInputChange}
              rows="3"
            />
          ) : (
            <div className="setting-value pre-line">{settings.businessHours}</div>
          )}
        </div>
        
        <div className="form-group">
          <label>
            <FaMoneyBillWave className="icon" /> Moneda
          </label>
          {isEditing ? (
            <select
              name="currency"
              value={settings.currency}
              onChange={handleInputChange}
            >
              <option value="COP">Peso Colombiano (COP)</option>
              <option value="USD">Dólar Estadounidense (USD)</option>
              <option value="EUR">Euro (EUR)</option>
            </select>
          ) : (
            <div className="setting-value">
              {settings.currency === 'COP' ? 'Peso Colombiano (COP)' : 
               settings.currency === 'USD' ? 'Dólar Estadounidense (USD)' : 'Euro (EUR)'}
            </div>
          )}
        </div>
      </div>

      <div className="settings-section">
        <h3>Notificaciones</h3>
        
        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              name="appointmentReminder"
              checked={settings.appointmentReminder}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
            <FaBell className="icon" /> Recordatorios de Citas
          </label>
        </div>
        
        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              name="emailNotifications"
              checked={settings.emailNotifications}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
            <FaBell className="icon" /> Notificaciones por Email
          </label>
        </div>
        
        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              name="smsNotifications"
              checked={settings.smsNotifications}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
            <FaBell className="icon" /> Notificaciones por SMS
          </label>
        </div>
      </div>
    </div>
  );
}

export default AdminSettings;