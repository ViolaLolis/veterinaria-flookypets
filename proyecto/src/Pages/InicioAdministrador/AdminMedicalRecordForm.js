import React, { useState, useEffect, useCallback } from 'react';
import { FaSave, FaTimes, FaSpinner } from 'react-icons/fa';
import { validateField } from '../../utils/validation';
import Modal from '../../Components//Modal';
import Notification from '../../Components//Notification';
import './Styles/AdminMedicalRecordForm.css'; // Asumo que este CSS es genérico para formularios admin

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const AdminAppointmentForm = ({ isOpen, onClose, appointment, onSaveSuccess }) => {
    const [formData, setFormData] = useState({
        id_cliente: '',
        id_mascota: '',
        id_servicio: '',
        id_veterinario: '',
        fecha_cita: '',
        notas_adicionales: '',
        estado: 'PENDIENTE' // Default to PENDIENTE
    });
    const [formErrors, setFormErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState(null);
    const [clientes, setClientes] = useState([]);
    const [mascotas, setMascotas] = useState([]); // All pets
    const [servicios, setServicios] = useState([]);
    const [veterinarios, setVeterinarios] = useState([]);
    const [filteredMascotas, setFilteredMascotas] = useState([]); // Mascotas filtered by selected client
    const [isLoadingDependencies, setIsLoadingDependencies] = useState(false); // Nuevo estado de carga

    // Function to get authentication token
    const getAuthToken = () => {
        return localStorage.getItem('token');
    };

    // Enhanced fetch function with authentication
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

        // Si la respuesta no es OK, pero no es 401/403, intentamos leer el mensaje de error del backend
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error del servidor: ${response.status}`);
        }

        return response;
    }, []);

    // Load appointment data if in edit mode
    useEffect(() => {
        if (appointment) {
            setFormData({
                id_cliente: appointment.id_cliente || '',
                id_mascota: appointment.id_mascota || '',
                id_servicio: appointment.id_servicio || '',
                id_veterinario: appointment.id_veterinario || '',
                fecha_cita: appointment.fecha_cita ? new Date(appointment.fecha_cita).toISOString().slice(0, 16) : '',
                notas_adicionales: appointment.notas_adicionales || '',
                estado: appointment.estado ? appointment.estado.toUpperCase() : 'PENDIENTE' // Ensure uppercase
            });
        } else {
            // Reset form for new appointment
            setFormData({
                id_cliente: '',
                id_mascota: '',
                id_servicio: '',
                id_veterinario: '',
                fecha_cita: '',
                notas_adicionales: '',
                estado: 'PENDIENTE'
            });
        }
        setFormErrors({});
        setNotification(null);
    }, [appointment, isOpen]);

    // Load clients, all pets, services, and veterinarians
    useEffect(() => {
        const fetchDependencies = async () => {
            setIsLoadingDependencies(true); // Inicia la carga
            try {
                const [clientesRes, mascotasRes, serviciosRes, vetsRes] = await Promise.allSettled([ // Usamos allSettled para que una falla no detenga las otras
                    authFetch(`${API_BASE_URL}/usuarios`), // Endpoint para usuarios clientes
                    authFetch(`${API_BASE_URL}/mascotas`), // Todas las mascotas
                    authFetch(`${API_BASE_URL}/servicios`),
                    authFetch(`${API_BASE_URL}/usuarios/veterinarios`)
                ]);

                // Manejo de resultados individuales
                if (clientesRes.status === 'fulfilled' && clientesRes.value.ok) {
                    const data = await clientesRes.value.json();
                    if (data.success) setClientes(data.data);
                    else setNotification(prev => prev || { message: data.message || 'Error al cargar clientes.', type: 'error' });
                } else if (clientesRes.status === 'rejected') {
                    setNotification(prev => prev || { message: `Error al cargar clientes: ${clientesRes.reason?.message || 'Error desconocido'}`, type: 'error' });
                }

                if (mascotasRes.status === 'fulfilled' && mascotasRes.value.ok) {
                    const data = await mascotasRes.value.json();
                    if (data.success) setMascotas(data.data);
                    else setNotification(prev => prev || { message: data.message || 'Error al cargar mascotas.', type: 'error' });
                } else if (mascotasRes.status === 'rejected') {
                    setNotification(prev => prev || { message: `Error al cargar mascotas: ${mascotasRes.reason?.message || 'Error desconocido'}`, type: 'error' });
                }

                if (serviciosRes.status === 'fulfilled' && serviciosRes.value.ok) {
                    const data = await serviciosRes.value.json();
                    if (data.success) setServicios(data.data);
                    else setNotification(prev => prev || { message: data.message || 'Error al cargar servicios.', type: 'error' });
                } else if (serviciosRes.status === 'rejected') {
                    setNotification(prev => prev || { message: `Error al cargar servicios: ${serviciosRes.reason?.message || 'Error desconocido'}`, type: 'error' });
                }

                if (vetsRes.status === 'fulfilled' && vetsRes.value.ok) {
                    const data = await vetsRes.value.json();
                    if (data.success) setVeterinarios(data.data);
                    else setNotification(prev => prev || { message: data.message || 'Error al cargar veterinarios.', type: 'error' });
                } else if (vetsRes.status === 'rejected') {
                    setNotification(prev => prev || { message: `Error al cargar veterinarios: ${vetsRes.reason?.message || 'Error desconocido'}`, type: 'error' });
                }

            } catch (err) {
                // Esto solo se capturaría si Promise.allSettled falla catastróficamente, lo cual es raro.
                // Los errores individuales ya se manejan arriba.
                console.error('Error general al cargar dependencias:', err);
                setNotification(prev => prev || { message: 'Error inesperado al cargar datos necesarios.', type: 'error' });
            } finally {
                setIsLoadingDependencies(false); // Finaliza la carga
            }
        };

        if (isOpen) {
            fetchDependencies();
        }
    }, [isOpen, authFetch]);

    // Filter pets when client is selected
    useEffect(() => {
        if (formData.id_cliente) {
            const clientMascotas = mascotas.filter(m => m.id_propietario === parseInt(formData.id_cliente));
            setFilteredMascotas(clientMascotas);
            // If the currently selected pet does not belong to the new client, reset it
            if (formData.id_mascota && !clientMascotas.some(m => m.id_mascota === parseInt(formData.id_mascota))) {
                setFormData(prev => ({ ...prev, id_mascota: '' }));
            }
        } else {
            setFilteredMascotas([]);
            setFormData(prev => ({ ...prev, id_mascota: '' }));
        }
    }, [formData.id_cliente, mascotas]);

    // Handle form changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Validate field in real-time
        const validationError = validateField(`${name}_cita`, value, formData, !appointment);
        setFormErrors(prev => ({ ...prev, [name]: validationError }));
    };

    // Handle blur to show errors when leaving a field
    const handleBlur = (e) => {
        const { name, value } = e.target;
        const validationError = validateField(`${name}_cita`, value, formData, !appointment);
        setFormErrors(prev => ({ ...prev, [name]: validationError }));
    };

    // Submit form (add or update)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setNotification(null);

        // Validate all fields before submitting
        let errors = {};
        let hasErrors = false;

        const fieldsToValidate = [
            'id_cliente', 'id_mascota', 'id_servicio', 'fecha_cita', 'estado'
        ];
        // id_veterinario y notas_adicionales son opcionales, solo validar si tienen un valor para reglas específicas
        if (formData.id_veterinario) {
            fieldsToValidate.push('id_veterinario');
        }
        if (formData.notas_adicionales) {
            fieldsToValidate.push('notas_adicionales');
        }

        for (const field of fieldsToValidate) {
            const errorMsg = validateField(`${field}_cita`, formData[field], formData, !appointment);
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
            let responseData; // Para almacenar la respuesta del backend
            const dataToSend = { ...formData };
            dataToSend.estado = dataToSend.estado.toUpperCase(); // Ensure state is uppercase

            // console.log("Sending appointment data:", dataToSend); // Debugging log

            if (appointment) {
                // Update appointment
                const response = await authFetch(`${API_BASE_URL}/citas/${appointment.id_cita}`, {
                    method: 'PUT',
                    body: JSON.stringify(dataToSend),
                });
                responseData = await response.json();
            } else {
                // Create new appointment
                const response = await authFetch(`${API_BASE_URL}/citas/agendar`, {
                    method: 'POST',
                    body: JSON.stringify(dataToSend),
                });
                responseData = await response.json();
            }

            // console.log("Backend response for appointment:", responseData); // Debugging log

            if (responseData.success) {
                setNotification({ message: responseData.message, type: 'success' });
                onSaveSuccess(); // Notify parent component to reload the list
                onClose(); // Close the modal
            } else {
                setNotification({ message: responseData.message || 'Error al guardar la cita. Intenta de nuevo.', type: 'error' });
            }
        } catch (err) {
            console.error('Error al enviar el formulario de cita:', err);
            setNotification({ message: `Error al guardar la cita: ${err.message || 'Error desconocido'}`, type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getClientName = (id) => {
        const client = clientes.find(c => c.id === parseInt(id));
        return client ? `${client.nombre} ${client.apellido}` : '';
    };

    const getMascotaName = (id) => {
        const mascota = mascotas.find(m => m.id_mascota === parseInt(id));
        return mascota ? mascota.nombre : '';
    };

    const getServicioName = (id) => {
        const servicio = servicios.find(s => s.id_servicio === parseInt(id));
        return servicio ? servicio.nombre : '';
    };

    const getVeterinarioName = (id) => {
        const veterinario = veterinarios.find(v => v.id === parseInt(id));
        return veterinario ? `${veterinario.nombre} ${veterinario.apellido}` : '';
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={appointment ? "Editar Cita" : "Agendar Nueva Cita"}>
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
                        <div className="form-group">
                            <label htmlFor="id_cliente">Cliente:</label>
                            {appointment ? (
                                <input
                                    type="text"
                                    id="cliente_display"
                                    value={getClientName(formData.id_cliente)}
                                    className="input-disabled"
                                    disabled
                                />
                            ) : (
                                <select
                                    id="id_cliente"
                                    name="id_cliente"
                                    value={formData.id_cliente}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={formErrors.id_cliente ? 'input-error' : ''}
                                    disabled={isSubmitting || isLoadingDependencies} // Deshabilitar si se está enviando o cargando dependencias
                                >
                                    <option value="">Selecciona un cliente</option>
                                    {clientes.map(cliente => (
                                        <option key={cliente.id} value={cliente.id}>
                                            {cliente.nombre} {cliente.apellido} ({cliente.email})
                                        </option>
                                    ))}
                                </select>
                            )}
                            {formErrors.id_cliente && <span className="error-text">{formErrors.id_cliente}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="id_mascota">Mascota:</label>
                            {appointment ? (
                                <input
                                    type="text"
                                    id="mascota_display"
                                    value={getMascotaName(formData.id_mascota)}
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
                                    disabled={isSubmitting || !formData.id_cliente || isLoadingDependencies} // Deshabilitar si no hay cliente o cargando
                                >
                                    <option value="">Selecciona una mascota</option>
                                    {filteredMascotas.map(mascota => (
                                        <option key={mascota.id_mascota} value={mascota.id_mascota}>
                                            {mascota.nombre} ({mascota.especie})
                                        </option>
                                    ))}
                                </select>
                            )}
                            {formErrors.id_mascota && <span className="error-text">{formErrors.id_mascota}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="id_servicio">Servicio Principal:</label>
                            <select
                                id="id_servicio"
                                name="id_servicio"
                                value={formData.id_servicio}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={formErrors.id_servicio ? 'input-error' : ''}
                                disabled={isSubmitting || isLoadingDependencies} // Deshabilitar si se está enviando o cargando
                            >
                                <option value="">Selecciona un servicio</option>
                                {servicios.map(servicio => (
                                    <option key={servicio.id_servicio} value={servicio.id_servicio}>
                                        {servicio.nombre} (${servicio.precio})
                                    </option>
                                ))}
                            </select>
                            {formErrors.id_servicio && <span className="error-text">{formErrors.id_servicio}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="id_veterinario">Veterinario Asignado:</label>
                            <select
                                id="id_veterinario"
                                name="id_veterinario"
                                value={formData.id_veterinario}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={formErrors.id_veterinario ? 'input-error' : ''}
                                disabled={isSubmitting || isLoadingDependencies} // Deshabilitar si se está enviando o cargando
                            >
                                <option value="">Asignar automáticamente</option>
                                {veterinarios.map(vet => (
                                    <option key={vet.id} value={vet.id}>
                                        {vet.nombre} {vet.apellido} ({vet.email})
                                    </option>
                                ))}
                            </select>
                            {formErrors.id_veterinario && <span className="error-text">{formErrors.id_veterinario}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="fecha_cita">Fecha y Hora:</label>
                            <input
                                type="datetime-local"
                                id="fecha_cita"
                                name="fecha_cita"
                                value={formData.fecha_cita}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={formErrors.fecha_cita ? 'input-error' : ''}
                                disabled={isSubmitting}
                            />
                            {formErrors.fecha_cita && <span className="error-text">{formErrors.fecha_cita}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="notas_adicionales">Notas Adicionales / Ubicación:</label>
                            <input
                                type="text"
                                id="notas_adicionales"
                                name="notas_adicionales"
                                value={formData.notas_adicionales}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={formErrors.notas_adicionales ? 'input-error' : ''}
                                disabled={isSubmitting}
                            />
                            {formErrors.notas_adicionales && <span className="error-text">{formErrors.notas_adicionales}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="estado">Estado:</label>
                            <select
                                id="estado"
                                name="estado"
                                value={formData.estado}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={formErrors.estado ? 'input-error' : ''}
                                disabled={isSubmitting}
                            >
                                <option value="PENDIENTE">PENDIENTE</option>
                                <option value="ACEPTADA">ACEPTADA</option>
                                <option value="RECHAZADA">RECHAZADA</option>
                                <option value="COMPLETA">COMPLETA</option>
                                <option value="CANCELADA">CANCELADA</option>
                            </select>
                            {formErrors.estado && <span className="error-text">{formErrors.estado}</span>}
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn-primary" disabled={isSubmitting || isLoadingDependencies}>
                            {isSubmitting ? <FaSpinner className="spinner" /> : <FaSave />} {appointment ? 'Actualizar Cita' : 'Agendar Cita'}
                        </button>
                        <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting || isLoadingDependencies}>
                            <FaTimes /> Cancelar
                        </button>
                    </div>
                </form>
            )}
        </Modal>
    );
};

export default AdminAppointmentForm;