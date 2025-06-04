import React, { useState, useEffect } from 'react';
import { FaUsers, FaUserMd, FaUserShield, FaConciergeBell, FaCalendarAlt, FaChartLine } from 'react-icons/fa';
import './Styles/AdminStats.css';

function AdminStats() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVets: 0,
    totalAdmins: 0,
    totalServices: 0,
    totalAppointments: 0,
    monthlyGrowth: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular carga de estadísticas
    setTimeout(() => {
      setStats({
        totalUsers: 125,
        totalVets: 8,
        totalAdmins: 3,
        totalServices: 12,
        totalAppointments: 342,
        monthlyGrowth: 15.7
      });
      setIsLoading(false);
    }, 1000);
  }, []);

  if (isLoading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Cargando estadísticas...</p>
      </div>
    );
  }

  return (
    <div className="admin-stats-container">
      <h2>
        <FaChartLine className="header-icon" />
        Resumen General
      </h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon users">
            <FaUsers />
          </div>
          <div className="stat-info">
            <h3>Usuarios</h3>
            <p>{stats.totalUsers}</p>
            <span className="stat-description">Clientes registrados</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon vets">
            <FaUserMd />
          </div>
          <div className="stat-info">
            <h3>Veterinarios</h3>
            <p>{stats.totalVets}</p>
            <span className="stat-description">Profesionales activos</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon admins">
            <FaUserShield />
          </div>
          <div className="stat-info">
            <h3>Administradores</h3>
            <p>{stats.totalAdmins}</p>
            <span className="stat-description">Usuarios con acceso</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon services">
            <FaConciergeBell />
          </div>
          <div className="stat-info">
            <h3>Servicios</h3>
            <p>{stats.totalServices}</p>
            <span className="stat-description">Opciones disponibles</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon appointments">
            <FaCalendarAlt />
          </div>
          <div className="stat-info">
            <h3>Citas</h3>
            <p>{stats.totalAppointments}</p>
            <span className="stat-description">Este mes</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon growth">
            <FaChartLine />
          </div>
          <div className="stat-info">
            <h3>Crecimiento</h3>
            <p>{stats.monthlyGrowth}%</p>
            <span className="stat-description">Mes anterior</span>
          </div>
        </div>
      </div>
      
      <div className="charts-section">
        <div className="chart-container">
          <h3>Citas por Mes</h3>
          <div className="chart-placeholder">
            {/* Aquí iría un gráfico real con una librería como Chart.js */}
            <p>Gráfico de citas mensuales</p>
          </div>
        </div>
        
        <div className="chart-container">
          <h3>Servicios Más Populares</h3>
          <div className="chart-placeholder">
            {/* Aquí iría un gráfico real con una librería como Chart.js */}
            <p>Gráfico de servicios populares</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminStats;