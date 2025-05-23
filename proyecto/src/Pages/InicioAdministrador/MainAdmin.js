import React, { useState, useEffect } from 'react';
import DashboardCards from './DashboardCards';
import RecentActivity from './RecentActivity';
import MonthlyAppointmentsChart from './MonthlyAppointmentsChart';
import './Styles/InicioAdministrador.css';

const MainAdmin = () => {
  const [stats, setStats] = useState({
    veterinarios: 0,
    propietarios: 0,
    administradores: 0,
    citasHoy: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/admin/stats');
        if (!response.ok) throw new Error('Error al obtener estadísticas');
        const data = await response.json();
        setStats(data);
        setLoading(false);
      } catch (error) {
        console.error('Error:', error);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="loading">Cargando estadísticas...</div>;
  }

  return (
    <div className="dashboard-container">
      <h1>Panel de Administración</h1>
      <p>Bienvenido al centro de control de FlookyPets</p>
      
      <DashboardCards stats={stats} />
      
      <div className="charts-row">
        <div className="chart-wrapper">
          <h3>Citas Mensuales</h3>
          <MonthlyAppointmentsChart />
        </div>
        
        <div className="recent-activity-wrapper">
          <RecentActivity />
        </div>
      </div>
    </div>
  );
};

export default MainAdmin;