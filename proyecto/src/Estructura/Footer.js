import React from 'react';
import "../Styles/Footer.css";

function Footer() {
  return (
    <footer>
      <div className="footer-container">
        <p>Flooky Pets - Todos los derechos reservados</p>
        <p>📞 3218928781</p>
        <p> 📍 <a href="https://www.google.com/maps?ll=4.621488,-74.108088&z=16&t=m&hl=es&gl=CO&mapclient=embed&q=Tv.+45+Puente+Aranda+Bogot%C3%A1">transversal #45</a></p>
        <p>✉️ <a href="mailto:contact@flookypets.com">contact@flookypets.com</a></p>
        <p>🔗 <a href="https://www.facebook.com/flookypets/">Facebook</a> | <a href="https://www.instagram.com/flookypets/">Instagram</a></p>
      </div>
    </footer>
  );
}

export default Footer;
