import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../Styles/DashboardCards.css';

const DashboardCards = () => {
  const [stats, setStats] = useState({
    appointments: 0,
    vets: 0,
    admins: 0,
    pets: 0,
    monthlyGrowth: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get('http://localhost:5000/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setLoading(false);
      
      if (error.response) {
        if (error.response.status === 401) {
          setError('No autorizado - por favor inicia sesión');
          navigate('/login');
        } else if (error.response.status === 403) {
          setError('No tienes permisos para ver estadísticas');
        } else {
          setError('Error al cargar las estadísticas');
        }
      } else {
        setError('No se pudo conectar al servidor');
      }
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return <div className="loading">Cargando estadísticas...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="dashboard-cards">
      <div className="card">
        <h3>Citas este mes</h3>
        <p>{stats.appointments}</p>
        <span className={`growth ${stats.monthlyGrowth >= 0 ? 'positive' : 'negative'}`}>
          {stats.monthlyGrowth >= 0 ? '↑' : '↓'} {Math.abs(stats.monthlyGrowth)}%
        </span>
      </div>
      
      <div className="card">
        <h3>Veterinarios</h3>
        <p>{stats.vets}</p>
      </div>
      
      <div className="card">
        <h3>Administradores</h3>
        <p>{stats.admins}</p>
      </div>
      
      <div className="card">
        <h3>Mascotas registradas</h3>
        <p>{stats.pets}</p>
      </div>
    </div>
  );
};

export default DashboardCards;