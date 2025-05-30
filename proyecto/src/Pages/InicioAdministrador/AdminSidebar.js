import React from 'react';
import './Styles/Admin.css';

function AdminSidebar({ activeTab, setActiveTab }) {
  return (
    <aside className="admin-sidebar">
      <nav>
        <ul>
          <li 
            className={activeTab === 'dashboard' ? 'active' : ''}
            onClick={() => setActiveTab('dashboard')}
          >
            <i className="fas fa-tachometer-alt"></i>
            <span>Dashboard</span>
          </li>
          
          <li 
            className={activeTab === 'services' ? 'active' : ''}
            onClick={() => setActiveTab('services')}
          >
            <i className="fas fa-concierge-bell"></i>
            <span>Servicios</span>
          </li>
          
          <li 
            className={activeTab === 'veterinarians' ? 'active' : ''}
            onClick={() => setActiveTab('veterinarians')}
          >
            <i className="fas fa-user-md"></i>
            <span>Veterinarios</span>
          </li>
          
          <li 
            className={activeTab === 'administrators' ? 'active' : ''}
            onClick={() => setActiveTab('administrators')}
          >
            <i className="fas fa-user-shield"></i>
            <span>Administradores</span>
          </li>
          
          <li 
            className={activeTab === 'profile' ? 'active' : ''}
            onClick={() => setActiveTab('profile')}
          >
            <i className="fas fa-user-cog"></i>
            <span>Mi Perfil</span>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

export default AdminSidebar;