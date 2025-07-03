// src/Pages/InicioAdministrador/AdminUsers.js
import React, { useState, useEffect, useCallback } from 'react';
import { FaUsers, FaSearch, FaEye, FaTrash, FaSpinner, FaInfoCircle, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { authFetch } from './api'; // Asegúrate de que la ruta sea correcta
import './Styles/AdminUser.css'; // Asegúrate de que este CSS exista
import { useNotifications } from '../../Notifications/NotificationContext'; // Importa el hook de notificaciones

function AdminUsers({ user }) {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const { addNotification } = useNotifications(); // Usa el hook de notificaciones

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const responseData = await authFetch('/admin/usuarios'); // Endpoint para usuarios (clientes)
            if (responseData.success && Array.isArray(responseData.data)) {
                setUsers(responseData.data);
            } else {
                addNotification('error', responseData.message || 'Formato de datos de usuarios incorrecto.', 5000);
                setUsers([]);
            }
        } catch (err) {
            setError(`Error al cargar los usuarios: ${err.message}`);
            addNotification('error', `Error de conexión: ${err.message}`, 5000);
            console.error('Error fetching users:', err);
            setUsers([]);
        } finally {
            setIsLoading(false);
        }
    }, [authFetch, addNotification]);

    useEffect(() => {
        if (user && user.token) {
            fetchUsers();
        } else {
            setError('No autorizado. Por favor, inicie sesión.');
            setIsLoading(false);
        }
    }, [user, fetchUsers]);

    useEffect(() => {
        const results = users.filter(user =>
            user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.telefono.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.numero_documento?.toLowerCase().includes(searchTerm.toLowerCase()) // Agregado para buscar por documento
        );
        setFilteredUsers(results);
    }, [searchTerm, users]);

    const handleDelete = useCallback(async (id) => {
        // *** REEMPLAZO DE window.confirm ***
        if (!window.confirm('¿Estás seguro de eliminar este cliente y todos sus datos (mascotas, historiales, citas)? Esta acción es irreversible.')) {
            return;
        }

        setIsLoading(true);
        try {
            const response = await authFetch(`/usuarios/${id}`, { method: 'DELETE' }); // Usa la ruta general de eliminación de usuarios
            if (response.success) {
                addNotification('success', response.message || 'Cliente y datos asociados eliminados correctamente.', 5000);
                fetchUsers(); // Re-fetch all users
            } else {
                addNotification('error', response.message || 'Error al eliminar el cliente.', 5000);
            }
        } catch (err) {
            addNotification('error', `Error de conexión: ${err.message}`, 5000);
            console.error("Error deleting user:", err);
        } finally {
            setIsLoading(false);
        }
    }, [authFetch, addNotification, fetchUsers]);

    const handleToggleActive = useCallback(async (userId, currentStatus) => {
        // *** REEMPLAZO DE window.confirm ***
        if (!window.confirm(`¿Estás seguro de ${currentStatus ? 'desactivar' : 'activar'} este cliente?`)) {
            return;
        }

        setIsLoading(true);
        try {
            const response = await authFetch(`/usuarios/${userId}`, {
                method: 'PUT',
                body: { active: !currentStatus }
            });
            if (response.success) {
                addNotification('success', response.message || `Cliente ${currentStatus ? 'desactivado' : 'activado'} correctamente.`, 5000);
                fetchUsers(); // Re-fetch all users
            } else {
                addNotification('error', response.message || `Error al cambiar el estado del cliente.`, 5000);
            }
        } catch (err) {
            addNotification('error', `Error de conexión: ${err.message}`, 5000);
            console.error("Error toggling user active status:", err);
        } finally {
            setIsLoading(false);
        }
    }, [authFetch, addNotification, fetchUsers]);


    if (isLoading && users.length === 0) {
        return (
            <div className="admin-loading">
                <div className="loading-spinner">
                    <FaSpinner className="spinner-icon" />
                </div>
                <p>Cargando clientes...</p>
            </div>
        );
    }

    if (error && users.length === 0) {
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
                    <FaUsers className="header-icon" />
                    Gestión de Clientes
                </h2>
                <div className="header-actions">
                    <div className="search-box">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Buscar clientes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                </div>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre Completo</th>
                            <th>Email</th>
                            <th>Teléfono</th>
                            <th>Mascotas</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map(client => (
                                <tr key={client.id}>
                                    <td>{client.id}</td>
                                    <td>{client.nombre} {client.apellido}</td>
                                    <td>{client.email}</td>
                                    <td>{client.telefono}</td>
                                    <td>{client.num_mascotas}</td>
                                    <td>
                                        <span className={`status-badge ${client.active ? 'badge-success' : 'badge-danger'}`}>
                                            {client.active ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="actions-cell">
                                        <Link to={`/admin/users/${client.id}`} className="btn-icon" title="Ver Detalles">
                                            <FaEye />
                                        </Link>
                                        <button
                                            className={`btn-icon ${client.active ? 'btn-deactivate' : 'btn-activate'}`}
                                            onClick={() => handleToggleActive(client.id, client.active)}
                                            disabled={isLoading}
                                            title={client.active ? 'Desactivar Cliente' : 'Activar Cliente'}
                                        >
                                            {client.active ? <FaToggleOn /> : <FaToggleOff />}
                                        </button>
                                        <button
                                            className="btn-icon btn-delete"
                                            onClick={() => handleDelete(client.id)}
                                            disabled={isLoading}
                                            title="Eliminar Cliente"
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
                                    No se encontraron clientes que coincidan con la búsqueda.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AdminUsers;
