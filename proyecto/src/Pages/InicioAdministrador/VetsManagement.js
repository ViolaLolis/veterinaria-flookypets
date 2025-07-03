// src/Pages/InicioAdministrador/VetsManagement.js
import React, { useState, useEffect, useCallback } from 'react';
import { FaStethoscope, FaSearch, FaPlus, FaEdit, FaTrash, FaSpinner, FaTimes, FaInfoCircle, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { authFetch } from './api'; // Asegúrate de que la ruta sea correcta
import './Styles/VetsManagement.css'; // Asegúrate de que este CSS exista
import { useNotifications } from '../../Notifications/NotificationContext'; // Importa el hook de notificaciones

function VetsManagement({ user }) {
    const [vets, setVets] = useState([]);
    const [filteredVets, setFilteredVets] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVet, setEditingVet] = useState(null); // null o el objeto del veterinario a editar
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addNotification } = useNotifications(); // Usa el hook de notificaciones

    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        direccion: '',
        password: '',
        experiencia: '',
        universidad: '',
        horario: '',
        imagen_url: ''
    });

    const fetchVets = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const responseData = await authFetch('/usuarios/veterinarios'); // Endpoint para veterinarios
            if (responseData.success && Array.isArray(responseData.data)) {
                setVets(responseData.data);
            } else {
                addNotification('error', responseData.message || 'Formato de datos de veterinarios incorrecto.', 5000);
                setVets([]);
            }
        } catch (err) {
            setError(`Error al cargar los veterinarios: ${err.message}`);
            addNotification('error', `Error de conexión: ${err.message}`, 5000);
            console.error('Error fetching vets:', err);
            setVets([]);
        } finally {
            setIsLoading(false);
        }
    }, [authFetch, addNotification]);

    useEffect(() => {
        if (user && user.token) {
            fetchVets();
        } else {
            setError('No autorizado. Por favor, inicie sesión.');
            setIsLoading(false);
        }
    }, [user, fetchVets]);

    useEffect(() => {
        const results = vets.filter(vet =>
            vet.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vet.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vet.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vet.telefono.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredVets(results);
    }, [searchTerm, vets]);

    const handleAdd = useCallback(() => {
        setEditingVet(null);
        setFormData({
            nombre: '',
            apellido: '',
            email: '',
            telefono: '',
            direccion: '',
            password: '',
            experiencia: '',
            universidad: '',
            horario: '',
            imagen_url: ''
        });
        setIsModalOpen(true);
    }, []);

    const handleEdit = useCallback((vet) => {
        setEditingVet(vet);
        setFormData({
            nombre: vet.nombre,
            apellido: vet.apellido,
            email: vet.email,
            telefono: vet.telefono,
            direccion: vet.direccion,
            password: '', // No cargar la contraseña por seguridad
            experiencia: vet.experiencia || '',
            universidad: vet.universidad || '',
            horario: vet.horario || '',
            imagen_url: vet.imagen_url || ''
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
            if (editingVet && !payload.password) {
                delete payload.password;
            }

            if (editingVet) {
                response = await authFetch(`/usuarios/veterinarios/${editingVet.id}`, {
                    method: 'PUT',
                    body: payload
                });
            } else {
                response = await authFetch('/usuarios/veterinarios', {
                    method: 'POST',
                    body: payload
                });
            }

            if (response.success) {
                addNotification('success', response.message || `Veterinario ${editingVet ? 'actualizado' : 'registrado'} correctamente.`, 5000);
                setIsModalOpen(false);
                fetchVets(); // Re-fetch all vets
            } else {
                addNotification('error', response.message || `Error al ${editingVet ? 'actualizar' : 'registrar'} el veterinario.`, 5000);
            }
        } catch (err) {
            addNotification('error', `Error de conexión: ${err.message}`, 5000);
            console.error("Error submitting vet form:", err);
        } finally {
            setIsSubmitting(false);
        }
    }, [editingVet, formData, authFetch, addNotification, fetchVets]);

    const handleDelete = useCallback(async (id) => {
        // *** REEMPLAZO DE window.confirm ***
        if (!window.confirm('¿Estás seguro de eliminar este veterinario? Esta acción es irreversible y eliminará datos asociados.')) {
            return;
        }

        setIsLoading(true);
        try {
            const response = await authFetch(`/usuarios/veterinarios/${id}`, { method: 'DELETE' });
            if (response.success) {
                addNotification('success', response.message || 'Veterinario eliminado correctamente.', 5000);
                fetchVets(); // Re-fetch all vets
            } else {
                addNotification('error', response.message || 'Error al eliminar el veterinario.', 5000);
            }
        } catch (err) {
            addNotification('error', `Error de conexión: ${err.message}`, 5000);
            console.error("Error deleting vet:", err);
        } finally {
            setIsLoading(false);
        }
    }, [authFetch, addNotification, fetchVets]);

    const handleToggleActive = useCallback(async (vetId, currentStatus) => {
        // *** REEMPLAZO DE window.confirm ***
        if (!window.confirm(`¿Estás seguro de ${currentStatus ? 'desactivar' : 'activar'} este veterinario?`)) {
            return;
        }

        setIsLoading(true);
        try {
            const response = await authFetch(`/usuarios/${vetId}`, { // Usamos la ruta general de usuarios para toggle active
                method: 'PUT',
                body: { active: !currentStatus }
            });
            if (response.success) {
                addNotification('success', response.message || `Veterinario ${currentStatus ? 'desactivado' : 'activado'} correctamente.`, 5000);
                fetchVets(); // Re-fetch all vets
            } else {
                addNotification('error', response.message || `Error al cambiar el estado del veterinario.`, 5000);
            }
        } catch (err) {
            addNotification('error', `Error de conexión: ${err.message}`, 5000);
            console.error("Error toggling vet active status:", err);
        } finally {
            setIsLoading(false);
        }
    }, [authFetch, addNotification, fetchVets]);

    if (isLoading && vets.length === 0) {
        return (
            <div className="admin-loading">
                <div className="loading-spinner">
                    <FaSpinner className="spinner-icon" />
                </div>
                <p>Cargando veterinarios...</p>
            </div>
        );
    }

    if (error && vets.length === 0) {
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
                    <FaStethoscope className="header-icon" />
                    Gestión de Veterinarios
                </h2>
                <div className="header-actions">
                    <div className="search-box">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Buscar veterinarios..."
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
                        <FaPlus /> Nuevo Veterinario
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
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredVets.length > 0 ? (
                            filteredVets.map(vet => (
                                <tr key={vet.id}>
                                    <td>{vet.id}</td>
                                    <td>{vet.nombre} {vet.apellido}</td>
                                    <td>{vet.email}</td>
                                    <td>{vet.telefono}</td>
                                    <td>
                                        <span className={`status-badge ${vet.active ? 'badge-success' : 'badge-danger'}`}>
                                            {vet.active ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="actions-cell">
                                        <button
                                            className="btn-icon"
                                            onClick={() => handleEdit(vet)}
                                            disabled={isLoading}
                                            title="Editar Veterinario"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            className={`btn-icon ${vet.active ? 'btn-deactivate' : 'btn-activate'}`}
                                            onClick={() => handleToggleActive(vet.id, vet.active)}
                                            disabled={isLoading}
                                            title={vet.active ? 'Desactivar Veterinario' : 'Activar Veterinario'}
                                        >
                                            {vet.active ? <FaToggleOn /> : <FaToggleOff />}
                                        </button>
                                        <button
                                            className="btn-icon btn-delete"
                                            onClick={() => handleDelete(vet.id)}
                                            disabled={isLoading}
                                            title="Eliminar Veterinario"
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
                                    No se encontraron veterinarios que coincidan con la búsqueda.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal para Añadir/Editar Veterinario */}
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
                                <h3>{editingVet ? 'Editar Veterinario' : 'Registrar Nuevo Veterinario'}</h3>
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
                                    <input type="email" id="email" name="email" value={formData.email} onChange={handleFormChange} required disabled={editingVet || isSubmitting} />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="telefono">Teléfono</label>
                                    <input type="text" id="telefono" name="telefono" value={formData.telefono} onChange={handleFormChange} required disabled={isSubmitting} />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="direccion">Dirección</label>
                                    <input type="text" id="direccion" name="direccion" value={formData.direccion} onChange={handleFormChange} disabled={isSubmitting} />
                                </div>
                                {!editingVet && (
                                    <div className="form-group">
                                        <label htmlFor="password">Contraseña</label>
                                        <input type="password" id="password" name="password" value={formData.password} onChange={handleFormChange} required={!editingVet} disabled={isSubmitting} />
                                    </div>
                                )}
                                <div className="form-group">
                                    <label htmlFor="experiencia">Experiencia</label>
                                    <input type="text" id="experiencia" name="experiencia" value={formData.experiencia} onChange={handleFormChange} disabled={isSubmitting} />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="universidad">Universidad</label>
                                    <input type="text" id="universidad" name="universidad" value={formData.universidad} onChange={handleFormChange} disabled={isSubmitting} />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="horario">Horario</label>
                                    <input type="text" id="horario" name="horario" value={formData.horario} onChange={handleFormChange} disabled={isSubmitting} />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="imagen_url">URL de Imagen (Opcional)</label>
                                    <input type="text" id="imagen_url" name="imagen_url" value={formData.imagen_url} onChange={handleFormChange} disabled={isSubmitting} />
                                </div>
                                <button type="submit" className="submit-btn" disabled={isSubmitting}>
                                    {isSubmitting ? <FaSpinner className="spinner-icon" /> : (editingVet ? 'Actualizar Veterinario' : 'Registrar Veterinario')}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default VetsManagement;
