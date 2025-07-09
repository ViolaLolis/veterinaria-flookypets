import React, { useState } from 'react';
import "./Styles/Footer.css";

function Footer() {
  const [activeCard, setActiveCard] = useState(null);

  const handleCardHover = (index) => {
    setActiveCard(index);
  };

  const handleCardLeave = () => {
    setActiveCard(null);
  };

  return (
    <footer className="site-footer">
      {/* Puedes mantener o eliminar el footer-wave si no lo necesitas, ocupa espacio */}
      {/* <div className="footer-wave">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 80H1440V0L720 80L0 0V80Z" fill="currentColor"/>
        </svg>
      </div> */}

      <div className="footer-content">
        <div className="footer-main">
          {/* Columna izquierda: Información de Contacto */}
          <div className="footer-info">
            {/* ELIMINADO EL h3 "contacto" para reducir espacio y evitar confusión con botones */}
            {/* Puedes añadir un título como "Contáctanos" o "Información" aquí si lo deseas */}
            {/* <h3 className="section-title">Contáctanos</h3> */}
            <p className="footer-motto">Cuidando a tus mascotas con amor.</p> 
            
            <div className="footer-contact">
              <div className="contact-item">
                <i className="fas fa-phone"></i>
                <span>+57 321 892 8781</span> {/* Añadido prefijo de país */}
              </div>
              <div className="contact-item">
                <i className="fas fa-map-marker-alt"></i>
                <span>Transversal 45 #55-22, Soacha, Cund.</span> {/* Más específico */}
              </div>
              <div className="contact-item">
                <i className="fas fa-envelope"></i>
                <span>info@flookypets.com</span> {/* Corregido el dominio */}
              </div>
            </div>

            <div className="footer-social">
              <a href="https://www.facebook.com/flookypets/" className="social-icon" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="https://www.instagram.com/flookypets/" className="social-icon" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="mailto:info@flookypets.com" className="social-icon" aria-label="Email">
                <i className="far fa-envelope"></i>
              </a>
            </div>
          </div>

          {/* Columna derecha: Mapa compacto */}
          <div className="footer-map-compact">
            <h3 className="map-title">
              <i className="fas fa-map-marker-alt"></i> Visítanos
            </h3>
            <div className="small-map-wrapper">
              <iframe
                title='Ubicación Flooky Pets'
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3976.8400000000005!2d-74.21634862413164!3d4.60627724213796!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e3f9e9d9b6d9d9b%3A0x8e3f9e9d9b6d9d9b!2sTransversal%2045%20%2355-22%2C%20Soacha%2C%20Cundinamarca!5e0!3m2!1ses!2sco!4v1700000000000!5m2!1ses!2sco" // URL real de embed para tu dirección
              ></iframe>
            </div>
            <a 
              href="https://www.google.com/maps/search/Transversal+45+%2355-22,+Soacha,+Cundinamarca" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="map-link"
            >
              Ver mapa completo <i className="fas fa-external-link-alt"></i>
            </a>
          </div>
        </div>

        {/* Información adicional (Tarjetas) */}
        <div className="footer-additional">
          <div 
            className={`footer-card ${activeCard === 0 ? 'active' : ''}`}
            onMouseEnter={() => handleCardHover(0)}
            onMouseLeave={handleCardLeave}
          >
            <h4><i className="fas fa-clock"></i> Horario</h4>
            <p>Lun-Vie: 8am - 6pm</p> {/* Más compacto */}
            <p>Sáb: 9am - 2pm</p>
            <p>Urgencias: 24/7</p> {/* Más compacto */}
          </div>

          <div 
            className={`footer-card ${activeCard === 1 ? 'active' : ''}`}
            onMouseEnter={() => handleCardHover(1)}
            onMouseLeave={handleCardLeave}
          >
            <h4><i className="fas fa-map-signs"></i> Puntos de Encuentro</h4> {/* Título más compacto */}
            <p>Parque Central Soacha</p> {/* Más compacto */}
            <p>CC Ventura Terreros</p> 
            <p>CC Mercurio</p>
          </div>

          <div 
            className={`footer-card ${activeCard === 2 ? 'active' : ''}`}
            onMouseEnter={() => handleCardHover(2)}
            onMouseLeave={handleCardLeave}
          >
            <h4><i className="fas fa-info-circle"></i> Sobre Nosotros</h4> {/* Título más compacto */}
            <p>Fundada en 2020</p>
            <p>Profesionales Certificados</p> {/* Más compacto */}
          </div>
        </div>

        {/* Copyright y Enlaces Inferiores */}
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Flooky Pets - Todos los derechos reservados</p>
          <div className="footer-links">
            <a href="#privacy" onClick={e => { e.preventDefault(); alert('Política de privacidad (en construcción)'); }}>Política de privacidad</a>
            <a href="#terms" onClick={e => { e.preventDefault(); alert('Términos de servicio (en construcción)'); }}>Términos de servicio</a>
            <a href="#legal" onClick={e => { e.preventDefault(); alert('Aviso legal (en construcción)'); }}>Aviso legal</a>
            {/* ELIMINADO EL BOTÓN "Inicio" porque ya está en el Header */}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;