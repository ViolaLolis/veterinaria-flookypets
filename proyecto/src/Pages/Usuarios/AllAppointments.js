import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../Styles/AllAppointments.css";

function AllAppointments({ appointments, onCancelAppointment }) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('todas');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAppointments = appointments.filter(app => {
    const matchesFilter = filter === 'todas' || app.status === filter;
    const matchesSearch = app.petName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         app.service.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const statusTypes = [
    { value: 'todas', label: 'Todas' },
    { value: 'confirmada', label: 'Confirmadas' },
    { value: 'completada', label: 'Completadas' },
    { value: 'cancelada', label: 'Canceladas' }
  ];

  return (
    <div className="all-appointments-container">
      <div className="appointments-header">
        <button className="back-button" onClick={() => navigate('/usuario')}>
          ← Volver al menú
        </button>
        <h1>Historial de Citas</h1>
      </div>

      <div className="controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar citas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span>🔍</span>
        </div>

        <div className="filter-buttons">
          {statusTypes.map(status => (
            <button
              key={status.value}
              className={`filter-button ${filter === status.value ? 'active' : ''}`}
              onClick={() => setFilter(status.value)}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>

      {filteredAppointments.length === 0 ? (
        <div className="no-results">
          <p>No se encontraron citas</p>
          <button 
            className="new-appointment-button"
            onClick={() => navigate('/nueva-cita')}
          >
            Agendar Nueva Cita
          </button>
        </div>
      ) : (
        <div className="appointments-table">
          <div className="table-header">
            <div>Fecha</div>
            <div>Mascota</div>
            <div>Servicio</div>
            <div>Estado</div>
            <div>Acciones</div>
          </div>

          {filteredAppointments.map(app => (
            <div key={app.id} className={`table-row ${app.status}`}>
              <div className="date-cell">
                <div className="date">{app.date}</div>
                <div className="time">{app.time}</div>
              </div>
              <div className="pet-cell">{app.petName}</div>
              <div className="service-cell">{app.service}</div>
              <div className="status-cell">
                <span className={`status-badge ${app.status}`}>
                  {app.status === 'confirmada' ? 'Confirmada' : 
                   app.status === 'completada' ? 'Completada' : 'Cancelada'}
                </span>
              </div>
              <div className="actions-cell">
                {app.status === 'confirmada' && (
                  <>
                    <button 
                      className="action-button"
                      onClick={() => navigate(`/reagendar-cita/${app.id}`)}
                    >
                      Reagendar
                    </button>
                    <button 
                      className="action-button cancel"
                      onClick={() => onCancelAppointment(app.id)}
                    >
                      Cancelar
                    </button>
                  </>
                )}
                <button 
                  className="action-button details"
                  onClick={() => navigate(`/cita/${app.id}`)}
                >
                  Detalles
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AllAppointments;