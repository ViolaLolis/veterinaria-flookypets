import React, { useState, useEffect, useCallback } from 'react';
// Importa los íconos necesarios
import { 
    FaCalendarAlt, FaSearch, FaUser, FaPaw, FaNotesMedical, 
    FaSpinner, FaPlus, FaEdit, FaTrash, FaTimes, FaInfoCircle, 
    FaCheck, FaBan, FaEye, FaRegCheckCircle, FaRegTimesCircle, 
    FaClock, FaCalendarCheck, FaTimesCircle // Agregado FaTimesCircle para cancelar
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { authFetch } from './api'; // Asegúrate de que la ruta sea correcta
import './Styles/AdminAppointments.css'; // Asegúrate de que este CSS exista

function AdminAppointments({ user }) { // Recibe el objeto 'user' como prop
    const [appointments, setAppointments] = useState([]);
    const [filteredAppointments, setFilteredAppointments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true); // Para la carga inicial de la tabla
    const [error, setError] = useState('');
    // Estados del filtro actualizados para coincidir con la DB
    const [filter, setFilter] = useState('all'); // 'all', 'pendiente', 'aceptada', 'rechazada', 'completa', 'cancelada'
    const [notification, setNotification] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false); // Modal para Añadir/Editar
    const [editingAppointment, setEditingAppointment] = useState(null); // null o el objeto de la cita a editar
    const [isSubmitting, setIsSubmitting] = useState(false); // Para el envío del formulario modal
    
    const [isViewModalOpen, setIsViewModalOpen] = useState(false); // Nuevo modal para Ver Detalles
    const [viewingAppointment, setViewingAppointment] = useState(null); // Objeto de la cita para ver detalles

    // formData ahora refleja que 'ubicacion' en el frontend se mapea a 'servicios' en el backend
    const [formData, setFormData] = useState({
        fecha: '',
        estado: 'pendiente',
        ubicacion: '', // Este campo en el frontend se mapea a 'servicios' en la DB
        id_servicio: '',
        id_cliente: '',
        id_veterinario: ''
    });

    const [services, setServices] = useState([]);
    const [clients, setClients] = useState([]);
    const [vets, setVets] = useState([]);

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
                    owner: app.cliente,
                    service: app.servicio, // Nombre del servicio desde la tabla 'servicios'
                    status: app.estado,
                    ubicacion: app.servicios || 'N/A', // OJO: 'ubicacion' en frontend viene de 'servicios' en DB
                    id_servicio: app.id_servicio,
                    id_cliente: app.id_cliente,
                    id_veterinario: app.id_veterinario,
                    cliente_telefono: app.cliente_telefono,
                    veterinario_nombre: app.veterinario // Nombre completo del veterinario
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
    }, [authFetch, showNotification, filter]); 

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
        let results = appointments; // appointments ya viene filtrado por estado desde el servidor
        
        if (searchTerm) {
            results = results.filter(app =>
                app.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
                app.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
                app.ubicacion.toLowerCase().includes(searchTerm.toLowerCase()) 
            );
        }
        
        setFilteredAppointments(results);
    }, [searchTerm, appointments]); 

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
            ubicacion: appointment.ubicacion || '', // Carga el valor desde 'app.ubicacion'
            id_servicio: appointment.id_servicio,
            id_cliente: appointment.id_cliente,
            id_veterinario: appointment.id_veterinario || ''
        });
        setIsModalOpen(true);
    }, []);

    // Nuevo: Abre el modal para ver detalles de una cita
    const handleViewDetails = useCallback(async (appointmentId) => {
        setIsLoading(true);
        try {
            const responseData = await authFetch(`/citas/${appointmentId}`);
            if (responseData.success && responseData.data) {
                // Mapear el campo 'servicios' del backend a 'ubicacion' para mostrarlo
                const detailedAppointment = {
                    ...responseData.data,
                    ubicacion: responseData.data.servicios || 'N/A' // Asegura que se muestre el valor correcto
                };
                setViewingAppointment(detailedAppointment);
                setIsViewModalOpen(true);
            } else {
                showNotification(responseData.message || 'Error al cargar los detalles de la cita.', 'error');
            }
        } catch (err) {
            showNotification(`Error de conexión al cargar detalles: ${err.message}`, 'error');
            console.error("Error fetching appointment details:", err);
        } finally {
            setIsLoading(false);
        }
    }, [authFetch, showNotification]);


    // Maneja el cambio en el formulario del modal
    const handleFormChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    // Envía el formulario del modal (añadir/editar)
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            // Validación de fecha para no permitir fechas pasadas
            const selectedDate = new Date(formData.fecha);
            const now = new Date();
            now.setMinutes(now.getMinutes() + 1); // Mínimo 1 minuto en el futuro
            if (selectedDate < now) {
                showNotification('La fecha y hora de la cita no pueden ser en el pasado.', 'error');
                setIsSubmitting(false);
                return;
            }

            let response;
            const payload = {
                ...formData,
                fecha: new Date(formData.fecha).toISOString().slice(0, 19).replace('T', ' '), // Formato MySQL DATETIME
                servicios: formData.ubicacion // OJO: Mapea 'ubicacion' de frontend a 'servicios' de DB
            };

            // Elimina la propiedad 'ubicacion' del payload si no la necesitas en el backend con ese nombre
            delete payload.ubicacion; 

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
                showNotification(response.message || `Cita ${editingAppointment ? 'actualizada' : 'registrada'} correctamente.`, 'success'); 
                setIsModalOpen(false);
                fetchAppointments(); // Re-fetch all appointments (with current filter)
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
                showNotification(response.message || 'Cita eliminada correctamente.', 'success'); 
                fetchAppointments(); // Re-fetch all appointments (with current filter)
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
                showNotification(response.message || `Estado de cita actualizado a "${targetStatus}".`, 'success'); 
                fetchAppointments(); // Re-fetch all appointments (with current filter)
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
            case 'completa': return 'badge-success'; 
            case 'pendiente': return 'badge-warning';
            case 'aceptada': return 'badge-info';
            case 'rechazada': return 'badge-danger'; 
            case 'cancelada': return 'badge-secondary'; 
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
                <p>Nota: Para ver citas completas y rechazadas, asegúrate de que existan registros con esos estados en tu base de datos y que tu tabla `citas` tenga el ENUM `('pendiente', 'aceptada', 'rechazada', 'completa', 'cancelada')`.</p>
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
                            className={`filter-btn ${filter === 'pendiente' ? 'active' : ''}`}
                            onClick={() => setFilter('pendiente')}
                            disabled={isLoading}
                        >
                            Pendientes
                        </button>
                        <button 
                            className={`filter-btn ${filter === 'aceptada' ? 'active' : ''}`}
                            onClick={() => setFilter('aceptada')}
                            disabled={isLoading}
                        >
                            Aceptadas
                        </button>
                        <button 
                            className={`filter-btn ${filter === 'completa' ? 'active' : ''}`} 
                            onClick={() => setFilter('completa')}
                            disabled={isLoading}
                        >
                            Completadas
                        </button>
                        <button 
                            className={`filter-btn ${filter === 'rechazada' ? 'active' : ''}`} 
                            onClick={() => setFilter('rechazada')}
                            disabled={isLoading}
                        >
                            Rechazadas
                        </button>
                        <button 
                            className={`filter-btn ${filter === 'cancelada' ? 'active' : ''}`} 
                            onClick={() => setFilter('cancelada')}
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
                                        {/* Muestra el detalle de ubicación/servicio (c.servicios en DB) */}
                                        <FaNotesMedical className="icon" /> {app.ubicacion} 
                                    </td>
                                    <td>
                                        <span className={`status-badge ${getStatusBadge(app.status)}`}>
                                            {/* Mostrar texto adecuado para cada estado */}
                                            {app.status === 'pendiente' && 'Pendiente'}
                                            {app.status === 'aceptada' && 'Aceptada'}
                                            {app.status === 'rechazada' && 'Rechazada'}
                                            {app.status === 'completa' && 'Completada'} 
                                            {app.status === 'cancelada' && 'Cancelada'} 
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
                                        {app.status === 'pendiente' && (
                                            <button 
                                                className="btn-icon btn-accept" 
                                                onClick={() => handleChangeStatus(app.id, app.status, 'aceptada')}
                                                disabled={isLoading}
                                                title="Aceptar Cita" 
                                            >
                                                <FaRegCheckCircle />
                                            </button>
                                        )}
                                        {app.status === 'rechazada' && ( 
                                            <button 
                                                className="btn-icon btn-accept" 
                                                onClick={() => handleChangeStatus(app.id, app.status, 'aceptada')}
                                                disabled={isLoading}
                                                title="Re-aceptar Cita" 
                                            >
                                                <FaRegCheckCircle />
                                            </button>
                                        )}
                                        {(app.status === 'pendiente' || app.status === 'aceptada') && (
                                            <button 
                                                className="btn-icon btn-reject" 
                                                onClick={() => handleChangeStatus(app.id, app.status, 'rechazada')}
                                                disabled={isLoading}
                                                title="Rechazar Cita" 
                                            >
                                                <FaRegTimesCircle />
                                            </button>
                                        )}
                                        {app.status === 'aceptada' && (
                                            <button 
                                                className="btn-icon btn-complete" 
                                                onClick={() => handleChangeStatus(app.id, app.status, 'completa')} 
                                                disabled={isLoading}
                                                title="Completar Cita" 
                                            >
                                                <FaCalendarCheck />
                                            </button>
                                        )}
                                        {(app.status === 'pendiente' || app.status === 'aceptada' || app.status === 'rechazada') && (
                                            <button 
                                                className="btn-icon btn-cancel" 
                                                onClick={() => handleChangeStatus(app.id, app.status, 'cancelada')} 
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
                                <td colSpan="6" className="no-results"> 
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
                                        min={getMinDateTime()} 
                                        required
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="ubicacion">Detalle de Ubicación/Servicio (ej. Clínica, A Domicilio, Sala de Rayos X)</label> {/* Etiqueta aclarada */}
                                    <input
                                        type="text"
                                        id="ubicacion"
                                        name="ubicacion" // Nombre en formData se mantiene como 'ubicacion'
                                        value={formData.ubicacion}
                                        onChange={handleFormChange}
                                        placeholder="Ej. Clínica principal, A domicilio, Sala de Rayos X"
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
                                        <option value="rechazada">Rechazada</option>
                                        <option value="completa">Completada</option> 
                                        <option value="cancelada">Cancelada</option> 
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

            {/* Nuevo: Modal para Ver Detalles de Cita */}
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
                            <div className="modal-details">
                                <p><strong>Fecha y Hora:</strong> {viewingAppointment.fecha}</p>
                                <p><strong>Estado:</strong> <span className={`status-badge ${getStatusBadge(viewingAppointment.estado)}`}>
                                    {viewingAppointment.estado === 'pendiente' && 'Pendiente'}
                                    {viewingAppointment.estado === 'aceptada' && 'Aceptada'}
                                    {viewingAppointment.estado === 'rechazada' && 'Rechazada'}
                                    {viewingAppointment.estado === 'completa' && 'Completada'}
                                    {viewingAppointment.estado === 'cancelada' && 'Cancelada'}
                                </span></p>
                                <p><strong>Servicio Principal:</strong> {viewingAppointment.servicio_nombre} (Precio: ${viewingAppointment.precio})</p>
                                <p><strong>Detalle de Ubicación/Servicio:</strong> {viewingAppointment.ubicacion || 'No especificado'}</p> {/* Usa .ubicacion (que viene de c.servicios) */}
                                <p><strong>Cliente:</strong> {viewingAppointment.cliente_nombre} (Teléfono: {viewingAppointment.cliente_telefono})</p>
                                <p><strong>Veterinario Asignado:</strong> {viewingAppointment.veterinario_nombre || 'N/A'}</p>
                            </div>
                            <div className="modal-footer">
                                <button className="submit-btn" onClick={() => setIsViewModalOpen(false)}>Cerrar</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default AdminAppointments;
