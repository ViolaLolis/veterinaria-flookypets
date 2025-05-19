import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import './Styles/InicioAdministrador.css';

const AdminLayout = ({ user, setUser }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <div className="admin-container">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <h2>FlookyPets Admin</h2>
        </div>
        
        <nav className="admin-nav">
          <ul>
            <li><Link to="/admin">Dashboard</Link></li>
            <li><Link to="/admin/servicios">Gestión de Servicios</Link></li>
            <li><Link to="/admin/personal">Gestión de Personal</Link></li>
            <li><Link to="/admin/reuniones">Reuniones</Link></li>
            <li><Link to="/admin/configuracion">Configuración</Link></li>
          </ul>
        </nav>
        
        <div className="admin-footer">
          <button onClick={handleLogout} className="logout-btn">
            Cerrar Sesión
          </button>
        </div>
      </aside>
      
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;