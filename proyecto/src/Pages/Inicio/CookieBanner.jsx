import React, { useState, useEffect } from 'react';
import { setCookieConsent } from './cookieUtils';
import './cookies.css'; 

const defaultConsent = {
  necessary: true,
  preferences: false,
  statistics: false,
  marketing: false,
};

function CookieBanner({ onCookieDecision }) {
  const [consent, setConsent] = useState(defaultConsent);
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Efecto de aparición con retraso para que notes el detalle 💫
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // Animación de corazones al aceptar (solo visual, pero bonito 🌈)
  const handleAccept = () => {
    setCookieConsent({ ...consent, necessary: true });
    onCookieDecision(consent);
    setIsVisible(false);
  };

  return (
    <div className={`cookie-banner ${isVisible ? 'visible' : ''}`}>
      <div className="cookie-content">
        
        {/* Header con toque especial */}
        <div className="cookie-header" onClick={() => setIsExpanded(!isExpanded)}>
          <h3>
            <span role="img" aria-label="Cookies">🍪</span> 
            ¡Hola! Usamos cookies 
            <span role="img" aria-label="Corazón"> ❤️</span>
          </h3>
          <button className="toggle-btn">{isExpanded ? '▲' : '▼'}</button>
        </div>

        {/* Mensaje más cálido */}
        <p className="cookie-description">
          Las <strong>necesarias</strong> siempre están activas (son como el abrazo de buenos días 🤗). 
          Las demás son opcionales y las controlas tú:
        </p>

        {isExpanded && (
          <div className="cookie-options">
            {/* Cada opción con icono y descripción clara */}
            {[
              { name: 'preferences', label: 'Preferencias', desc: 'Como tu playlist favorita 🎵' },
              { name: 'statistics', label: 'Estadísticas', desc: 'Para mejorar juntos 📈' },
              { name: 'marketing', label: 'Marketing', desc: 'Ofertas que podrían gustarte 🛍️' }
            ].map((option) => (
              <div key={option.name} className="cookie-option">
                <label className="cookie-switch">
                  <input
                    type="checkbox"
                    name={option.name}
                    checked={consent[option.name]}
                    onChange={(e) => setConsent({...consent, [option.name]: e.target.checked})}
                  />
                  <span className="cookie-slider"></span>
                </label>
                <div className="cookie-text">
                  <span className="cookie-label">{option.label}</span>
                  <span className="cookie-tooltip">{option.desc}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Botones gemelos pero únicos ✨ */}
        <div className="cookie-buttons">
          <button 
            onClick={() => {
              setCookieConsent(defaultConsent);
              onCookieDecision(defaultConsent);
              setIsVisible(false);
            }}
            className="cookie-btn secondary-btn"
          >
            Solo las necesarias
          </button>
          <button 
            onClick={handleAccept}
            className="cookie-btn primary-btn pulse-on-hover"
          >
            ¡Aceptar con amor!
          </button>
        </div>
      </div>
    </div>
  );
}

export default CookieBanner;
