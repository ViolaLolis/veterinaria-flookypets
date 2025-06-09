import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { FaPaw, FaCalendarPlus, FaShoppingCart, FaUserCog, FaQuestionCircle } from 'react-icons/fa';

const InicioUsuario = ({ user, setUser }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <div>
      {/* Barra de navegación superior */}
      <div>
        <button onClick={() => navigate('/usuario/inicio')}>Inicio</button>
        <button onClick={() => navigate('/usuario/citas')}>Citas</button>
        <button onClick={() => navigate('/usuario/servicios')}>Servicios</button>
        <button onClick={() => navigate('/usuario/perfil')}>Perfil</button>
        <button onClick={() => navigate('/usuario/ayuda')}>Ayuda</button>
        <button onClick={handleLogout}>Cerrar sesión</button>
      </div>

      {/* Contenido principal */}
      <div>
        <Outlet />
      </div>

      {/* Barra de navegación inferior */}
      <div>
        <button onClick={() => navigate('/usuario/inicio')}>
          <FaPaw /> Inicio
        </button>
        <button onClick={() => navigate('/usuario/citas')}>
          <FaCalendarPlus /> Citas
        </button>
        <button onClick={() => navigate('/usuario/servicios')}>
          <FaShoppingCart /> Servicios
        </button>
        <button onClick={() => navigate('/usuario/perfil')}>
          <FaUserCog /> Perfil
        </button>
        <button onClick={() => navigate('/usuario/ayuda')}>
          <FaQuestionCircle /> Ayuda
        </button>
      </div>
    </div>
  );
};

export default InicioUsuario;