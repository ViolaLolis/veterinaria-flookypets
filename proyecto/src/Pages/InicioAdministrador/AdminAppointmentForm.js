// src/Components/Admin/AdminAppointmentForm.js
import React, { useState, useEffect, useCallback } from 'react';
import { FaSave, FaTimes, FaSpinner } from 'react-icons/fa';
import { validateField } from '../../utils/validation';
import Modal from '../../Components/Modal';
import Notification from '../../Components/Notification'; // Ruta corregida
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
    const [clientes, setClientes] = useState([]);
    const [servicios, setServicios] = useState([]);
    const [veterinarios, setVeterinarios] = useState([]);
    const [filteredMascotas, setFilteredMascotas] = useState([]); // Nuevo estado para mascotas filtradas

    // Función para manejar cambios en los campos del formulario
    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setFormErrors(prev => ({ ...prev, [name]: '' })); // Limpiar error al cambiar
    }, []);

    // Función para manejar el desenfoque del campo y validar
    const handleBlur = useCallback((e) => {
        const { name, value } = e.target;
        const error = validateField(name, value);
        if (error) {
            setFormErrors(prev => ({ ...prev, [name]: error }));
        }
    }, []);

    // === FETCHING INITIAL DATA ===

    // Fetch clientes
    const fetchClientes = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setNotification({ message: 'No autorizado. Por favor, inicia sesión.', type: 'error' });
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/admin/clientes`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Error al cargar clientes.');
            const data = await response.json();
            if (data.success) {
                setClientes(data.data);
            } else {
                setNotification({ message: data.message || 'No se pudieron cargar los clientes.', type: 'error' });
            }
        } catch (error) {
            console.error("Error fetching clients:", error);
            setNotification({ message: error.message || 'Error del servidor al cargar clientes.', type: 'error' });
        }
    }, [setNotification]); // Agrega setNotification a las dependencias

    // Fetch servicios
    const fetchServicios = useCallback(async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_BASE_URL}/servicios`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Error al cargar servicios.');
            const data = await response.json();
            if (data.success) {
                setServicios(data.data);
            } else {
                setNotification({ message: data.message || 'No se pudieron cargar los servicios.', type: 'error' });
            }
        } catch (error) {
            console.error("Error fetching services:", error);
            setNotification({ message: error.message || 'Error del servidor al cargar servicios.', type: 'error' });
        }
    }, [setNotification]);

    // Fetch veterinarios
    const fetchVeterinarios = useCallback(async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_BASE_URL}/veterinarios`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Error al cargar veterinarios.');
            const data = await response.json();
            if (data.success) {
                setVeterinarios(data.data);
            } else {
                setNotification({ message: data.message || 'No se pudieron cargar los veterinarios.', type: 'error' });
            }
        } catch (error) {
            console.error("Error fetching vets:", error);
            setNotification({ message: error.message || 'Error del servidor al cargar veterinarios.', type: 'error' });
        }
    }, [setNotification]);

    useEffect(() => {
        if (isOpen) {
            fetchClientes();
            fetchServicios();
            fetchVeterinarios();

            if (appointment) {
                // Formatear la fecha para datetime-local
                const formattedDate = appointment.fecha_cita ? new Date(appointment.fecha_cita).toISOString().slice(0, 16) : '';
                setFormData({
                    id_cliente: appointment.id_cliente || '',
                    id_mascota: appointment.id_mascota || '',
                    id_servicio: appointment.id_servicio || '',
                    id_veterinario: appointment.id_veterinario || '',
                    fecha_cita: formattedDate,
                    notas_adicionales: appointment.notas_adicionales || '',
                    estado: appointment.estado || 'PENDIENTE'
                });
            } else {
                // Resetear el formulario para nueva cita
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
        }
    }, [isOpen, appointment, fetchClientes, fetchServicios, fetchVeterinarios]);

    // === NUEVA LÓGICA PARA CARGAR MASCOTAS SEGÚN EL CLIENTE SELECCIONADO ===
    useEffect(() => {
        // Solo cargar mascotas si el formulario está abierto y se ha seleccionado un cliente
        if (isOpen && formData.id_cliente) {
            const fetchMascotasForClient = async () => {
                const token = localStorage.getItem('token');
                if (!token) {
                    setNotification({ message: 'No autorizado. Por favor, inicia sesión.', type: 'error' });
                    setFilteredMascotas([]); // Asegúrate de limpiar si no hay token
                    return;
                }
                try {
                    const response = await fetch(`${API_BASE_URL}/mascotas/cliente/${formData.id_cliente}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (!response.ok) {
                        // Si la respuesta es 404 (Not Found), significa que no hay mascotas para ese cliente
                        if (response.status === 404) {
                            setNotification({ message: 'No se encontraron mascotas para el cliente seleccionado.', type: 'info' });
                            setFilteredMascotas([]); // No hay mascotas
                        } else {
                            const errorData = await response.json();
                            throw new Error(errorData.message || 'Error al obtener mascotas del cliente.');
                        }
                    } else {
                        const result = await response.json();
                        if (result.success) {
                            setFilteredMascotas(result.data); // Almacena las mascotas obtenidas
                        } else {
                            // En caso de que el backend devuelva success: false pero no sea 404
                            setNotification({ message: result.message || 'No se pudieron cargar las mascotas del cliente.', type: 'error' });
                            setFilteredMascotas([]);
                        }
                    }
                    // Si se está editando una cita y la mascota existente no está en la lista filtrada,
                    // podríamos querer deseleccionarla automáticamente.
                    if (appointment && appointment.id_mascota && !filteredMascotas.some(m => m.id_mascota === appointment.id_mascota)) {
                         setFormData(prev => ({ ...prev, id_mascota: '' }));
                    }

                } catch (error) {
                    console.error("Error fetching mascotas for client:", error);
                    setNotification({ message: error.message || 'Error del servidor al cargar mascotas.', type: 'error' });
                    setFilteredMascotas([]); // Limpia las mascotas en caso de error
                }
            };
            fetchMascotasForClient();
        } else if (!formData.id_cliente && isOpen) {
            // Si no hay cliente seleccionado (o se deselecciona uno), limpia las mascotas filtradas
            setFilteredMascotas([]);
            setFormData(prev => ({ ...prev, id_mascota: '' })); // También limpia la mascota seleccionada en el formulario
        }
    }, [formData.id_cliente, isOpen, API_BASE_URL, setNotification, appointment]); // Dependencias clave

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormErrors({});
        setNotification(null);

        let valid = true;
        let newErrors = {};

        // Validar todos los campos antes de enviar
        const fieldsToValidate = ['id_cliente', 'id_mascota', 'id_servicio', 'id_veterinario', 'fecha_cita', 'estado'];
        fieldsToValidate.forEach(field => {
            const error = validateField(field, formData[field]);
            if (error) {
                newErrors[field] = error;
                valid = false;
            }
        });

        if (!valid) {
            setFormErrors(newErrors);
            setIsSubmitting(false);
            setNotification({ message: 'Por favor, corrige los errores del formulario.', type: 'error' });
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            setNotification({ message: 'No autorizado. Por favor, inicia sesión.', type: 'error' });
            setIsSubmitting(false);
            return;
        }

        try {
            const method = appointment ? 'PUT' : 'POST';
            const url = appointment ? `${API_BASE_URL}/admin/citas/${appointment.id_cita}` : `${API_BASE_URL}/admin/citas`;

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Error al guardar la cita.');
            }

            setNotification({ message: result.message, type: 'success' });
            onSaveSuccess(); // Llama a la función de éxito para recargar la lista o cerrar el modal
            onClose(); // Cierra el modal después de guardar
        } catch (error) {
            console.error("Error saving appointment:", error);
            setNotification({ message: error.message || 'Error del servidor al guardar la cita.', type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={appointment ? "Editar Cita" : "Registrar Cita"}>
            <Notification notification={notification} onClose={() => setNotification(null)} duration={5000} />
            {isOpen && ( // Renderiza el formulario solo si el modal está abierto para evitar problemas de estado inicial
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                <option value="">-- Selecciona un cliente --</option>
                                {clientes.map(cliente => (
                                    <option key={cliente.id} value={cliente.id}>
                                        {cliente.nombre} {cliente.apellido}
                                    </option>
                                ))}
                            </select>
                            {formErrors.id_cliente && <span className="error-text">{formErrors.id_cliente}</span>}
                        </div>

                        {/* Mascota - Usar filteredMascotas */}
                        <div className="form-group">
                            <label htmlFor="id_mascota">Mascota:</label>
                            <select
                                id="id_mascota"
                                name="id_mascota"
                                value={formData.id_mascota}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={formErrors.id_mascota ? 'input-error' : ''}
                                // Deshabilitar si no hay cliente seleccionado o mientras se carga
                                disabled={isSubmitting || !formData.id_cliente || filteredMascotas.length === 0}
                            >
                                <option value="">-- Selecciona una mascota --</option>
                                {filteredMascotas.length > 0 ? (
                                    filteredMascotas.map(mascota => (
                                        <option key={mascota.id_mascota} value={mascota.id_mascota}>
                                            {mascota.nombre} ({mascota.especie})
                                        </option>
                                    ))
                                ) : (
                                    formData.id_cliente && <option value="" disabled>No hay mascotas para este cliente</option>
                                )}
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
                                <option value="">-- Selecciona un servicio --</option>
                                {servicios.map(servicio => (
                                    <option key={servicio.id_servicio} value={servicio.id_servicio}>
                                        {servicio.nombre}
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
                                <option value="">-- Selecciona un veterinario --</option>
                                {veterinarios.map(veterinario => (
                                    <option key={veterinario.id} value={veterinario.id}>
                                        {veterinario.nombre} {veterinario.apellido}
                                    </option>
                                ))}
                            </select>
                            {formErrors.id_veterinario && <span className="error-text">{formErrors.id_veterinario}</span>}
                        </div>

                        {/* Fecha de Cita */}
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

                        {/* Estado */}
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
                                <option value="COMPLETADA">COMPLETADA</option>
                                <option value="CANCELADA">CANCELADA</option>
                            </select>
                            {formErrors.estado && <span className="error-text">{formErrors.estado}</span>}
                        </div>

                        {/* Notas Adicionales */}
                        <div className="form-group md:col-span-2">
                            <label htmlFor="notas_adicionales">Notas Adicionales:</label>
                            <textarea
                                id="notas_adicionales"
                                name="notas_adicionales"
                                value={formData.notas_adicionales}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={formErrors.notas_adicionales ? 'input-error' : ''}
                                disabled={isSubmitting}
                                rows="3"
                            ></textarea>
                            {formErrors.notas_adicionales && <span className="error-text">{formErrors.notas_adicionales}</span>}
                        </div>
                    </div>

                    <div className="form-actions mt-4 flex justify-end space-x-2">
                        <button type="submit" className="btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? <FaSpinner className="spinner" /> : <FaSave />} {appointment ? 'Actualizar Cita' : 'Registrar Cita'}
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

export default AdminAppointmentForm;