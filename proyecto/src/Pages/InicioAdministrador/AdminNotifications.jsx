import React, { useState } from 'react';
import './Styles/AdminNotifications.css';

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'Nuevo usuario registrado', read: false, date: '2023-11-01' },
    { id: 2, message: 'Cita cancelada', read: true, date: '2023-10-30' },
  ]);

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  return (
    <div className="notifications-container">
      <h2>Notificaciones</h2>
      <div className="notifications-list">
        {notifications.map(notification => (
          <div 
            key={notification.id} 
            className={`notification ${notification.read ? 'read' : 'unread'}`}
            onClick={() => markAsRead(notification.id)}
          >
            <p>{notification.message}</p>
            <span>{notification.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminNotifications;