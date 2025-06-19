import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from './AdminNavbar'; // Asegúrate de que la ruta sea correcta
import AdminSidebar from './AdminSidebar'; // Asegúrate de que la ruta sea correcta
import AdminStats from './AdminStats';     // Asegúrate de que la ruta sea correcta
import ServicesManagement from './ServicesManagement'; // Asegúrate de que la ruta sea correcta
import VetsManagement from './VetsManagement';     // Asegúrate de que la ruta sea correcta
import AdminsManagement from './AdminsManagement';   // Asegúrate de que la ruta sea correcta
import UserProfile from './UserProfile';       // Asegúrate de que la ruta sea correcta
import AdminUsers from './AdminUsers'; // Importa el nuevo componente AdminUsers
import AdminAppointments from './AdminAppointments'; // Asegúrate de que la ruta sea correcta
import AdminMedicalRecords from './AdminMedicalRecords'; // Asegúrate de que la ruta sea correcta
import AdminSettings from './AdminSettings'; // Asegúrate de que la ruta sea correcta
import { authFetch } from './api'; // Importa authFetch
import './Styles/AdminStyles.css'; // Asegúrate de que la ruta sea correcta

function AdminDashboard({ user, setUser }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({}); // Mantener stats para el dashboard
  const navigate = useNavigate();

  const fetchAdminStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const responseData = await authFetch('/admin/stats');
      if (responseData.success && responseData.data) {
        setStats(responseData.data);
      } else {
        console.error('Error al cargar estadísticas:', responseData.message);
        setStats({ // Datos de respaldo
          totalUsers: 0, totalVets: 0, totalAdmins: 0,
          totalServices: 0, totalAppointments: 0, monthlyGrowth: 0
        });
      }
    } catch (error) {
      console.error('Error de conexión al cargar estadísticas:', error);
      setStats({ // Datos de respaldo en caso de error de conexión
        totalUsers: 0, totalVets: 0, totalAdmins: 0,
        totalServices: 0, totalAppointments: 0, monthlyGrowth: 0
      });
    } finally {
      setIsLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchAdminStats();
  }, [user, navigate, fetchAdminStats]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  }, [navigate, setUser]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminStats user={user} />;
      case 'users': // Nueva pestaña para gestión de usuarios
        return <AdminUsers user={user} />;
      case 'services':
        return <ServicesManagement user={user} />;
      case 'veterinarians':
        return <VetsManagement user={user} />;
      case 'administrators':
        return <AdminsManagement user={user} />;
      case 'appointments':
        return <AdminAppointments user={user} />;
      case 'medical-records':
        return <AdminMedicalRecords user={user} />;
      case 'settings':
        return <AdminSettings user={user} />;
      case 'profile':
        return <UserProfile user={user} setUser={setUser} />;
      default:
        return <AdminStats user={user} />;
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
