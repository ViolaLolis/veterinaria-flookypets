// src/Pages/InicioAdministrador/AdminsManagement.js
import React, { useState, useEffect, useCallback } from 'react';
import { FaUserShield, FaSearch, FaPlus, FaEdit, FaTrash, FaSpinner, FaTimes, FaInfoCircle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { authFetch } from '../../utils/api'; // Ruta ajustada
import { validateField } from '../../utils/validation'; // Importa la función de validación
import './Styles/AdminsManagement.css'; // Ruta relativa al CSS
import { useNotifications } from '../../Notifications/NotificationContext'; // Ruta ajustada
// import ConfirmationModal from '../../Components/ConfirmationModal'; // <-- Ruta hipotética para un modal de confirmación personalizado

function AdminsManagement({ user }) {
    const [admins, setAdmins] = useState([]);
    const [filteredAdmins, setFilteredAdmins] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState(null); // null o el objeto del admin a editar
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState({}); // Estado para errores de formulario
    const { addNotification } = useNotifications(); // Usa el hook de notificaciones

    // Estado para el modal de confirmación de eliminación (para reemplazar window.confirm)
    const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
    const [adminToDeleteId, setAdminToDeleteId] = useState(null);

    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        direccion: '',
        password: ''
        // Eliminado: imagen_url, ya que se gestiona en el perfil del usuario
    });

    const fetchAdmins = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const responseData = await authFetch('/api/admin/administrators'); // Endpoint para administradores
            if (responseData.success && Array.isArray(responseData.data)) {
                setAdmins(responseData.data);
            } else {
                // Notificación más específica si hay un mensaje de error del backend
                addNotification('error', responseData.message || 'Formato de datos de administradores incorrecto o API no disponible.', 5000);
                setAdmins([]);
            }
        } catch (err) {
            setError(`Error al cargar los administradores: ${err.message}`);
            addNotification('error', `Error de conexión al obtener administradores: ${err.message}`, 5000);
            console.error('Error fetching admins:', err);
            setAdmins([]);
        } finally {
            setIsLoading(false);
        }
    }, [authFetch, addNotification]);

    useEffect(() => {
        // Solo intenta cargar administradores si el usuario y el token existen.
        // Esto previene llamadas no autorizadas si el estado del usuario aún no se ha cargado.
        if (user && user.token) {
            fetchAdmins();
        } else {
            setError('No autorizado. Por favor, inicie sesión.');
            setIsLoading(false);
        }
    }, [user, fetchAdmins]);

    useEffect(() => {
        // Filtra los administradores basándose en el término de búsqueda
        const results = admins.filter(admin =>
            admin.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            admin.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
            admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (admin.telefono && admin.telefono.toLowerCase().includes(searchTerm.toLowerCase())) // Manejar si telefono puede ser null
        );
        setFilteredAdmins(results);
    }, [searchTerm, admins]);

    const handleAdd = useCallback(() => {
        setEditingAdmin(null); // Asegura que estamos en modo "añadir"
        setFormData({
            nombre: '',
            apellido: '',
            email: '',
            telefono: '',
            direccion: '',
            password: ''
        });
        setFormErrors({}); // Limpiar errores al abrir el modal
        setIsModalOpen(true);
    }, []);

    const handleEdit = useCallback((admin) => {
        setEditingAdmin(admin); // Establece el administrador a editar
        setFormData({
            nombre: admin.nombre,
            apellido: admin.apellido,
            email: admin.email,
            telefono: admin.telefono || '', // Asegurar que sea string vacío si es null/undefined
            direccion: admin.direccion || '', // Asegurar que sea string vacío si es null/undefined
            password: '', // No cargar la contraseña por seguridad
        });
        setFormErrors({}); // Limpiar errores al abrir el modal
        setIsModalOpen(true);
    }, []);

    const handleFormChange = useCallback((e) => {
        const { name, value } = e.target;
        let newValue = value;

        // Convertir a mayúsculas para campos específicos (nombre, apellido, direccion), excepto email y password
        if (['nombre', 'apellido', 'direccion'].includes(name)) {
            newValue = value.toUpperCase();
        }

        setFormData(prev => ({ ...prev, [name]: newValue }));

        // Validar el campo individualmente al cambiar
        // `isNewRecord` es true si `editingAdmin` es null
        const isNewRecord = !editingAdmin;
        const originalEmail = editingAdmin ? editingAdmin.email : '';
        const errorMessage = validateField(name, newValue, { ...formData, [name]: newValue }, isNewRecord, originalEmail);
        setFormErrors(prev => ({ ...prev, [name]: errorMessage }));
    }, [formData, editingAdmin]);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        setFormErrors({}); // Limpiar errores antes de una nueva validación

        // Validar todos los campos antes de enviar
        let errors = {};
        const isNewRecord = !editingAdmin;
        const originalEmail = editingAdmin ? editingAdmin.email : '';

        Object.keys(formData).forEach(key => {
            // Si estamos editando y el campo de contraseña está vacío, no lo validamos
            if (editingAdmin && key === 'password' && !formData[key]) {
                return;
            }
            // `isNewRecord` asegura que la validación de email para duplicados funcione correctamente
            const errorMessage = validateField(key, formData[key], formData, isNewRecord, originalEmail);
            if (errorMessage) {
                errors[key] = errorMessage;
            }
        });

        setFormErrors(errors);

        if (Object.keys(errors).length > 0) {
            addNotification('error', 'Por favor, corrige los errores en el formulario.', 5000);
            setIsSubmitting(false);
            return;
        }

        try {
            let response;
            const payload = { ...formData };

            // Si estamos editando y la contraseña está vacía, no la enviamos en el payload
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
                fetchAdmins(); // Re-fetch all admins to update the list
            } else {
                // Manejo de errores específicos del backend
                if (response.errors) { // Si el backend envía errores de validación de campos
                    setFormErrors(response.errors);
                    addNotification('error', 'Errores en los campos: ' + Object.values(response.errors).join(', '), 7000);
                } else {
                    addNotification('error', response.message || `Error al ${editingAdmin ? 'actualizar' : 'registrar'} el administrador.`, 5000);
                }
            }
        } catch (err) {
            addNotification('error', `Error de conexión: ${err.message}`, 5000);
            console.error("Error submitting admin form:", err);
        } finally {
            setIsSubmitting(false);
        }
    }, [editingAdmin, formData, authFetch, addNotification, fetchAdmins, validateField]); // Añadir validateField a las dependencias

    // Función para manejar la solicitud de eliminación (abre el modal de confirmación)
    const requestDelete = useCallback((id) => {
        setAdminToDeleteId(id);
        setShowConfirmDeleteModal(true);
    }, []);

    // Función para ejecutar la eliminación después de la confirmación
    const confirmDelete = useCallback(async () => {
        if (!adminToDeleteId) return;

        setShowConfirmDeleteModal(false); // Cierra el modal de confirmación
        setIsLoading(true); // Indica que la operación de eliminación está en curso

        try {
            const response = await authFetch(`/api/admin/administrators/${adminToDeleteId}`, { method: 'DELETE' });
            if (response.success) {
                addNotification('success', response.message || 'Administrador eliminado correctamente.', 5000);
                fetchAdmins(); // Vuelve a cargar la lista de administradores
            } else {
                addNotification('error', response.message || 'Error al eliminar el administrador.', 5000);
            }
        } catch (err) {
            addNotification('error', `Error de conexión: ${err.message}`, 5000);
            console.error("Error deleting admin:", err);
        } finally {
            setIsLoading(false); // Finaliza el estado de carga
            setAdminToDeleteId(null); // Limpia el ID del administrador a eliminar
        }
    }, [adminToDeleteId, authFetch, addNotification, fetchAdmins]);

    // Función para cancelar la eliminación
    const cancelDelete = useCallback(() => {
        setShowConfirmDeleteModal(false);
        setAdminToDeleteId(null);
    }, []);

    // Renderizado condicional para estados de carga y error iniciales
    if (isLoading && admins.length === 0 && !error) { // Solo mostrar spinner si no hay admins y no hay error aún
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
                <p>{error}</p> {/* Mostrar el mensaje de error directamente */}
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
                                        {user && admin.id !== user.id && (
                                            <button
                                                className="btn-icon btn-delete"
                                                onClick={() => requestDelete(admin.id)} // Llama a la función que abre el modal
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
                            // Rol y aria-modal para accesibilidad
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="modal-title"
                        >
                            <div className="modal-header">
                                <h3 id="modal-title">{editingAdmin ? 'Editar Administrador' : 'Registrar Nuevo Administrador'}</h3>
                                <button className="close-modal-btn" onClick={() => { setIsModalOpen(false); setFormErrors({}); }} aria-label="Cerrar modal">
                                    <FaTimes />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="modal-form">
                                <div className="form-group">
                                    <label htmlFor="nombre">Nombre</label>
                                    <input
                                        type="text"
                                        id="nombre"
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleFormChange}
                                        required
                                        disabled={isSubmitting}
                                        aria-invalid={formErrors.nombre ? "true" : "false"}
                                        aria-describedby={formErrors.nombre ? "nombre-error" : null}
                                    />
                                    {formErrors.nombre && <p id="nombre-error" className="error-message-inline">{formErrors.nombre}</p>}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="apellido">Apellido</label>
                                    <input
                                        type="text"
                                        id="apellido"
                                        name="apellido"
                                        value={formData.apellido}
                                        onChange={handleFormChange}
                                        disabled={isSubmitting}
                                        aria-invalid={formErrors.apellido ? "true" : "false"}
                                        aria-describedby={formErrors.apellido ? "apellido-error" : null}
                                    />
                                    {formErrors.apellido && <p id="apellido-error" className="error-message-inline">{formErrors.apellido}</p>}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="email">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleFormChange}
                                        required
                                        disabled={editingAdmin || isSubmitting} // Deshabilitado si editas o estás enviando
                                        aria-invalid={formErrors.email ? "true" : "false"}
                                        aria-describedby={formErrors.email ? "email-error" : null}
                                    />
                                    {formErrors.email && <p id="email-error" className="error-message-inline">{formErrors.email}</p>}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="telefono">Teléfono</label>
                                    <input
                                        type="text"
                                        id="telefono"
                                        name="telefono"
                                        value={formData.telefono}
                                        onChange={handleFormChange}
                                        required
                                        disabled={isSubmitting}
                                        aria-invalid={formErrors.telefono ? "true" : "false"}
                                        aria-describedby={formErrors.telefono ? "telefono-error" : null}
                                    />
                                    {formErrors.telefono && <p id="telefono-error" className="error-message-inline">{formErrors.telefono}</p>}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="direccion">Dirección</label>
                                    <input
                                        type="text"
                                        id="direccion"
                                        name="direccion"
                                        value={formData.direccion}
                                        onChange={handleFormChange}
                                        disabled={isSubmitting}
                                        aria-invalid={formErrors.direccion ? "true" : "false"}
                                        aria-describedby={formErrors.direccion ? "direccion-error" : null}
                                    />
                                    {formErrors.direccion && <p id="direccion-error" className="error-message-inline">{formErrors.direccion}</p>}
                                </div>
                                {!editingAdmin && (
                                    <div className="form-group">
                                        <label htmlFor="password">Contraseña</label>
                                        <input
                                            type="password"
                                            id="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleFormChange}
                                            required={!editingAdmin} // Requerida solo al añadir
                                            disabled={isSubmitting}
                                            aria-invalid={formErrors.password ? "true" : "false"}
                                            aria-describedby={formErrors.password ? "password-error" : null}
                                        />
                                        {formErrors.password && <p id="password-error" className="error-message-inline">{formErrors.password}</p>}
                                    </div>
                                )}
                                <button type="submit" className="submit-btn" disabled={isSubmitting}>
                                    {isSubmitting ? <FaSpinner className="spinner-icon" /> : (editingAdmin ? 'Actualizar Administrador' : 'Registrar Administrador')}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Componente Modal de Confirmación para Eliminar */}
            {/* Necesitarías crear este componente en src/Components/ConfirmationModal.js */}
            <AnimatePresence>
                {showConfirmDeleteModal && (
                    <motion.div
                        className="modal-overlay" // Reutilizar el overlay de modal
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="modal-content small-modal" // Clase para un modal más pequeño
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            role="alertdialog"
                            aria-modal="true"
                            aria-labelledby="confirm-delete-title"
                            aria-describedby="confirm-delete-description"
                        >
                            <div className="modal-header">
                                <h3 id="confirm-delete-title">Confirmar Eliminación</h3>
                                <button className="close-modal-btn" onClick={cancelDelete} aria-label="Cancelar y cerrar">
                                    <FaTimes />
                                </button>
                            </div>
                            <div className="modal-body" id="confirm-delete-description">
                                <p>¿Estás seguro de que deseas eliminar este administrador? Esta acción es irreversible y eliminará todos los datos asociados.</p>
                            </div>
                            <div className="modal-footer">
                                <button
                                    className="btn-cancel"
                                    onClick={cancelDelete}
                                    disabled={isLoading}
                                >
                                    Cancelar
                                </button>
                                <button
                                    className="submit-btn btn-delete" // Reutilizar estilos pero con color de eliminación
                                    onClick={confirmDelete}
                                    disabled={isLoading}
                                >
                                    {isLoading ? <FaSpinner className="spinner-icon" /> : 'Eliminar'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default AdminsManagement;