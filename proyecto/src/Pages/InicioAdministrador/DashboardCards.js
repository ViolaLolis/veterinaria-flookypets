import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Styles/InicioAdministrador.css';

const DashboardCards = () => {
  const [stats, setStats] = useState({
    veterinarios: 0,
    clientes: 0,
    mascotas: 0,
    citasHoy: 0
  });
  const [citasData, setCitasData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Obtener estadísticas
        const statsResponse = await fetch('http://localhost:5000/api/stats');
        if (!statsResponse.ok) throw new Error('Error al obtener estadísticas');
        const statsData = await statsResponse.json();
        
        // Obtener datos de citas para el gráfico
        const citasResponse = await fetch('http://localhost:5000/api/citas/semana');
        if (!citasResponse.ok) throw new Error('Error al obtener citas');
        const citasData = await citasResponse.json();
        
        setStats(statsData);
        setCitasData(citasData);
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
    <div className="dashboard-cards">
      <div className="stats-card">
        <h3>Veterinarios</h3>
        <p className="stat-number">{stats.veterinarios}</p>
        <p className="stat-desc">Activos</p>
      </div>
      
      <div className="stats-card">
        <h3>Clientes</h3>
        <p className="stat-number">{stats.clientes}</p>
        <p className="stat-desc">Registrados</p>
      </div>
      
      <div className="stats-card">
        <h3>Mascotas</h3>
        <p className="stat-number">{stats.mascotas}</p>
        <p className="stat-desc">Atendidas</p>
      </div>
      
      <div className="stats-card">
        <h3>Citas Hoy</h3>
        <p className="stat-number">{stats.citasHoy}</p>
        <p className="stat-desc">Programadas</p>
      </div>
      
      <div className="chart-container">
        <h3>Citas Semanales</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart 
            data={citasData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis 
              dataKey="dia" 
              tick={{ fill: '#555' }}
              axisLine={{ stroke: '#ccc' }}
            />
            <YAxis 
              tick={{ fill: '#555' }}
              axisLine={{ stroke: '#ccc' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            />
            <Legend />
            <Bar 
              dataKey="citas" 
              fill="#3498db" 
              radius={[4, 4, 0, 0]}
              name="Número de citas"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardCards;