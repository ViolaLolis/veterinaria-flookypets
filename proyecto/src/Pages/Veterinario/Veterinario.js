import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../Styles/Veterinario.css';
import vetImage from '../Inicio/Imagenes/flooty.png';

function Veterinario() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="veterinario-container">
      <header className="vet-header">
        <nav className="vet-navbar">
          <button className="logout-button" onClick={handleLogout}>Cerrar Sesión</button>
        </nav>
      </header>

      <section className="vet-welcome">
        <div className="profile-info">
          <img src={vetImage} alt="Foto de perfil" className="profile-pic" />
          <h2>Bienvenido, {user?.name || 'Veterinario'}</h2>
        </div>
      </section>

      <section className="vet-menu">
        <h3>Opciones</h3>
        <div className="vet-options">
          <Link to="/registrar-mascota" className="vet-button">Registrar Mascota</Link>
          <Link to="/agendar" className="vet-button">Agendar Cita</Link>
          <Link to="/historial-medico" className="vet-button">Historial Médico</Link>
        </div>
      </section>
    </div>
  );
}

export default Veterinario;