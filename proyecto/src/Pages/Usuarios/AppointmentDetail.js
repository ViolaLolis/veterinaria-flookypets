import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import "../Styles/AppointmentDetail.css";

function AppointmentDetail({ appointments, pets, onCancelAppointment }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const appointment = appointments.find(a => a.id === parseInt(id));
  const pet = pets.find(p => p.id === appointment?.petId);

  if (!appointment) {
    return (
      <div className="appointment-not-found">
        <h2>Cita no encontrada</h2>
        <button onClick={() => navigate('/usuario')}>Volver al menú</button>
      </div>
    );
  }

  return (
    <div className="appointment-detail-container">
      <div className="appointment-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Volver
        </button>
        <h1>Detalle de Cita</h1>
      </div>

      <div className="appointment-info">
        <div className="info-section">
          <h2>Información de la Cita</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Fecha:</span>
              <span className="info-value">{appointment.date}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Hora:</span>
              <span className="info-value">{appointment.time}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Servicio:</span>
              <span className="info-value">{appointment.service}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Estado:</span>
              <span className={`info-value status-${appointment.status}`}>
                {appointment.status === 'confirmada' ? 'Confirmada' : 
                 appointment.status === 'completada' ? 'Completada' : 'Cancelada'}
              </span>
            </div>
            {appointment.notes && (
              <div className="info-item full-width">
                <span className="info-label">Notas:</span>
                <span className="info-value">{appointment.notes}</span>
              </div>
            )}
          </div>
        </div>

        <div className="info-section">
          <h2>Información de la Mascota</h2>
          {pet ? (
            <div className="pet-info">
              <div className="pet-avatar">
                {pet.type === 'Perro' ? '🐶' : '🐱'}
              </div>
              <div className="pet-details">
                <h3>{pet.name}</h3>
                <p><strong>Raza:</strong> {pet.breed}</p>
                <p><strong>Edad:</strong> {pet.age} años</p>
                <button 
                  className="view-pet-button"
                  onClick={() => navigate(`/mascota/${pet.id}`)}
                >
                  Ver perfil completo
                </button>
              </div>
            </div>
          ) : (
            <p>Mascota no encontrada</p>
          )}
        </div>
      </div>

      <div className="appointment-actions">
        {appointment.status === 'confirmada' && (
          <>
            <button 
              className="action-button reschedule"
              onClick={() => navigate(`/reagendar-cita/${appointment.id}`)}
            >
              Reagendar Cita
            </button>
            <button 
              className="action-button cancel"
              onClick={() => {
                if (window.confirm('¿Estás seguro de cancelar esta cita?')) {
                  onCancelAppointment(appointment.id);
                  navigate('/usuario');
                }
              }}
            >
              Cancelar Cita
            </button>
          </>
        )}
        <button 
          className="action-button back"
          onClick={() => navigate('/usuario')}
        >
          Volver al Menú
        </button>
      </div>
    </div>
  );
}

export default AppointmentDetail;