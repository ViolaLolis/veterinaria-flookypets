import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../Imagenes/flooty.png';
import './Styles/Header.css';

function Header() {
  const handleScroll = (id) => (e) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <header className="header">
      <div className="header__logo">
        <img src={logo} alt="Logo" />
      </div>
      <nav className="header__nav">
        <ul className="header__menu">
          <li className="header__menu-item">
            <Link to="#" className="header__menu-link" onClick={handleScroll('inicio')}>Inicio</Link>
          </li>
          <li className="header__menu-item">
            <Link to="#" className="header__menu-link" onClick={handleScroll('servicios')}>Servicios</Link>
          </li>
          <li className="header__menu-item">
            <Link to="#" className="header__menu-link" onClick={handleScroll('nosotros')}>Nosotros</Link>
          </li>
          <li className="header__menu-item">
            <Link to="#" className="header__menu-link" onClick={handleScroll('contacto')}>Contacto</Link>
          </li>
          <li className="header__menu-item">
            <Link to="/login" className="header__menu-link">Iniciar sesión</Link>
          </li>
        </ul>
      </nav>
  
    </header>
  );
}

export default Header;