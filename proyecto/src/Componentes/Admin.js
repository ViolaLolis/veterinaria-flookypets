import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import "../Styles/Admin.css";

function Admin() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="admin-container">
      <header className="admin-header">
        <nav className="admin-navbar">
          <button className="logout-button" onClick={handleLogout}>
            Cerrar Sesión
          </button>
        </nav>
      </header>

      <section className="admin-welcome">
        <div className="profile-info">
          <img src='' alt="Foto de perfil" className="profile-pic" />
          <h2>Bienvenido, {user?.name || 'Administrador'}</h2>
        </div>
      </section>

      <section className="admin-menu">
        <h3>Gestión del Sistema</h3>
        <div className="admin-options">
          <Link to="/registrar-mascota" className="admin-button">Registrar Mascota</Link>
          <Link to="/registrar-veterinario" className="admin-button">Registrar Veterinario</Link>
          <Link to="/eliminar-usuario" className="admin-button">Eliminar Usuario</Link>
          <Link to="/eliminar-mascotas" className="admin-button">Eliminar Mascota</Link>
          <Link to="/agendar" className="admin-button">Agendar Cita</Link>
        </div>
      </section>
    </div>
  );
}

export default Admin;