// src/Pages/InicioAdministrador/AdminSettings.js
import React, { useState, useCallback, useEffect } from 'react';
import { FaCog, FaSave, FaSpinner, FaInfoCircle } from 'react-icons/fa';
import { authFetch } from '../../utils/api';
import { validateField } from '../../utils/validation';
import './Styles/AdminSettings.css'; // Make sure this path is correct
import { useNotifications } from '../../Notifications/NotificationContext'; // Make sure this path is correct

function AdminSettings({ user }) {
    const [settings, setSettings] = useState({
        nombre_clinica: '',
        direccion_clinica: '',
        telefono_clinica: '',
        email_clinica: '',
        horario_atencion: '',
        politica_cancelacion: '',
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [formErrors, setFormErrors] = useState({});
    const { addNotification } = useNotifications();

    const fetchSettings = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const responseData = await authFetch('/admin/settings');
            if (responseData.success && responseData.data) {
                // Filter out any extra fields that might come from the backend if not used in this form
                const {
                    notificaciones_activas, // Removed from UI
                    sonido_notificacion,    // Removed from UI
                    recordatorios_cita,     // Removed from UI
                    intervalo_recordatorio, // Removed from UI
                    ...restSettings // Capture only the settings relevant to this form
                } = responseData.data;
                setSettings(restSettings);
            } else {
                addNotification('error', responseData.message || 'Error al cargar la configuración.', 5000);
                // If no configuration is found, initialize with empty values
                setSettings({
                    nombre_clinica: '',
                    direccion_clinica: '',
                    telefono_clinica: '',
                    email_clinica: '',
                    horario_atencion: '',
                    politica_cancelacion: '',
                });
            }
        } catch (err) {
            setError(`Error de conexión al cargar la configuración: ${err.message}`);
            addNotification('error', `Error de conexión: ${err.message}`, 5000);
            console.error('Error fetching settings:', err);
            // If there's a connection error, initialize with empty values
            setSettings({
                nombre_clinica: '',
                direccion_clinica: '',
                telefono_clinica: '',
                email_clinica: '',
                horario_atencion: '',
                politica_cancelacion: '',
            });
        } finally {
            setIsLoading(false);
        }
    }, [authFetch, addNotification]);

    useEffect(() => {
        if (user && user.token) {
            fetchSettings();
        } else {
            setError('No autorizado. Por favor, inicie sesión.');
            setIsLoading(false);
        }
    }, [user, fetchSettings]);

    const handleFormChange = useCallback((e) => {
        const { name, value } = e.target; // No more checkboxes, so simplified

        setSettings(prev => ({ ...prev, [name]: value }));

        // Validate the field individually on change
        const errorMessage = validateField(name, value, { ...settings, [name]: value }, false);
        setFormErrors(prev => ({ ...prev, [name]: errorMessage }));
    }, [settings]);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        // Validate all fields before submitting
        let errors = {};
        Object.keys(settings).forEach(key => {
            const errorMessage = validateField(key, settings[key], settings, false);
            if (errorMessage) {
                errors[key] = errorMessage;
            }
        });

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            addNotification('error', 'Por favor, corrige los errores en el formulario.', 5000);
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await authFetch('/admin/settings', { // Adjust this endpoint if different
                method: 'PUT',
                body: settings
            });
            if (response.success) {
                addNotification('success', response.message || 'Configuración actualizada correctamente.', 5000);
            } else {
                addNotification('error', response.message || 'Error al actualizar la configuración.', 5000);
            }
        } catch (err) {
            addNotification('error', `Error de conexión: ${err.message}`, 5000);
            console.error("Error submitting settings form:", err);
        } finally {
            setIsSubmitting(false);
        }
    }, [settings, authFetch, addNotification]);

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
                <fieldset className="form-section">
                    <legend>Información de la Clínica</legend>
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
                        {formErrors.nombre_clinica && <p className="error-message-inline">{formErrors.nombre_clinica}</p>}
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
                        {formErrors.direccion_clinica && <p className="error-message-inline">{formErrors.direccion_clinica}</p>}
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
                        {formErrors.telefono_clinica && <p className="error-message-inline">{formErrors.telefono_clinica}</p>}
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
                        {formErrors.email_clinica && <p className="error-message-inline">{formErrors.email_clinica}</p>}
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
                        {formErrors.horario_atencion && <p className="error-message-inline">{formErrors.horario_atencion}</p>}
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
                        {formErrors.politica_cancelacion && <p className="error-message-inline">{formErrors.politica_cancelacion}</p>}
                    </div>
                </fieldset>

                <button type="submit" className="submit-btn" disabled={isSubmitting}>
                    {isSubmitting ? <FaSpinner className="spinner-icon" /> : <FaSave />} Guardar Configuración
                </button>
            </form>
        </div>
    );
}

export default AdminSettings;