// src/Components/Admin/AdminUserManagement.js
import React, { useState, useEffect, useCallback } from 'react';
import { FaUser, FaPlus, FaSearch, FaTimes, FaSave, FaSpinner, FaEdit, FaTrash, FaInfoCircle, FaPaw } from 'react-icons/fa';
import { validateField } from '../../utils/validation'; // Importar la función de validación
import Modal from '../../Components/Modal';
import Notification from '../../Components/Notification';
import './Styles/AdminUserManagement.css'; // Asegúrate de que los estilos sean adecuados

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const AdminUserManagement = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null); // Para editar
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        direccion: '',
        password: '',
        confirmPassword: '',
        tipo_documento: '',
        numero_documento: '',
        fecha_nacimiento: '',
        active: true, // Por defecto activo
        imagen_url: ''
    });
    const [formErrors, setFormErrors] = useState({}); // Errores de validación del formulario
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    // Función para obtener el token de autenticación
    const getAuthToken = () => {
        return localStorage.getItem('token');
    };

    // Función mejorada para hacer fetch con autenticación
    const authFetch = useCallback(async (url, options = {}) => {
        const token = getAuthToken();
        if (!token) {
            setError('No se encontró token de autenticación. Por favor, inicia sesión de nuevo.');
            // Redirigir al login si no hay token
            // navigate('/login');
            throw new Error('No se encontró token de autenticación');
        }

        const defaultHeaders = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        const response = await fetch(url, {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers,
            },
        });

        if (response.status === 401 || response.status === 403) {
            setError('Sesión expirada o no autorizado. Por favor, inicia sesión de nuevo.');
            // navigate('/login');
            throw new Error('No autorizado');
        }

        return response;
    }, []);

    // Obtener usuarios
    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await authFetch(`${API_BASE_URL}/admin/usuarios`); // Endpoint para usuarios clientes
            const data = await response.json();
            if (data.success) {
                setUsers(data.data);
                setFilteredUsers(data.data);
            } else {
                setError(data.message || 'Error al cargar usuarios.');
            }
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Error al conectar con el servidor para cargar usuarios.');
        } finally {
            setIsLoading(false);
        }
    }, [authFetch]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Filtrar usuarios por término de búsqueda
    useEffect(() => {
        const lowercasedFilter = searchTerm.toLowerCase();
        const filtered = users.filter(user =>
            user.nombre.toLowerCase().includes(lowercasedFilter) ||
            user.apellido.toLowerCase().includes(lowercasedFilter) ||
            user.email.toLowerCase().includes(lowercasedFilter) ||
            user.telefono.toLowerCase().includes(lowercasedFilter)
        );
        setFilteredUsers(filtered);
    }, [searchTerm, users]);

    // Manejar cambios en el formulario
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        let newValue = type === 'checkbox' ? checked : value;

        // Convertir a mayúsculas para campos específicos
        if (['nombre', 'apellido', 'email', 'direccion', 'tipo_documento', 'numero_documento'].includes(name)) {
            newValue = typeof newValue === 'string' ? newValue.toUpperCase() : newValue;
        }
        
        setFormData(prev => ({ ...prev, [name]: newValue }));

        // Validar campo en tiempo real
        const validationError = validateField(name, newValue, formData, !currentUser);
        setFormErrors(prev => ({ ...prev, [name]: validationError }));
    };

    // Manejar blur para mostrar errores al salir del campo
    const handleBlur = (e) => {
        const { name, value } = e.target;
        const validationError = validateField(name, value, formData, !currentUser);
        setFormErrors(prev => ({ ...prev, [name]: validationError }));
    };

    // Abrir formulario para añadir nuevo usuario
    const handleAddNew = () => {
        setCurrentUser(null);
        setFormData({
            nombre: '',
            apellido: '',
            email: '',
            telefono: '',
            direccion: '',
            password: '',
            confirmPassword: '',
            tipo_documento: '',
            numero_documento: '',
            fecha_nacimiento: '',
            active: true,
            imagen_url: ''
        });
        setFormErrors({});
        setIsFormOpen(true);
    };

    // Abrir formulario para editar usuario existente
    const handleEdit = (user) => {
        setCurrentUser(user);
        setFormData({
            nombre: user.nombre || '',
            apellido: user.apellido || '',
            email: user.email || '',
            telefono: user.telefono || '',
            direccion: user.direccion || '',
            password: '', // No precargar contraseña por seguridad
            confirmPassword: '',
            tipo_documento: user.tipo_documento || '',
            numero_documento: user.numero_documento || '',
            fecha_nacimiento: user.fecha_nacimiento ? user.fecha_nacimiento.split('T')[0] : '', // FormatoYYYY-MM-DD
            active: user.active === 1,
            imagen_url: user.imagen_url || ''
        });
        setFormErrors({});
        setIsFormOpen(true);
    };

    // Enviar formulario (añadir o actualizar)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        setNotification(null);

        // Validar todos los campos antes de enviar
        let errors = {};
        let hasErrors = false;

        const fieldsToValidate = [
            'nombre', 'apellido', 'email', 'telefono', 'direccion',
            'tipo_documento', 'numero_documento', 'fecha_nacimiento'
        ];

        if (!currentUser) { // Si es un nuevo registro, la contraseña es obligatoria
            fieldsToValidate.push('password', 'confirmPassword');
        } else if (formData.password) { // Si se está editando y se ingresó una contraseña, validarla
            fieldsToValidate.push('password', 'confirmPassword');
        }

        for (const field of fieldsToValidate) {
            const errorMsg = validateField(field, formData[field], formData, !currentUser, currentUser?.email);
            if (errorMsg) {
                errors[field] = errorMsg;
                hasErrors = true;
            }
        }

        setFormErrors(errors);

        if (hasErrors) {
            setIsSubmitting(false);
            setError('Por favor, corrige los errores del formulario.');
            return;
        }

        try {
            let response;
            if (currentUser) {
                // Actualizar usuario
                const updateData = { ...formData };
                delete updateData.confirmPassword; // No enviar confirmPassword al backend
                if (!updateData.password) { // Si la contraseña está vacía, no la envíes para no cambiarla
                    delete updateData.password;
                }
                // Asegurarse de que experiencia, universidad, horario sean null para usuarios normales
                updateData.experiencia = null;
                updateData.universidad = null;
                updateData.horario = null;

                console.log("Sending update data to backend:", updateData); // Debugging log
                response = await authFetch(`${API_BASE_URL}/usuarios/${currentUser.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(updateData),
                });
            } else {
                // Crear nuevo usuario (cliente)
                const createData = { ...formData, role: 'usuario' };
                delete createData.confirmPassword;
                // Asegurarse de que experiencia, universidad, horario sean null para usuarios normales
                createData.experiencia = null;
                createData.universidad = null;
                createData.horario = null;

                console.log("Sending create data to backend:", createData); // Debugging log
                response = await authFetch(`${API_BASE_URL}/register`, { // Usar la ruta de registro general
                    method: 'POST',
                    body: JSON.stringify(createData),
                });
            }

            const data = await response.json();
            console.log("Backend response:", data); // Debugging log

            if (data.success) {
                setNotification({ message: data.message, type: 'success' });
                setIsFormOpen(false);
                fetchUsers(); // Recargar la lista de usuarios
            } else {
                setError(data.message || 'Error al guardar usuario.');
            }
        } catch (err) {
            console.error('Error saving user:', err);
            setError('Error al conectar con el servidor para guardar usuario.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Manejar eliminación de usuario
    const handleDeleteConfirm = (user) => {
        setUserToDelete(user);
        setShowDeleteConfirm(true);
    };

    const handleDelete = async () => {
        setIsSubmitting(true);
        setError('');
        setNotification(null);
        try {
            const response = await authFetch(`${API_BASE_URL}/usuarios/${userToDelete.id}`, {
                method: 'DELETE',
            });
            const data = await response.json();

            if (data.success) {
                setNotification({ message: data.message, type: 'success' });
                fetchUsers();
            } else {
                setError(data.message || 'Error al eliminar usuario.');
            }
        } catch (err) {
            console.error('Error deleting user:', err);
            setError('Error al conectar con el servidor para eliminar usuario.');
        } finally {
            setIsSubmitting(false);
            setShowDeleteConfirm(false);
            setUserToDelete(null);
        }
    };

    return (
        <div className="admin-container">
            <h1 className="admin-title"><FaUser /> Gestión de Clientes</h1>

            {notification && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}
            {error && <div className="error-message">{error}</div>}

            <div className="admin-actions">
                <div className="search-bar">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Buscar cliente por nombre, email o teléfono..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    {searchTerm && (
                        <FaTimes className="clear-search" onClick={() => setSearchTerm('')} />
                    )}
                </div>
                <button className="add-btn" onClick={handleAddNew} disabled={isLoading || isSubmitting}>
                    <FaPlus /> Registrar Nuevo Cliente
                </button>
            </div>

            {isLoading ? (
                <div className="loading-indicator">
                    <FaSpinner className="spinner" /> Cargando clientes...
                </div>
            ) : filteredUsers.length > 0 ? (
                <div className="table-responsive">
                    <table className="admin-table">
                        <thead>
                            <tr> {/* No whitespace here */}
                                <th>ID</th>
                                <th>Nombre Completo</th>
                                <th>Email</th>
                                <th>Teléfono</th>
                                <th>Mascotas</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr> {/* No whitespace here */}
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => (
                                <tr key={user.id}> {/* No whitespace here */}
                                    <td>{user.id}</td>
                                    <td>{user.nombre} {user.apellido}</td>
                                    <td>{user.email}</td>
                                    <td>{user.telefono}</td>
                                    <td>
                                        <div className="pet-count-badge">
                                            <FaPaw /> {user.num_mascotas || 0}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${user.active ? 'active' : 'inactive'}`}>
                                            {user.active ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="actions-column">
                                        <button
                                            onClick={() => handleEdit(user)}
                                            className="btn-edit"
                                            disabled={isLoading || isSubmitting}
                                            title="Editar Cliente"
                                        >
                                            <FaEdit /> Editar
                                        </button>
                                        <button
                                            onClick={() => handleDeleteConfirm(user)}
                                            className="btn-delete"
                                            disabled={isLoading || isSubmitting}
                                            title="Eliminar Cliente"
                                        >
                                            <FaTrash /> Eliminar
                                        </button>
                                    </td>
                                </tr> /* No whitespace here */
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="no-results">
                    <FaInfoCircle className="info-icon" />
                    {searchTerm ?
                        'No se encontraron clientes que coincidan con la búsqueda.' :
                        'No hay clientes registrados.'}
                    <button
                        className="add-btn"
                        onClick={handleAddNew}
                        disabled={isLoading || isSubmitting}
                    >
                        <FaPlus /> Registrar Nuevo Cliente
                    </button>
                </div>
            )}

            {/* Modal para añadir/editar usuario */}
            <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={currentUser ? "Editar Cliente" : "Registrar Nuevo Cliente"}>
                <form onSubmit={handleSubmit} className="admin-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="nombre">Nombre:</label>
                            <input
                                type="text"
                                id="nombre"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={formErrors.nombre ? 'input-error' : ''}
                                disabled={isSubmitting}
                            />
                            {formErrors.nombre && <span className="error-text">{formErrors.nombre}</span>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="apellido">Apellido:</label>
                            <input
                                type="text"
                                id="apellido"
                                name="apellido"
                                value={formData.apellido}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={formErrors.apellido ? 'input-error' : ''}
                                disabled={isSubmitting}
                            />
                            {formErrors.apellido && <span className="error-text">{formErrors.apellido}</span>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email:</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={formErrors.email ? 'input-error' : ''}
                                disabled={isSubmitting || (currentUser && currentUser.email === formData.email)} // Deshabilitar si es edición y no cambia el email
                            />
                            {formErrors.email && <span className="error-text">{formErrors.email}</span>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="telefono">Teléfono:</label>
                            <input
                                type="text"
                                id="telefono"
                                name="telefono"
                                value={formData.telefono}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={formErrors.telefono ? 'input-error' : ''}
                                disabled={isSubmitting}
                            />
                            {formErrors.telefono && <span className="error-text">{formErrors.telefono}</span>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="direccion">Dirección:</label>
                            <input
                                type="text"
                                id="direccion"
                                name="direccion"
                                value={formData.direccion}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={formErrors.direccion ? 'input-error' : ''}
                                disabled={isSubmitting}
                            />
                            {formErrors.direccion && <span className="error-text">{formErrors.direccion}</span>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="tipo_documento">Tipo de Documento:</label>
                            <select
                                id="tipo_documento"
                                name="tipo_documento"
                                value={formData.tipo_documento}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={formErrors.tipo_documento ? 'input-error' : ''}
                                disabled={isSubmitting}
                            >
                                <option value="">Seleccionar</option>
                                <option value="CC">CÉDULA DE CIUDADANÍA</option>
                                <option value="CE">CÉDULA DE EXTRANJERÍA</option>
                                <option value="TI">TARJETA DE IDENTIDAD</option>
                                <option value="PASAPORTE">PASAPORTE</option>
                                <option value="NIT">NIT</option>
                            </select>
                            {formErrors.tipo_documento && <span className="error-text">{formErrors.tipo_documento}</span>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="numero_documento">Número de Documento:</label>
                            <input
                                type="text"
                                id="numero_documento"
                                name="numero_documento"
                                value={formData.numero_documento}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={formErrors.numero_documento ? 'input-error' : ''}
                                disabled={isSubmitting}
                            />
                            {formErrors.numero_documento && <span className="error-text">{formErrors.numero_documento}</span>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="fecha_nacimiento">Fecha de Nacimiento:</label>
                            <input
                                type="date"
                                id="fecha_nacimiento"
                                name="fecha_nacimiento"
                                value={formData.fecha_nacimiento}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={formErrors.fecha_nacimiento ? 'input-error' : ''}
                                disabled={isSubmitting}
                            />
                            {formErrors.fecha_nacimiento && <span className="error-text">{formErrors.fecha_nacimiento}</span>}
                        </div>

                        {/* Campos de contraseña solo para nuevos registros o si se desea cambiar en edición */}
                        {!currentUser || formData.password.length > 0 ? (
                            <>
                                <div className="form-group">
                                    <label htmlFor="password">Contraseña {currentUser ? '(dejar vacío para no cambiar)' : '*'}:</label>
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className={formErrors.password ? 'input-error' : ''}
                                        disabled={isSubmitting}
                                    />
                                    {formErrors.password && <span className="error-text">{formErrors.password}</span>}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="confirmPassword">Confirmar Contraseña {currentUser ? '' : '*'}:</label>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className={formErrors.confirmPassword ? 'input-error' : ''}
                                        disabled={isSubmitting}
                                    />
                                    {formErrors.confirmPassword && <span className="error-text">{formErrors.confirmPassword}</span>}
                                </div>
                            </>
                        ) : null}

                        {/* Campo de estado activo/inactivo (solo para edición por admin) */}
                        {currentUser && (
                            <div className="form-group checkbox-group">
                                <input
                                    type="checkbox"
                                    id="active"
                                    name="active"
                                    checked={formData.active}
                                    onChange={handleChange}
                                    disabled={isSubmitting}
                                />
                                <label htmlFor="active">Activo</label>
                            </div>
                        )}
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? <FaSpinner className="spinner" /> : <FaSave />} {currentUser ? 'Actualizar Cliente' : 'Registrar Cliente'}
                        </button>
                        <button type="button" className="btn-secondary" onClick={() => setIsFormOpen(false)} disabled={isSubmitting}>
                            <FaTimes /> Cancelar
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal de confirmación de eliminación */}
            <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Confirmar Eliminación">
                <div className="modal-content-delete">
                    <p>¿Estás seguro de que quieres eliminar al cliente <strong>{userToDelete?.nombre} {userToDelete?.apellido}</strong>?</p>
                    <p>Esta acción eliminará también todas sus mascotas, historiales médicos y citas asociadas.</p>
                    <div className="form-actions">
                        <button className="btn-delete" onClick={handleDelete} disabled={isSubmitting}>
                            {isSubmitting ? <FaSpinner className="spinner" /> : <FaTrash />} Eliminar
                        </button>
                        <button className="btn-secondary" onClick={() => setShowDeleteConfirm(false)} disabled={isSubmitting}>
                            <FaTimes /> Cancelar
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default AdminUserManagement;
