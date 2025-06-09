import React, { useState, useEffect } from 'react';
import { FaUsers, FaUserMd, FaUserShield, FaConciergeBell, FaCalendarAlt, FaChartLine } from 'react-icons/fa';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
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

function AdminStats() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVets: 0,
    totalAdmins: 0,
    totalServices: 0,
    totalAppointments: 0,
    monthlyGrowth: 0
  });
  
  const [citasPorMes, setCitasPorMes] = useState([]);
  const [serviciosPopulares, setServiciosPopulares] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCharts, setIsLoadingCharts] = useState(true);

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

    // Cargar datos para gráficos
    const fetchChartData = async () => {
      try {
        // En un proyecto real, harías fetch a tus endpoints API
        // const citasRes = await fetch('/api/stats/citas-por-mes');
        // const serviciosRes = await fetch('/api/stats/servicios-populares');
        // const citasData = await citasRes.json();
        // const serviciosData = await serviciosRes.json();
        
        // Datos de ejemplo (simulando la respuesta de la API)
        const citasData = [
          { mes: 'Enero', cantidad: 45 },
          { mes: 'Febrero', cantidad: 60 },
          { mes: 'Marzo', cantidad: 55 },
          { mes: 'Abril', cantidad: 72 },
          { mes: 'Mayo', cantidad: 85 },
          { mes: 'Junio', cantidad: 120 }
        ];
        
        const serviciosData = [
          { servicio: 'Consulta General', cantidad: 150 },
          { servicio: 'Vacunación', cantidad: 95 },
          { servicio: 'Estética Canina y Felina', cantidad: 65 },
          { servicio: 'Diagnóstico por Imagen', cantidad: 42 },
          { servicio: 'Laboratorio Clínico', cantidad: 30 }
        ];
        
        setCitasPorMes(citasData);
        setServiciosPopulares(serviciosData);
        setIsLoadingCharts(false);
      } catch (error) {
        console.error('Error al cargar datos para gráficos:', error);
        setIsLoadingCharts(false);
      }
    };

    fetchChartData();
  }, []);

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
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
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
          {isLoadingCharts ? (
            <div className="chart-loading">Cargando datos...</div>
          ) : (
            <Bar options={citasChartOptions} data={citasChartData} />
          )}
        </div>
        
        <div className="chart-container">
          <h3>Servicios Más Populares</h3>
          {isLoadingCharts ? (
            <div className="chart-loading">Cargando datos...</div>
          ) : (
            <Pie options={serviciosChartOptions} data={serviciosChartData} />
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminStats;