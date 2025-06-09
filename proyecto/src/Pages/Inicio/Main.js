import React, { useState, useEffect } from 'react';
import Header from './Estructura/Header';
import Servicios from './Estructura/Services';
import Footer from './Estructura/Footer';
import Hero from './Estructura/Hero';
import AboutUs from './Estructura/AboutUs';
import ImageCarousel from './Estructura/ImageCarousel';
import CookieBanner from './CookieBanner'; // Asegúrate de que la ruta sea correcta
import { checkCookieConsent } from './cookieUtils'; // Asegúrate de tener esta función para verificar el consentimiento
import { setCookieConsent } from "./cookieUtils"; // Ajusta la ruta según corresponda
import './cookies.css';

function Main() { 
  const [cookieConsent, setCookieConsentState] = useState(null);
  const [showLoginRestriction, setShowLoginRestriction] = useState(false);

  useEffect(() => {
    const consent = checkCookieConsent();
    setCookieConsentState(consent);

    if (!consent) {
      // Puedes agregar lógica para restringir acceso si quieres
    }
  }, []);

  const handleCookieDecision = (decision) => {
    setCookieConsent(decision); // Guarda en cookies
    setCookieConsentState(decision); // Actualiza estado local

    // Si rechazó todas excepto las necesarias, muestra advertencia
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
            Has rechazado las cookies necesarias para el inicio de sesión. <br />
            Para acceder a tu cuenta, por favor actualiza tus preferencias de cookies.
          </p>
          <button onClick={() => setShowLoginRestriction(false)}>Cerrar</button>
        </div>
      )}
    </div>
  );
}

export default Main;
