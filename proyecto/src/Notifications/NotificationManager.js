// src/Components/NotificationBox/NotificationManager.js
import React, { useState, useCallback } from 'react';
import NotificationBox from './NotificationBox';
import './NotificationBox.css'; // Asegúrate de importar el CSS aquí también

/**
 * Componente para gestionar y mostrar múltiples notificaciones.
 *
 * @param {object} props - Las propiedades del componente.
 * @param {'top-right'|'top-left'} [props.position='top-right'] - Posición de las notificaciones.
 */
const NotificationManager = ({ position = 'top-right' }) => {
  const [notifications, setNotifications] = useState([]);
  const [nextId, setNextId] = useState(0); // Para generar IDs únicos

  /**
   * Añade una nueva notificación a la lista.
   * @param {'success'|'error'|'info'|'warning'} type - Tipo de notificación.
   * @param {string} message - Mensaje de la notificación.
   * @param {number} [duration=5000] - Duración en ms (0 para persistente).
   */
  const addNotification = useCallback((type, message, duration = 5000) => {
    const newId = nextId;
    setNextId(prevId => prevId + 1);

    const newNotification = {
      id: newId,
      type,
      message,
      duration,
      position // Pasa la posición a la notificación individual
    };

    setNotifications(prevNotifications => [...prevNotifications, newNotification]);
  }, [nextId, position]);

  /**
   * Elimina una notificación de la lista por su ID.
   * @param {string} id - ID de la notificación a eliminar.
   */
  const removeNotification = useCallback((id) => {
    setNotifications(prevNotifications => prevNotifications.filter(notif => notif.id !== id));
  }, []);

  // Puedes exponer `addNotification` a través de un Context API si necesitas
  // que otros componentes lo usen sin pasar props manualmente.
  // Por simplicidad, aquí lo mostramos como un componente independiente.

  return (
    // El contenedor principal que define la posición
    <div className={`notification-container ${position}`}>
      {notifications.map(notif => (
        <NotificationBox
          key={notif.id}
          id={notif.id}
          type={notif.type}
          message={notif.message}
          duration={notif.duration}
          position={notif.position} // Pasa la posición para la animación
          onClose={removeNotification}
        />
      ))}
    </div>
  );
};

export default NotificationManager;
