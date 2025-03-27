import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../Imagenes/flooty.png';

function Header() {
  return (
    <header className="header">
      <div className="header__logo">
        <img src={logo} alt="Logo" />
      </div>
      <nav className="header__nav">
        <ul className="header__menu">
          <li className="header__menu-item">
            <Link to="/" className="header__menu-link">Inicio</Link>
          </li>
          <li className="header__menu-item">
            <Link to="/servicios" className="header__menu-link">Servicios</Link>
          </li>
          <li className="header__menu-item">
            <Link to="/nosotros" className="header__menu-link">Nosotros</Link>
          </li>
          <li className="header__menu-item">
            <Link to="/contacto" className="header__menu-link">Contacto</Link>
          </li>
          <li className="header__menu-item">
            <Link to="/login" className="header__menu-link">Login</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;

