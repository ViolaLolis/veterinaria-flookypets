// src/Components/Admin/AdminMedicalRecordForm.js
import React, { useState, useEffect, useCallback } from 'react';
import { FaSave, FaTimes, FaSpinner } from 'react-icons/fa';
import { validateField } from '../../utils/validation';
import '../Styles/AdminStyles.css'; // Asegúrate de que los estilos sean adecuados
import Modal from '../../utils/Modal'; // Asumo que tienes un componente Modal
import Notification from '../../utils/Notification'; // Asumo que tienes un componente Notification

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const AdminMedicalRecordForm = ({ isOpen, onClose, record, onSaveSuccess }) => {
    const [formData, setFormData] = useState({
        id_mascota: '',
        fecha_consulta: '',
        veterinario: '',
        diagnostico: '',
        tratamiento: '',
        observaciones: '',
        peso_actual: '',
        temperatura: '',
        proxima_cita: ''
    });
    const [formErrors, setFormErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState(null);
    const [mascotas, setMascotas] = useState([]);
    const [veterinarios, setVeterinarios] = useState([]);
    const [selectedMascotaName, setSelectedMascotaName] = useState(''); // Para mostrar el nombre de la mascota
    const [selectedVeterinarioName, setSelectedVeterinarioName] = useState(''); // Para mostrar el nombre del veterinario

    // Función para obtener el token de autenticación
    const getAuthToken = () => {
        return localStorage.getItem('token');
    };

    // Función mejorada para hacer fetch con autenticación
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

        return response;
    }, []);

    // Cargar datos del registro si está en modo edición
    useEffect(() => {
        if (record) {
            setFormData({
                id_mascota: record.id_mascota || '',
                fecha_consulta: record.fecha_consulta ? new Date(record.fecha_consulta).toISOString().slice(0, 16) : '',
                veterinario: record.veterinario || '',
                diagnostico: record.diagnostico || '',
                tratamiento: record.tratamiento || '',
                observaciones: record.observaciones || '',
                peso_actual: record.peso_actual || '',
                temperatura: record.temperatura || '',
                proxima_cita: record.proxima_cita ? new Date(record.proxima_cita).toISOString().slice(0, 10) : ''
            });
            setSelectedMascotaName(record.mascota_nombre || '');
            setSelectedVeterinarioName(record.veterinario_nombre || '');
        } else {
            // Resetear formulario para nuevo registro
            setFormData({
                id_mascota: '',
                fecha_consulta: '',
                veterinario: '',
                diagnostico: '',
                tratamiento: '',
                observaciones: '',
                peso_actual: '',
                temperatura: '',
                proxima_cita: ''
            });
            setSelectedMascotaName('');
            setSelectedVeterinarioName('');
        }
        setFormErrors({});
        setNotification(null);
    }, [record, isOpen]); // Dependencia de isOpen para resetear al abrir/cerrar

    // Cargar mascotas y veterinarios
    useEffect(() => {
        const fetchDependencies = async () => {
            try {
                const [mascotasRes, vetsRes] = await Promise.all([
                    authFetch(`${API_BASE_URL}/mascotas`),
                    authFetch(`${API_BASE_URL}/usuarios/veterinarios`)
                ]);

                const mascotasData = await mascotasRes.json();
                const vetsData = await vetsRes.json();

                if (mascotasData.success) {
                    setMascotas(mascotasData.data);
                } else {
                    setNotification({ message: mascotasData.message || 'Error al cargar mascotas.', type: 'error' });
                }

                if (vetsData.success) {
                    setVeterinarios(vetsData.data);
                } else {
                    setNotification({ message: vetsData.message || 'Error al cargar veterinarios.', type: 'error' });
                }
            } catch (err) {
                console.error('Error fetching dependencies:', err);
                setNotification({ message: 'Error al cargar datos necesarios (mascotas/veterinarios).', type: 'error' });
            }
        };

        if (isOpen) { // Solo cargar cuando el modal está abierto
            fetchDependencies();
        }
    }, [isOpen, authFetch]);

    // Manejar cambios en el formulario
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Validar campo en tiempo real
        const validationError = validateField(`${name}_historial`, value, formData, !record);
        setFormErrors(prev => ({ ...prev, [name]: validationError }));

        // Actualizar nombre de mascota/veterinario si se selecciona del dropdown
        if (name === 'id_mascota') {
            const selectedPet = mascotas.find(m => m.id_mascota === parseInt(value));
            setSelectedMascotaName(selectedPet ? `${selectedPet.nombre} (${selectedPet.especie})` : '');
        }
        if (name === 'veterinario') {
            const selectedVet = veterinarios.find(v => v.id === parseInt(value));
            setSelectedVeterinarioName(selectedVet ? `${selectedVet.nombre} ${selectedVet.apellido}` : '');
        }
    };

    // Manejar blur para mostrar errores al salir del campo
    const handleBlur = (e) => {
        const { name, value } = e.target;
        const validationError = validateField(`${name}_historial`, value, formData, !record);
        setFormErrors(prev => ({ ...prev, [name]: validationError }));
    };

    // Enviar formulario (añadir o actualizar)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setNotification(null);

        // Validar todos los campos antes de enviar
        let errors = {};
        let hasErrors = false;

        const fieldsToValidate = [
            'id_mascota', 'fecha_consulta', 'veterinario', 'diagnostico',
            'tratamiento', 'observaciones', 'peso_actual', 'temperatura', 'proxima_cita'
        ];

        for (const field of fieldsToValidate) {
            const errorMsg = validateField(`${field}_historial`, formData[field], formData, !record);
            if (errorMsg) {
                errors[field] = errorMsg;
                hasErrors = true;
            }
        }

        setFormErrors(errors);

        if (hasErrors) {
            setIsSubmitting(false);
            setNotification({ message: 'Por favor, corrige los errores del formulario.', type: 'error' });
            return;
        }

        try {
            let response;
            if (record) {
                // Actualizar historial médico
                response = await authFetch(`${API_BASE_URL}/historial_medico/${record.id_historial}`, {
                    method: 'PUT',
                    body: JSON.stringify(formData),
                });
            } else {
                // Crear nuevo historial médico
                response = await authFetch(`${API_BASE_URL}/historial_medico`, {
                    method: 'POST',
                    body: JSON.stringify(formData),
                });
            }

            const data = await response.json();

            if (data.success) {
                setNotification({ message: data.message, type: 'success' });
                onSaveSuccess(); // Notificar al componente padre para recargar la lista
                onClose(); // Cerrar el modal
            } else {
                setNotification({ message: data.message || 'Error al guardar el historial médico.', type: 'error' });
            }
        } catch (err) {
            console.error('Error saving medical record:', err);
            setNotification({ message: 'Error al conectar con el servidor para guardar el historial médico.', type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={record ? "Editar Historial Médico" : "Registrar Historial Médico"}>
            {notification && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}
            <form onSubmit={handleSubmit} className="admin-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="id_mascota">Mascota:</label>
                        {record ? (
                            // En modo edición, mostrar el nombre de la mascota como texto plano o input deshabilitado
                            <input
                                type="text"
                                id="mascota_display"
                                value={selectedMascotaName || (mascotas.find(m => m.id_mascota === formData.id_mascota)?.nombre + ' (' + mascotas.find(m => m.id_mascota === formData.id_mascota)?.especie + ')') || ''}
                                className="input-disabled"
                                disabled
                            />
                        ) : (
                            // En modo creación, permitir seleccionar la mascota
                            <select
                                id="id_mascota"
                                name="id_mascota"
                                value={formData.id_mascota}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={formErrors.id_mascota ? 'input-error' : ''}
                                disabled={isSubmitting}
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

                    <div className="form-group">
                        <label htmlFor="fecha_consulta">Fecha y Hora de Consulta:</label>
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

                    <div className="form-group">
                        <label htmlFor="veterinario">Veterinario Asignado:</label>
                        <select
                            id="veterinario"
                            name="veterinario"
                            value={formData.veterinario}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={formErrors.veterinario ? 'input-error' : ''}
                            disabled={isSubmitting}
                        >
                            <option value="">Selecciona un veterinario</option>
                            {veterinarios.map(vet => (
                                <option key={vet.id} value={vet.id}>
                                    {vet.nombre} {vet.apellido} ({vet.email})
                                </option>
                            ))}
                        </select>
                        {formErrors.veterinario && <span className="error-text">{formErrors.veterinario}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="diagnostico">Diagnóstico:</label>
                        <textarea
                            id="diagnostico"
                            name="diagnostico"
                            value={formData.diagnostico}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={formErrors.diagnostico ? 'input-error' : ''}
                            disabled={isSubmitting}
                        ></textarea>
                        {formErrors.diagnostico && <span className="error-text">{formErrors.diagnostico}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="tratamiento">Tratamiento:</label>
                        <textarea
                            id="tratamiento"
                            name="tratamiento"
                            value={formData.tratamiento}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={formErrors.tratamiento ? 'input-error' : ''}
                            disabled={isSubmitting}
                        ></textarea>
                        {formErrors.tratamiento && <span className="error-text">{formErrors.tratamiento}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="observaciones">Observaciones:</label>
                        <textarea
                            id="observaciones"
                            name="observaciones"
                            value={formData.observaciones}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={formErrors.observaciones ? 'input-error' : ''}
                            disabled={isSubmitting}
                        ></textarea>
                        {formErrors.observaciones && <span className="error-text">{formErrors.observaciones}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="peso_actual">Peso Actual (kg):</label>
                        <input
                            type="number"
                            step="0.01"
                            id="peso_actual"
                            name="peso_actual"
                            value={formData.peso_actual}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={formErrors.peso_actual ? 'input-error' : ''}
                            disabled={isSubmitting}
                        />
                        {formErrors.peso_actual && <span className="error-text">{formErrors.peso_actual}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="temperatura">Temperatura (°C):</label>
                        <input
                            type="number"
                            step="0.01"
                            id="temperatura"
                            name="temperatura"
                            value={formData.temperatura}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={formErrors.temperatura ? 'input-error' : ''}
                            disabled={isSubmitting}
                        />
                        {formErrors.temperatura && <span className="error-text">{formErrors.temperatura}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="proxima_cita">Próxima Cita:</label>
                        <input
                            type="date"
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
        </Modal>
    );
};

export default AdminMedicalRecordForm;
