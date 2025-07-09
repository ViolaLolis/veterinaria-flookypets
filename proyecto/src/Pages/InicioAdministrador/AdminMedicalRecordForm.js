import React, { useState, useEffect, useCallback } from 'react';
import { FaSave, FaTimes, FaSpinner } from 'react-icons/fa';
import { validateField } from '../../utils/validation';
import Modal from '../../Components/Modal';
import Notification from '../../Components/Notification';
import './Styles/AdminMedicalRecordForm.css'; // Asumo que este CSS es genérico para formularios admin

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const AdminMedicalRecordForm = ({ isOpen, onClose, record, onSaveSuccess }) => {
    const [formData, setFormData] = useState({
        id_mascota: '',
        fecha_consulta: '', // Formato 'YYYY-MM-DDTHH:mm' para input datetime-local
        diagnostico: '',
        tratamiento: '',
        observaciones: '',
        veterinario: '', // ID del veterinario
        peso_actual: '',
        temperatura: '',
        proxima_cita: '', // Formato 'YYYY-MM-DDTHH:mm' para input datetime-local
    });
    const [formErrors, setFormErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState(null);
    const [mascotas, setMascotas] = useState([]);
    const [veterinarios, setVeterinarios] = useState([]);
    const [isLoadingDependencies, setIsLoadingDependencies] = useState(false);

    const getAuthToken = () => {
        return localStorage.getItem('token');
    };

    const authFetch = useCallback(async (url, options = {}) => {
        const token = getAuthToken();
        if (!token) {
            setNotification({ message: 'No se encontró token de autenticación. Por favor, inicia sesión de nuevo.', type: 'error' });
            throw new Error('No se encontró token de autenticación');
        }

        const defaultHeaders = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        const response = await fetch(url, {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers,
            },
        });

        if (response.status === 401 || response.status === 403) {
            setNotification({ message: 'Sesión expirada o no autorizado. Por favor, inicia sesión de nuevo.', type: 'error' });
            throw new Error('No autorizado');
        }

        if (!response.ok) {
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error del servidor: ${response.status}`);
            } else {
                const text = await response.text();
                console.error("Response was not JSON:", text);
                setNotification({ message: `Error del servidor: Respuesta inesperada. Estado: ${response.status}. Detalles: ${text.substring(0, 100)}...`, type: 'error' });
                throw new Error("Respuesta del servidor no es JSON");
            }
        }

        return response;
    }, []);

    // Load dependencies (mascotas, veterinarios)
    useEffect(() => {
        const fetchDependencies = async () => {
            setIsLoadingDependencies(true);
            try {
                const [mascotasRes, vetsRes] = await Promise.allSettled([
                    authFetch(`${API_BASE_URL}/mascotas`),
                    authFetch(`${API_BASE_URL}/usuarios/veterinarios`)
                ]);

                if (mascotasRes.status === 'fulfilled' && mascotasRes.value.ok) {
                    const data = await mascotasRes.value.json();
                    if (data.success) setMascotas(data.data);
                    else setNotification(prev => prev || { message: data.message || 'Error al cargar mascotas.', type: 'error' });
                } else if (mascotasRes.status === 'rejected') {
                    setNotification(prev => prev || { message: `Error al cargar mascotas: ${mascotasRes.reason?.message || 'Error desconocido'}`, type: 'error' });
                }

                if (vetsRes.status === 'fulfilled' && vetsRes.value.ok) {
                    const data = await vetsRes.value.json();
                    if (data.success) setVeterinarios(data.data);
                    else setNotification(prev => prev || { message: data.message || 'Error al cargar veterinarios.', type: 'error' });
                } else if (vetsRes.status === 'rejected') {
                    setNotification(prev => prev || { message: `Error al cargar veterinarios: ${vetsRes.reason?.message || 'Error desconocido'}`, type: 'error' });
                }

            } catch (err) {
                console.error('Error general al cargar dependencias:', err);
                setNotification(prev => prev || { message: 'Error inesperado al cargar datos necesarios.', type: 'error' });
            } finally {
                setIsLoadingDependencies(false);
            }
        };

        if (isOpen) {
            fetchDependencies();
        }
    }, [isOpen, authFetch]);

    // Load record data if in edit mode
    useEffect(() => {
        if (isOpen) {
            if (record) {
                // Formatear fechas para el input datetime-local
                const formatForInput = (dateString) => {
                    if (!dateString) return '';
                    const date = new Date(dateString);
                    return isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 16);
                };

                setFormData({
                    id_mascota: record.id_mascota || '',
                    fecha_consulta: formatForInput(record.fecha_consulta),
                    diagnostico: record.diagnostico || '',
                    tratamiento: record.tratamiento || '',
                    observaciones: record.observaciones || '',
                    veterinario: record.veterinario_id || '', // Usar veterinario_id si viene del backend
                    peso_actual: record.peso_actual || '',
                    temperatura: record.temperatura || '',
                    proxima_cita: formatForInput(record.proxima_cita),
                });
            } else {
                // Reset form for new record
                setFormData({
                    id_mascota: '',
                    fecha_consulta: '',
                    diagnostico: '',
                    tratamiento: '',
                    observaciones: '',
                    veterinario: '',
                    peso_actual: '',
                    temperatura: '',
                    proxima_cita: '',
                });
            }
            setFormErrors({});
            setNotification(null);
        }
    }, [record, isOpen]);

    // Handle form changes
    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        let newValue = value;

        // Convertir IDs numéricos si no están vacíos
        if (['id_mascota', 'veterinario'].includes(name)) {
            newValue = value !== '' ? parseInt(value, 10) : '';
        }
        // Para campos numéricos como peso y temperatura, asegúrate de que sean números
        if (['peso_actual', 'temperatura'].includes(name)) {
            newValue = value !== '' ? parseFloat(value) : '';
        }

        setFormData(prev => ({ ...prev, [name]: newValue }));

        // Validate field in real-time
        const validationError = validateField(name, newValue);
        setFormErrors(prev => ({ ...prev, [name]: validationError }));
    }, []);

    // Handle blur to show errors when leaving a field
    const handleBlur = useCallback((e) => {
        const { name, value } = e.target;
        let currentValue = value;
        // Convertir IDs numéricos si no están vacíos para la validación onBlur
        if (['id_mascota', 'veterinario'].includes(name)) {
            currentValue = value !== '' ? parseInt(value, 10) : '';
        }
        if (['peso_actual', 'temperatura'].includes(name)) {
            currentValue = value !== '' ? parseFloat(value) : '';
        }
        const validationError = validateField(name, currentValue);
        setFormErrors(prev => ({ ...prev, [name]: validationError }));
    }, []);

    // Submit form (add or update)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setNotification(null);

        // Validate all fields before submitting
        let errors = {};
        let hasErrors = false;

        const fieldsToValidate = [
            'id_mascota', 'fecha_consulta', 'diagnostico', 'tratamiento', 'veterinario'
        ];

        for (const field of fieldsToValidate) {
            const errorMsg = validateField(field, formData[field]);
            if (errorMsg) {
                errors[field] = errorMsg;
                hasErrors = true;
            }
        }

        setFormErrors(errors);

        if (hasErrors) {
            setIsSubmitting(false);
            setNotification({ message: 'Por favor, corrige los errores del formulario antes de enviar.', type: 'error' });
            return;
        }

        try {
            const dataToSend = { ...formData };

            // Formatear fechas a ISO string antes de enviar al backend
            if (dataToSend.fecha_consulta) {
                const date = new Date(dataToSend.fecha_consulta);
                dataToSend.fecha_consulta = isNaN(date.getTime()) ? null : date.toISOString();
            } else {
                dataToSend.fecha_consulta = null;
            }
            if (dataToSend.proxima_cita) {
                const date = new Date(dataToSend.proxima_cita);
                dataToSend.proxima_cita = isNaN(date.getTime()) ? null : date.toISOString();
            } else {
                dataToSend.proxima_cita = null;
            }

            let responseData;
            if (record) {
                // Update medical record
                const response = await authFetch(`${API_BASE_URL}/historial_medico/${record.id_historial}`, {
                    method: 'PUT',
                    body: JSON.stringify(dataToSend),
                });
                responseData = await response.json();
            } else {
                // Create new medical record
                const response = await authFetch(`${API_BASE_URL}/historial_medico`, {
                    method: 'POST',
                    body: JSON.stringify(dataToSend),
                });
                responseData = await response.json();
            }

            if (responseData.success) {
                setNotification({ message: responseData.message, type: 'success' });
                onSaveSuccess(); // Notify parent component to reload the list
                onClose(); // Close the modal
            } else {
                setNotification({ message: responseData.message || 'Error al guardar el historial médico. Intenta de nuevo.', type: 'error' });
            }
        } catch (err) {
            console.error('Error al enviar el formulario de historial médico:', err);
            setNotification({ message: `Error al guardar el historial médico: ${err.message || 'Error desconocido'}`, type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getMascotaDisplay = (id) => {
        const mascota = mascotas.find(m => m.id_mascota === parseInt(id));
        return mascota ? `${mascota.nombre} (${mascota.especie})` : '';
    };

    const getVeterinarioDisplay = (id) => {
        const veterinario = veterinarios.find(v => v.id === parseInt(id));
        return veterinario ? `${veterinario.nombre} ${veterinario.apellido}` : '';
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={record ? "Editar Historial Médico" : "Registrar Nuevo Historial Médico"}>
            {notification && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}
            {isLoadingDependencies ? (
                <div className="loading-state">
                    <FaSpinner className="spinner" /> Cargando datos necesarios...
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="admin-form">
                    <div className="form-grid">
                        {/* Mascota */}
                        <div className="form-group">
                            <label htmlFor="id_mascota">Mascota:</label>
                            {record ? (
                                <input
                                    type="text"
                                    id="mascota_display"
                                    value={getMascotaDisplay(formData.id_mascota)}
                                    className="input-disabled"
                                    disabled
                                />
                            ) : (
                                <select
                                    id="id_mascota"
                                    name="id_mascota"
                                    value={formData.id_mascota}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={formErrors.id_mascota ? 'input-error' : ''}
                                    disabled={isSubmitting || isLoadingDependencies}
                                >
                                    <option value="">Selecciona una mascota</option>
                                    {mascotas.map(mascota => (
                                        <option key={mascota.id_mascota} value={mascota.id_mascota}>
                                            {mascota.nombre} ({mascota.especie}) - Propietario: {mascota.propietario_nombre}
                                        </option>
                                    ))}
                                </select>
                            )}
                            {formErrors.id_mascota && <span className="error-text">{formErrors.id_mascota}</span>}
                        </div>

                        {/* Fecha de Consulta */}
                        <div className="form-group">
                            <label htmlFor="fecha_consulta">Fecha de Consulta:</label>
                            <input
                                type="datetime-local"
                                id="fecha_consulta"
                                name="fecha_consulta"
                                value={formData.fecha_consulta}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={formErrors.fecha_consulta ? 'input-error' : ''}
                                disabled={isSubmitting}
                            />
                            {formErrors.fecha_consulta && <span className="error-text">{formErrors.fecha_consulta}</span>}
                        </div>

                        {/* Diagnóstico */}
                        <div className="form-group full-width">
                            <label htmlFor="diagnostico">Diagnóstico:</label>
                            <textarea
                                id="diagnostico"
                                name="diagnostico"
                                value={formData.diagnostico}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={formErrors.diagnostico ? 'input-error' : ''}
                                rows="3"
                                disabled={isSubmitting}
                            ></textarea>
                            {formErrors.diagnostico && <span className="error-text">{formErrors.diagnostico}</span>}
                        </div>

                        {/* Tratamiento */}
                        <div className="form-group full-width">
                            <label htmlFor="tratamiento">Tratamiento:</label>
                            <textarea
                                id="tratamiento"
                                name="tratamiento"
                                value={formData.tratamiento}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={formErrors.tratamiento ? 'input-error' : ''}
                                rows="3"
                                disabled={isSubmitting}
                            ></textarea>
                            {formErrors.tratamiento && <span className="error-text">{formErrors.tratamiento}</span>}
                        </div>

                        {/* Observaciones */}
                        <div className="form-group full-width">
                            <label htmlFor="observaciones">Observaciones:</label>
                            <textarea
                                id="observaciones"
                                name="observaciones"
                                value={formData.observaciones}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={formErrors.observaciones ? 'input-error' : ''}
                                rows="3"
                                disabled={isSubmitting}
                            ></textarea>
                            {formErrors.observaciones && <span className="error-text">{formErrors.observaciones}</span>}
                        </div>

                        {/* Veterinario */}
                        <div className="form-group">
                            <label htmlFor="veterinario">Veterinario:</label>
                            <select
                                id="veterinario"
                                name="veterinario"
                                value={formData.veterinario}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={formErrors.veterinario ? 'input-error' : ''}
                                disabled={isSubmitting || isLoadingDependencies}
                            >
                                <option value="">Selecciona un veterinario</option>
                                {veterinarios.map(vet => (
                                    <option key={vet.id} value={vet.id}>
                                        {vet.nombre} {vet.apellido}
                                    </option>
                                ))}
                            </select>
                            {formErrors.veterinario && <span className="error-text">{formErrors.veterinario}</span>}
                        </div>

                        {/* Peso Actual */}
                        <div className="form-group">
                            <label htmlFor="peso_actual">Peso Actual (kg):</label>
                            <input
                                type="number"
                                id="peso_actual"
                                name="peso_actual"
                                value={formData.peso_actual}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={formErrors.peso_actual ? 'input-error' : ''}
                                disabled={isSubmitting}
                                step="0.01"
                            />
                            {formErrors.peso_actual && <span className="error-text">{formErrors.peso_actual}</span>}
                        </div>

                        {/* Temperatura */}
                        <div className="form-group">
                            <label htmlFor="temperatura">Temperatura (°C):</label>
                            <input
                                type="number"
                                id="temperatura"
                                name="temperatura"
                                value={formData.temperatura}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={formErrors.temperatura ? 'input-error' : ''}
                                disabled={isSubmitting}
                                step="0.1"
                            />
                            {formErrors.temperatura && <span className="error-text">{formErrors.temperatura}</span>}
                        </div>

                        {/* Próxima Cita */}
                        <div className="form-group">
                            <label htmlFor="proxima_cita">Próxima Cita:</label>
                            <input
                                type="datetime-local"
                                id="proxima_cita"
                                name="proxima_cita"
                                value={formData.proxima_cita}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={formErrors.proxima_cita ? 'input-error' : ''}
                                disabled={isSubmitting}
                            />
                            {formErrors.proxima_cita && <span className="error-text">{formErrors.proxima_cita}</span>}
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? <FaSpinner className="spinner" /> : <FaSave />} {record ? 'Actualizar Historial' : 'Registrar Historial'}
                        </button>
                        <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>
                            <FaTimes /> Cancelar
                        </button>
                    </div>
                </form>
            )}
        </Modal>
    );
};

export default AdminMedicalRecordForm;
