// src/Pages/InicioAdministrador/ServicesManagement.js
import React, { useState, useEffect, useCallback } from 'react';
import { FaBriefcaseMedical, FaSearch, FaPlus, FaEdit, FaTrash, FaSpinner, FaTimes, FaInfoCircle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { authFetch } from './api'; // Asegúrate de que la ruta sea correcta
import './Styles/ServicesManagement.css'; // Asegúrate de que este CSS exista
import { useNotifications } from '../../Notifications/NotificationContext'; // Importa el hook de notificaciones

function ServicesManagement({ user }) {
    const [services, setServices] = useState([]);
    const [filteredServices, setFilteredServices] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState(null); // null o el objeto del servicio a editar
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addNotification } = useNotifications(); // Usa el hook de notificaciones

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
    }, [authFetch, addNotification]);

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
            service.precio.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredServices(results);
    }, [searchTerm, services]);

    const handleAdd = useCallback(() => {
        setEditingService(null);
        setFormData({ nombre: '', descripcion: '', precio: '' });
        setIsModalOpen(true);
    }, []);

    const handleEdit = useCallback((service) => {
        setEditingService(service);
        setFormData({
            nombre: service.nombre,
            descripcion: service.descripcion,
            precio: service.precio
        });
        setIsModalOpen(true);
    }, []);

    const handleFormChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            let response;
            if (editingService) {
                response = await authFetch(`/servicios/${editingService.id_servicio}`, {
                    method: 'PUT',
                    body: formData
                });
            } else {
                response = await authFetch('/servicios', {
                    method: 'POST',
                    body: formData
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
    }, [editingService, formData, authFetch, addNotification, fetchServices]);

    const handleDelete = useCallback(async (id) => {
        // *** REEMPLAZO DE window.confirm ***
        // Aquí deberías integrar un modal de confirmación personalizado.
        // Ejemplo conceptual:
        // const confirmed = await showCustomConfirmModal('¿Estás seguro de eliminar este servicio? Esta acción es irreversible.');
        // if (!confirmed) return;

        if (!window.confirm('¿Estás seguro de eliminar este servicio? Esta acción es irreversible.')) {
            return;
        }

        setIsLoading(true);
        try {
            const response = await authFetch(`/servicios/${id}`, { method: 'DELETE' });
            if (response.success) {
                addNotification('success', response.message || 'Servicio eliminado correctamente.', 5000);
                fetchServices(); // Re-fetch all services
            } else {
                addNotification('error', response.message || 'Error al eliminar el servicio.', 5000);
            }
        } catch (err) {
            addNotification('error', `Error de conexión: ${err.message}`, 5000);
            console.error("Error deleting service:", err);
        } finally {
            setIsLoading(false);
        }
    }, [authFetch, addNotification, fetchServices]);

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
                                            onClick={() => handleDelete(service.id_servicio)}
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
                    >
                        <motion.div
                            className="modal-content"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ duration: 0.2 }}
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
                                </div>
                                <button type="submit" className="submit-btn" disabled={isSubmitting}>
                                    {isSubmitting ? <FaSpinner className="spinner-icon" /> : (editingService ? 'Actualizar Servicio' : 'Registrar Servicio')}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default ServicesManagement;
