import React, { useState } from 'react';
import './Styles/AdminSettings.css';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    clinicName: 'FlookyPets',
    workingHours: '08:00 - 18:00',
    appointmentDuration: 30,
    notificationsEnabled: true,
    maintenanceMode: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí iría la lógica para guardar los cambios
    alert('Configuración guardada correctamente');
  };

  return (
    <div className="admin-settings-container">
      <h2>Configuración del Sistema</h2>
      
      <form onSubmit={handleSubmit} className="settings-form">
        <div className="form-group">
          <label>Nombre de la Clínica:</label>
          <input
            type="text"
            name="clinicName"
            value={settings.clinicName}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label>Horario de Trabajo:</label>
          <input
            type="text"
            name="workingHours"
            value={settings.workingHours}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label>Duración de Citas (minutos):</label>
          <input
            type="number"
            name="appointmentDuration"
            value={settings.appointmentDuration}
            onChange={handleChange}
            min="15"
            max="60"
            step="15"
          />
        </div>
        
        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              name="notificationsEnabled"
              checked={settings.notificationsEnabled}
              onChange={handleChange}
            />
            Notificaciones Habilitadas
          </label>
        </div>
        
        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              name="maintenanceMode"
              checked={settings.maintenanceMode}
              onChange={handleChange}
            />
            Modo Mantenimiento
          </label>
        </div>
        
        <div className="form-actions">
          <button type="submit" className="save-btn">
            Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;