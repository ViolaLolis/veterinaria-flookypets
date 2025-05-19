import React, { useState, useEffect } from 'react';
import './Styles/InicioAdministrador.css';

const Meetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    date: '',
    time: '',
    participants: [],
    agenda: ''
  });
  const [staff, setStaff] = useState([]);

  useEffect(() => {
    // Simular carga de datos
    setStaff([
      { id: 1, nombre: 'Carlos', apellido: 'Veterinario', role: 'veterinario' },
      { id: 2, nombre: 'Laura', apellido: 'Gómez', role: 'veterinario' },
      { id: 3, nombre: 'Admin', apellido: 'Principal', role: 'admin' }
    ]);
    
    setMeetings([
      { 
        id: 1, 
        title: 'Reunión mensual', 
        date: '2023-06-15', 
        time: '15:00', 
        participants: [1, 2], 
        agenda: 'Revisión de métricas y planificación' 
      },
      { 
        id: 2, 
        title: 'Capacitación nuevos protocolos', 
        date: '2023-06-20', 
        time: '10:00', 
        participants: [1, 2, 3], 
        agenda: 'Capacitación sobre nuevos protocolos sanitarios' 
      }
    ]);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMeeting(prev => ({ ...prev, [name]: value }));
  };

  const handleParticipantChange = (id, isChecked) => {
    setNewMeeting(prev => {
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

  const handleAddMeeting = () => {
    if (!newMeeting.title || !newMeeting.date || !newMeeting.time) return;
    
    const newId = meetings.length > 0 ? Math.max(...meetings.map(m => m.id)) + 1 : 1;
    
    setMeetings([...meetings, {
      id: newId,
      ...newMeeting
    }]);
    
    setNewMeeting({
      title: '',
      date: '',
      time: '',
      participants: [],
      agenda: ''
    });
  };

  const handleDeleteMeeting = (id) => {
    setMeetings(meetings.filter(m => m.id !== id));
  };

  return (
    <div className="management-container">
      <h1>Reuniones con Veterinarios</h1>
      
      <div className="form-container">
        <h2>Programar Nueva Reunión</h2>
        
        <div className="form-group">
          <label>Título:</label>
          <input 
            type="text" 
            name="title" 
            value={newMeeting.title}
            onChange={handleInputChange}
          />
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Fecha:</label>
            <input 
              type="date" 
              name="date" 
              value={newMeeting.date}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="form-group">
            <label>Hora:</label>
            <input 
              type="time" 
              name="time" 
              value={newMeeting.time}
              onChange={handleInputChange}
            />
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
                  checked={newMeeting.participants.includes(person.id)}
                  onChange={(e) => handleParticipantChange(person.id, e.target.checked)}
                />
                <label htmlFor={`participant-${person.id}`}>
                  {person.nombre} {person.apellido} ({person.role === 'admin' ? 'Administrador' : 'Veterinario'})
                </label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="form-group">
          <label>Agenda:</label>
          <textarea 
            name="agenda" 
            value={newMeeting.agenda}
            onChange={handleInputChange}
          />
        </div>
        
        <div className="form-actions">
          <button onClick={handleAddMeeting} className="btn-primary">
            Programar Reunión
          </button>
        </div>
      </div>
      
      <div className="list-container">
        <h2>Reuniones Programadas</h2>
        {meetings.length === 0 ? (
          <p>No hay reuniones programadas</p>
        ) : (
          <div className="meetings-list">
            {meetings.map(meeting => (
              <div key={meeting.id} className="meeting-card">
                <h3>{meeting.title}</h3>
                <p><strong>Fecha:</strong> {meeting.date} a las {meeting.time}</p>
                
                <div className="meeting-participants">
                  <strong>Participantes:</strong>
                  <ul>
                    {meeting.participants.map(pid => {
                      const person = staff.find(s => s.id === pid);
                      return person ? (
                        <li key={pid}>{person.nombre} {person.apellido}</li>
                      ) : null;
                    })}
                  </ul>
                </div>
                
                <div className="meeting-agenda">
                  <strong>Agenda:</strong>
                  <p>{meeting.agenda}</p>
                </div>
                
                <div className="meeting-actions">
                  <button className="btn-start">Iniciar Reunión</button>
                  <button 
                    onClick={() => handleDeleteMeeting(meeting.id)}
                    className="btn-delete"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Meetings;