// src/Components/NotificationBox/NotificationBox.js
import React, { useEffect, useState } from 'react';
import './NotificationBox.css'; // Importa los estilos
import { FaCheckCircle, FaTimesCircle, FaInfoCircle, FaExclamationTriangle } from 'react-icons/fa'; // Iconos

/**
 * Componente individual para mostrar una notificación.
 *
 * @param {object} props - Las propiedades del componente.
 * @param {string} props.id - ID único de la notificación.
 * @param {'success'|'error'|'info'|'warning'} props.type - Tipo de notificación para aplicar estilos.
 * @param {string} props.message - Mensaje a mostrar en la notificación.
 * @param {function} props.onClose - Función a llamar cuando la notificación se cierra.
 * @param {number} [props.duration=5000] - Duración en milisegundos antes de que la notificación se cierre automáticamente (0 para persistente).
 * @param {'top-right'|'top-left'} [props.position='top-right'] - Posición de la notificación.
 */
const NotificationBox = ({ id, type, message, onClose, duration = 5000, position = 'top-right' }) => {
  const [animationClass, setAnimationClass] = useState('');

  useEffect(() => {
    // Determinar la clase de animación de entrada basada en la posición
    if (position === 'top-right') {
      setAnimationClass('notification-enter-right');
    } else {
      setAnimationClass('notification-enter-left');
    }

    // Si la duración es mayor que 0, programar el cierre automático
    if (duration > 0) {
      const timer = setTimeout(() => {
        setAnimationClass('notification-exit'); // Inicia la animación de salida
        setTimeout(() => onClose(id), 500); // Espera a que termine la animación antes de remover
      }, duration);
      return () => clearTimeout(timer); // Limpiar el temporizador si el componente se desmonta o se cierra manualmente
    }
  }, [id, duration, onClose, position]);

  // Función para obtener el icono según el tipo de notificación
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FaCheckCircle />;
      case 'error':
        return <FaTimesCircle />;
      case 'info':
        return <FaInfoCircle />;
      case 'warning':
        return <FaExclamationTriangle />;
      default:
        return null;
    }
  };

  const handleCloseClick = () => {
    setAnimationClass('notification-exit'); // Inicia la animación de salida
    setTimeout(() => onClose(id), 500); // Espera a que termine la animación antes de remover
  };

  return (
    <div className={`notification-box ${type} ${animationClass}`}>
      <span className="notification-icon">{getIcon()}</span>
      <p className="notification-message">{message}</p>
      <button className="notification-close-btn" onClick={handleCloseClick} aria-label="Cerrar notificación">
        &times; {/* Símbolo de "x" */}
      </button>
    </div>
  );
};

export default NotificationBox;
