import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import "../Styles/PetDetail.css";

function PetDetail({ pets, onDeletePet, onEditPet }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const pet = pets.find(p => p.id === parseInt(id));

  if (!pet) {
    return (
      <div className="pet-not-found">
        <h2>Mascota no encontrada</h2>
        <button onClick={() => navigate('/usuario')}>Volver al menú</button>
      </div>
    );
  }

  return (
    <div className="pet-detail-container">
      <div className="pet-header">
        <button className="back-button" onClick={() => navigate('/usuario')}>
          ← Volver a Mis Mascotas
        </button>
        <div className="pet-title">
          <span className="pet-emoji">{pet.type === 'Perro' ? '🐶' : '🐱'}</span>
          <h1>{pet.name}</h1>
        </div>
      </div>

      <div className="pet-info-grid">
        <div className="pet-info-card">
          <h3>Información Básica</h3>
          <div className="info-item">
            <span className="info-label">Tipo:</span>
            <span className="info-value">{pet.type}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Raza:</span>
            <span className="info-value">{pet.breed || 'No especificada'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Edad:</span>
            <span className="info-value">{pet.age} años</span>
          </div>
          <div className="info-item">
            <span className="info-label">Peso:</span>
            <span className="info-value">{pet.weight || 'No registrado'}</span>
          </div>
        </div>

        <div className="pet-info-card">
          <h3>Historial Médico</h3>
          {pet.medicalHistory?.length > 0 ? (
            <ul className="medical-history-list">
              {pet.medicalHistory.map((item, index) => (
                <li key={index}>
                  <span className="history-date">{item.date}</span>
                  <span className="history-description">{item.description}</span>
                  {item.vet && <span className="history-vet">Dr. {item.vet}</span>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-history">No hay historial médico registrado</p>
          )}
          <button 
            className="add-history-button"
            onClick={() => navigate(`/mascota/${pet.id}/nuevo-registro`)}
          >
            + Añadir Registro
          </button>
        </div>

        <div className="pet-info-card">
          <h3>Próximas Citas</h3>
          {pet.upcomingAppointments?.length > 0 ? (
            <ul className="appointments-list">
              {pet.upcomingAppointments.map(app => (
                <li key={app.id}>
                  <span className="app-date">{app.date}</span>
                  <span className="app-service">{app.service}</span>
                  <button 
                    className="app-action"
                    onClick={() => navigate(`/cita/${app.id}`)}
                  >
                    Ver
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-appointments">No hay citas programadas</p>
          )}
          <button 
            className="schedule-button"
            onClick={() => navigate('/nueva-cita', { state: { petId: pet.id } })}>Agendar Nueva Cita
          </button>
        </div>
      </div>

      <div className="pet-actions">
        <button 
          className="edit-button"
          onClick={() => navigate(`/editar-mascota/${pet.id}`)}
        >
          Editar Información
        </button>
        <button 
          className="delete-button"
          onClick={() => {
            if (window.confirm(`¿Estás seguro de eliminar a ${pet.name}?`)) {
              onDeletePet(pet.id);
              navigate('/usuario');
            }
          }}
        >
          Eliminar Mascota
        </button>
      </div>
    </div>
  );
}

export default PetDetail;