import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardCards from './Components/DashboardCards';
import ServicesManagement from './ServicesManagement';
import UsersManagement from './UsersManagement';
import MeetingModal from './Components/MeetingModal';
import "./Styles/AdminDashboard.css";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const navigate = useNavigate();

  // Verificar autenticación al cargar el componente
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'admin') {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="sidebar-header">
          <img 
            src={require('../Inicio/Imagenes/flooty.png')} 
            alt="FlookyPets Logo" 
            className="sidebar-logo"
          />
          <h2>Panel de Administración</h2>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={activeTab === 'dashboard' ? 'active' : ''}
            onClick={() => setActiveTab('dashboard')}
          >
            <i className="fas fa-chart-line"></i> Dashboard
          </button>
          
          <button 
            className={activeTab === 'services' ? 'active' : ''}
            onClick={() => setActiveTab('services')}
          >
            <i className="fas fa-clipboard-list"></i> Servicios
          </button>
          
          <button 
            className={activeTab === 'users' ? 'active' : ''}
            onClick={() => setActiveTab('users')}
          >
            <i className="fas fa-users-cog"></i> Usuarios
          </button>
          
          <button 
            className={activeTab === 'meetings' ? 'active' : ''}
            onClick={() => setShowMeetingModal(true)}
          >
            <i className="fas fa-calendar-alt"></i> Reunión con Veterinarios
          </button>
        </nav>
        
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <i className="fas fa-sign-out-alt"></i> Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-main">
        {activeTab === 'dashboard' && (
          <>
            <h1>Dashboard de Administración</h1>
            <DashboardCards />
          </>
        )}
        
        {activeTab === 'services' && <ServicesManagement />}
        {activeTab === 'users' && <UsersManagement />}
      </div>

      {/* Meeting Modal */}
      {showMeetingModal && (
        <MeetingModal onClose={() => setShowMeetingModal(false)} />
      )}
    </div>
  );
};

export default AdminDashboard;