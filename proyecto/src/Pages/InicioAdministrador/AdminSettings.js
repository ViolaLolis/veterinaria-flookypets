// src/Pages/InicioAdministrador/AdminSettings.js
import React, { useState, useCallback, useEffect } from 'react';
import { FaCog, FaSave, FaSpinner, FaInfoCircle } from 'react-icons/fa';
import { authFetch } from '../../utils/api'; // Ruta ajustada
import { validateField } from '../../utils/validation'; // Importa la función de validación
import './Styles/AdminSettings.css'; // Ruta relativa al CSS
import { useNotifications } from '../../Notifications/NotificationContext'; // Ruta ajustada

function AdminSettings({ user }) {
    const [settings, setSettings] = useState({
        nombre_clinica: '',
        direccion_clinica: '',
        telefono_clinica: '',
        email_clinica: '',
        horario_atencion: '',
        politica_cancelacion: '',
        notificaciones_activas: true, // Nuevo campo para configuración de notificaciones
        sonido_notificacion: 'default', // Nuevo campo
        recordatorios_cita: true, // Nuevo campo
        intervalo_recordatorio: '30 minutos' // Nuevo campo
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [formErrors, setFormErrors] = useState({});
    const { addNotification } = useNotifications(); // Usa el hook de notificaciones

    // Función para cargar la configuración actual
    // NOTA: Necesitas un endpoint en tu backend para obtener y guardar esta configuración.
    // Asumo un endpoint '/admin/settings' para GET y PUT.
    const fetchSettings = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const responseData = await authFetch('/admin/settings'); // Ajusta este endpoint si es diferente
            if (responseData.success && responseData.data) {
                setSettings(responseData.data);
            } else {
                addNotification('error', responseData.message || 'Error al cargar la configuración.', 5000);
                // Si no hay configuración en la DB, inicializa con valores por defecto o vacíos
                setSettings({
                    nombre_clinica: '',
                    direccion_clinica: '',
                    telefono_clinica: '',
                    email_clinica: '',
                    horario_atencion: '',
                    politica_cancelacion: '',
                    notificaciones_activas: true,
                    sonido_notificacion: 'default',
                    recordatorios_cita: true,
                    intervalo_recordatorio: '30 minutos'
                });
            }
        } catch (err) {
            setError(`Error de conexión al cargar la configuración: ${err.message}`);
            addNotification('error', `Error de conexión: ${err.message}`, 5000);
            console.error('Error fetching settings:', err);
            // Si hay un error de conexión, inicializa con valores por defecto
            setSettings({
                nombre_clinica: '',
                direccion_clinica: '',
                telefono_clinica: '',
                email_clinica: '',
                horario_atencion: '',
                politica_cancelacion: '',
                notificaciones_activas: true,
                sonido_notificacion: 'default',
                recordatorios_cita: true,
                intervalo_recordatorio: '30 minutos'
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
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;

        setSettings(prev => ({ ...prev, [name]: newValue }));

        // Validar el campo individualmente al cambiar
        const errorMessage = validateField(name, newValue, { ...settings, [name]: newValue }, false);
        setFormErrors(prev => ({ ...prev, [name]: errorMessage }));
    }, [settings]);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        // Validar todos los campos antes de enviar
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
            const response = await authFetch('/admin/settings', { // Ajusta este endpoint si es diferente
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

                <fieldset className="form-section mt-6">
                    <legend>Configuración de Notificaciones</legend>
                    <div className="form-group-checkbox">
                        <input
                            type="checkbox"
                            id="notificaciones_activas"
                            name="notificaciones_activas"
                            checked={settings.notificaciones_activas}
                            onChange={handleFormChange}
                            disabled={isSubmitting}
                        />
                        <label htmlFor="notificaciones_activas">Activar Notificaciones Globales</label>
                    </div>
                    <div className="form-group">
                        <label htmlFor="sonido_notificacion">Sonido de Notificación</label>
                        <select
                            id="sonido_notificacion"
                            name="sonido_notificacion"
                            value={settings.sonido_notificacion}
                            onChange={handleFormChange}
                            disabled={isSubmitting}
                        >
                            <option value="default">Por defecto</option>
                            <option value="bell">Campana</option>
                            <option value="chime">Timbre</option>
                            <option value="none">Ninguno</option>
                        </select>
                        {formErrors.sonido_notificacion && <p className="error-message-inline">{formErrors.sonido_notificacion}</p>}
                    </div>
                    <div className="form-group-checkbox">
                        <input
                            type="checkbox"
                            id="recordatorios_cita"
                            name="recordatorios_cita"
                            checked={settings.recordatorios_cita}
                            onChange={handleFormChange}
                            disabled={isSubmitting}
                        />
                        <label htmlFor="recordatorios_cita">Enviar Recordatorios de Citas</label>
                    </div>
                    <div className="form-group">
                        <label htmlFor="intervalo_recordatorio">Intervalo de Recordatorio</label>
                        <select
                            id="intervalo_recordatorio"
                            name="intervalo_recordatorio"
                            value={settings.intervalo_recordatorio}
                            onChange={handleFormChange}
                            disabled={isSubmitting || !settings.recordatorios_cita}
                        >
                            <option value="15 minutos">15 minutos antes</option>
                            <option value="30 minutos">30 minutos antes</option>
                            <option value="1 hora">1 hora antes</option>
                            <option value="24 horas">24 horas antes</option>
                        </select>
                        {formErrors.intervalo_recordatorio && <p className="error-message-inline">{formErrors.intervalo_recordatorio}</p>}
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
