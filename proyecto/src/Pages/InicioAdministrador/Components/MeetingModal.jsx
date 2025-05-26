import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "../Styles/MeetingModal.css";

const MeetingModal = ({ onClose }) => {
  const [meeting, setMeeting] = useState({
    title: '',
    date: '',
    time: '',
    description: ''
  });
  const [vets, setVets] = useState([]);
  const [selectedVets, setSelectedVets] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchVets = async () => {
      try {
        const response = await axios.get('http://localhost:5000/admin/users?role=veterinario');
        setVets(response.data);
      } catch (error) {
        console.error('Error fetching vets:', error);
      }
    };
    
    fetchVets();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMeeting(prev => ({ ...prev, [name]: value }));
  };

  const handleVetSelection = (vetId) => {
    setSelectedVets(prev => 
      prev.includes(vetId) 
        ? prev.filter(id => id !== vetId) 
        : [...prev, vetId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);
    
    try {
      await axios.post('http://localhost:5000/admin/meetings', {
        ...meeting,
        participants: selectedVets
      });
      
      setMessage('Reunión programada correctamente');
      setTimeout(() => {
        onClose();
        setMessage('');
      }, 2000);
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      setMessage('Error al programar la reunión');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="meeting-modal">
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>Programar Reunión con Veterinarios</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Título:</label>
            <input
              type="text"
              name="title"
              value={meeting.title}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Fecha:</label>
              <input
                type="date"
                name="date"
                value={meeting.date}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Hora:</label>
              <input
                type="time"
                name="time"
                value={meeting.time}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Descripción:</label>
            <textarea
              name="description"
              value={meeting.description}
              onChange={handleInputChange}
              rows="4"
            />
          </div>
          
          <div className="form-group">
            <label>Veterinarios:</label>
            <div className="vets-list">
              {vets.map(vet => (
                <div key={vet.id} className="vet-checkbox">
                  <input
                    type="checkbox"
                    id={`vet-${vet.id}`}
                    checked={selectedVets.includes(vet.id)}
                    onChange={() => handleVetSelection(vet.id)}
                  />
                  <label htmlFor={`vet-${vet.id}`}>
                    {vet.nombre} {vet.apellido}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          {message && <div className="modal-message">{message}</div>}
          
          <div className="modal-actions">
            <button 
              type="button" 
              className="cancel-btn"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="confirm-btn"
              disabled={isSending}
            >
              {isSending ? 'Enviando...' : 'Programar Reunión'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MeetingModal;