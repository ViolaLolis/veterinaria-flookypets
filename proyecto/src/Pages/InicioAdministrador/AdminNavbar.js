import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUserCog, FaSignOutAlt, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import './Styles/AdminNavbar.css';

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

  // Determine the image URL to display, with a fallback to a placeholder
  const displayImageUrl = user?.imagen_url || `https://placehold.co/150x150/00acc1/ffffff?text=${user?.nombre?.charAt(0) || 'A'}`;

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
              {/* Use img tag for profile picture, with fallback */}
              <img 
                src={displayImageUrl}
                alt="User Avatar"
                className="profile-img"
                onError={(e) => { 
                  e.target.onerror = null; // Prevent infinite loop if placeholder also fails
                  e.target.src = `https://placehold.co/150x150/00acc1/ffffff?text=${user?.nombre?.charAt(0) || 'A'}`; 
                }}
              />
            </div>
            <div className="user-info">
              <span className="user-name">{user?.nombre || 'Administrador'}</span>
              <span className="user-role">{user?.role || 'Admin'}</span> {/* Display actual role */}
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
