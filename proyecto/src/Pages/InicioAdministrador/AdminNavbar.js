import React from 'react';
import { Link } from 'react-router-dom';
import './Styles/Admin.css';

function AdminNavbar({ user, handleLogout }) {
  return (
    <header className="admin-navbar">
      <div className="navbar-left">
        <Link to="/admin" className="navbar-brand">
          <img 
            src={require('../Inicio/Imagenes/flooty.png')} 
            alt="Flooky Pets Logo" 
            className="navbar-logo"
          />
          <span>Flooky Pets Admin</span>
        </Link>
      </div>
      
      <div className="navbar-right">
        <div className="user-info">
          <span className="user-name">{user?.nombre || 'Administrador'}</span>
          <span className="user-role">Admin</span>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          Cerrar Sesión
        </button>
      </div>
    </header>
  );
}

export default AdminNavbar;