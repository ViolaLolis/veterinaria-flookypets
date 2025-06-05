import React, { useState, useEffect } from 'react';
import Header from './Estructura/Header';
import Servicios from './Estructura/Services';
import Footer from './Estructura/Footer';
import Hero from './Estructura/Hero';
import AboutUs from './Estructura/AboutUs';
import ImageCarousel from './Estructura/ImageCarousel';
import CookieBanner from './Estructura/CookieBanner';
import { checkCookieConsent } from './Estructura/cookieUtils';

function Main() {
  const [cookieConsent, setCookieConsent] = useState(null);
  const [showLoginRestriction, setShowLoginRestriction] = useState(false);

  useEffect(() => {
    const consent = checkCookieConsent();
    setCookieConsent(consent);
    
    // Si no hay consentimiento, no permitir acceso a ciertas partes
    if (!consent) {
      // Aquí puedes agregar lógica para restringir acceso
    }
  }, []);

  const handleCookieDecision = (decision) => {
    setCookieConsent(decision);
    // Si rechazó todas excepto las necesarias, mostrar advertencia sobre inicio de sesión
    if (!decision.preferences && !decision.statistics && !decision.marketing) {
      setShowLoginRestriction(true);
    } else {
      setShowLoginRestriction(false);
    }
  };

  return (
    <div>
      <Header />
      <ImageCarousel />
      <Hero />
      <Servicios />
      <AboutUs />
      <Footer />
      
      {!cookieConsent && (
        <CookieBanner onCookieDecision={handleCookieDecision} />
      )}
      
      {showLoginRestriction && (
        <div className="login-restriction-banner">
          <p>
            Has rechazado las cookies necesarias para el inicio de sesión. 
            Para acceder a tu cuenta, por favor actualiza tus preferencias de cookies.
          </p>
          <button onClick={() => setShowLoginRestriction(false)}>Cerrar</button>
        </div>
      )}
    </div>
  );
}

export default Main;


