import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Styles/AdminTables.css';

const MeetingManagement = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const response = await axios.get('/api/admin/meetings');
        setMeetings(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching meetings:', error);
        setLoading(false);
      }
    };

    fetchMeetings();
  }, []);

  if (loading) return <div>Cargando reuniones...</div>;

  return (
    <div className="management-container">
      <h2>Gestión de Reuniones</h2>
      <table className="management-table">
        <thead>
          <tr>
            <th>Título</th>
            <th>Fecha</th>
            <th>Participantes</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {meetings.map(meeting => (
            <tr key={meeting.id}>
              <td>{meeting.title}</td>
              <td>{new Date(meeting.date).toLocaleString()}</td>
              <td>{meeting.participants.join(', ')}</td>
              <td>
                <button className="edit-btn">Editar</button>
                <button className="delete-btn">Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MeetingManagement;