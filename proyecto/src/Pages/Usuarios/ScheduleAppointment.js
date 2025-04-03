import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import "../Styles/ScheduleAppointment.css";

function ScheduleAppointment() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    petId: '',
    service: location.state?.service || '',
    date: '',
    time: '',
    notes: ''
  });

  // Datos de ejemplo (en una app real vendrían de props o API)
  const pets = [
    { id: 1, name: "Max", type: "Perro" },
    { id: 2, name: "Luna", type: "Gato" }
  ];

  const services = [
    "Consulta General",
    "Vacunación",
    "Estética",
    "Cirugía",
    "Odontología"
  ];

  const availableHours = [
    "9:00 AM", "10:00 AM", "11:00 AM", 
    "2:00 PM", "3:00 PM", "4:00 PM"
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí iría la lógica para guardar en la API
    console.log('Cita agendada:', formData);
    navigate('/usuario');
  };

  return (
    <div className="schedule-appointment-container">
      <h2>Agendar Nueva Cita</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Mascota</label>
          <select
            name="petId"
            value={formData.petId}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione una mascota</option>
            {pets.map(pet => (
              <option key={pet.id} value={pet.id}>
                {pet.name} ({pet.type})
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label>Servicio</label>
          <select
            name="service"
            value={formData.service}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione un servicio</option>
            {services.map(service => (
              <option key={service} value={service}>{service}</option>
            ))}
          </select>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Fecha</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Hora</label>
            <select
              name="time"
              value={formData.time}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione una hora</option>
              {availableHours.map(hour => (
                <option key={hour} value={hour}>{hour}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="form-group">
          <label>Notas adicionales (opcional)</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
          />
        </div>
        
        <div className="form-actions">
          <button type="button" className="cancel-button" onClick={() => navigate('/usuario')}>
            Cancelar
          </button>
          <button type="submit" className="confirm-button">
            Confirmar Cita
          </button>
        </div>
      </form>
    </div>
  );
}

export default ScheduleAppointment;