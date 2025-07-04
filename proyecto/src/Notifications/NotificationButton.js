// src/Components/Notifications/NotificationButton.js
import React, { useEffect, useState, useCallback } from 'react';
import { FaBell, FaSpinner } from 'react-icons/fa';
import { useNotifications } from '../../Notifications/NotificationContext'; // Ajusta la ruta si es necesario
// import '../Styles/NotificationButton.css'; // Crea este archivo CSS para los estilos del botón

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const NotificationButton = ({ user }) => {
    const { notifications, fetchNotifications, toggleNotificationDisplay, unreadCount } = useNotifications();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch notifications when the component mounts or user changes
    useEffect(() => {
        if (user && user.id) {
            setIsLoading(true);
            setError(null);
            fetchNotifications(user.id, user.role)
                .catch(err => {
                    console.error("Error fetching notifications in NotificationButton:", err);
                    setError("Error al cargar notificaciones.");
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [user, fetchNotifications]);

    const handleClick = () => {
        toggleNotificationDisplay();
    };

    if (!user) {
        return null; // Don't render if no user is logged in
    }

    return (
        <div className="notification-button-container">
            <button
                className="notification-button"
                onClick={handleClick}
                disabled={isLoading}
                title="Ver Notificaciones"
            >
                {isLoading ? (
                    <FaSpinner className="spinner" />
                ) : (
                    <FaBell />
                )}
                {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                )}
            </button>
            {error && <div className="notification-button-error">{error}</div>}
        </div>
    );
};

export default NotificationButton;