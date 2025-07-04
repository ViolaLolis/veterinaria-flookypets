import React, { useState, useEffect, useCallback } from 'react';
import {
    FaCalendarAlt, FaSearch, FaUser, FaNotesMedical,
    FaSpinner, FaPlus, FaEdit, FaTrash, FaTimes, FaInfoCircle,
    FaEye, FaRegCheckCircle, FaRegTimesCircle, FaCalendarCheck, FaTimesCircle
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { authFetch } from '../../utils/api'; // Ruta ajustada
import AdminAppointmentForm from './AdminAppointmentForm';
import Modal from '../../Components/Modal'; // Para el modal de confirmación de eliminación
import { useNotifications } from '../../Notifications/NotificationContext';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function AdminAppointments({ user }) {
    const [appointments, setAppointments] = useState([]);
    const [filteredAppointments, setFilteredAppointments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const { addNotification } = useNotifications();

    const [isFormModalOpen, setIsFormModalOpen] = useState(false); // Controla el modal del formulario
    const [currentAppointmentToEdit, setCurrentAppointmentToEdit] = useState(null); // Objeto de la cita a editar

    const [isViewModalOpen, setIsViewModalOpen] = useState(false); // Modal para Ver Detalles
    const [viewingAppointment, setViewingAppointment] = useState(null); // Objeto de la cita para ver detalles

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [appointmentToDelete, setAppointmentToDelete] = useState(null);


    // Enhanced fetch function with authentication (moved from api.js to here for direct use)
    const getAuthToken = () => {
        return localStorage.getItem('token');
    };

    const authFetchInternal = useCallback(async (endpoint, options = {}) => {
        const token = getAuthToken();

        if (!token && endpoint !== '/login' && endpoint !== '/register' && !endpoint.startsWith('/forgot-password') && !endpoint.startsWith('/reset-password') && !endpoint.startsWith('/verify-reset-code')) {
            addNotification('error', 'No autorizado. Por favor, inicie sesión.', 5000);
            throw new Error('No autorizado. No se encontró token de autenticación.');
        }

        const defaultHeaders = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        const config = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers // Allows overriding default headers
            }
        };

        // If the body is not FormData, stringify it.
        if (options.body && !(options.body instanceof FormData)) {
            config.body = JSON.stringify(options.body);
        }

        const url = `${API_BASE_URL}${endpoint}`;
        console.log(`AuthFetchInternal: Realizando solicitud a: ${url} con método: ${config.method || 'GET'}`);

        try {
            const response = await fetch(url, config);

            let responseData;
            try {
                responseData = await response.json();
            } catch (jsonError) {
                console.error(`AuthFetchInternal: No se pudo parsear la respuesta como JSON para ${endpoint}.`, jsonError);
                throw new Error(`Error de red o respuesta no JSON del servidor (${response.status}): ${response.statusText}`);
            }

            if (!response.ok) {
                const errorMessage = responseData.message || `Error del servidor: ${response.status} ${response.statusText}`;
                console.error(`AuthFetchInternal: Error en la respuesta para ${endpoint}:`, responseData);
                throw new Error(errorMessage);
            }

            return responseData;

        } catch (err) {
            console.error(`AuthFetchInternal: Error en la solicitud a ${endpoint}:`, err);
            throw err;
        }
    }, [addNotification]);


    // Función para cargar las citas desde la API
    const fetchAppointments = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const queryParams = new URLSearchParams();
            if (filterStatus !== 'all') {
                queryParams.append('status', filterStatus);
            }
            const url = `/admin/citas?${queryParams.toString()}`;
            console.log("Fetching appointments from:", url);
            const responseData = await authFetchInternal(url);

            if (responseData.success && Array.isArray(responseData.data)) {
                // El backend ya debería devolver los nombres completos de mascota y propietario
                setAppointments(responseData.data);
            } else {
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
    }, [authFetchInternal, filterStatus, addNotification]);

    useEffect(() => {
        if (user && user.token) {
            fetchAppointments();
        } else {
            setError('No autorizado. Por favor, inicie sesión.');
            setIsLoading(false);
        }
    }, [user, fetchAppointments]);

    // Apply search term filter
    useEffect(() => {
        const lowercasedSearchTerm = searchTerm.toLowerCase();
        const filtered = appointments.filter(appointment => {
            const matchesSearch =
                (appointment.mascota_nombre && appointment.mascota_nombre.toLowerCase().includes(lowercasedSearchTerm)) ||
                (appointment.cliente && appointment.cliente.toLowerCase().includes(lowercasedSearchTerm)) ||
                (appointment.veterinario && appointment.veterinario.toLowerCase().includes(lowercasedSearchTerm)) ||
                (appointment.servicio && appointment.servicio.toLowerCase().includes(lowercasedSearchTerm));

            return matchesSearch;
        });
        setFilteredAppointments(filtered);
    }, [searchTerm, appointments]);

    const handleAddNew = () => {
        setCurrentAppointmentToEdit(null); // Para indicar que es una nueva cita
        setIsFormModalOpen(true);
    };

    const handleEdit = (appointment) => {
        setCurrentAppointmentToEdit(appointment); // Pasa la cita completa para edición
        setIsFormModalOpen(true);
    };

    const handleSaveSuccess = () => {
        fetchAppointments(); // Recargar la lista de citas después de guardar
        setIsFormModalOpen(false); // Cerrar el modal
        setCurrentAppointmentToEdit(null); // Limpiar la cita en edición
    };

    const handleDeleteConfirm = (appointment) => {
        setAppointmentToDelete(appointment);
        setShowDeleteConfirm(true);
    };

    const handleDelete = useCallback(async () => {
        setIsLoading(true);
        setShowDeleteConfirm(false); // Close the confirmation modal
        try {
            const response = await authFetchInternal(`/citas/${appointmentToDelete.id_cita}`, { method: 'DELETE' });
            if (response.success) {
                addNotification('success', response.message || 'Cita eliminada correctamente.', 5000);
                fetchAppointments();
            } else {
                addNotification('error', response.message || 'Error al eliminar la cita.', 5000);
            }
        } catch (err) {
            addNotification('error', `Error de conexión: ${err.message}`, 5000);
            console.error("Error deleting appointment:", err);
        } finally {
            setIsLoading(false);
            setAppointmentToDelete(null);
        }
    }, [authFetchInternal, addNotification, fetchAppointments, appointmentToDelete]);

    const handleViewDetails = useCallback(async (appointmentId) => {
        setIsLoading(true);
        try {
            const responseData = await authFetchInternal(`/citas/${appointmentId}`);
            if (responseData.success && responseData.data) {
                setViewingAppointment(responseData.data);
                setIsViewModalOpen(true);
            } else {
                addNotification('error', responseData.message || 'Error al cargar los detalles de la cita.', 5000);
            }
        } catch (err) {
            addNotification('error', `Error de conexión al cargar detalles: ${err.message}`, 5000);
            console.error("Error fetching appointment details:", err);
        } finally {
            setIsLoading(false);
        }
    }, [authFetchInternal, addNotification]);


    const handleChangeStatus = useCallback(async (id, currentStatus, targetStatus) => {
        if (!window.confirm(`¿Estás seguro de cambiar el estado de la cita a "${targetStatus}"?`)) {
            return;
        }
        setIsLoading(true);
        try {
            const response = await authFetchInternal(`/citas/${id}`, {
                method: 'PUT',
                body: { estado: targetStatus.toUpperCase() }
            });
            if (response.success) {
                addNotification('success', response.message || `Estado de cita actualizado a "${targetStatus}".`, 5000);
                fetchAppointments();
            } else {
                addNotification('error', response.message || `Error al actualizar el estado de la cita.`, 5000);
            }
        } catch (err) {
            addNotification('error', `Error de conexión: ${err.message}`, 5000);
            console.error("Error changing appointment status:", err);
        } finally {
            setIsLoading(false);
        }
    }, [authFetchInternal, addNotification, fetchAppointments]);

    const getStatusBadge = (status) => {
        switch (status.toLowerCase()) {
            case 'completa': return 'badge-success';
            case 'pendiente': return 'badge-warning';
            case 'aceptada': return 'badge-info';
            case 'rechazada': return 'badge-danger';
            case 'cancelada': return 'badge-secondary';
            default: return 'badge-secondary';
        }
    };

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
            </div>
        );
    }

    return (
        <div className="admin-content-container">
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
                            placeholder="Buscar citas por dueño, mascota, veterinario o servicio..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                    <div className="filter-buttons">
                        <button
                            className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                            onClick={() => setFilterStatus('all')}
                            disabled={isLoading}
                        >
                            Todas
                        </button>
                        <button
                            className={`filter-btn ${filterStatus === 'PENDIENTE' ? 'active' : ''}`}
                            onClick={() => setFilterStatus('PENDIENTE')}
                            disabled={isLoading}
                        >
                            Pendientes
                        </button>
                        <button
                            className={`filter-btn ${filterStatus === 'ACEPTADA' ? 'active' : ''}`}
                            onClick={() => setFilterStatus('ACEPTADA')}
                            disabled={isLoading}
                        >
                            Aceptadas
                        </button>
                        <button
                            className={`filter-btn ${filterStatus === 'COMPLETA' ? 'active' : ''}`}
                            onClick={() => setFilterStatus('COMPLETA')}
                            disabled={isLoading}
                        >
                            Completadas
                        </button>
                        <button
                            className={`filter-btn ${filterStatus === 'RECHAZADA' ? 'active' : ''}`}
                            onClick={() => setFilterStatus('RECHAZADA')}
                            disabled={isLoading}
                        >
                            Rechazadas
                        </button>
                        <button
                            className={`filter-btn ${filterStatus === 'CANCELADA' ? 'active' : ''}`}
                            onClick={() => setFilterStatus('CANCELADA')}
                            disabled={isLoading}
                        >
                            Canceladas
                        </button>
                    </div>
                    <button
                        className="add-new-btn"
                        onClick={handleAddNew}
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
                            <th>Mascota</th>
                            <th>Servicio</th>
                            <th>Veterinario</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAppointments.length > 0 ? (
                            filteredAppointments.map(app => (
                                <tr key={app.id_cita}>
                                    <td>{app.id_cita}</td>
                                    <td>{app.fecha}</td>
                                    <td>
                                        <FaUser className="icon" /> {app.cliente}
                                    </td>
                                    <td>
                                        {app.mascota_nombre} {/* Muestra solo el nombre de la mascota */}
                                    </td>
                                    <td>
                                        <FaNotesMedical className="icon" /> {app.servicio}
                                    </td>
                                    <td>
                                        {app.veterinario || 'N/A'}
                                    </td>
                                    <td>
                                        <span className={`status-badge ${getStatusBadge(app.estado)}`}>
                                            {getStatusText(app.estado)}
                                        </span>
                                    </td>
                                    <td className="actions-cell">
                                        <button
                                            className="btn-icon"
                                            onClick={() => handleViewDetails(app.id_cita)}
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
                                        {app.estado.toUpperCase() === 'PENDIENTE' && (
                                            <button
                                                className="btn-icon btn-accept"
                                                onClick={() => handleChangeStatus(app.id_cita, app.estado, 'ACEPTADA')}
                                                disabled={isLoading}
                                                title="Aceptar Cita"
                                            >
                                                <FaRegCheckCircle />
                                            </button>
                                        )}
                                        {app.estado.toUpperCase() === 'RECHAZADA' && (
                                            <button
                                                className="btn-icon btn-accept"
                                                onClick={() => handleChangeStatus(app.id_cita, app.estado, 'ACEPTADA')}
                                                disabled={isLoading}
                                                title="Re-aceptar Cita"
                                            >
                                                <FaRegCheckCircle />
                                            </button>
                                        )}
                                        {(app.estado.toUpperCase() === 'PENDIENTE' || app.estado.toUpperCase() === 'ACEPTADA') && (
                                            <button
                                                className="btn-icon btn-reject"
                                                onClick={() => handleChangeStatus(app.id_cita, app.estado, 'RECHAZADA')}
                                                disabled={isLoading}
                                                title="Rechazar Cita"
                                            >
                                                <FaRegTimesCircle />
                                            </button>
                                        )}
                                        {app.estado.toUpperCase() === 'ACEPTADA' && (
                                            <button
                                                className="btn-icon btn-complete"
                                                onClick={() => handleChangeStatus(app.id_cita, app.estado, 'COMPLETA')}
                                                disabled={isLoading}
                                                title="Completar Cita"
                                            >
                                                <FaCalendarCheck />
                                            </button>
                                        )}
                                        {(app.estado.toUpperCase() === 'PENDIENTE' || app.estado.toUpperCase() === 'ACEPTADA' || app.estado.toUpperCase() === 'RECHAZADA') && (
                                            <button
                                                className="btn-icon btn-cancel"
                                                onClick={() => handleChangeStatus(app.id_cita, app.estado, 'CANCELADA')}
                                                disabled={isLoading}
                                                title="Cancelar Cita"
                                            >
                                                <FaTimesCircle />
                                            </button>
                                        )}
                                        <button
                                            className="btn-icon btn-delete"
                                            onClick={() => handleDeleteConfirm(app)}
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
                                <td colSpan="8" className="no-results">
                                    <FaInfoCircle className="info-icon" />
                                    No se encontraron citas que coincidan con el filtro o la búsqueda.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Renderiza el AdminAppointmentForm como un componente separado */}
            <AdminAppointmentForm
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                appointment={currentAppointmentToEdit} // Pasa el objeto de la cita para edición o null para nueva
                onSaveSuccess={handleSaveSuccess}
            />

            {/* Modal para Confirmación de Eliminación */}
            <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Confirmar Eliminación">
                <div className="modal-content-delete">
                    <p>¿Estás seguro de que quieres eliminar la cita de <strong>{appointmentToDelete?.cliente}</strong> con <strong>{appointmentToDelete?.mascota_nombre}</strong> el <strong>{appointmentToDelete?.fecha}</strong>?</p>
                    <div className="form-actions">
                        <button className="btn-delete" onClick={handleDelete} disabled={isLoading}>
                            {isLoading ? <FaSpinner className="spinner" /> : <FaTrash />} Eliminar
                        </button>
                        <button className="btn-secondary" onClick={() => setShowDeleteConfirm(false)} disabled={isLoading}>
                            <FaTimes /> Cancelar
                        </button>
                    </div>
                </div>
            </Modal>

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
                                <p><strong>Notas Adicionales:</strong> {viewingAppointment.observaciones || 'N/A'}</p>
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
