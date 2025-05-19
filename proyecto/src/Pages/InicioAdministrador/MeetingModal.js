import React, { useState, useEffect } from 'react';
import '../Styles/InicioAdministrador.css';

const MeetingModal = ({ meeting, staff, onClose, onSave, isEditing }) => {
  const [editedMeeting, setEditedMeeting] = useState(meeting || {
    title: '',
    date: '',
    time: '',
    participants: [],
    agenda: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!meeting) {
      // Set default time to next hour
      const now = new Date();
      const nextHour = new Date(now.setHours(now.getHours() + 1, 0, 0, 0));
      
      const timeString = nextHour.toTimeString().substring(0, 5);
      const dateString = nextHour.toISOString().substring(0, 10);
      
      setEditedMeeting(prev => ({
        ...prev,
        date: dateString,
        time: timeString
      }));
    }
  }, [meeting]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedMeeting(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleParticipantChange = (id, isChecked) => {
    setEditedMeeting(prev => {
      const participants = [...prev.participants];
      if (isChecked) {
        participants.push(id);
      } else {
        const index = participants.indexOf(id);
        if (index > -1) {
          participants.splice(index, 1);
        }
      }
      return { ...prev, participants };
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!editedMeeting.title) newErrors.title = 'El título es requerido';
    if (!editedMeeting.date) newErrors.date = 'La fecha es requerida';
    if (!editedMeeting.time) newErrors.time = 'La hora es requerida';
    if (editedMeeting.participants.length === 0) newErrors.participants = 'Selecciona al menos un participante';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSave(editedMeeting);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3>{isEditing ? 'Editar Reunión' : 'Programar Nueva Reunión'}</h3>
          <button onClick={onClose} className="modal-close-btn">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Título:</label>
            <input
              type="text"
              name="title"
              value={editedMeeting.title}
              onChange={handleChange}
              className={errors.title ? 'input-error' : ''}
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Fecha:</label>
              <input
                type="date"
                name="date"
                value={editedMeeting.date}
                onChange={handleChange}
                className={errors.date ? 'input-error' : ''}
              />
              {errors.date && <span className="error-message">{errors.date}</span>}
            </div>
            
            <div className="form-group">
              <label>Hora:</label>
              <input
                type="time"
                name="time"
                value={editedMeeting.time}
                onChange={handleChange}
                className={errors.time ? 'input-error' : ''}
              />
              {errors.time && <span className="error-message">{errors.time}</span>}
            </div>
          </div>
          
          <div className="form-group">
            <label>Participantes:</label>
            <div className="participants-list">
              {staff.filter(s => s.role === 'veterinario' || s.role === 'admin').map(person => (
                <div key={person.id} className="participant-checkbox">
                  <input
                    type="checkbox"
                    id={`participant-${person.id}`}
                    checked={editedMeeting.participants.includes(person.id)}
                    onChange={(e) => handleParticipantChange(person.id, e.target.checked)}
                  />
                  <label htmlFor={`participant-${person.id}`}>
                    {person.nombre} {person.apellido} ({person.role === 'admin' ? 'Administrador' : 'Veterinario'})
                  </label>
                </div>
              ))}
            </div>
            {errors.participants && <span className="error-message">{errors.participants}</span>}
          </div>
          
          <div className="form-group">
            <label>Agenda:</label>
            <textarea
              name="agenda"
              value={editedMeeting.agenda}
              onChange={handleChange}
              placeholder="Describe los temas a tratar en la reunión..."
            />
          </div>
          
          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              {isEditing ? 'Actualizar Reunión' : 'Programar Reunión'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MeetingModal;