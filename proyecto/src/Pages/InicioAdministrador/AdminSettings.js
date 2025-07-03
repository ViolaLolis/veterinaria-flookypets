// src/Pages/InicioAdministrador/AdminSettings.js
import React, { useState, useCallback, useEffect } from 'react';
import { FaCog, FaSave, FaSpinner, FaInfoCircle } from 'react-icons/fa';
import { authFetch } from './api'; // Asegúrate de que la ruta sea correcta
import './Styles/AdminSettings.css'; // Asegúrate de que este CSS exista
import { useNotifications } from '../../Notifications/NotificationContext'; // Importa el hook de notificaciones

function AdminSettings({ user }) {
    const [settings, setSettings] = useState({
        nombre_clinica: '',
        direccion_clinica: '',
        telefono_clinica: '',
        email_clinica: '',
        horario_atencion: '',
        politica_cancelacion: ''
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const { addNotification } = useNotifications(); // Usa el hook de notificaciones

    // Función para cargar la configuración actual (simulado, ya que no tienes un endpoint de settings aún)
    const fetchSettings = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            // *** NOTA IMPORTANTE: Necesitarás un endpoint en tu backend para obtener la configuración. ***
            // Por ahora, simulamos datos o los inicializamos vacíos.
            // Ejemplo: const responseData = await authFetch('/admin/settings');
            // if (responseData.success) { setSettings(responseData.data); }
            // else { addNotification('error', responseData.message || 'Error al cargar la configuración.', 5000); }

            // Simulando carga de datos para evitar errores si el endpoint no existe
            setSettings({
                nombre_clinica: 'Flooky Pets Central',
                direccion_clinica: 'Calle Ficticia 123, Soacha',
                telefono_clinica: '+57 300 123 4567',
                email_clinica: 'info@flookypets.com',
                horario_atencion: 'Lunes a Viernes: 9 AM - 6 PM, Sábados: 9 AM - 1 PM',
                politica_cancelacion: 'Las cancelaciones deben realizarse con al menos 24 horas de anticipación.'
            });
            addNotification('info', 'Configuración cargada (datos simulados).', 3000);

        } catch (err) {
            setError(`Error de conexión al cargar la configuración: ${err.message}`);
            addNotification('error', `Error de conexión: ${err.message}`, 5000);
            console.error('Error fetching settings:', err);
        } finally {
            setIsLoading(false);
        }
    }, [addNotification]);

    useEffect(() => {
        if (user && user.token) {
            fetchSettings();
        } else {
            setError('No autorizado. Por favor, inicie sesión.');
            setIsLoading(false);
        }
    }, [user, fetchSettings]);

    const handleFormChange = useCallback((e) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            // *** NOTA IMPORTANTE: Necesitarás un endpoint en tu backend para guardar la configuración. ***
            // Ejemplo:
            // const response = await authFetch('/admin/settings', {
            //     method: 'PUT',
            //     body: settings
            // });
            // if (response.success) {
            //     addNotification('success', response.message || 'Configuración actualizada correctamente.', 5000);
            // } else {
            //     addNotification('error', response.message || 'Error al actualizar la configuración.', 5000);
            // }

            // Simulando éxito
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simula una llamada a la API
            addNotification('success', 'Configuración actualizada correctamente (simulado).', 5000);

        } catch (err) {
            addNotification('error', `Error de conexión: ${err.message}`, 5000);
            console.error("Error submitting settings form:", err);
        } finally {
            setIsSubmitting(false);
        }
    }, [settings, addNotification]);

    if (isLoading) {
        return (
            <div className="admin-loading">
                <div className="loading-spinner">
                    <FaSpinner className="spinner-icon" />
                </div>
                <p>Cargando configuración...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-message">
                <FaInfoCircle className="info-icon" />
                {error}
                <p>Asegúrate de que el backend esté corriendo y los endpoints de API estén accesibles y funcionando correctamente.</p>
            </div>
        );
    }

    return (
        <div className="admin-content-container">
            <div className="admin-content-header">
                <h2>
                    <FaCog className="header-icon" />
                    Configuración del Sistema
                </h2>
            </div>

            <form onSubmit={handleSubmit} className="admin-settings-form">
                <div className="form-group">
                    <label htmlFor="nombre_clinica">Nombre de la Clínica</label>
                    <input
                        type="text"
                        id="nombre_clinica"
                        name="nombre_clinica"
                        value={settings.nombre_clinica}
                        onChange={handleFormChange}
                        disabled={isSubmitting}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="direccion_clinica">Dirección de la Clínica</label>
                    <input
                        type="text"
                        id="direccion_clinica"
                        name="direccion_clinica"
                        value={settings.direccion_clinica}
                        onChange={handleFormChange}
                        disabled={isSubmitting}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="telefono_clinica">Teléfono de la Clínica</label>
                    <input
                        type="text"
                        id="telefono_clinica"
                        name="telefono_clinica"
                        value={settings.telefono_clinica}
                        onChange={handleFormChange}
                        disabled={isSubmitting}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="email_clinica">Email de la Clínica</label>
                    <input
                        type="email"
                        id="email_clinica"
                        name="email_clinica"
                        value={settings.email_clinica}
                        onChange={handleFormChange}
                        disabled={isSubmitting}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="horario_atencion">Horario de Atención</label>
                    <textarea
                        id="horario_atencion"
                        name="horario_atencion"
                        value={settings.horario_atencion}
                        onChange={handleFormChange}
                        disabled={isSubmitting}
                    ></textarea>
                </div>
                <div className="form-group">
                    <label htmlFor="politica_cancelacion">Política de Cancelación</label>
                    <textarea
                        id="politica_cancelacion"
                        name="politica_cancelacion"
                        value={settings.politica_cancelacion}
                        onChange={handleFormChange}
                        disabled={isSubmitting}
                    ></textarea>
                </div>
                <button type="submit" className="submit-btn" disabled={isSubmitting}>
                    {isSubmitting ? <FaSpinner className="spinner-icon" /> : <FaSave />} Guardar Configuración
                </button>
            </form>
        </div>
    );
}

export default AdminSettings;
