// src/Components/Utils/Notification.js
import React, { useEffect, useRef } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';
// import '../../Styles/Notification.css'; // You'll need to create this CSS file

const Notification = ({ message, type, onClose, duration = 5000 }) => {
    const timerRef = useRef(null);

    useEffect(() => {
        // Clear any existing timer when message or type changes
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        if (duration > 0) {
            timerRef.current = setTimeout(() => {
                onClose();
            }, duration);
        }

        // Cleanup function to clear timer on unmount
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [message, type, onClose, duration]);

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
            <button className="notification-close-btn" onClick={onClose} aria-label="Cerrar notificación">
                <FaTimes />
            </button>
        </div>
    );
};

export default Notification;
