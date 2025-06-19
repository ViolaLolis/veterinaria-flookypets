import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUserCog, FaSignOutAlt, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import './Styles/AdminStyles.css';

function AdminNavbar({ user, handleLogout }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className={`admin-navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <div className="navbar-left">
          <Link to="/admin" className="navbar-brand">
            <img 
              src={require('../Inicio/Imagenes/flooty.png')} 
              alt="Flooky Pets Logo" 
              className="navbar-logo"
            />
            <span className="brand-text">Flooky Pets Admin</span>
          </Link>
        </div>
        
        <div className="navbar-right">
          <div 
            className="user-profile"
            onClick={toggleMenu}
          >
            <div className="user-avatar">
              <FaUserCog className="user-icon" />
            </div>
            <div className="user-info">
              <span className="user-name">{user?.nombre || 'Administrador'}</span>
              <span className="user-role">Admin</span>
            </div>
            {isMenuOpen ? <FaChevronUp className="menu-arrow" /> : <FaChevronDown className="menu-arrow" />}
            
            {isMenuOpen && (
              <div className="dropdown-menu">
                <button 
                  onClick={handleLogout} 
                  className="dropdown-item logout-item"
                >
                  <FaSignOutAlt /> Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default AdminNavbar;