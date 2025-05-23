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
      <div className="footer-content">
        <div className="footer-main">
          {/* Columna izquierda: Información */}
          <div className="footer-info">
            <h3 className="footer-logo">contacto</h3>
            <p className="footer-motto">Cuidando a tus mascotas con amor </p>
            
            <div className="footer-contact">
              <div className="contact-item">
                <i className="fas fa-phone"></i>
                <span>321 892 8781</span>
              </div>
              <div className="contact-item">
                <i className="fas fa-map-marker-alt"></i>
                <span>Transversal 45 #55-22</span>
              </div>
              <div className="contact-item">
                <i className="fas fa-envelope"></i>
                <span>flookypets@flookypets.com</span>
              </div>
            </div>

            <div className="footer-social">
              <a href="https://www.facebook.com/flookypets/" className="social-icon" aria-label="Facebook">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="https://www.instagram.com/flookypets/" className="social-icon" aria-label="Instagram">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="mailto:contact@flookypets.com" className="social-icon" aria-label="Email">
                <i className="far fa-envelope"></i>
              </a>
            </div>
          </div>

          {/* Columna derecha: Mapa compacto */}
          <div className="footer-map-compact">
            <h3 className="map-title">
              <i className="fas fa-map-marker-alt"></i>Visítanos
            </h3>
            <div className="small-map-wrapper">
              <iframe
                title='Ubicación Flooky Pets'
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3976.9728971442!2d-74.07800742426815!3d4.598916042707592!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e3f99a7eccfe58f%3A0x9620f171953c6c95!2sTransversal%2045%2C%20Bogot%C3%A1%2C%20Colombia!5e0!3m2!1ses!2sco!4v1710798850813!5m2!1ses!2sco">
              </iframe>
            </div>
            <a href="https://www.google.com/maps?ll=4.621488,-74.108088&z=16&t=m&hl=es&gl=CO&mapclient=embed&q=Tv.+45+Puente+Aranda+Bogot%C3%A1" className="map-link">
              Ver mapa completo <i className="fas fa-external-link-alt"></i>
            </a>
          </div>
        </div>

        {/* Información adicional */}
        <div className="footer-additional">
          <div 
            className={`footer-card ${activeCard === 0 ? 'active' : ''}`}
            onMouseEnter={() => handleCardHover(0)}
            onMouseLeave={handleCardLeave}
          >
            <h4><i className="fas fa-clock"></i> Horario</h4>
            <p>Lunes a Viernes: 8am - 6pm</p>
            <p>Sábados: 9am - 2pm</p>
            <p>Urgencias 24/7</p>
          </div>

          <div 
            className={`footer-card ${activeCard === 1 ? 'active' : ''}`}
            onMouseEnter={() => handleCardHover(1)}
            onMouseLeave={handleCardLeave}
          >
            <h4><i className="fas fa-map-signs"></i> Puntos de encuentro</h4>
            <p>Parque Central de Soacha</p>
            <p>CC Ventura Terreros</p>
            <p>CC Mercurio</p>
          </div>

          <div 
            className={`footer-card ${activeCard === 2 ? 'active' : ''}`}
            onMouseEnter={() => handleCardHover(2)}
            onMouseLeave={handleCardLeave}
          >
            <h4><i className="fas fa-info-circle"></i> Sobre nosotros</h4>
            <p>Fundada en 2020</p>
            <p>Profesionales certificados</p>
          </div>
        </div>

        {/* Copyright */}
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Flooky Pets - Todos los derechos reservados</p>
          <div className="footer-links">
            <a href="#">Política de privacidad</a>
            <a href="#">Términos de servicio</a>
            <a href="#">Aviso legal</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;