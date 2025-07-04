// src/Pages/InicioAdministrador/AdminAppointments.js
import React, { useState, useEffect, useCallback } from 'react';
// Importa los íconos necesarios
import {
    FaCalendarAlt, FaSearch, FaUser, FaNotesMedical,
    FaSpinner, FaPlus, FaEdit, FaTrash, FaTimes, FaInfoCircle
    , FaEye, FaRegCheckCircle, FaRegTimesCircle, FaCalendarCheck, FaTimesCircle
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { authFetch } from '../../utils/api'; // Ruta ajustada
import { validateField } from '../../utils/validation'; // Importa la función de validación
import './Styles/AdminAppointments.css'; // Ruta relativa al CSS

// Importar el hook useNotifications
import { useNotifications } from '../../Notifications/NotificationContext'; // Ruta ajustada

function AdminAppointments({ user }) { // Recibe el objeto 'user' como prop
    const [appointments, setAppointments] = useState([]);
    const [filteredAppointments, setFilteredAppointments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true); // Para la carga inicial de la tabla
    const [error, setError] = useState('');
    // Estados del filtro actualizados para coincidir con la DB
    const [filter, setFilter] = useState('all'); // 'all', 'PENDIENTE', 'ACEPTADA', 'RECHAZADA', 'COMPLETA', 'CANCELADA'

    // *** CAMBIO CLAVE: Usa el hook useNotifications en lugar del estado local de notificación ***
    const { addNotification } = useNotifications();

    const [isModalOpen, setIsModalOpen] = useState(false); // Modal para Añadir/Editar
    const [editingAppointment, setEditingAppointment] = useState(null); // null o el objeto de la cita a editar
    const [isSubmitting, setIsSubmitting] = useState(false); // Para el envío del formulario modal
    const [formErrors, setFormErrors] = useState({}); // Estado para errores de formulario

    const [isViewModalOpen, setIsViewModalOpen] = useState(false); // Nuevo modal para Ver Detalles
    const [viewingAppointment, setViewingAppointment] = useState(null); // Objeto de la cita para ver detalles

    // formData ahora refleja que 'ubicacion' en el frontend se mapea a 'servicios' en el backend
    const [formData, setFormData] = useState({
        fecha: '',
        estado: 'PENDIENTE', // Valores en mayúsculas para consistencia con ENUM
        ubicacion: '', // Este campo en el frontend se mapea a 'servicios' en la DB
        id_servicio: '',
        id_cliente: '',
        id_veterinario: '',
        id_mascota: '' // Nuevo campo para la mascota
    });

    const [services, setServices] = useState([]);
    const [clients, setClients] = useState([]);
    const [vets, setVets] = useState([]);
    const [pets, setPets] = useState([]); // Nuevo estado para mascotas

    // Calcular la fecha y hora mínima para el input (actual)
    const getMinDateTime = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() + 1); // Un minuto más que la hora actual para evitar conflictos de segundos
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    // Función para cargar los servicios, clientes, veterinarios y mascotas
    const fetchDropdownData = useCallback(async () => {
        try {
            const [servicesRes, clientsRes, vetsRes, petsRes] = await Promise.all([
                authFetch('/servicios'),
                authFetch('/admin/usuarios'), // Devuelve usuarios con role 'usuario'
                authFetch('/usuarios/veterinarios'),
                authFetch('/mascotas') // Endpoint para todas las mascotas
            ]);

            if (servicesRes.success) setServices(servicesRes.data);
            else console.error('Error al cargar servicios:', servicesRes.message);

            if (clientsRes.success) setClients(clientsRes.data);
            else console.error('Error al cargar clientes:', clientsRes.message);

            if (vetsRes.success) setVets(vetsRes.data);
            else console.error('Error al cargar veterinarios:', vetsRes.message);

            if (petsRes.success) setPets(petsRes.data);
            else console.error('Error al cargar mascotas:', petsRes.message);

        } catch (err) {
            console.error("Error al cargar datos para dropdowns:", err);
            // *** CAMBIO CLAVE: Usa addNotification del contexto ***
            addNotification('error', 'Error al cargar opciones para el formulario.', 5000);
        }
    }, [addNotification]); // Dependencia actualizada

    // Función para cargar las citas desde la API, AHORA CON FILTRO DE ESTADO
    const fetchAppointments = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            // Construir la URL con el parámetro de estado si no es 'all'
            const apiUrl = filter && filter !== 'all' ? `/admin/citas?status=${filter}` : '/admin/citas';
            const responseData = await authFetch(apiUrl); // Endpoint para citas de admin

            if (responseData.success && Array.isArray(responseData.data)) {
                const formattedAppointments = responseData.data.map(app => ({
                    id: app.id_cita,
                    date: app.fecha,
                    owner: app.cliente, // Nombre completo del cliente
                    service: app.servicio, // Nombre del servicio desde la tabla 'servicios'
                    status: app.estado,
                    ubicacion: app.notas_adicionales || 'N/A', // OJO: 'ubicacion' en frontend viene de 'servicios' en DB
                    id_servicio: app.id_servicio,
                    id_cliente: app.id_cliente,
                    id_veterinario: app.id_veterinario,
                    id_mascota: app.id_mascota, // Asegúrate de que este campo venga del backend
                    cliente_telefono: app.cliente_telefono,
                    veterinario_nombre: app.veterinario, // Nombre completo del veterinario
                    mascota_nombre: app.mascota_nombre, // Añadido para mostrar en tabla
                    mascota_especie: app.mascota_especie // Añadido para mostrar en tabla
                }));
                setAppointments(formattedAppointments);
            } else {
                // *** CAMBIO CLAVE: Usa addNotification del contexto ***
                addNotification('error', responseData.message || 'Formato de datos de citas incorrecto.', 5000);
                setAppointments([]);
            }
        } catch (err) {
            setError(`Error al cargar las citas: ${err.message}`);
            console.error('Error fetching appointments:', err);
            setAppointments([]);
        } finally {
            setIsLoading(false);
        }
    }, [authFetch, addNotification, filter]); // Dependencia actualizada

    // Efecto para cargar citas y datos de dropdowns al inicio y cuando cambia el filtro
    useEffect(() => {
        if (user && user.token) {
            fetchAppointments();
            fetchDropdownData();
        } else {
            setError('No autorizado. Por favor, inicie sesión.');
            setIsLoading(false);
        }
    }, [user, fetchAppointments, fetchDropdownData]);

    // Efecto para filtrar citas cuando cambia searchTerm (el filtro de estado ya viene del backend)
    useEffect(() => {
        const results = appointments.filter(app =>
            app.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.ubicacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.mascota_nombre.toLowerCase().includes(searchTerm.toLowerCase()) // Buscar por nombre de mascota
        );
        setFilteredAppointments(results);
    }, [searchTerm, appointments]);

    // Abre el modal para añadir una nueva cita
    const handleAdd = useCallback(() => {
        setEditingAppointment(null);
        setFormData({ // Restablecer el formulario
            fecha: '',
            estado: 'PENDIENTE',
            ubicacion: '',
            id_servicio: '',
            id_cliente: '',
            id_veterinario: '',
            id_mascota: ''
        });
        setFormErrors({}); // Limpiar errores al abrir el modal
        setIsModalOpen(true);
    }, []);

    // Abre el modal para editar una cita existente
    const handleEdit = useCallback((appointment) => {
        setEditingAppointment(appointment);
        setFormData({
            fecha: appointment.date,
            estado: appointment.status.toUpperCase(), // Asegurar mayúsculas
            ubicacion: appointment.ubicacion || '', // Carga el valor desde 'app.ubicacion'
            id_servicio: appointment.id_servicio,
            id_cliente: appointment.id_cliente,
            id_veterinario: appointment.id_veterinario || '',
            id_mascota: appointment.id_mascota || ''
        });
        setFormErrors({}); // Limpiar errores al abrir el modal
        setIsModalOpen(true);
    }, []);

    // Nuevo: Abre el modal para ver detalles de una cita
    const handleViewDetails = useCallback(async (appointmentId) => {
        setIsLoading(true);
        try {
            const responseData = await authFetch(`/citas/${appointmentId}`);
            if (responseData.success && responseData.data) {
                // Mapear el campo 'observaciones' del backend a 'ubicacion' para mostrarlo
                const detailedAppointment = {
                    ...responseData.data,
                    ubicacion: responseData.data.observaciones || 'N/A' // Asegura que se muestre el valor correcto
                };
                setViewingAppointment(detailedAppointment);
                setIsViewModalOpen(true);
            } else {
                // *** CAMBIO CLAVE: Usa addNotification del contexto ***
                addNotification('error', responseData.message || 'Error al cargar los detalles de la cita.', 5000);
            }
        } catch (err) {
            // *** CAMBIO CLAVE: Usa addNotification del contexto ***
            addNotification('error', `Error de conexión al cargar detalles: ${err.message}`, 5000);
            console.error("Error fetching appointment details:", err);
        } finally {
            setIsLoading(false);
        }
    }, [authFetch, addNotification]); // Dependencia actualizada


    // Maneja el cambio en el formulario del modal
    const handleFormChange = useCallback((e) => {
        const { name, value } = e.target;
        let newValue = value;

        // Convertir a mayúsculas para campos específicos
        if (['ubicacion'].includes(name)) { // Añadir más campos si es necesario
            newValue = value.toUpperCase();
        }

        setFormData(prev => ({ ...prev, [name]: newValue }));

        // Validar el campo individualmente al cambiar
        const errorMessage = validateField(name, newValue, { ...formData, [name]: newValue }, !editingAppointment);
        setFormErrors(prev => ({ ...prev, [name]: errorMessage }));
    }, [formData, editingAppointment]); // Depende de formData y editingAppointment para validaciones cruzadas

    // Envía el formulario del modal (añadir/editar)
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        // Validar todos los campos antes de enviar
        let errors = {};
        Object.keys(formData).forEach(key => {
            const errorMessage = validateField(key, formData[key], formData, !editingAppointment);
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
            let response;
            const payload = {
                ...formData,
                fecha_cita: new Date(formData.fecha).toISOString().slice(0, 19).replace('T', ' '), // Formato MySQL DATETIME
                notas_adicionales: formData.ubicacion // OJO: Mapea 'ubicacion' de frontend a 'servicios' en DB
            };

            // Elimina la propiedad 'ubicacion' del payload si no la necesitas en el backend con ese nombre
            delete payload.ubicacion;
            delete payload.fecha; // 'fecha' del formData es 'fecha_cita' para el backend

            payload.id_servicio = payload.id_servicio ? parseInt(payload.id_servicio, 10) : null;
            payload.id_cliente = payload.id_cliente ? parseInt(payload.id_cliente, 10) : null;
            payload.id_veterinario = payload.id_veterinario ? parseInt(payload.id_veterinario, 10) : null;
            payload.id_mascota = payload.id_mascota ? parseInt(payload.id_mascota, 10) : null;

            if (payload.id_veterinario === 0) payload.id_veterinario = null;


            if (editingAppointment) {
                response = await authFetch(`/citas/${editingAppointment.id}`, {
                    method: 'PUT',
                    body: payload
                });
            } else {
                response = await authFetch('/citas/agendar', { // Endpoint para agendar citas
                    method: 'POST',
                    body: payload
                });
            }

            if (response.success) {
                // *** CAMBIO CLAVE: Usa addNotification del contexto ***
                addNotification('success', response.message || `Cita ${editingAppointment ? 'actualizada' : 'registrada'} correctamente.`, 5000);
                setIsModalOpen(false);
                fetchAppointments(); // Re-fetch all appointments (con filtro actual)
            } else {
                // *** CAMBIO CLAVE: Usa addNotification del contexto ***
                addNotification('error', response.message || `Error al ${editingAppointment ? 'actualizar' : 'registrar'} la cita.`, 5000);
            }
        } catch (err) {
            // *** CAMBIO CLAVE: Usa addNotification del contexto ***
            addNotification('error', `Error de conexión: ${err.message}`, 5000);
            console.error("Error submitting appointment form:", err);
        } finally {
            setIsSubmitting(false);
        }
    }, [editingAppointment, formData, authFetch, addNotification, fetchAppointments]); // Dependencias actualizadas

    // Eliminar cita
    const handleDelete = useCallback(async (id) => {
        // *** REEMPLAZO DE window.confirm ***
        // Aquí deberías integrar un modal de confirmación personalizado.
        // Ejemplo conceptual:
        // const confirmed = await showCustomConfirmModal('¿Estás seguro de eliminar esta cita? Esta acción es irreversible.');
        // if (!confirmed) return;
        if (!window.confirm('¿Estás seguro de eliminar esta cita? Esta acción es irreversible.')) {
            return;
        }

        setIsLoading(true);
        try {
            const response = await authFetch(`/citas/${id}`, { method: 'DELETE' });
            if (response.success) {
                // *** CAMBIO CLAVE: Usa addNotification del contexto ***
                addNotification('success', response.message || 'Cita eliminada correctamente.', 5000);
                fetchAppointments(); // Re-fetch all appointments (con filtro actual)
            } else {
                // *** CAMBIO CLAVE: Usa addNotification del contexto ***
                addNotification('error', response.message || 'Error al eliminar la cita.', 5000);
            }
        } catch (err) {
            // *** CAMBIO CLAVE: Usa addNotification del contexto ***
            addNotification('error', `Error de conexión: ${err.message}`, 5000);
            console.error("Error deleting appointment:", err);
        } finally {
            setIsLoading(false);
        }
    }, [authFetch, addNotification, fetchAppointments]); // Dependencias actualizadas

    // Función para cambiar el estado de la cita
    const handleChangeStatus = useCallback(async (id, currentStatus, targetStatus) => {
        // *** REEMPLAZO DE window.confirm ***
        // Aquí deberías integrar un modal de confirmación personalizado.
        // Ejemplo conceptual:
        // const confirmed = await showCustomConfirmModal(`¿Estás seguro de cambiar el estado de la cita a "${targetStatus}"?`);
        // if (!confirmed) return;
        if (!window.confirm(`¿Estás seguro de cambiar el estado de la cita a "${targetStatus}"?`)) {
            return;
        }
        setIsLoading(true);
        try {
            const response = await authFetch(`/citas/${id}`, {
                method: 'PUT',
                body: { estado: targetStatus.toUpperCase() } // Asegurar que el estado se envíe en mayúsculas
            });
            if (response.success) {
                // *** CAMBIO CLAVE: Usa addNotification del contexto ***
                addNotification('success', response.message || `Estado de cita actualizado a "${targetStatus}".`, 5000);
                fetchAppointments(); // Re-fetch all appointments (con filtro actual)
            } else {
                // *** CAMBIO CLAVE: Usa addNotification del contexto ***
                addNotification('error', response.message || `Error al actualizar el estado de la cita.`, 5000);
            }
        } catch (err) {
            // *** CAMBIO CLAVE: Usa addNotification del contexto ***
            addNotification('error', `Error de conexión: ${err.message}`, 5000);
            console.error("Error changing appointment status:", err);
        } finally {
            setIsLoading(false);
        }
    }, [authFetch, addNotification, fetchAppointments]); // Dependencias actualizadas

    // Función para obtener la clase del badge de estado
    const getStatusBadge = (status) => {
        switch (status.toLowerCase()) { // Convertir a minúsculas para la comparación
            case 'completa': return 'badge-success';
            case 'pendiente': return 'badge-warning';
            case 'aceptada': return 'badge-info';
            case 'rechazada': return 'badge-danger';
            case 'cancelada': return 'badge-secondary';
            default: return 'badge-secondary';
        }
    };

    // Función para obtener el texto del estado
    const getStatusText = (status) => {
        switch (status.toLowerCase()) {
            case 'completa': return 'COMPLETADA';
            case 'pendiente': return 'PENDIENTE';
            case 'aceptada': return 'ACEPTADA';
            case 'rechazada': return 'RECHAZADA';
            case 'cancelada': return 'CANCELADA';
            default: return status.toUpperCase();
        }
    };


    if (isLoading && appointments.length === 0) {
        return (
            <div className="admin-loading">
                <div className="loading-spinner">
                    <FaSpinner className="spinner-icon" />
                </div>
                <p>Cargando citas...</p>
            </div>
        );
    }

    if (error && appointments.length === 0) {
        return (
            <div className="error-message">
                <FaInfoCircle className="info-icon" />
                {error}
                <p>Asegúrate de que el backend esté corriendo y los endpoints de API estén accesibles y funcionando correctamente.</p>
                <p>Nota: Para ver citas completas y rechazadas, asegúrate de que existan registros con esos estados en tu base de datos y que tu tabla `citas` tenga el ENUM `('pendiente', 'aceptada', 'rechazada', 'completa', 'cancelada')`.</p>
            </div>
        );
    }

    return (
        <div className="admin-content-container">
            {/* *** CAMBIO CLAVE: Elimina el bloque AnimatePresence y la notificación local *** */}
            {/* Las notificaciones ahora serán mostradas por NotificationDisplay globalmente */}

            <div className="admin-content-header">
                <h2>
                    <FaCalendarAlt className="header-icon" />
                    Gestión de Citas
                </h2>
                <div className="header-actions">
                    <div className="search-box">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Buscar citas por dueño, servicio o detalle..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                    <div className="filter-buttons">
                        <button
                            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                            onClick={() => setFilter('all')}
                            disabled={isLoading}
                        >
                            Todas
                        </button>
                        <button
                            className={`filter-btn ${filter === 'PENDIENTE' ? 'active' : ''}`}
                            onClick={() => setFilter('PENDIENTE')}
                            disabled={isLoading}
                        >
                            Pendientes
                        </button>
                        <button
                            className={`filter-btn ${filter === 'ACEPTADA' ? 'active' : ''}`}
                            onClick={() => setFilter('ACEPTADA')}
                            disabled={isLoading}
                        >
                            Aceptadas
                        </button>
                        <button
                            className={`filter-btn ${filter === 'COMPLETA' ? 'active' : ''}`}
                            onClick={() => setFilter('COMPLETA')}
                            disabled={isLoading}
                        >
                            Completadas
                        </button>
                        <button
                            className={`filter-btn ${filter === 'RECHAZADA' ? 'active' : ''}`}
                            onClick={() => setFilter('RECHAZADA')}
                            disabled={isLoading}
                        >
                            Rechazadas
                        </button>
                        <button
                            className={`filter-btn ${filter === 'CANCELADA' ? 'active' : ''}`}
                            onClick={() => setFilter('CANCELADA')}
                            disabled={isLoading}
                        >
                            Canceladas
                        </button>
                    </div>
                    <button
                        className="add-new-btn"
                        onClick={handleAdd}
                        disabled={isLoading}
                    >
                        <FaPlus /> Nueva Cita
                    </button>
                </div>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Fecha y Hora</th>
                            <th>Dueño</th>
                            <th>Mascota</th> {/* Nueva columna */}
                            <th>Detalle de Ubicación/Servicio {/* Nuevo nombre de columna */}</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAppointments.length > 0 ? (
                            filteredAppointments.map(app => (
                                <tr key={app.id}>
                                    <td>{app.id}</td>
                                    <td>{app.date}</td>
                                    <td>
                                        <FaUser className="icon" /> {app.owner}
                                    </td>
                                    <td>
                                        {/* Muestra el nombre de la mascota */}
                                        {app.mascota_nombre} ({app.mascota_especie})
                                    </td>
                                    <td>
                                        {/* Muestra el detalle de ubicación/servicio (c.servicios en DB) */}
                                        <FaNotesMedical className="icon" /> {app.ubicacion}
                                    </td>
                                    <td>
                                        <span className={`status-badge ${getStatusBadge(app.status)}`}>
                                            {getStatusText(app.status)}
                                        </span>
                                    </td>
                                    <td className="actions-cell">
                                        <button
                                            className="btn-icon"
                                            onClick={() => handleViewDetails(app.id)}
                                            disabled={isLoading}
                                            title="Ver Detalles"
                                        >
                                            <FaEye />
                                        </button>
                                        <button
                                            className="btn-icon"
                                            onClick={() => handleEdit(app)}
                                            disabled={isLoading}
                                            title="Editar Cita"
                                        >
                                            <FaEdit />
                                        </button>
                                        {/* Botones de cambio de estado con íconos y tooltips */}
                                        {app.status === 'PENDIENTE' && (
                                            <button
                                                className="btn-icon btn-accept"
                                                onClick={() => handleChangeStatus(app.id, app.status, 'ACEPTADA')}
                                                disabled={isLoading}
                                                title="Aceptar Cita"
                                            >
                                                <FaRegCheckCircle />
                                            </button>
                                        )}
                                        {app.status === 'RECHAZADA' && (
                                            <button
                                                className="btn-icon btn-accept"
                                                onClick={() => handleChangeStatus(app.id, app.status, 'ACEPTADA')}
                                                disabled={isLoading}
                                                title="Re-aceptar Cita"
                                            >
                                                <FaRegCheckCircle />
                                            </button>
                                        )}
                                        {(app.status === 'PENDIENTE' || app.status === 'ACEPTADA') && (
                                            <button
                                                className="btn-icon btn-reject"
                                                onClick={() => handleChangeStatus(app.id, app.status, 'RECHAZADA')}
                                                disabled={isLoading}
                                                title="Rechazar Cita"
                                            >
                                                <FaRegTimesCircle />
                                            </button>
                                        )}
                                        {app.status === 'ACEPTADA' && (
                                            <button
                                                className="btn-icon btn-complete"
                                                onClick={() => handleChangeStatus(app.id, app.status, 'COMPLETA')}
                                                disabled={isLoading}
                                                title="Completar Cita"
                                            >
                                                <FaCalendarCheck />
                                            </button>
                                        )}
                                        {(app.status === 'PENDIENTE' || app.status === 'ACEPTADA' || app.status === 'RECHAZADA') && (
                                            <button
                                                className="btn-icon btn-cancel"
                                                onClick={() => handleChangeStatus(app.id, app.status, 'CANCELADA')}
                                                disabled={isLoading}
                                                title="Cancelar Cita"
                                            >
                                                <FaTimesCircle /> {/* Usando un ícono de "cerrar círculo" para cancelar */}
                                            </button>
                                        )}
                                        <button
                                            className="btn-icon btn-delete"
                                            onClick={() => handleDelete(app.id)}
                                            disabled={isLoading}
                                            title="Eliminar Cita"
                                        >
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="no-results">
                                    <FaInfoCircle className="info-icon" />
                                    No se encontraron citas que coincidan con el filtro o la búsqueda.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal para Añadir/Editar Cita */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="modal-content"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="modal-header">
                                <h3>{editingAppointment ? 'Editar Cita' : 'Registrar Nueva Cita'}</h3>
                                <button className="close-modal-btn" onClick={() => { setIsModalOpen(false); setFormErrors({}); }}>
                                    <FaTimes />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="modal-form">
                                <div className="form-group">
                                    <label htmlFor="id_cliente">Cliente</label>
                                    {/* Cliente deshabilitado en modo edición */}
                                    {editingAppointment ? (
                                        <input
                                            type="text"
                                            id="id_cliente_display"
                                            // Asegura que clients esté cargado antes de intentar encontrar
                                            value={clients.length > 0 ? `${clients.find(c => c.id === formData.id_cliente)?.nombre || ''} ${clients.find(c => c.id === formData.id_cliente)?.apellido || ''}` : 'Cargando...'}
                                            disabled
                                            className="disabled-input-text"
                                        />
                                    ) : (
                                        <select
                                            id="id_cliente"
                                            name="id_cliente"
                                            value={formData.id_cliente}
                                            onChange={handleFormChange}
                                            required
                                            disabled={isSubmitting}
                                        >
                                            <option value="">Selecciona un cliente</option>
                                            {clients.map(client => (
                                                <option key={client.id} value={client.id}>
                                                    {client.nombre} {client.apellido} ({client.email})
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                    {formErrors.id_cliente && <p className="error-message-inline">{formErrors.id_cliente}</p>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="id_mascota">Mascota</label>
                                    {/* Mascota deshabilitada en modo edición */}
                                    {editingAppointment ? (
                                        <input
                                            type="text"
                                            id="id_mascota_display"
                                            // Asegura que pets esté cargado antes de intentar encontrar
                                            value={pets.length > 0 ? `${pets.find(p => p.id_mascota === formData.id_mascota)?.nombre || ''} (${pets.find(p => p.id_mascota === formData.id_mascota)?.especie || ''})` : 'Cargando...'}
                                            disabled
                                            className="disabled-input-text"
                                        />
                                    ) : (
                                        <select
                                            id="id_mascota"
                                            name="id_mascota"
                                            value={formData.id_mascota}
                                            onChange={handleFormChange}
                                            required
                                            disabled={isSubmitting || !formData.id_cliente} // Deshabilita si no hay cliente seleccionado
                                        >
                                            <option value="">Selecciona una mascota</option>
                                            {/* Filtra mascotas por el cliente seleccionado */}
                                            {pets.filter(pet => formData.id_cliente && pet.id_propietario === parseInt(formData.id_cliente)).map(pet => (
                                                <option key={pet.id_mascota} value={pet.id_mascota}>
                                                    {pet.nombre} ({pet.especie})
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                    {formErrors.id_mascota && <p className="error-message-inline">{formErrors.id_mascota}</p>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="id_servicio">Servicio Principal</label>
                                    <select
                                        id="id_servicio"
                                        name="id_servicio"
                                        value={formData.id_servicio}
                                        onChange={handleFormChange}
                                        required
                                        disabled={isSubmitting}
                                    >
                                        <option value="">Selecciona un servicio</option>
                                        {services.map(service => (
                                            <option key={service.id_servicio} value={service.id_servicio}>
                                                {service.nombre} (${service.precio})
                                            </option>
                                        ))}
                                    </select>
                                    {formErrors.id_servicio && <p className="error-message-inline">{formErrors.id_servicio}</p>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="id_veterinario">Veterinario Asignado</label>
                                    <select
                                        id="id_veterinario"
                                        name="id_veterinario"
                                        value={formData.id_veterinario}
                                        onChange={handleFormChange}
                                        disabled={isSubmitting}
                                    >
                                        <option value="">(Asignación automática)</option>
                                        {vets.map(vet => (
                                            <option key={vet.id} value={vet.id}>
                                                {vet.nombre} {vet.apellido} ({vet.email})
                                            </option>
                                        ))}
                                    </select>
                                    {formErrors.id_veterinario && <p className="error-message-inline">{formErrors.id_veterinario}</p>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="fecha">Fecha y Hora</label>
                                    <input
                                        type="datetime-local"
                                        id="fecha"
                                        name="fecha"
                                        value={formData.fecha}
                                        onChange={handleFormChange}
                                        min={getMinDateTime()} // Asegura que la fecha no sea pasada
                                        required
                                        disabled={isSubmitting}
                                    />
                                    {formErrors.fecha && <p className="error-message-inline">{formErrors.fecha}</p>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="ubicacion">Detalle de Ubicación/Servicio</label>
                                    <input
                                        type="text"
                                        id="ubicacion"
                                        name="ubicacion"
                                        value={formData.ubicacion}
                                        onChange={handleFormChange}
                                        placeholder="EJ: CONSULTORIO 1, SALA DE RAYOS X"
                                        disabled={isSubmitting}
                                    />
                                    {formErrors.ubicacion && <p className="error-message-inline">{formErrors.ubicacion}</p>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="estado">Estado</label>
                                    <select
                                        id="estado"
                                        name="estado"
                                        value={formData.estado}
                                        onChange={handleFormChange}
                                        required
                                        disabled={isSubmitting}
                                    >
                                        <option value="PENDIENTE">PENDIENTE</option>
                                        <option value="ACEPTADA">ACEPTADA</option>
                                        <option value="RECHAZADA">RECHAZADA</option>
                                        <option value="COMPLETA">COMPLETA</option>
                                        <option value="CANCELADA">CANCELADA</option>
                                    </select>
                                    {formErrors.estado && <p className="error-message-inline">{formErrors.estado}</p>}
                                </div>

                                <button type="submit" className="submit-btn" disabled={isSubmitting}>
                                    {isSubmitting ? <FaSpinner className="spinner-icon" /> : (editingAppointment ? 'Actualizar Cita' : 'Registrar Cita')}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal para Ver Detalles de Cita */}
            <AnimatePresence>
                {isViewModalOpen && viewingAppointment && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="modal-content"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="modal-header">
                                <h3>Detalles de la Cita #{viewingAppointment.id_cita}</h3>
                                <button className="close-modal-btn" onClick={() => setIsViewModalOpen(false)}>
                                    <FaTimes />
                                </button>
                            </div>
                            <div className="modal-body view-details-modal">
                                <p><strong>Fecha y Hora:</strong> {viewingAppointment.fecha_cita}</p>
                                <p><strong>Estado:</strong> <span className={`status-badge ${getStatusBadge(viewingAppointment.estado)}`}>{getStatusText(viewingAppointment.estado)}</span></p>
                                <p><strong>Servicio:</strong> {viewingAppointment.servicio_nombre}</p>
                                <p><strong>Detalle Ubicación/Servicio:</strong> {viewingAppointment.observaciones || 'N/A'}</p>
                                <p><strong>Mascota:</strong> {viewingAppointment.mascota_nombre} ({viewingAppointment.mascota_especie} - {viewingAppointment.mascota_raza})</p>
                                {viewingAppointment.mascota_imagen_url && (
                                    <div className="mt-4 text-center">
                                        <img src={viewingAppointment.mascota_imagen_url} alt={`Imagen de ${viewingAppointment.mascota_nombre}`} className="w-32 h-32 object-cover rounded-full mx-auto shadow-md" />
                                    </div>
                                )}
                                <h4 className="mt-4 mb-2 text-lg font-semibold">Información del Propietario</h4>
                                <p><strong>Nombre:</strong> {viewingAppointment.propietario_nombre}</p>
                                <p><strong>Teléfono:</strong> {viewingAppointment.propietario_telefono}</p>
                                <p><strong>Email:</strong> {viewingAppointment.propietario_email}</p>
                                <p><strong>Dirección:</strong> {viewingAppointment.propietario_direccion || 'N/A'}</p>

                                {viewingAppointment.id_veterinario && (
                                    <>
                                        <h4 className="mt-4 mb-2 text-lg font-semibold">Información del Veterinario</h4>
                                        <p><strong>Nombre:</strong> {viewingAppointment.veterinario_nombre}</p>
                                        <p><strong>Email:</strong> {viewingAppointment.veterinario_email}</p>
                                        <p><strong>Dirección:</strong> {viewingAppointment.veterinario_direccion || 'N/A'}</p>
                                    </>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button className="btn-secondary" onClick={() => setIsViewModalOpen(false)}>Cerrar</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default AdminAppointments;
