import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Styles/AdminStats.css';

const AdminStats = () => {
  const [stats, setStats] = useState({
    appointments: 0,
    vets: 0,
    admins: 0,
    pets: 0,
    monthlyGrowth: 0,
    monthlyData: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('http://localhost:5000/admin/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    
    fetchStats();
  }, []);

  const chartData = [
    { name: 'Citas', value: stats.appointments },
    { name: 'Veterinarios', value: stats.vets },
    { name: 'Mascotas', value: stats.pets },
    { name: 'Administradores', value: stats.admins }
  ];

  return (
    <div className="admin-stats-container">
      <h2>Estadísticas Generales</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Citas este mes</h3>
          <div className="stat-value">{stats.appointments}</div>
          <div className={`stat-growth ${stats.monthlyGrowth >= 0 ? 'positive' : 'negative'}`}>
            {stats.monthlyGrowth >= 0 ? '↑' : '↓'} {Math.abs(stats.monthlyGrowth)}%
          </div>
        </div>
        
        <div className="stat-card">
          <h3>Veterinarios</h3>
          <div className="stat-value">{stats.vets}</div>
          <div className="stat-label">Registrados</div>
        </div>
        
        <div className="stat-card">
          <h3>Mascotas</h3>
          <div className="stat-value">{stats.pets}</div>
          <div className="stat-label">Registradas</div>
        </div>
        
        <div className="stat-card">
          <h3>Administradores</h3>
          <div className="stat-value">{stats.admins}</div>
          <div className="stat-label">Activos</div>
        </div>
      </div>
      
      <div className="chart-container">
        <h3>Resumen Mensual</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#1e3a8a" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AdminStats;