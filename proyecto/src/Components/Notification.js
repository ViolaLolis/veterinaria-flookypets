// src/Components/Utils/Notification.js
import React, { useEffect, useRef } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';
// import '../../Styles/Notification.css'; // Asegúrate de que esta ruta sea correcta si tienes estilos personalizados

const Notification = ({ notification, onClose, duration = 5000 }) => {
    // Declaración de Hooks incondicionalmente al principio del componente
    const timerRef = useRef(null);

    // Extrae message y type del objeto notification de forma segura
    // Serán undefined si notification es null/undefined, lo cual es manejado por el useEffect y la renderización.
    const message = notification?.message;
    const type = notification?.type;

    useEffect(() => {
        // Limpiar cualquier temporizador existente cuando se actualiza el componente
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        // Solo configurar el temporizador si hay una notificación con mensaje,
        // onClose es una función válida, y la duración es mayor que 0.
        if (notification && message && onClose && typeof onClose === 'function' && duration > 0) {
            timerRef.current = setTimeout(() => {
                onClose();
            }, duration);
        }

        // Función de limpieza: se ejecuta cuando el componente se desmonta o antes de cada re-renderizado
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [notification, message, onClose, duration]); // Dependencias para re-ejecutar el efecto

    // Condición de renderizado: solo renderiza el JSX si existe un objeto notification y tiene un mensaje.
    // Esta verificación se realiza después de que todos los Hooks han sido llamados.
    if (!notification || !notification.message) {
        return null;
    }

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <FaCheckCircle className="notification-icon success-icon" />;
            case 'error':
                return <FaExclamationCircle className="notification-icon error-icon" />;
            case 'info':
                return <FaInfoCircle className="notification-icon info-icon" />;
            default:
                return null;
        }
    };

    const notificationClass = `notification-container ${type}`;

    return (
        <div className={notificationClass} role="alert">
            <div className="notification-content">
                {getIcon()}
                <p className="notification-message">{message}</p>
            </div>
            {/* Solo renderizar el botón de cerrar si onClose es una función válida */}
            {onClose && typeof onClose === 'function' && (
                <button className="notification-close-btn" onClick={onClose} aria-label="Cerrar notificación">
                    <FaTimes />
                </button>
            )}
        </div>
    );
};

export default Notification;