import React from 'react';
import { Link } from 'react-router-dom';
import "../Styles/Admin.css";

function Admin() {
  return (
    <div className="admin-container">
      <header className="admin-header">
        <nav className="admin-navbar">
          <button className="logout-button">
            <Link to="/login">Cerrar Sesión</Link>
          </button>
        </nav>
      </header>

      <section className="admin-welcome">
        <div className="profile-info">
          <img src='' alt="Foto de perfil" className="profile-pic" />
          <h2>Bienvenido, Administrador</h2>
        </div>
      </section>

      <section className="admin-menu">
        <h3>Gestión del Sistema</h3>
        <div className="admin-options">
          <Link to="/registrar-mascota" className="admin-button">Registrar Mascota</Link>
          <Link to="/registrar-cliente" className="admin-button">Registrar Cliente</Link>
          <Link to="/registrar-producto" className="admin-button">Eliminar Cliente</Link>
          <Link to="/registrar-producto" className="admin-button">Eliminar Mascota</Link>

          <Link to="/agendar" className="admin-button">Agendar Cita</Link>
          <Link to="/gestion-usuarios" className="admin-button">Gestionar Usuarios</Link>
        </div>
      </section>
    </div>
  );
}

export default Admin;
