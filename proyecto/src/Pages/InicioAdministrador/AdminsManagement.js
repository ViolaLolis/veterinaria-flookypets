// src/Pages/InicioAdministrador/AdminsManagement.js
import React, { useState, useEffect, useCallback } from 'react';
import { FaUserShield, FaSearch, FaPlus, FaEdit, FaTrash, FaSpinner, FaTimes, FaInfoCircle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { authFetch } from './api'; // Asegúrate de que la ruta sea correcta
import './Styles/AdminsManagement.css'; // Asegúrate de que este CSS exista
import { useNotifications } from '../../Notifications/NotificationContext'; // Importa el hook de notificaciones

function AdminsManagement({ user }) {
    const [admins, setAdmins] = useState([]);
    const [filteredAdmins, setFilteredAdmins] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState(null); // null o el objeto del admin a editar
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addNotification } = useNotifications(); // Usa el hook de notificaciones

    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        direccion: '',
        password: '',
        imagen_url: ''
    });

    const fetchAdmins = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const responseData = await authFetch('/api/admin/administrators'); // Endpoint para administradores
            if (responseData.success && Array.isArray(responseData.data)) {
                setAdmins(responseData.data);
            } else {
                addNotification('error', responseData.message || 'Formato de datos de administradores incorrecto.', 5000);
                setAdmins([]);
            }
        } catch (err) {
            setError(`Error al cargar los administradores: ${err.message}`);
            addNotification('error', `Error de conexión: ${err.message}`, 5000);
            console.error('Error fetching admins:', err);
            setAdmins([]);
        } finally {
            setIsLoading(false);
        }
    }, [authFetch, addNotification]);

    useEffect(() => {
        if (user && user.token) {
            fetchAdmins();
        } else {
            setError('No autorizado. Por favor, inicie sesión.');
            setIsLoading(false);
        }
    }, [user, fetchAdmins]);

    useEffect(() => {
        const results = admins.filter(admin =>
            admin.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            admin.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
            admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            admin.telefono.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredAdmins(results);
    }, [searchTerm, admins]);

    const handleAdd = useCallback(() => {
        setEditingAdmin(null);
        setFormData({
            nombre: '',
            apellido: '',
            email: '',
            telefono: '',
            direccion: '',
            password: '',
            imagen_url: ''
        });
        setIsModalOpen(true);
    }, []);

    const handleEdit = useCallback((admin) => {
        setEditingAdmin(admin);
        setFormData({
            nombre: admin.nombre,
            apellido: admin.apellido,
            email: admin.email,
            telefono: admin.telefono,
            direccion: admin.direccion,
            password: '', // No cargar la contraseña por seguridad
            imagen_url: admin.imagen_url || ''
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
            const payload = { ...formData };

            // Si estamos editando y la contraseña está vacía, no la enviamos
            if (editingAdmin && !payload.password) {
                delete payload.password;
            }

            if (editingAdmin) {
                response = await authFetch(`/api/admin/administrators/${editingAdmin.id}`, {
                    method: 'PUT',
                    body: payload
                });
            } else {
                response = await authFetch('/api/admin/administrators', {
                    method: 'POST',
                    body: payload
                });
            }

            if (response.success) {
                addNotification('success', response.message || `Administrador ${editingAdmin ? 'actualizado' : 'registrado'} correctamente.`, 5000);
                setIsModalOpen(false);
                fetchAdmins(); // Re-fetch all admins
            } else {
                addNotification('error', response.message || `Error al ${editingAdmin ? 'actualizar' : 'registrar'} el administrador.`, 5000);
            }
        } catch (err) {
            addNotification('error', `Error de conexión: ${err.message}`, 5000);
            console.error("Error submitting admin form:", err);
        } finally {
            setIsSubmitting(false);
        }
    }, [editingAdmin, formData, authFetch, addNotification, fetchAdmins]);

    const handleDelete = useCallback(async (id) => {
        // *** REEMPLAZO DE window.confirm ***
        if (!window.confirm('¿Estás seguro de eliminar este administrador? Esta acción es irreversible y eliminará datos asociados.')) {
            return;
        }

        setIsLoading(true);
        try {
            const response = await authFetch(`/api/admin/administrators/${id}`, { method: 'DELETE' });
            if (response.success) {
                addNotification('success', response.message || 'Administrador eliminado correctamente.', 5000);
                fetchAdmins(); // Re-fetch all admins
            } else {
                addNotification('error', response.message || 'Error al eliminar el administrador.', 5000);
            }
        } catch (err) {
            addNotification('error', `Error de conexión: ${err.message}`, 5000);
            console.error("Error deleting admin:", err);
        } finally {
            setIsLoading(false);
        }
    }, [authFetch, addNotification, fetchAdmins]);

    if (isLoading && admins.length === 0) {
        return (
            <div className="admin-loading">
                <div className="loading-spinner">
                    <FaSpinner className="spinner-icon" />
                </div>
                <p>Cargando administradores...</p>
            </div>
        );
    }

    if (error && admins.length === 0) {
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
                    <FaUserShield className="header-icon" />
                    Gestión de Administradores
                </h2>
                <div className="header-actions">
                    <div className="search-box">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Buscar administradores..."
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
                        <FaPlus /> Nuevo Administrador
                    </button>
                </div>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Teléfono</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAdmins.length > 0 ? (
                            filteredAdmins.map(admin => (
                                <tr key={admin.id}>
                                    <td>{admin.id}</td>
                                    <td>{admin.nombre} {admin.apellido}</td>
                                    <td>{admin.email}</td>
                                    <td>{admin.telefono}</td>
                                    <td className="actions-cell">
                                        <button
                                            className="btn-icon"
                                            onClick={() => handleEdit(admin)}
                                            disabled={isLoading}
                                            title="Editar Administrador"
                                        >
                                            <FaEdit />
                                        </button>
                                        {/* No permitir que un admin se elimine a sí mismo */}
                                        {admin.id !== user.id && (
                                            <button
                                                className="btn-icon btn-delete"
                                                onClick={() => handleDelete(admin.id)}
                                                disabled={isLoading}
                                                title="Eliminar Administrador"
                                            >
                                                <FaTrash />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="no-results">
                                    <FaInfoCircle className="info-icon" />
                                    No se encontraron administradores que coincidan con la búsqueda.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal para Añadir/Editar Administrador */}
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
                                <h3>{editingAdmin ? 'Editar Administrador' : 'Registrar Nuevo Administrador'}</h3>
                                <button className="close-modal-btn" onClick={() => setIsModalOpen(false)}>
                                    <FaTimes />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="modal-form">
                                <div className="form-group">
                                    <label htmlFor="nombre">Nombre</label>
                                    <input type="text" id="nombre" name="nombre" value={formData.nombre} onChange={handleFormChange} required disabled={isSubmitting} />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="apellido">Apellido</label>
                                    <input type="text" id="apellido" name="apellido" value={formData.apellido} onChange={handleFormChange} disabled={isSubmitting} />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="email">Email</label>
                                    <input type="email" id="email" name="email" value={formData.email} onChange={handleFormChange} required disabled={editingAdmin || isSubmitting} />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="telefono">Teléfono</label>
                                    <input type="text" id="telefono" name="telefono" value={formData.telefono} onChange={handleFormChange} required disabled={isSubmitting} />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="direccion">Dirección</label>
                                    <input type="text" id="direccion" name="direccion" value={formData.direccion} onChange={handleFormChange} disabled={isSubmitting} />
                                </div>
                                {!editingAdmin && (
                                    <div className="form-group">
                                        <label htmlFor="password">Contraseña</label>
                                        <input type="password" id="password" name="password" value={formData.password} onChange={handleFormChange} required={!editingAdmin} disabled={isSubmitting} />
                                    </div>
                                )}
                                <div className="form-group">
                                    <label htmlFor="imagen_url">URL de Imagen (Opcional)</label>
                                    <input type="text" id="imagen_url" name="imagen_url" value={formData.imagen_url} onChange={handleFormChange} disabled={isSubmitting} />
                                </div>
                                <button type="submit" className="submit-btn" disabled={isSubmitting}>
                                    {isSubmitting ? <FaSpinner className="spinner-icon" /> : (editingAdmin ? 'Actualizar Administrador' : 'Registrar Administrador')}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default AdminsManagement;