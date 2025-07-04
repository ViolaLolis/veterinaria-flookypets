// src/Components/Admin/AdminAppointmentForm.js
import React, { useState, useEffect, useCallback } from 'react';
import { FaSave, FaTimes, FaSpinner } from 'react-icons/fa';
import { validateField } from '../../utils/validation';
import Modal from '../../Components//Modal';
import Notification from '../../Components//Notification';
import './Styles/AdminStyles.css';

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
            try {
                const [clientesRes, mascotasRes, serviciosRes, vetsRes] = await Promise.all([
                    authFetch(`${API_BASE_URL}/usuarios`), // Endpoint for client users
                    authFetch(`${API_BASE_URL}/mascotas`), // All pets
                    authFetch(`${API_BASE_URL}/servicios`),
                    authFetch(`${API_BASE_URL}/usuarios/veterinarios`)
                ]);

                const clientesData = await clientesRes.json();
                const mascotasData = await mascotasRes.json();
                const serviciosData = await serviciosRes.json();
                const vetsData = await vetsRes.json();

                if (clientesData.success) setClientes(clientesData.data);
                else setNotification({ message: clientesData.message || 'Error al cargar clientes.', type: 'error' });

                if (mascotasData.success) setMascotas(mascotasData.data);
                else setNotification({ message: mascotasData.message || 'Error al cargar mascotas.', type: 'error' });

                if (serviciosData.success) setServicios(serviciosData.data);
                else setNotification({ message: serviciosData.message || 'Error al cargar servicios.', type: 'error' });

                if (vetsData.success) setVeterinarios(vetsData.data);
                else setNotification({ message: vetsData.message || 'Error al cargar veterinarios.', type: 'error' });

            } catch (err) {
                console.error('Error fetching dependencies:', err);
                setNotification({ message: 'Error al cargar datos necesarios.', type: 'error' });
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
        // id_veterinario is optional, only validate if it has a value
        if (formData.id_veterinario) {
            fieldsToValidate.push('id_veterinario');
        }
        // notas_adicionales is optional, only validate if it has a value
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
            setNotification({ message: 'Por favor, corrige los errores del formulario.', type: 'error' });
            return;
        }

        try {
            let response;
            const dataToSend = { ...formData };
            dataToSend.estado = dataToSend.estado.toUpperCase(); // Ensure state is uppercase

            console.log("Sending appointment data:", dataToSend); // Debugging log

            if (appointment) {
                // Update appointment
                response = await authFetch(`${API_BASE_URL}/citas/${appointment.id_cita}`, {
                    method: 'PUT',
                    body: JSON.stringify(dataToSend),
                });
            } else {
                // Create new appointment
                response = await authFetch(`${API_BASE_URL}/citas/agendar`, {
                    method: 'POST',
                    body: JSON.stringify(dataToSend),
                });
            }

            const data = await response.json();
            console.log("Backend response for appointment:", data); // Debugging log

            if (data.success) {
                setNotification({ message: data.message, type: 'success' });
                onSaveSuccess(); // Notify parent component to reload the list
                onClose(); // Close the modal
            } else {
                setNotification({ message: data.message || 'Error al guardar la cita.', type: 'error' });
            }
        } catch (err) {
            console.error('Error submitting appointment form:', err);
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
        return mascota ? mascota.nombre : ''; // Removed parentheses
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
            <form onSubmit={handleSubmit} className="admin-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="id_cliente">Cliente:</label>
                        {appointment ? (
                            // In edit mode, display client name as plain text or disabled input
                            <input
                                type="text"
                                id="cliente_display"
                                value={getClientName(formData.id_cliente)}
                                className="input-disabled"
                                disabled
                            />
                        ) : (
                            // In creation mode, allow selecting the client
                            <select
                                id="id_cliente"
                                name="id_cliente"
                                value={formData.id_cliente}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={formErrors.id_cliente ? 'input-error' : ''}
                                disabled={isSubmitting}
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
                            // In edit mode, display pet name as plain text or disabled input
                            <input
                                type="text"
                                id="mascota_display"
                                value={getMascotaName(formData.id_mascota)}
                                className="input-disabled"
                                disabled
                            />
                        ) : (
                            // In creation mode, allow selecting the pet (filtered by client)
                            <select
                                id="id_mascota"
                                name="id_mascota"
                                value={formData.id_mascota}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={formErrors.id_mascota ? 'input-error' : ''}
                                disabled={isSubmitting || !formData.id_cliente}
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
                            disabled={isSubmitting}
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
                            disabled={isSubmitting}
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
                    <button type="submit" className="btn-primary" disabled={isSubmitting}>
                        {isSubmitting ? <FaSpinner className="spinner" /> : <FaSave />} {appointment ? 'Actualizar Cita' : 'Agendar Cita'}
                    </button>
                    <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>
                        <FaTimes /> Cancelar
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default AdminAppointmentForm;
