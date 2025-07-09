// src/Pages/InicioAdministrador/ServicesManagement.js
import React, { useState, useEffect, useCallback } from 'react';
import { FaBriefcaseMedical, FaSearch, FaPlus, FaEdit, FaTrash, FaSpinner, FaTimes, FaInfoCircle, FaExclamationTriangle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { authFetch } from '../../utils/api'; // Ruta ajustada
import { validateField } from '../../utils/validation'; // Importa la función de validación
import './Styles/ServicesManagement.css'; // Ruta relativa al CSS
import { useNotifications } from '../../Notifications/NotificationContext'; // Ruta ajustada

function ServicesManagement({ user }) {
    const [services, setServices] = useState([]);
    const [filteredServices, setFilteredServices] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState(null); // null o el objeto del servicio a editar
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState({}); // Estado para errores de formulario
    const { addNotification } = useNotifications(); // Usa el hook de notificaciones

    // Estados para el modal de confirmación de eliminación
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState(null);
    const [deleteErrorMessage, setDeleteErrorMessage] = useState(''); // Mensaje de error específico para la eliminación
    const [isDeleting, setIsDeleting] = useState(false); // Estado para el spinner en el modal de eliminación


    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        precio: ''
    });

    const fetchServices = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const responseData = await authFetch('/servicios');
            if (responseData.success && Array.isArray(responseData.data)) {
                setServices(responseData.data);
            } else {
                addNotification('error', responseData.message || 'Formato de datos de servicios incorrecto.', 5000);
                setServices([]);
            }
        } catch (err) {
            setError(`Error al cargar los servicios: ${err.message}`);
            addNotification('error', `Error de conexión: ${err.message}`, 5000);
            console.error('Error fetching services:', err);
            setServices([]);
        } finally {
            setIsLoading(false);
        }
    }, [addNotification]);

    useEffect(() => {
        if (user && user.token) {
            fetchServices();
        } else {
            setError('No autorizado. Por favor, inicie sesión.');
            setIsLoading(false);
        }
    }, [user, fetchServices]);

    useEffect(() => {
        const results = services.filter(service =>
            service.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
            String(service.precio).toLowerCase().includes(searchTerm.toLowerCase()) // Convertir a string para buscar en precio
        );
        setFilteredServices(results);
    }, [searchTerm, services]);

    const handleAdd = useCallback(() => {
        setEditingService(null);
        setFormData({ nombre: '', descripcion: '', precio: '' });
        setFormErrors({}); // Limpiar errores al abrir el modal
        setIsModalOpen(true);
    }, []);

    const handleEdit = useCallback((service) => {
        setEditingService(service);
        setFormData({
            nombre: service.nombre,
            descripcion: service.descripcion,
            precio: service.precio
        });
        setFormErrors({}); // Limpiar errores al abrir el modal
        setIsModalOpen(true);
    }, []);

    const handleFormChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Validar el campo individualmente al cambiar
        const errorMessage = validateField(name, value, formData);
        setFormErrors(prev => ({ ...prev, [name]: errorMessage }));
    }, [formData]);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        // Validar todos los campos antes de enviar
        let errors = {};
        Object.keys(formData).forEach(key => {
            const errorMessage = validateField(key, formData[key], formData, !editingService);
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
            // IMPORTANTE: Pasar formData directamente, authFetch se encargará de stringificarlo
            if (editingService) {
                response = await authFetch(`/servicios/${editingService.id_servicio}`, {
                    method: 'PUT',
                    body: formData // Pasa el objeto directamente
                });
            } else {
                response = await authFetch('/servicios', {
                    method: 'POST',
                    body: formData // Pasa el objeto directamente
                });
            }

            if (response.success) {
                addNotification('success', response.message || `Servicio ${editingService ? 'actualizado' : 'registrado'} correctamente.`, 5000);
                setIsModalOpen(false);
                fetchServices(); // Re-fetch all services
            } else {
                addNotification('error', response.message || `Error al ${editingService ? 'actualizar' : 'registrar'} el servicio.`, 5000);
            }
        } catch (err) {
            addNotification('error', `Error de conexión: ${err.message}`, 5000);
            console.error("Error submitting service form:", err);
        } finally {
            setIsSubmitting(false);
        }
    }, [editingService, formData, addNotification, fetchServices]);

    // Función para abrir el modal de confirmación de eliminación
    const handleDeleteClick = useCallback((service) => {
        setServiceToDelete(service);
        setDeleteErrorMessage(''); // Limpiar cualquier mensaje de error anterior
        setShowDeleteConfirmModal(true);
    }, []);

    // Función para confirmar la eliminación después de la advertencia
    const confirmDelete = useCallback(async () => {
        if (!serviceToDelete) return;

        setIsDeleting(true);
        setDeleteErrorMessage(''); // Limpiar el mensaje de error antes de intentar eliminar

        try {
            const response = await authFetch(`/servicios/${serviceToDelete.id_servicio}`, { method: 'DELETE' });
            if (response.success) {
                addNotification('success', response.message || 'Servicio eliminado correctamente.', 5000);
                setShowDeleteConfirmModal(false); // Cerrar el modal
                fetchServices(); // Re-fetch all services
            } else {
                // Si el backend devuelve un mensaje específico de error (ej. por clave foránea)
                setDeleteErrorMessage(response.message || 'Error al eliminar el servicio.');
                addNotification('error', response.message || 'Error al eliminar el servicio.', 5000);
            }
        } catch (err) {
            const errorMessage = err.message || 'Error de conexión al servidor.';
            setDeleteErrorMessage(`Error de conexión: ${errorMessage}`);
            addNotification('error', errorMessage, 5000);
            console.error("Error deleting service:", err);
        } finally {
            setIsDeleting(false);
        }
    }, [serviceToDelete, addNotification, fetchServices]);

    if (isLoading && services.length === 0) {
        return (
            <div className="admin-loading">
                <div className="loading-spinner">
                    <FaSpinner className="spinner-icon" />
                </div>
                <p>Cargando servicios...</p>
            </div>
        );
    }

    if (error && services.length === 0) {
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
                    <FaBriefcaseMedical className="header-icon" />
                    Gestión de Servicios
                </h2>
                <div className="header-actions">
                    <div className="search-box">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Buscar servicios..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                    <button
                        className="add-new-btn"
                        onClick={handleAdd}
                        disabled={isLoading}
                    >
                        <FaPlus /> Nuevo Servicio
                    </button>
                </div>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Descripción</th>
                            <th>Precio</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredServices.length > 0 ? (
                            filteredServices.map(service => (
                                <tr key={service.id_servicio}>
                                    <td>{service.id_servicio}</td>
                                    <td>{service.nombre}</td>
                                    <td>{service.descripcion}</td>
                                    <td>{service.precio}</td>
                                    <td className="actions-cell">
                                        <button
                                            className="btn-icon"
                                            onClick={() => handleEdit(service)}
                                            disabled={isLoading}
                                            title="Editar Servicio"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            className="btn-icon btn-delete"
                                            onClick={() => handleDeleteClick(service)} // Usar handleDeleteClick
                                            disabled={isLoading}
                                            title="Eliminar Servicio"
                                        >
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="no-results">
                                    <FaInfoCircle className="info-icon" />
                                    No se encontraron servicios que coincidan con la búsqueda.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal para Añadir/Editar Servicio */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsModalOpen(false)} // Cerrar modal al hacer click fuera
                    >
                        <motion.div
                            className="modal-content"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={(e) => e.stopPropagation()} // Evitar que el click en el contenido cierre el modal
                        >
                            <div className="modal-header">
                                <h3>{editingService ? 'Editar Servicio' : 'Registrar Nuevo Servicio'}</h3>
                                <button className="close-modal-btn" onClick={() => setIsModalOpen(false)}>
                                    <FaTimes />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="modal-form">
                                <div className="form-group">
                                    <label htmlFor="nombre">Nombre del Servicio</label>
                                    <input
                                        type="text"
                                        id="nombre"
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleFormChange}
                                        required
                                        disabled={isSubmitting}
                                    />
                                    {formErrors.nombre && <p className="error-message-inline">{formErrors.nombre}</p>}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="descripcion">Descripción</label>
                                    <textarea
                                        id="descripcion"
                                        name="descripcion"
                                        value={formData.descripcion}
                                        onChange={handleFormChange}
                                        required
                                        disabled={isSubmitting}
                                    ></textarea>
                                    {formErrors.descripcion && <p className="error-message-inline">{formErrors.descripcion}</p>}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="precio">Precio</label>
                                    <input
                                        type="text"
                                        id="precio"
                                        name="precio"
                                        value={formData.precio}
                                        onChange={handleFormChange}
                                        placeholder="$XX.XXX"
                                        required
                                        disabled={isSubmitting}
                                    />
                                    {formErrors.precio && <p className="error-message-inline">{formErrors.precio}</p>}
                                </div>
                                <button type="submit" className="submit-btn" disabled={isSubmitting}>
                                    {isSubmitting ? <FaSpinner className="spinner-icon" /> : (editingService ? 'Actualizar Servicio' : 'Registrar Servicio')}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Nuevo Modal de Confirmación de Eliminación */}
            <AnimatePresence>
                {showDeleteConfirmModal && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowDeleteConfirmModal(false)}
                    >
                        <motion.div
                            className="modal-content"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h3>Confirmar Eliminación de Servicio</h3>
                                <button className="close-modal-btn" onClick={() => setShowDeleteConfirmModal(false)}>
                                    <FaTimes />
                                </button>
                            </div>
                            <div className="modal-body">
                                {deleteErrorMessage ? (
                                    <p className="error-message-modal">
                                        <FaExclamationTriangle className="icon-warning" /> {deleteErrorMessage}
                                    </p>
                                ) : (
                                    <p>¿Estás seguro de que deseas eliminar el servicio "<strong>{serviceToDelete?.nombre}</strong>"?</p>
                                )}
                                <p className="warning-text">Esta acción es irreversible si se completa.</p>
                            </div>
                            <div className="modal-actions">
                                <button
                                    className="btn-cancel"
                                    onClick={() => setShowDeleteConfirmModal(false)}
                                    disabled={isDeleting}
                                >
                                    Cancelar
                                </button>
                                <button
                                    className="btn-delete"
                                    onClick={confirmDelete}
                                    disabled={isDeleting || deleteErrorMessage !== ''} // Deshabilitar si hay un mensaje de error que impide la eliminación
                                >
                                    {isDeleting ? <FaSpinner className="spinner-icon" /> : 'Sí, Eliminar'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default ServicesManagement;