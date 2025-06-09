import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';
import AdminSidebar from './AdminSidebar';
import AdminStats from './AdminStats';
import ServicesManagement from './ServicesManagement';
import VetsManagement from './VetsManagement';
import AdminsManagement from './AdminsManagement';
import UserProfile from './UserProfile';
import './Styles/AdminDashboard.css';

function AdminDashboard({ user, setUser }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }

    // Simular carga de datos
    const timer = setTimeout(() => {
      fetchAdminStats();
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [user, navigate]);

  const fetchAdminStats = async () => {
    try {
      // En una aplicación real, harías una llamada a tu API
      const response = await fetch('http://localhost:5000/admin/stats', {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setStats(data);
      } else {
        console.error('Error al cargar estadísticas:', data.message);
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      // Datos de ejemplo para desarrollo
      setStats({
        totalUsers: 23,
        totalVets: 5,
        totalAdmins: 2,
        totalServices: 6,
        recentAppointments: 20
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminStats stats={stats} />;
      case 'services':
        return <ServicesManagement user={user} />;
      case 'veterinarians':
        return <VetsManagement user={user} />;
      case 'administrators':
        return <AdminsManagement user={user} />;
      case 'profile':
        return <UserProfile user={user} setUser={setUser} />;
      default:
        return <AdminStats stats={stats} />;
    }
  };

  if (isLoading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <AdminNavbar user={user} handleLogout={handleLogout} />
      
      <div className="admin-container">
        <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main className="admin-content">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;