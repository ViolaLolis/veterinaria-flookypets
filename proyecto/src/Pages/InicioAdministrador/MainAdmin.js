import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardCards from './DashboardCards';
import './Styles/InicioAdministrador.css';

const MainAdmin = () => {
  const [stats, setStats] = useState({
    veterinarios: 0,
    clientes: 0,
    mascotas: 0,
    citasHoy: 0
  });

  useEffect(() => {
    // Aquí iría la llamada a la API para obtener las estadísticas
    const fetchStats = async () => {
      try {
        // Ejemplo de datos simulados
        setStats({
          veterinarios: 12,
          clientes: 245,
          mascotas: 320,
          citasHoy: 18
        });
      } catch (error) {
        console.error('Error al obtener estadísticas:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="dashboard-container">
      <h1>Panel de Administración</h1>
      <p>Bienvenido al centro de control de FlookyPets</p>
      
      <DashboardCards stats={stats} />
      
      <div className="quick-actions">
        <h2>Acciones rápidas</h2>
        <div className="action-buttons">
          <Link to="/admin/servicios/nuevo" className="action-btn">
            Agregar Servicio
          </Link>
          <Link to="/admin/personal/nuevo" className="action-btn">
            Registrar Veterinario
          </Link>
          <Link to="/admin/reuniones/nueva" className="action-btn">
            Programar Reunión
          </Link>
        </div>
      </div>
      
      <div className="recent-activity">
        <h2>Actividad Reciente</h2>
        {/* Aquí iría un componente de lista de actividad reciente */}
      </div>
    </div>
  );
};

export default MainAdmin;