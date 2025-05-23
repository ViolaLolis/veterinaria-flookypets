import React from 'react';
import './Styles/InicioAdministrador.css';

const RecentActivity = () => {
  const activities = [
    { id: 1, type: 'new_user', user: 'Dr. Martínez', time: '10 min ago', action: 'se registró' },
    { id: 2, type: 'new_appointment', user: 'Juan Pérez', time: '25 min ago', action: 'agendó una cita' },
    { id: 3, type: 'service_update', user: 'Administrador', time: '1 hora ago', action: 'actualizó el servicio de Vacunación' },
    { id: 4, type: 'meeting', user: 'Equipo veterinario', time: '2 horas ago', action: 'tuvo una reunión' },
    { id: 5, type: 'new_pet', user: 'María Gómez', time: '3 horas ago', action: 'registró a su mascota' }
  ];

  const getActivityIcon = (type) => {
    switch(type) {
      case 'new_user': return '👤';
      case 'new_appointment': return '📅';
      case 'service_update': return '🔄';
      case 'meeting': return '👥';
      case 'new_pet': return '🐶';
      default: return '🔔';
    }
  };

  return (
    <div className="recent-activity-container">
      <h3>Actividad Reciente</h3>
      <ul className="activity-list">
        {activities.map(activity => (
          <li key={activity.id} className="activity-item">
            <span className="activity-icon">{getActivityIcon(activity.type)}</span>
            <div className="activity-details">
              <span className="activity-user">{activity.user}</span>
              <span className="activity-action">{activity.action}</span>
              <span className="activity-time">{activity.time}</span>
            </div>
          </li>
        ))}
      </ul>
      <button className="view-all-btn">Ver toda la actividad</button>
    </div>
  );
};

export default RecentActivity;