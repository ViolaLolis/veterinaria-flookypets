import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import "../Styles/MedicalHistory.css";

function MedicalHistory() {
  const location = useLocation();
  const navigate = useNavigate();
  const { pet } = location.state || {};

  if (!pet) {
    return (
      <div className="medical-history-container">
        <h1>Historial Médico no disponible</h1>
        <button onClick={() => navigate('/usuario')}>Volver</button>
      </div>
    );
  }

  return (
    <div className="medical-history-container">
      <div className="header">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Volver
        </button>
        <h1>Historial Médico de {pet.name}</h1>
      </div>
      
      <div className="pet-info">
        <div className="pet-avatar">
          {pet.type === 'Perro' ? '🐶' : '🐱'}
        </div>
        <div>
          <h2>{pet.name}</h2>
          <p><strong>Raza:</strong> {pet.breed}</p>
          <p><strong>Edad:</strong> {pet.age} años</p>
        </div>
      </div>
      
      <div className="medical-records">
        <h2>Registros Médicos</h2>
        
        {pet.medicalHistory?.length > 0 ? (
          <div className="records-list">
            {pet.medicalHistory.map((record, index) => (
              <div key={index} className="record-card">
                <div className="record-date">
                  {new Date(record.date).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </div>
                <div className="record-details">
                  <h3>{record.description}</h3>
                  {record.vet && <p><strong>Veterinario:</strong> {record.vet}</p>}
                  {record.diagnosis && <p><strong>Diagnóstico:</strong> {record.diagnosis}</p>}
                  {record.treatment && <p><strong>Tratamiento:</strong> {record.treatment}</p>}
                  {record.notes && <p><strong>Notas:</strong> {record.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-records">
            <p>No hay registros médicos disponibles</p>
          </div>
        )}
      </div>
      
      <div className="vaccine-records">
        <h2>Registro de Vacunas</h2>
        {/* Aquí iría el componente específico para vacunas */}
      </div>
      
      <button 
        className="print-button"
        onClick={() => window.print()}
      >
        Imprimir Historial
      </button>
    </div>
  );
}

export default MedicalHistory;