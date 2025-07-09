import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../Imagenes/flooty.png';
import './Styles/Header.css'; // Asegúrate de que esta ruta sea correcta

function Header() {
  const handleScroll = (id) => (e) => {
    e.preventDefault(); // Previene el comportamiento por defecto del Link
    // Si 'inicio' es el ID para el tope de la página,
    // o si quieres ir al principio absoluto, puedes usar window.scrollTo
    if (id === 'inicio') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth' // Desplazamiento suave
      });
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  };

  return (
    <header className="header">
      <div className="header__logo">
        {/* Usamos un Link para el logo que también puede ir al inicio de la página */}
        <Link to="#" onClick={handleScroll('inicio')}>
          <img src={logo} alt="Logo Flooky Pets" />
        </Link>
      </div>
      <nav className="header__nav">
        <ul className="header__menu">
          <li className="header__menu-item">
            {/* El enlace de Inicio ahora usará la lógica de scroll al top */}
            <Link to="#" className="header__menu-link" onClick={handleScroll('inicio')}>Inicio</Link>
          </li>
          <li className="header__menu-item">
            <Link to="#" className="header__menu-link" onClick={handleScroll('servicios')}>Servicios</Link>
          </li>
          <li className="header__menu-item">
            <Link to="#" className="header__menu-link" onClick={handleScroll('nosotros')}>Nosotros</Link>
          </li>
          {/* ELIMINADO: Botón de Contacto
          <li className="header__menu-item">
            <Link to="#" className="header__menu-link" onClick={handleScroll('contacto')}>Contacto</Link>
          </li>
          */}
          <li className="header__menu-item">
            <Link to="/login" className="header__menu-link header__menu-link--button">Iniciar sesión</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;