import React, { useState, useEffect, useCallback } from 'react';
import { FaCalendarAlt, FaSearch, FaUser, FaPaw, FaNotesMedical, FaSpinner, FaPlus, FaEdit, FaTrash, FaTimes, FaInfoCircle, FaCheck, FaBan, FaEye } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { authFetch } from './api'; // Asegúrate de que la ruta sea correcta
import './Styles/AdminAppointments.css'; // Asegúrate de que este CSS exista

function AdminAppointments({ user }) { // Recibe el objeto 'user' como prop
    const [appointments, setAppointments] = useState([]);
    const [filteredAppointments, setFilteredAppointments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true); // Para la carga inicial de la tabla
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all'); // 'all', 'pending', 'accepted', 'rejected', 'completed', 'canceled'
    const [notification, setNotification] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState(null); // null o el objeto de la cita a editar
    const [formData, setFormData] = useState({
        fecha: '',
        estado: 'pendiente',
        ubicacion: '',
        id_servicio: '',
        id_cliente: '',
        id_veterinario: ''
        // id_mascota ELIMINADO de formData porque la DB no lo tiene en la tabla citas
    });
    const [isSubmitting, setIsSubmitting] = useState(false); // Para el envío del formulario modal

    const [services, setServices] = useState([]);
    const [clients, setClients] = useState([]);
    const [vets, setVets] = useState([]);
    // const [pets, setPets] = useState([]); // Ya no necesitamos pets directamente para el formulario de citas


    // Función para mostrar notificaciones
    const showNotification = useCallback((message, type = 'success') => {
        setNotification({ message, type });
        const timer = setTimeout(() => setNotification(null), 5000);
        return () => clearTimeout(timer);
    }, []);

    // Función para cargar los servicios, clientes y veterinarios
    const fetchDropdownData = useCallback(async () => {
        try {
            const [servicesRes, clientsRes, vetsRes] = await Promise.all([
                authFetch('/servicios'),
                authFetch('/admin/usuarios'), // Devuelve usuarios con role 'usuario'
                authFetch('/usuarios/veterinarios')
            ]);

            if (servicesRes.success) setServices(servicesRes.data);
            else console.error('Error al cargar servicios:', servicesRes.message);

            if (clientsRes.success) setClients(clientsRes.data);
            else console.error('Error al cargar clientes:', clientsRes.message);

            if (vetsRes.success) setVets(vetsRes.data);
            else console.error('Error al cargar veterinarios:', vetsRes.message);

        } catch (err) {
            console.error("Error al cargar datos para dropdowns:", err);
            showNotification('Error al cargar opciones para el formulario.', 'error');
        }
    }, [authFetch, showNotification]);

    // fetchPetsByClient ya no es relevante directamente para el formulario de citas si no hay id_mascota en citas

    // Función para cargar las citas desde la API
    const fetchAppointments = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const responseData = await authFetch('/admin/citas'); // Endpoint para citas de admin

            if (responseData.success && Array.isArray(responseData.data)) {
                const formattedAppointments = responseData.data.map(app => ({
                    id: app.id_cita,
                    date: app.fecha,
                    // pet: app.mascota_nombre || 'N/A', // Ya no se obtiene directamente si no hay JOIN a mascotas
                    owner: app.cliente,
                    service: app.servicio,
                    status: app.estado,
                    ubicacion: app.ubicacion || 'N/A',
                    id_servicio: app.id_servicio,
                    id_cliente: app.id_cliente,
                    id_veterinario: app.id_veterinario
                    // id_mascota ya no se mapea
                }));
                setAppointments(formattedAppointments);
            } else {
                showNotification(responseData.message || 'Formato de datos de citas incorrecto.', 'error');
                setAppointments([]);
            }
        } catch (err) {
            setError(`Error al cargar las citas: ${err.message}`);
            console.error('Error fetching appointments:', err);
            setAppointments([]);
        } finally {
            setIsLoading(false);
        }
    }, [authFetch, showNotification]);

    // Efecto para cargar citas y datos de dropdowns al inicio
    useEffect(() => {
        if (user && user.token) {
            fetchAppointments();
            fetchDropdownData();
        } else {
            setError('No autorizado. Por favor, inicie sesión.');
            setIsLoading(false);
        }
    }, [user, fetchAppointments, fetchDropdownData]);

    // Efecto para filtrar citas cuando cambian searchTerm, filter o appointments
    useEffect(() => {
        let results = appointments;
        
        if (filter !== 'all') {
            results = results.filter(app => app.status === filter);
        }
        
        if (searchTerm) {
            results = results.filter(app =>
                // app.pet.toLowerCase().includes(searchTerm.toLowerCase()) || // Eliminado
                app.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
                app.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
                app.ubicacion.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        setFilteredAppointments(results);
    }, [searchTerm, filter, appointments]);

    // Abre el modal para añadir una nueva cita
    const handleAdd = useCallback(() => {
        setEditingAppointment(null);
        setFormData({ // Restablecer el formulario
            fecha: '',
            estado: 'pendiente',
            ubicacion: '',
            id_servicio: '',
            id_cliente: '',
            id_veterinario: ''
        });
        setIsModalOpen(true);
    }, []);

    // Abre el modal para editar una cita existente
    const handleEdit = useCallback((appointment) => {
        setEditingAppointment(appointment);
        setFormData({
            fecha: appointment.date,
            estado: appointment.status,
            ubicacion: appointment.ubicacion || '',
            id_servicio: appointment.id_servicio,
            id_cliente: appointment.id_cliente,
            id_veterinario: appointment.id_veterinario || ''
        });
        setIsModalOpen(true);
    }, []);

    // Maneja el cambio en el formulario del modal
    const handleFormChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // No hay necesidad de cargar mascotas si id_mascota no está en citas
    }, []);

    // Envía el formulario del modal (añadir/editar)
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            let response;
            const payload = {
                ...formData,
                fecha: new Date(formData.fecha).toISOString().slice(0, 19).replace('T', ' ') // Formato MySQL DATETIME
            };

            payload.id_servicio = payload.id_servicio ? parseInt(payload.id_servicio, 10) : null;
            payload.id_cliente = payload.id_cliente ? parseInt(payload.id_cliente, 10) : null;
            payload.id_veterinario = payload.id_veterinario ? parseInt(payload.id_veterinario, 10) : null;
            
            if (payload.id_veterinario === 0) payload.id_veterinario = null;


            if (editingAppointment) {
                response = await authFetch(`/citas/${editingAppointment.id}`, {
                    method: 'PUT',
                    body: payload
                });
            } else {
                response = await authFetch('/citas', {
                    method: 'POST',
                    body: payload
                });
            }

            if (response.success) {
                showNotification(response.message || `Cita ${editingAppointment ? 'actualizada' : 'registrada'} correctamente.`);
                setIsModalOpen(false);
                fetchAppointments();
            } else {
                showNotification(response.message || `Error al ${editingAppointment ? 'actualizar' : 'registrar'} la cita.`, 'error');
            }
        } catch (err) {
            showNotification(`Error de conexión: ${err.message}`, 'error');
            console.error("Error submitting appointment form:", err);
        } finally {
            setIsSubmitting(false);
        }
    }, [editingAppointment, formData, authFetch, showNotification, fetchAppointments]);

    // Eliminar cita
    const handleDelete = useCallback(async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar esta cita? Esta acción es irreversible.')) {
            return;
        }

        setIsLoading(true);
        try {
            const response = await authFetch(`/citas/${id}`, { method: 'DELETE' });
            if (response.success) {
                showNotification(response.message || 'Cita eliminada correctamente.');
                fetchAppointments();
            } else {
                showNotification(response.message || 'Error al eliminar la cita.', 'error');
            }
        } catch (err) {
            showNotification(`Error de conexión: ${err.message}`, 'error');
            console.error("Error deleting appointment:", err);
        } finally {
            setIsLoading(false);
        }
    }, [authFetch, showNotification, fetchAppointments]);

    // Función para cambiar el estado de la cita
    const handleChangeStatus = useCallback(async (id, currentStatus, targetStatus) => {
        if (!window.confirm(`¿Estás seguro de cambiar el estado de la cita a "${targetStatus}"?`)) {
            return;
        }
        setIsLoading(true);
        try {
            const response = await authFetch(`/citas/${id}`, {
                method: 'PUT',
                body: { estado: targetStatus }
            });
            if (response.success) {
                showNotification(response.message || `Estado de cita actualizado a "${targetStatus}".`);
                fetchAppointments();
            } else {
                showNotification(response.message || `Error al actualizar el estado de la cita.`, 'error');
            }
        } catch (err) {
            showNotification(`Error de conexión: ${err.message}`, 'error');
            console.error("Error changing appointment status:", err);
        } finally {
            setIsLoading(false);
        }
    }, [authFetch, showNotification, fetchAppointments]);

    // Función para obtener la clase del badge de estado
    const getStatusBadge = (status) => {
        switch (status) {
            case 'completed': return 'badge-success';
            case 'pending': return 'badge-warning';
            case 'accepted': return 'badge-info';
            case 'rejected': return 'badge-danger';
            case 'canceled': return 'badge-secondary';
            default: return 'badge-secondary';
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
                <p>Nota: Actualmente las citas no se vinculan directamente a una mascota en la base de datos según tu esquema actual.</p>
            </div>
        );
    }

    return (
        <div className="admin-content-container">
            {/* Notificaciones */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        key="appointment-notification"
                        className={`notification ${notification.type}`}
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        transition={{ duration: 0.3 }}
                    >
                        <FaInfoCircle className="notification-icon" />
                        {notification.message}
                        <button className="close-notification" onClick={() => setNotification(null)}>
                            <FaTimes />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

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
                            placeholder="Buscar citas por dueño, servicio o ubicación..."
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
                            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
                            onClick={() => setFilter('pending')}
                            disabled={isLoading}
                        >
                            Pendientes
                        </button>
                        <button 
                            className={`filter-btn ${filter === 'accepted' ? 'active' : ''}`}
                            onClick={() => setFilter('accepted')}
                            disabled={isLoading}
                        >
                            Aceptadas
                        </button>
                        <button 
                            className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
                            onClick={() => setFilter('completed')}
                            disabled={isLoading}
                        >
                            Completadas
                        </button>
                        <button 
                            className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`}
                            onClick={() => setFilter('rejected')}
                            disabled={isLoading}
                        >
                            Rechazadas
                        </button>
                        <button 
                            className={`filter-btn ${filter === 'canceled' ? 'active' : ''}`}
                            onClick={() => setFilter('canceled')}
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
                            <th>Mascota (por cliente)</th> {/* Cambiado el encabezado */}
                            <th>Dueño</th>
                            <th>Servicio</th>
                            <th>Ubicación</th>
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
                                        <FaPaw className="icon" /> N/A {/* Mascota no disponible directamente desde Cita */}
                                    </td>
                                    <td>
                                        <FaUser className="icon" /> {app.owner}
                                    </td>
                                    <td>
                                        <FaNotesMedical className="icon" /> {app.service}
                                    </td>
                                    <td>{app.ubicacion}</td>
                                    <td>
                                        <span className={`status-badge ${getStatusBadge(app.status)}`}>
                                            {app.status.charAt(0).toUpperCase() + app.status.slice(1).replace('ed', 'ada')}
                                        </span>
                                    </td>
                                    <td className="actions-cell">
                                        <button 
                                            className="btn-view-details" 
                                            onClick={() => showNotification(`Detalles de la cita ${app.id}: Dueño: ${app.owner}, Servicio: ${app.service}, Estado: ${app.status.toUpperCase()}`, 'info')}
                                            disabled={isLoading}
                                        >
                                            <FaEye /> Ver
                                        </button>
                                        <button 
                                            className="btn-edit" 
                                            onClick={() => handleEdit(app)}
                                            disabled={isLoading}
                                        >
                                            <FaEdit /> Editar
                                        </button>
                                        {/* Botones de cambio de estado */}
                                        {app.status === 'pendiente' && (
                                            <button 
                                                className="btn-accept" 
                                                onClick={() => handleChangeStatus(app.id, app.status, 'aceptada')}
                                                disabled={isLoading}
                                            >
                                                <FaCheck /> Aceptar
                                            </button>
                                        )}
                                        {(app.status === 'pendiente' || app.status === 'aceptada') && (
                                            <button 
                                                className="btn-reject" 
                                                onClick={() => handleChangeStatus(app.id, app.status, 'rechazada')}
                                                disabled={isLoading}
                                            >
                                                <FaBan /> Rechazar
                                            </button>
                                        )}
                                        {app.status === 'aceptada' && (
                                            <button 
                                                className="btn-complete" 
                                                onClick={() => handleChangeStatus(app.id, app.status, 'completed')}
                                                disabled={isLoading}
                                            >
                                                <FaCheck /> Completar
                                            </button>
                                        )}
                                        <button 
                                            className="btn-delete" 
                                            onClick={() => handleDelete(app.id)}
                                            disabled={isLoading}
                                        >
                                            <FaTrash /> Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" className="no-results">
                                    <FaInfoCircle className="info-icon" />
                                    No se encontraron citas
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
                                <button className="close-modal-btn" onClick={() => setIsModalOpen(false)}>
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
                                            value={`${clients.find(c => c.id === formData.id_cliente)?.nombre || ''} ${clients.find(c => c.id === formData.id_cliente)?.apellido || ''}`}
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
                                </div>

                                {/* Campo de Mascota eliminado si la tabla citas no lo tiene */}
                                {/* <div className="form-group">
                                    <label htmlFor="id_mascota">Mascota</label>
                                    <select
                                        id="id_mascota"
                                        name="id_mascota"
                                        value={formData.id_mascota}
                                        onChange={handleFormChange}
                                        disabled={isSubmitting || !formData.id_cliente || pets.length === 0}
                                    >
                                        <option value="">Selecciona una mascota (del cliente)</option>
                                        {pets.map(pet => (
                                            <option key={pet.id_mascota} value={pet.id_mascota}>
                                                {pet.nombre} ({pet.especie})
                                            </option>
                                        ))}
                                    </select>
                                    {!formData.id_cliente && <p className="text-sm text-gray-500 mt-1">Selecciona un cliente para ver sus mascotas.</p>}
                                    {formData.id_cliente && pets.length === 0 && <p className="text-sm text-gray-500 mt-1">Este cliente no tiene mascotas registradas.</p>}
                                </div> */}

                                <div className="form-group">
                                    <label htmlFor="id_servicio">Servicio</label>
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
                                        <option value="">Ninguno / Selecciona un veterinario</option>
                                        {vets.map(vet => (
                                            <option key={vet.id} value={vet.id}>
                                                {vet.nombre} {vet.apellido}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="fecha">Fecha y Hora</label>
                                    <input
                                        type="datetime-local"
                                        id="fecha"
                                        name="fecha"
                                        value={formData.fecha}
                                        onChange={handleFormChange}
                                        required
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="ubicacion">Ubicación</label>
                                    <input
                                        type="text"
                                        id="ubicacion"
                                        name="ubicacion"
                                        value={formData.ubicacion}
                                        onChange={handleFormChange}
                                        placeholder="Ej. Clínica principal, A domicilio"
                                        disabled={isSubmitting}
                                    />
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
                                        <option value="pendiente">Pendiente</option>
                                        <option value="aceptada">Aceptada</option>
                                        <option value="rejected">Rechazada</option>
                                        <option value="completed">Completada</option>
                                        <option value="canceled">Cancelada</option>
                                    </select>
                                </div>

                                <button type="submit" className="submit-btn" disabled={isSubmitting}>
                                    {isSubmitting ? <><FaSpinner className="spinner-icon" /> Guardando...</> : (editingAppointment ? 'Guardar Cambios' : 'Registrar Cita')}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default AdminAppointments;