import React, { useState } from 'react';
import './Styles/CookiePreferences.css';

const CookiePreferences = ({ initialPreferences, onSave, onCancel }) => {
  const [preferences, setPreferences] = useState(initialPreferences);

  const handleToggle = (cookieType) => {
    setPreferences(prev => ({
      ...prev,
      [cookieType]: !prev[cookieType]
    }));
  };

  return (
    <div className="cookie-preferences">
      <div className="cookie-preferences-content">
        <h3>Configuración de Cookies</h3>
        <p>Selecciona las cookies que deseas permitir:</p>
        
        <div className="cookie-types">
          <div className="cookie-type necessary">
            <div className="cookie-info">
              <h4>Cookies necesarias</h4>
              <p>Estas cookies son esenciales para que el sitio web funcione correctamente.</p>
            </div>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={preferences.necessary} 
                disabled
              />
              <span className="slider round"></span>
            </label>
          </div>
          
          <div className="cookie-type">
            <div className="cookie-info">
              <h4>Cookies de preferencias</h4>
              <p>Permiten recordar tus ajustes y preferencias (como idioma o región).</p>
            </div>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={preferences.preferences} 
                onChange={() => handleToggle('preferences')}
              />
              <span className="slider round"></span>
            </label>
          </div>
          
          <div className="cookie-type">
            <div className="cookie-info">
              <h4>Cookies estadísticas</h4>
              <p>Nos ayudan a entender cómo los visitantes interactúan con nuestro sitio.</p>
            </div>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={preferences.statistics} 
                onChange={() => handleToggle('statistics')}
              />
              <span className="slider round"></span>
            </label>
          </div>
          
          <div className="cookie-type">
            <div className="cookie-info">
              <h4>Cookies de marketing</h4>
              <p>Se usan para mostrar anuncios relevantes para ti.</p>
            </div>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={preferences.marketing} 
                onChange={() => handleToggle('marketing')}
              />
              <span className="slider round"></span>
            </label>
          </div>
        </div>
        
        <div className="preferences-buttons">
          <button className="preferences-btn save" onClick={() => onSave(preferences)}>
            Guardar preferencias
          </button>
          <button className="preferences-btn cancel" onClick={onCancel}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookiePreferences;