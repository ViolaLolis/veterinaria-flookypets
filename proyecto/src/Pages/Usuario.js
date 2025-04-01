import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../Styles/UserMenu.css';

function UserMenu() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="user-menu-container">
      <div className="user-header">
        <button className="logout-button" onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </div>

      <div className="user-info">
        <img src="https://via.placeholder.com/150" alt="Usuario" className="profile-picture" />
        <h2>Bienvenido, {user?.name || 'Usuario'}</h2>
      </div>

      <div className="user-options">
        <button className="btn-option" onClick={() => navigate('/ver-citas')}>
          Ver citas médicas
        </button>
        <button className="btn-option" onClick={() => navigate('/ver-mascotas')}>
          Ver mascotas registradas
        </button>
        <button className="btn-option" onClick={() => navigate('/historial-medico')}>
          Historial médico
        </button>
      </div>
    </div>
  );
}

export default UserMenu;
