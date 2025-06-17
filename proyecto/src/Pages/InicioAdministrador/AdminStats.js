import React, { useState, useEffect, useCallback } from 'react';
import { FaUsers, FaUserMd, FaUserShield, FaConciergeBell, FaCalendarAlt, FaChartLine, FaSpinner, FaInfoCircle } from 'react-icons/fa';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { authFetch } from './api'; // Importa authFetch
import './Styles/AdminStats.css';

// Registra los componentes necesarios de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function AdminStats({ user }) { // Recibe 'user' como prop
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVets: 0,
    totalAdmins: 0,
    totalServices: 0,
    totalAppointments: 0, // Citas este mes
    monthlyGrowth: 0      // Crecimiento respecto al mes anterior
  });
  
  const [citasPorMes, setCitasPorMes] = useState([]);
  const [serviciosPopulares, setServiciosPopulares] = useState([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true); // Nuevo estado para la carga de las estadísticas generales
  const [isLoadingCharts, setIsLoadingCharts] = useState(true);

  // Función para obtener las estadísticas generales del dashboard
  const fetchDashboardStats = useCallback(async () => {
    setIsLoadingStats(true);
    try {
      const responseData = await authFetch('/admin/stats');
      if (responseData.success && responseData.data) {
        setStats(responseData.data);
      } else {
        console.error('Error en fetchDashboardStats:', responseData.message);
        // Respaldo a 0 si la API falla o devuelve datos inesperados
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
      console.error('Error de conexión en fetchDashboardStats:', error);
      // Respaldo a 0 si la conexión falla
      setStats({
        totalUsers: 0,
        totalVets: 0,
        totalAdmins: 0,
        totalServices: 0,
        totalAppointments: 0,
        monthlyGrowth: 0
      });
    } finally {
      setIsLoadingStats(false);
    }
  }, [authFetch]);

  // Función para cargar datos para los gráficos
  const fetchChartData = useCallback(async () => {
    setIsLoadingCharts(true);
    try {
      // Fetch para citas por mes
      const citasRes = await authFetch('/api/stats/citas-por-mes');
      if (citasRes.success && Array.isArray(citasRes.data)) {
        setCitasPorMes(citasRes.data);
      } else {
        console.error('Error en citasPorMes:', citasRes.message);
        setCitasPorMes([]); // Asegura que sea un array vacío si falla
      }

      // Fetch para servicios populares
      const serviciosRes = await authFetch('/api/stats/servicios-populares');
      if (serviciosRes.success && Array.isArray(serviciosRes.data)) {
        setServiciosPopulares(serviciosRes.data);
      } else {
        console.error('Error en serviciosPopulares:', serviciosRes.message);
        setServiciosPopulares([]); // Asegura que sea un array vacío si falla
      }
    } catch (error) {
      console.error('Error de conexión en fetchChartData:', error);
      setCitasPorMes([]);
      setServiciosPopulares([]);
    } finally {
      setIsLoadingCharts(false);
    }
  }, [authFetch]);

  useEffect(() => {
    // Solo cargar datos si el usuario está disponible y autenticado
    if (user && user.token) {
      fetchDashboardStats();
      fetchChartData();
    }
  }, [user, fetchDashboardStats, fetchChartData]);

  // Configuración del gráfico de barras (citas por mes)
  const citasChartData = {
    labels: citasPorMes.map(item => item.mes),
    datasets: [
      {
        label: 'Citas por mes',
        data: citasPorMes.map(item => item.cantidad),
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const citasChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Citas registradas por mes',
        font: {
          size: 16
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 20
        }
      }
    }
  };

  // Configuración del gráfico circular (servicios populares)
  const serviciosChartData = {
    labels: serviciosPopulares.map(item => item.servicio),
    datasets: [
      {
        label: 'Cantidad de citas',
        data: serviciosPopulares.map(item => item.cantidad),
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
          'rgba(255, 159, 64, 0.7)', // Añadir más colores si hay más de 5 servicios
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const serviciosChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Servicios más solicitados',
        font: {
          size: 16
        }
      },
    },
  };

  if (isLoadingStats) { // Usar isLoadingStats para el spinner principal
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
          {isLoadingCharts ? (
            <div className="chart-loading"><FaSpinner className="spinner-icon" /> Cargando datos...</div>
          ) : (
            <Bar options={citasChartOptions} data={citasChartData} />
          )}
        </div>
        
        <div className="chart-container">
          <h3>Servicios Más Populares</h3>
          {isLoadingCharts ? (
            <div className="chart-loading"><FaSpinner className="spinner-icon" /> Cargando datos...</div>
          ) : (
            <Pie options={serviciosChartOptions} data={serviciosChartData} />
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminStats;
