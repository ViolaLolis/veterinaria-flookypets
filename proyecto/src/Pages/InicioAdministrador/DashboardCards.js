import React from 'react';
import './Styles/InicioAdministrador.css';

const DashboardCards = ({ stats }) => {
  return (
    <div className="dashboard-cards">
      <div className="stats-card">
        <h3>Veterinarios</h3>
        <p className="stat-number">{stats.veterinarios}</p>
        <p className="stat-desc">Registrados</p>
      </div>
      
      <div className="stats-card">
        <h3>Propietarios</h3>
        <p className="stat-number">{stats.propietarios}</p>
        <p className="stat-desc">Registrados</p>
      </div>
      
      <div className="stats-card">
        <h3>Administradores</h3>
        <p className="stat-number">{stats.administradores}</p>
        <p className="stat-desc">Activos</p>
      </div>
      
      <div className="stats-card">
        <h3>Citas Hoy</h3>
        <p className="stat-number">{stats.citasHoy}</p>
        <p className="stat-desc">Programadas</p>
      </div>
    </div>
  );
};

export default DashboardCards;