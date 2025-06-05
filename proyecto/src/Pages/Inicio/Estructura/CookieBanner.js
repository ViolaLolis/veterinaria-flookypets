import React, { useState, useEffect } from 'react';
import './Styles/CookieBanner.css';
import CookiePreferences from './CookiePreferences';

const CookieBanner = ({ onCookieDecision }) => {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [cookiesEnabled, setCookiesEnabled] = useState({
    necessary: true,
    preferences: false,
    statistics: false,
    marketing: false
  });

  useEffect(() => {
    // Verificar si ya se tomó una decisión sobre las cookies
    const cookieDecision = localStorage.getItem('cookieDecision');
    if (!cookieDecision) {
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const allCookies = {
      necessary: true,
      preferences: true,
      statistics: true,
      marketing: true
    };
    localStorage.setItem('cookieDecision', JSON.stringify(allCookies));
    setCookiesEnabled(allCookies);
    setShowBanner(false);
    onCookieDecision(allCookies);
  };

  const handleRejectAll = () => {
    const onlyNecessary = {
      necessary: true, // Las cookies necesarias no se pueden rechazar
      preferences: false,
      statistics: false,
      marketing: false
    };
    localStorage.setItem('cookieDecision', JSON.stringify(onlyNecessary));
    setCookiesEnabled(onlyNecessary);
    setShowBanner(false);
    onCookieDecision(onlyNecessary);
  };

  const handleSavePreferences = (preferences) => {
    localStorage.setItem('cookieDecision', JSON.stringify(preferences));
    setCookiesEnabled(preferences);
    setShowPreferences(false);
    onCookieDecision(preferences);
  };

  const handleShowPreferences = () => {
    setShowPreferences(true);
    setShowBanner(false);
  };

  if (!showBanner && !showPreferences) return null;

  if (showPreferences) {
    return (
      <CookiePreferences 
        initialPreferences={cookiesEnabled}
        onSave={handleSavePreferences}
        onCancel={() => {
          setShowPreferences(false);
          setShowBanner(true);
        }}
      />
    );
  }

  return (
    <div className="cookie-banner">
      <div className="cookie-banner-content">
        <h3>Gestión de Cookies</h3>
        <p>
          Utilizamos cookies propias y de terceros para mejorar nuestros servicios, 
          mostrar publicidad relacionada con tus preferencias y obtener datos estadísticos. 
          Puedes aceptar todas las cookies, rechazarlas o configurarlas según tus preferencias.
        </p>
        <div className="cookie-buttons">
          <button className="cookie-btn accept-all" onClick={handleAcceptAll}>
            Aceptar todas
          </button>
          <button className="cookie-btn preferences" onClick={handleShowPreferences}>
            Configurar preferencias
          </button>
          <button className="cookie-btn reject-all" onClick={handleRejectAll}>
            Rechazar todas
          </button>
        </div>
        <a 
          href="/politica-de-cookies" 
          className="cookie-policy-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          Más información sobre cookies
        </a>
      </div>
    </div>
  );
};

export default CookieBanner;