// src/Components/Admin/AdminAppointmentForm.js
import React, { useState, useEffect, useCallback } from 'react';
import { FaSave, FaTimes, FaSpinner } from 'react-icons/fa';
import { validateField } from '../../utils/validation';
import Modal from '../../Components/Modal';
import Notification from '../../Components/Notification';
// import './Styles/AdminStyles.css'; // Asegúrate de que esta ruta sea correcta

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const AdminAppointmentForm = ({ isOpen, onClose, appointment, onSaveSuccess }) => {
    const [formData, setFormData] = useState({
        id_cliente: '',
        id_mascota: '',
        id_servicio: '',
        id_veterinario: '',
        fecha_cita: '', // Formato 'YYYY-MM-DDTHH:mm' para input datetime-local
        notas_adicionales: '',
        estado: 'PENDIENTE'
    });
    const [formErrors, setFormErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState(null);
    const [clientes, setClientes] = useState([]); // Todas las listas para selects
    const [mascotas, setMascotas] = useState([]);
    const [servicios, setServicios] = useState([]);
    const [veterinarios, setVeterinarios] = useState([]);
    const [filteredMascotas, setFilteredMascotas] = useState([]); // Mascotas filtradas por cliente seleccionado

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
            const errorData = await response.json().catch(() => ({ message: 'Error de autenticación/autorización.' }));
            setNotification({ message: errorData.message || 'Sesión expirada o no autorizado. Por favor, inicia sesión de nuevo.', type: 'error' });
            throw new Error(errorData.message || 'No autorizado');
        }

        // Manejo de errores de respuesta no JSON
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            return response; // Si es JSON, retorna la respuesta para que se parsee más adelante
        } else {
            const text = await response.text();
            console.error("Response was not JSON:", text);
            setNotification({ message: `Error del servidor: Respuesta inesperada. Estado: ${response.status}. Detalles: ${text.substring(0, 100)}...`, type: 'error' });
            throw new Error("Respuesta del servidor no es JSON");
        }
    }, []);

    // --- Efecto 1: Cargar todas las listas al abrir el formulario ---
    useEffect(() => {
        if (isOpen) {
            console.log("DEBUG: Modal se abrió. Iniciando carga de datos.");
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

                    if (clientesData.success) {
                        setClientes(clientesData.data);
                    } else {
                        setNotification({ message: clientesData.message || 'Error al cargar clientes.', type: 'error' });
                    }

                    if (mascotasData.success) {
                        setMascotas(mascotasData.data);
                    } else {
                        setNotification({ message: mascotasData.message || 'Error al cargar mascotas.', type: 'error' });
                    }

                    if (serviciosData.success) {
                        setServicios(serviciosData.data);
                    } else {
                        setNotification({ message: serviciosData.message || 'Error al cargar servicios.', type: 'error' });
                    }

                    if (vetsData.success) {
                        setVeterinarios(vetsData.data);
                    } else {
                        setNotification({ message: vetsData.message || 'Error al cargar veterinarios.', type: 'error' });
                    }

                } catch (err) {
                    console.error('Error fetching dependencies:', err);
                    setNotification({ message: 'Error al cargar datos necesarios.', type: 'error' });
                }
            };
            fetchDependencies(); // Llama a la función de carga
            setFormErrors({}); // Limpia errores al abrir el modal
            setNotification(null); // Limpia notificaciones
        } else {
            console.log("DEBUG: Modal se cerró. Limpiando estado.");
            // Limpiar formData y errores cuando el modal se cierra
            setFormData({
                id_cliente: '', id_mascota: '', id_servicio: '', id_veterinario: '',
                fecha_cita: '', notas_adicionales: '', estado: 'PENDIENTE'
            });
            setFormErrors({});
            setFilteredMascotas([]);
        }
    }, [isOpen, authFetch]);


    // --- Efecto 2: Pre-llenar el formulario cuando 'appointment' y las listas estén cargadas ---
    useEffect(() => {
        // Solo intenta precargar si el modal está abierto y hay un objeto 'appointment'
        // y las listas de datos maestros (clientes, mascotas, etc.) ya se cargaron.
        if (isOpen && appointment && clientes.length > 0 && mascotas.length > 0 && servicios.length > 0 && veterinarios.length > 0) {
            console.log("DEBUG InitialFill: Starting to pre-fill form for appointment:", appointment);

            let formattedDate = '';
            // Safely format the date for the datetime-local input
            if (appointment.fecha_cita) {
                const date = new Date(appointment.fecha_cita);
                if (!isNaN(date.getTime())) { // Check if the date is valid
                    formattedDate = date.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm"
                } else {
                    console.warn("Invalid date value received for fecha_cita:", appointment.fecha_cita);
                }
            }

            // Asegúrate de parsear a números para consistencia
            const clientId = appointment.id_cliente ? parseInt(appointment.id_cliente, 10) : '';
            const petId = appointment.id_mascota ? parseInt(appointment.id_mascota, 10) : '';
            const serviceId = appointment.id_servicio ? parseInt(appointment.id_servicio, 10) : '';
            const vetId = appointment.id_veterinario ? parseInt(appointment.id_veterinario, 10) : '';

            // Set all form data in a single update for better consistency
            setFormData({
                id_cliente: clientId,
                id_mascota: petId,
                id_servicio: serviceId,
                id_veterinario: vetId,
                fecha_cita: formattedDate,
                notas_adicionales: appointment.notas_adicionales || '',
                estado: appointment.estado || 'PENDIENTE'
            });

            console.log("DEBUG InitialFill: Final formData after pre-filling:", {
                id_cliente: clientId,
                id_mascota: petId,
                id_servicio: serviceId,
                id_veterinario: vetId,
                fecha_cita: formattedDate,
                notas_adicionales: appointment.notas_adicionales || '',
                estado: appointment.estado || 'PENDIENTE'
            });
        } else if (!appointment && isOpen) {
            // Si es un nuevo formulario y se abre, resetear a valores iniciales
            console.log("DEBUG InitialFill: New appointment form, resetting state.");
            setFormData({
                id_cliente: '', id_mascota: '', id_servicio: '', id_veterinario: '',
                fecha_cita: '', notas_adicionales: '', estado: 'PENDIENTE'
            });
            setFilteredMascotas([]);
            setFormErrors({});
        }
    }, [appointment, clientes, mascotas, servicios, veterinarios, isOpen]); // Todas las dependencias son cruciales


    // --- Efecto 3: Filtrar mascotas cuando cambia el cliente seleccionado o la lista de mascotas ---
    // Este efecto debe ejecutarse SIEMPRE que 'formData.id_cliente' o 'mascotas' cambian.
    useEffect(() => {
        console.log("DEBUG filterMascotas: Triggered with client ID:", formData.id_cliente, "and pet ID:", formData.id_mascota);

        if (formData.id_cliente && mascotas.length > 0) {
            const petsForClient = mascotas.filter(
                (pet) => parseInt(pet.id_propietario, 10) === parseInt(formData.id_cliente, 10)
            );
            setFilteredMascotas(petsForClient);
            console.log("DEBUG filterMascotas: Filtered pets result:", petsForClient);

            // If the currently selected mascota (formData.id_mascota) is not in the newly filtered list,
            // and it's not the initial load of an existing appointment (where the pet might be valid but not yet filtered),
            // then reset id_mascota.
            // This prevents keeping a pet selected that doesn't belong to the chosen client.
            if (formData.id_mascota && !petsForClient.some(m => parseInt(m.id_mascota, 10) === parseInt(formData.id_mascota, 10))) {
                 // Only reset if the current formData.id_mascota is not among the filtered pets,
                 // ensuring we don't clear a valid pre-selected pet on initial load.
                console.log("DEBUG filterMascotas: Resetting id_mascota as it's not in new filtered list.");
                setFormData(prev => ({ ...prev, id_mascota: '' }));
            }
        } else {
            console.log("DEBUG filterMascotas: No client selected or no pets loaded. Resetting filteredMascotas.");
            setFilteredMascotas([]);
            // Always reset id_mascota if no client is selected or no pets are available for the selected client.
            setFormData(prev => ({ ...prev, id_mascota: '' }));
        }
    }, [formData.id_cliente, mascotas, formData.id_mascota]); // Dependencias: cliente seleccionado y todas las mascotas


    // --- Manejo de cambios en los inputs ---
    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        let newValue = value;

        // Convertir IDs a números si no están vacíos
        if (['id_cliente', 'id_mascota', 'id_servicio', 'id_veterinario'].includes(name)) {
            newValue = value !== '' ? parseInt(value, 10) : '';
        }

        setFormData(prev => ({ ...prev, [name]: newValue }));

        // Llama a validateField después de actualizar el estado con el nuevo valor
        const error = validateField(name, newValue);
        setFormErrors(prev => ({ ...prev, [name]: error }));

        // Lógica específica para resetear id_mascota si el cliente cambia
        if (name === 'id_cliente') {
            console.log("DEBUG handleChange: Client changed to", newValue, ", resetting id_mascota.");
            setFormData(prev => ({ ...prev, id_mascota: '' }));
        }
    }, []); // Removed 'appointment' from dependencies as it's not directly used here for state update logic.

    const handleBlur = useCallback((e) => {
        const { name, value } = e.target;
        let currentValue = value;
        // Convertir IDs a números si no están vacíos para la validación onBlur
        if (['id_cliente', 'id_mascota', 'id_servicio', 'id_veterinario'].includes(name)) {
            currentValue = value !== '' ? parseInt(value, 10) : '';
        }
        const error = validateField(name, currentValue);
        setFormErrors(prev => ({ ...prev, [name]: error }));
    }, []);

    // --- Manejo del envío del formulario ---
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setNotification(null);

        // =========================================================================
        // Paso CRÍTICO: Validar campos obligatorios antes de enviar
        // =========================================================================
        const newErrors = {};
        // Asegúrate de que los campos numéricos sean válidos (no 0, no NaN)
        if (!formData.id_cliente || isNaN(formData.id_cliente)) newErrors.id_cliente = "El cliente es obligatorio.";
        if (!formData.id_mascota || isNaN(formData.id_mascota)) newErrors.id_mascota = "La mascota es obligatoria.";
        if (!formData.id_servicio || isNaN(formData.id_servicio)) newErrors.id_servicio = "El servicio es obligatorio.";
        if (!formData.id_veterinario || isNaN(formData.id_veterinario)) newErrors.id_veterinario = "El veterinario es obligatorio.";
        // Para fecha_cita, verifica que no esté vacía. La validez de la fecha la manejará el backend o un validador más específico.
        if (!formData.fecha_cita) newErrors.fecha_cita = "La fecha y hora son obligatorias.";

        // Si hay errores, actualiza el estado de errores y detén el envío
        if (Object.keys(newErrors).length > 0) {
            setFormErrors(newErrors);
            setIsSubmitting(false);
            setNotification({ type: 'error', message: 'Por favor, complete todos los campos obligatorios.' });
            console.log("DEBUG handleSubmit: Errores de validación frontend:", newErrors);
            return; // Detiene la ejecución de handleSubmit
        }
        // =========================================================================

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error("No hay token de autenticación. Por favor, inicie sesión.");
            }

            let url = '';
            let method = '';
            const dataToSend = { ...formData };

            // Convertir fecha_cita a formato ISO string si no está vacía
            // Esto es crucial para que la base de datos lo entienda correctamente
            if (dataToSend.fecha_cita) {
                // Ensure the date is a valid Date object before converting to ISO string
                const dateObj = new Date(dataToSend.fecha_cita);
                if (isNaN(dateObj.getTime())) {
                    throw new Error("Fecha y hora de cita inválidas.");
                }
                dataToSend.fecha_cita = dateObj.toISOString();
            }

            if (appointment) {
                // Actualizar cita existente
                url = `${API_BASE_URL}/citas/${appointment.id_cita}`;
                method = 'PUT';
                // Para PUT, el backend espera 'notas_adicionales' para el campo 'servicios'
                dataToSend.servicios = dataToSend.notas_adicionales;
                delete dataToSend.notas_adicionales; // Eliminar el campo original si es necesario
            } else {
                // Crear nueva cita
                url = `${API_BASE_URL}/citas/agendar`; // Usar la ruta específica para agendar
                method = 'POST';
                // Para POST /citas/agendar, el backend espera 'notas_adicionales'
                // No es necesario mapear a 'motivo' aquí, ya que la ruta /agendar lo maneja directamente.
            }

            console.log("DEBUG handleSubmit: Datos a enviar al backend:", dataToSend);
            console.log("DEBUG handleSubmit: URL:", url, "Method:", method);

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(dataToSend)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error response from backend:', errorData);
                throw new Error(errorData.message || 'Error al agendar/actualizar cita.');
            }

            const result = await response.json();
            setNotification({ type: 'success', message: `Cita ${appointment ? 'actualizada' : 'agendada'} con éxito!` });
            onSaveSuccess();
            onClose();
        } catch (error) {
            console.error('Error al agendar/actualizar cita:', error);
            setNotification({ type: 'error', message: `Error al agendar/actualizar cita: ${error.message}` });
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, appointment, onSaveSuccess, onClose]);


    return (
        <Modal isOpen={isOpen} onClose={onClose} title={appointment ? 'Editar Cita' : 'Agendar Nueva Cita'}>
            {notification && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}
            <form onSubmit={handleSubmit} className="admin-form">
                <div className="form-grid">
                    {/* Cliente */}
                    <div className="form-group">
                        <label htmlFor="id_cliente">Cliente:</label>
                        <select
                            id="id_cliente"
                            name="id_cliente"
                            value={formData.id_cliente}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={formErrors.id_cliente ? 'input-error' : ''}
                            disabled={isSubmitting}
                        >
                            <option value="">Seleccione un cliente</option>
                            {clientes.map(cliente => (
                                <option key={cliente.id} value={cliente.id}>
                                    {cliente.nombre} {cliente.apellido}
                                </option>
                            ))}
                        </select>
                        {formErrors.id_cliente && <span className="error-text">{formErrors.id_cliente}</span>}
                    </div>

                    {/* Mascota */}
                    <div className="form-group">
                        <label htmlFor="id_mascota">Mascota:</label>
                        <select
                            id="id_mascota"
                            name="id_mascota"
                            value={formData.id_mascota}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={formErrors.id_mascota ? 'input-error' : ''}
                            disabled={isSubmitting || !formData.id_cliente}
                        >
                            <option value="">
                                {formData.id_cliente ? 'Seleccione una mascota' : 'Seleccione un cliente primero'}
                            </option>
                            {filteredMascotas.map(mascota => (
                                <option key={mascota.id_mascota} value={mascota.id_mascota}>
                                    {mascota.nombre} ({mascota.especie})
                                </option>
                            ))}
                        </select>
                        {formErrors.id_mascota && <span className="error-text">{formErrors.id_mascota}</span>}
                    </div>

                    {/* Servicio */}
                    <div className="form-group">
                        <label htmlFor="id_servicio">Servicio:</label>
                        <select
                            id="id_servicio"
                            name="id_servicio"
                            value={formData.id_servicio}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={formErrors.id_servicio ? 'input-error' : ''}
                            disabled={isSubmitting}
                        >
                            <option value="">Seleccione un servicio</option>
                            {servicios.map(servicio => (
                                <option key={servicio.id_servicio} value={servicio.id_servicio}>
                                    {servicio.nombre} (${servicio.precio})
                                </option>
                            ))}
                        </select>
                        {formErrors.id_servicio && <span className="error-text">{formErrors.id_servicio}</span>}
                    </div>

                    {/* Veterinario */}
                    <div className="form-group">
                        <label htmlFor="id_veterinario">Veterinario:</label>
                        <select
                            id="id_veterinario"
                            name="id_veterinario"
                            value={formData.id_veterinario}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={formErrors.id_veterinario ? 'input-error' : ''}
                            disabled={isSubmitting}
                        >
                            <option value="">Seleccione un veterinario</option>
                            {veterinarios.map(vet => (
                                <option key={vet.id} value={vet.id}>
                                    {vet.nombre} {vet.apellido}
                                </option>
                            ))}
                        </select>
                        {formErrors.id_veterinario && <span className="error-text">{formErrors.id_veterinario}</span>}
                    </div>

                    {/* Fecha y Hora */}
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

                    {/* Notas Adicionales */}
                    <div className="form-group full-width">
                        <label htmlFor="notas_adicionales">Notas Adicionales:</label>
                        <textarea
                            id="notas_adicionales"
                            name="notas_adicionales"
                            value={formData.notas_adicionales}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={formErrors.notas_adicionales ? 'input-error' : ''}
                            rows="3"
                            placeholder="No hay observaciones" // Added placeholder
                            disabled={isSubmitting}
                        ></textarea>
                        {formErrors.notas_adicionales && <span className="error-text">{formErrors.notas_adicionales}</span>}
                    </div>

                    {/* Estado de la Cita */}
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
