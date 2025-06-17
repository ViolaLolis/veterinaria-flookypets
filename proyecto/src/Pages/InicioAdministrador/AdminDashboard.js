import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';
import AdminSidebar from './AdminSidebar';
import AdminStats from './AdminStats';
import ServicesManagement from './ServicesManagement';
import VetsManagement from './VetsManagement';
import AdminsManagement from './AdminsManagement';
import UserProfile from './UserProfile';
import { authFetch } from './api'; // Importa authFetch
import './Styles/AdminStyles.css';

function AdminDashboard({ user, setUser }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({});
  const navigate = useNavigate();

  // Función para obtener las estadísticas del administrador
  const fetchAdminStats = useCallback(async () => {
    setIsLoading(true);
    try {
      // Usar authFetch para hacer la llamada a la API
      const responseData = await authFetch('/admin/stats'); // Endpoint para estadísticas del admin

      if (responseData.success && responseData.data) {
        setStats(responseData.data);
      } else {
        console.error('Error al cargar estadísticas:', responseData.message);
        // Si hay un error, establecer datos de ejemplo para desarrollo
        setStats({
          totalUsers: 0,
          totalVets: 0,
          totalAdmins: 0,
          totalServices: 0,
          totalAppointments: 0,
          monthlyGrowth: 0
        });
      }
    } catch (error) {
      console.error('Error de conexión al cargar estadísticas:', error);
      // Datos de ejemplo para desarrollo en caso de error de conexión o autenticación
      setStats({
        totalUsers: 23,
        totalVets: 5,
        totalAdmins: 2,
        totalServices: 6,
        totalAppointments: 20,
        monthlyGrowth: 0 // Si no se puede calcular
      });
    } finally {
      setIsLoading(false);
    }
  }, [authFetch]); // authFetch es una dependencia

  useEffect(() => {
    // Redirige si el usuario no está logueado o no es admin
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }

    // Carga las estadísticas cuando el componente se monta o el usuario cambia
    fetchAdminStats();

    // No necesitamos el setTimeout de simulación, ya que authFetch es asíncrono.
  }, [user, navigate, fetchAdminStats]); // Dependencias: user, navigate, fetchAdminStats

  const handleLogout = useCallback(() => {
    localStorage.removeItem('user');
    localStorage.removeItem('token'); // Asegurarse de remover el token también
    setUser(null);
    navigate('/login');
  }, [navigate, setUser]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        // Pasa user y setStats para que AdminStats pueda recargar si es necesario
        return <AdminStats user={user} />; 
      case 'services':
        return <ServicesManagement user={user} />;
      case 'veterinarians':
        return <VetsManagement user={user} />;
      case 'administrators':
        return <AdminsManagement user={user} />;
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
