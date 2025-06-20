import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEdit, FaTrash, FaSearch, FaBan, FaCheck, FaTimes, FaSpinner, FaInfoCircle, FaPlus, FaSave, FaEye } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { authFetch } from './api'; // Asegúrate de que la ruta sea correcta a tu api.js
import './Styles/AdminStyles.css'; // Estilos generales de administración
import AdminUserDetail from './AdminUserDetail'; // Importa el componente de detalle del usuario

/**
 * Componente AdminUsers
 * Gestiona la visualización, adición, edición, activación/desactivación y eliminación de usuarios (propietarios de mascotas).
 * También integra un modal para ver los detalles completos de cada usuario, incluyendo sus mascotas.
 * @param {object} props - Propiedades del componente.
 * @param {object} props.user - Objeto del usuario logueado (contiene el token JWT y rol).
 */
function AdminUsers({ user }) {
    // --- Estados del componente ---
    const [users, setUsers] = useState([]); // Lista original de usuarios fetched desde el backend
    const [filteredUsers, setFilteredUsers] = useState([]); // Lista de usuarios filtrados por búsqueda y estado
    const [searchTerm, setSearchTerm] = useState(''); // Término de búsqueda
    const [filterStatus, setFilterStatus] = useState('all'); // Estado de filtro: 'all', 'active', 'inactive'
    const [isLoading, setIsLoading] = useState(true); // Indica si los datos están cargando
    const [error, setError] = useState(''); // Mensaje de error general
    const [notification, setNotification] = useState(null); // Para notificaciones flotantes (éxito/error)

    // Estados para el modal de Añadir/Editar Usuario
    const [isFormOpen, setIsFormOpen] = useState(false); // Controla la visibilidad del modal del formulario
    const [currentUser, setCurrentUser] = useState(null); // Almacena el usuario siendo editado (null para nuevo)
    const [formData, setFormData] = useState({ // Datos del formulario
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        direccion: '',
        tipo_documento: '',
        numero_documento: '',
        fecha_nacimiento: '',
        password: '',
        confirmPassword: ''
    });
    const [validationErrors, setValidationErrors] = useState({}); // Errores de validación en tiempo real para el formulario
    const [isSubmitting, setIsSubmitting] = useState(false); // Indica si el formulario está en proceso de envío

    // Estados para el modal de Detalles de Usuario
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false); // Controla la visibilidad del modal de detalles
    const [selectedUserId, setSelectedUserId] = useState(null); // ID del usuario cuyos detalles se están viendo

    const navigate = useNavigate(); // Hook para navegación (aunque no se usa directamente en este componente, se mantiene por si acaso)

    /**
     * Muestra una notificación temporal en la UI.
     * @param {string} message - Mensaje a mostrar.
     * @param {string} type - Tipo de notificación ('success', 'error', 'warning', 'info').
     */
    const showNotification = useCallback((message, type = 'success') => {
        setNotification({ message, type });
        const timer = setTimeout(() => setNotification(null), 3000);
        return () => clearTimeout(timer); // Limpiar el timer si el componente se desmonta
    }, []);

    /**
     * Carga la lista de usuarios desde el backend.
     * Incluye manejo de estado de carga y errores.
     */
    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const responseData = await authFetch('/admin/usuarios'); // Endpoint para obtener usuarios (clientes)

            if (responseData.success && Array.isArray(responseData.data)) {
                // Mapea los datos para añadir campos derivados como 'name' y 'status'
                setUsers(responseData.data.map(u => ({
                    ...u,
                    name: `${u.nombre} ${u.apellido || ''}`.trim(),
                    status: u.active ? 'active' : 'inactive',
                    num_mascotas: u.num_mascotas || 0 // Asegurar que num_mascotas siempre sea un número
                })));
            } else {
                setError(responseData.message || 'Formato de datos de usuarios incorrecto.');
                showNotification(responseData.message || 'Error al cargar usuarios: Formato incorrecto.', 'error');
            }
        } catch (err) {
            setError(`Error al cargar usuarios: ${err.message}`);
            console.error('Error fetching users:', err);
        } finally {
            setIsLoading(false);
        }
    }, [authFetch, showNotification, setError, setIsLoading]);

    // Efecto que se ejecuta al montar el componente o cuando el objeto 'user' cambia.
    // Llama a `fetchUsers` si el usuario está autorizado.
    useEffect(() => {
        if (user && user.token) {
            fetchUsers();
        } else {
            setIsLoading(false);
            setError('No autorizado. Por favor, inicie sesión.');
            showNotification('No autorizado para ver usuarios.', 'error');
        }
    }, [fetchUsers, user, showNotification]);

    // Efecto para filtrar la lista de usuarios cada vez que `searchTerm`, `users` o `filterStatus` cambian.
    useEffect(() => {
        let results = users.filter(userItem =>
            userItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            userItem.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            userItem.telefono.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (userItem.numero_documento && userItem.numero_documento.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        // Aplicar filtro por estado
        if (filterStatus === 'active') {
            results = results.filter(userItem => userItem.active);
        } else if (filterStatus === 'inactive') {
            results = results.filter(userItem => !userItem.active);
        }
        // 'all' no necesita filtrado adicional

        setFilteredUsers(results);
    }, [searchTerm, users, filterStatus]);

    // =============================================
    // Funciones de Validación de Formulario
    // =============================================

    /**
     * Valida un campo específico del formulario y retorna un mensaje de error si existe.
     * @param {string} name - Nombre del campo a validar (ej. 'email', 'password').
     * @param {string} value - Valor actual del campo.
     * @param {object} currentFormData - El estado actual completo del formData (para validaciones cruzadas).
     * @param {boolean} isNewUser - True si se está creando un nuevo usuario, false si se edita.
     * @returns {string} Mensaje de error o cadena vacía si es válido.
     */
    const validateField = useCallback((name, value, currentFormData = formData, isNewUser = !currentUser) => {
        let message = '';
        switch (name) {
            case 'nombre':
            case 'apellido':
                if (!value) {
                    message = `${name === 'nombre' ? 'El nombre' : 'El apellido'} es obligatorio.`;
                } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s-]{2,50}$/.test(value)) {
                    message = `Solo letras (2-50 caracteres) en ${name === 'nombre' ? 'el nombre' : 'el apellido'}.`;
                }
                break;
            case 'email':
                if (!value) {
                    message = 'El email es obligatorio.';
                } else if (!/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(value)) {
                    message = 'Formato de email inválido (ej. usuario@dominio.com).';
                }
                break;
            case 'telefono':
                if (!value) {
                    message = 'El teléfono es obligatorio.';
                } else if (!/^\d{10}$/.test(value)) {
                    message = 'El teléfono debe ser un número de 10 dígitos.';
                }
                break;
            case 'direccion':
                if (value && value.length > 0) {
                    // La dirección debe contener al menos una letra, un número y el caracter '#' o '-'
                    if (!/(?=.*[a-zA-Z])(?=.*\d)(?=.*[#-])/.test(value)) {
                        message = 'Formato de dirección inválido (ej. Calle 15 #19C - 55).';
                    } else if (value.length < 5 || value.length > 200) {
                        message = 'La dirección debe tener entre 5 y 200 caracteres.';
                    }
                }
                break;
            case 'tipo_documento':
                const validTypes = ['CC', 'CE', 'TI', 'PASAPORTE', 'NIT']; // Más tipos de documento
                if (value && !validTypes.includes(value)) {
                    message = 'Tipo de documento inválido.';
                }
                break;
            case 'numero_documento':
                if (value && value.length > 0) {
                    if (!/^[a-zA-Z0-9]{5,20}$/.test(value)) { // Permite alfanumérico, 5-20 caracteres
                        message = 'Número de documento debe ser alfanumérico y tener entre 5 y 20 caracteres.';
                    }
                }
                break;
            case 'fecha_nacimiento':
                if (value) {
                    const dob = new Date(value + 'T00:00:00'); // Añadir T00:00:00 para evitar problemas de zona horaria
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    if (dob >= today) {
                        message = 'La fecha de nacimiento no puede ser futura o de hoy.';
                    } else {
                        const ageDiffMs = today.getTime() - dob.getTime();
                        const ageDate = new Date(ageDiffMs); // fake date
                        const age = Math.abs(ageDate.getUTCFullYear() - 1970);
                        if (age < 18) {
                            message = 'El usuario debe ser mayor de 18 años.';
                        }
                    }
                }
                break;
            case 'password':
                // Validación de contraseña para nuevo usuario o si se está cambiando
                // Solo es obligatorio para nuevos usuarios. En edición, es opcional si no se llena.
                if (isNewUser || (value && value.length > 0)) {
                    if (!value) {
                        message = isNewUser ? 'La contraseña es obligatoria.' : 'La contraseña no puede estar vacía si se va a cambiar.';
                    } else if (value.length < 8) {
                        message = 'Debe tener al menos 8 caracteres.';
                    } else if (!/[A-Z]/.test(value)) {
                        message = 'Debe contener al menos una mayúscula.';
                    } else if (!/[a-z]/.test(value)) {
                        message = 'Debe contener al menos una minúscula.';
                    } else if (!/[0-9]/.test(value)) {
                        message = 'Debe contener al menos un número.';
                    } else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~` ]/.test(value)) {
                        message = 'Debe contener al menos un carácter especial (ej. !@#$).';
                    }
                }
                break;
            case 'confirmPassword':
                // Compara con el campo 'password' en el formData actual
                // Solo es obligatorio si `password` tiene un valor o si es un nuevo usuario
                if ((currentFormData.password && currentFormData.password.length > 0) || isNewUser) {
                    if (!value) {
                        message = 'Confirma tu contraseña.';
                    } else if (value !== currentFormData.password) {
                        message = 'Las contraseñas no coinciden.';
                    }
                }
                break;
            default:
                break;
        }
        return message;
    }, [currentUser, formData]); // Dependencias para useCallback

    // =============================================
    // Handlers de Eventos del Formulario
    // =============================================

    /**
     * Maneja el cambio en los inputs del formulario y activa la validación en tiempo real.
     * @param {object} e - Evento de cambio.
     */
    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Valida el campo inmediatamente y actualiza los errores de validación
        // Pasa el estado actual de formData incluyendo el valor que acaba de cambiar para validaciones cruzadas.
        const updatedFormData = { ...formData, [name]: value };
        const errorMessage = validateField(name, value, updatedFormData);
        setValidationErrors(prev => ({ ...prev, [name]: errorMessage }));

        // Si es un campo de contraseña y se está escribiendo, valida también confirmPassword
        if (name === 'password' && updatedFormData.confirmPassword.length > 0) {
            const confirmPassError = validateField('confirmPassword', updatedFormData.confirmPassword, updatedFormData);
            setValidationErrors(prev => ({ ...prev, confirmPassword: confirmPassError }));
        }
    }, [formData, validateField]);


    /**
     * Maneja el evento onBlur (cuando un input pierde el foco) para activar la validación.
     * @param {object} e - Evento onBlur.
     */
    const handleInputBlur = useCallback((e) => {
        const { name, value } = e.target;
        // Solo valida si el campo tiene un valor o es un campo requerido que está vacío.
        // Esto evita mostrar errores vacíos en campos opcionales al perder el foco.
        const isRequired = e.target.required;
        if (value.trim() !== '' || isRequired) {
            const errorMessage = validateField(name, value, formData);
            setValidationErrors(prev => ({ ...prev, [name]: errorMessage }));
        }
    }, [formData, validateField]);

    /**
     * Maneja el cambio de estado (activar/desactivar) de un usuario.
     * @param {number} id - ID del usuario.
     * @param {string} currentStatus - Estado actual ('active' o 'inactive').
     */
    const toggleStatus = useCallback(async (id, currentStatus) => {
        setIsSubmitting(true);
        setError('');
        try {
            const newStatus = currentStatus === 'active' ? 0 : 1; // 0 para inactivo, 1 para activo
            const responseData = await authFetch(`/usuarios/${id}`, {
                method: 'PUT',
                body: { active: newStatus } // Solo enviar el campo 'active'
            });

            if (responseData.success) {
                setUsers(prevUsers => prevUsers.map(userItem =>
                    userItem.id === id ? {
                        ...userItem,
                        active: newStatus,
                        status: newStatus ? 'active' : 'inactive' // Actualizar el status para el badge
                    } : userItem
                ));
                showNotification(responseData.message || `Usuario ${newStatus ? 'activado' : 'desactivado'} correctamente.`);
            } else {
                showNotification(responseData.message || 'Error al cambiar estado del usuario.', 'error');
            }
        } catch (err) {
            showNotification(`Error al cambiar estado: ${err.message}`, 'error');
            console.error('Error toggling user status:', err);
        } finally {
            setIsSubmitting(false);
        }
    }, [authFetch, showNotification, setUsers, setError, setIsSubmitting]);

    /**
     * Maneja la eliminación de un usuario.
     * Requiere confirmación del usuario debido a la naturaleza irreversible de la acción.
     * @param {number} id - ID del usuario a eliminar.
     */
    const handleDelete = useCallback(async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este usuario? Esta acción es irreversible y eliminará también sus mascotas e historial médico asociados.')) {
            return;
        }
        setIsSubmitting(true);
        setError('');
        try {
            const responseData = await authFetch(`/usuarios/${id}`, { method: 'DELETE' });
            if (responseData.success) {
                setUsers(prevUsers => prevUsers.filter(userItem => userItem.id !== id));
                showNotification(responseData.message || 'Usuario eliminado correctamente.');
            } else {
                showNotification(responseData.message || 'Error al eliminar usuario.', 'error');
            }
        } catch (err) {
            showNotification(`Error al eliminar usuario: ${err.message}`, 'error');
            console.error('Error deleting user:', err);
        } finally {
            setIsSubmitting(false);
        }
    }, [authFetch, showNotification, setUsers, setError, setIsSubmitting]);

    /**
     * Prepara el formulario para editar un usuario existente.
     * @param {object} userItem - Objeto del usuario a editar.
     */
    const handleEdit = useCallback((userItem) => {
        setCurrentUser(userItem);
        setFormData({
            nombre: userItem.nombre,
            apellido: userItem.apellido || '',
            email: userItem.email,
            telefono: userItem.telefono,
            direccion: userItem.direccion || '',
            tipo_documento: userItem.tipo_documento || '',
            numero_documento: userItem.numero_documento || '',
            // Formatear la fecha de nacimiento a YYYY-MM-DD para el input type="date"
            fecha_nacimiento: userItem.fecha_nacimiento ? userItem.fecha_nacimiento.split('T')[0] : '',
            password: '', // Vacío para que el campo no muestre la contraseña y sea opcional cambiarla
            confirmPassword: ''
        });
        setValidationErrors({}); // Limpiar errores al abrir el formulario
        setIsFormOpen(true); // Abrir el modal del formulario
        setError('');
    }, []);

    /**
     * Prepara el formulario para añadir un nuevo usuario.
     */
    const handleAddNew = useCallback(() => {
        setCurrentUser(null); // No hay usuario actual (es nuevo)
        setFormData({ // Limpiar todos los campos del formulario
            nombre: '', apellido: '', email: '', telefono: '', direccion: '',
            tipo_documento: '', numero_documento: '', fecha_nacimiento: '',
            password: '', confirmPassword: ''
        });
        setValidationErrors({}); // Limpiar errores al abrir el formulario
        setIsFormOpen(true); // Abrir el modal del formulario
        setError('');
    }, []);

    /**
     * Cierra el modal del formulario y resetea sus estados.
     */
    const handleCancelForm = useCallback(() => {
        setIsFormOpen(false);
        setCurrentUser(null);
        setFormData({
            nombre: '', apellido: '', email: '', telefono: '', direccion: '',
            tipo_documento: '', numero_documento: '', fecha_nacimiento: '',
            password: '', confirmPassword: ''
        });
        setValidationErrors({});
        setError('');
    }, []);

    /**
     * Envía el formulario de añadir/editar usuario al backend.
     * Primero realiza una validación completa de todos los campos.
     * @param {object} e - Evento de envío del formulario.
     */
    const handleSubmitForm = useCallback(async (e) => {
        e.preventDefault();
        setError('');

        // Validar todos los campos antes de enviar
        let errors = {};
        // Para la validación completa, necesitamos considerar si es un nuevo usuario
        const isNewUserCheck = !currentUser;

        // Recorre todos los campos del formData y valida cada uno
        Object.keys(formData).forEach(key => {
            // Solo valida campos de contraseña si no es edición o si tienen valor en edición
            if ((key === 'password' || key === 'confirmPassword') && !isNewUserCheck && formData[key].length === 0) {
                return; // No validar si está vacío en edición
            }
            const errorMessage = validateField(key, formData[key], formData, isNewUserCheck);
            if (errorMessage) {
                errors[key] = errorMessage;
            }
        });

        // Si hay errores, actualiza el estado de errores de validación y muestra una notificación
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            showNotification('Por favor, corrige los errores en el formulario antes de guardar.', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            let responseData;
            const payload = { ...formData };
            delete payload.confirmPassword; // Eliminar confirmPassword, no debe ir al backend

            // Si es edición y la contraseña está vacía, no enviarla para no cambiarla
            if (currentUser && !payload.password) {
                delete payload.password;
            }

            if (currentUser) {
                // Modo edición: Realiza una petición PUT
                responseData = await authFetch(`/usuarios/${currentUser.id}`, {
                    method: 'PUT',
                    body: payload
                });
                if (responseData.success && responseData.data) {
                    // Actualiza la lista de usuarios en el estado local
                    setUsers(prevUsers => prevUsers.map(u =>
                        u.id === currentUser.id ? {
                            ...u,
                            ...responseData.data,
                            name: `${responseData.data.nombre} ${responseData.data.apellido || ''}`.trim(),
                            status: responseData.data.active ? 'active' : 'inactive'
                        } : u
                    ));
                    showNotification(responseData.message || 'Usuario actualizado correctamente.');
                } else {
                    showNotification(responseData.message || 'Error al actualizar usuario.', 'error');
                }
            } else {
                // Modo nuevo: Realiza una petición POST
                payload.role = 'usuario'; // Asigna rol por defecto para nuevos registros desde el admin
                payload.active = 1; // Por defecto, activo
                responseData = await authFetch('/register', { // Usa el endpoint de registro general
                    method: 'POST',
                    body: payload
                });
                if (responseData.success && responseData.data) {
                    // Añade el nuevo usuario a la lista en el estado local
                    setUsers(prevUsers => [...prevUsers, {
                        ...responseData.data,
                        name: `${responseData.data.nombre} ${responseData.data.apellido || ''}`.trim(),
                        status: responseData.data.active ? 'active' : 'inactive',
                        num_mascotas: 0 // Nuevo usuario no tiene mascotas al inicio
                    }]);
                    showNotification(responseData.message || 'Usuario creado correctamente.');
                } else {
                    showNotification(responseData.message || 'Error al crear usuario.', 'error');
                }
            }
            handleCancelForm(); // Cierra y limpia el formulario
            fetchUsers(); // Vuelve a cargar la lista para reflejar cualquier cambio
        } catch (err) {
            showNotification(`Error al guardar usuario: ${err.message}`, 'error');
            console.error('Error submitting form:', err);
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, currentUser, authFetch, showNotification, setUsers, handleCancelForm, fetchUsers, validateField, setError]);

    /**
     * Abre el modal de detalles del usuario.
     * @param {number} userId - ID del usuario para el cual ver los detalles.
     */
    const handleViewDetails = useCallback((userId) => {
        setSelectedUserId(userId);
        setIsDetailModalOpen(true);
    }, []);

    /**
     * Cierra el modal de detalles del usuario.
     */
    const handleCloseDetailModal = useCallback(() => {
        setIsDetailModalOpen(false);
        setSelectedUserId(null); // Limpiar el ID seleccionado
    }, []);

    // --- Renderizado Condicional: Estados de Carga y Error ---
    if (isLoading) {
        return (
            <div className="loading-container">
                <FaSpinner className="spinner-icon" />
                <p>Cargando usuarios...</p>
            </div>
        );
    }

    if (error && users.length === 0) {
        return <div className="error-message"><FaInfoCircle className="icon" /> {error}</div>;
    }

    // --- Renderizado Principal del Componente ---
    return (
        <div className="admin-content-container">
            {/* Notificaciones globales */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        key="user-notification"
                        className={`notification ${notification.type}`}
                        initial={{ opacity: 0, y: -20, pointerEvents: 'none' }}
                        animate={{ opacity: 1, y: 0, pointerEvents: 'auto' }}
                        exit={{ opacity: 0, y: -20, pointerEvents: 'none' }}
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

            {/* Modal para Añadir/Editar Usuario */}
            <AnimatePresence>
                {isFormOpen && (
                    <motion.div
                        key="user-form-modal"
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="modal-content"
                            initial={{ y: "-100vh", opacity: 0 }}
                            animate={{ y: "0", opacity: 1 }}
                            exit={{ y: "100vh", opacity: 0 }}
                            transition={{ type: "spring", stiffness: 120, damping: 20 }}
                        >
                            <button className="close-modal-btn" onClick={handleCancelForm} disabled={isSubmitting}>
                                <FaTimes />
                            </button>
                            <div className="modal-header">
                                <h3>
                                    <FaUser className="form-icon" />
                                    {currentUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                                </h3>
                            </div>
                            
                            <form onSubmit={handleSubmitForm} className="modal-form">
                                <div className="form-grid">
                                    {/* Campo ID (solo en modo edición, deshabilitado) */}
                                    {currentUser && (
                                        <div className="form-group">
                                            <label htmlFor="id">ID</label>
                                            <input type="text" id="id" name="id" value={currentUser.id} disabled className="disabled-input-text" />
                                        </div>
                                    )}
                                    {/* Campo Nombre */}
                                    <div className="form-group">
                                        <label htmlFor="nombre">Nombre*</label>
                                        <input
                                            type="text"
                                            id="nombre"
                                            name="nombre"
                                            value={formData.nombre}
                                            onChange={handleInputChange}
                                            onBlur={handleInputBlur} // Valida al salir del campo
                                            disabled={isSubmitting}
                                            required
                                        />
                                        {validationErrors.nombre && <span className="error-message-inline">{validationErrors.nombre}</span>}
                                    </div>
                                    {/* Campo Apellido */}
                                    <div className="form-group">
                                        <label htmlFor="apellido">Apellido</label>
                                        <input
                                            type="text"
                                            id="apellido"
                                            name="apellido"
                                            value={formData.apellido}
                                            onChange={handleInputChange}
                                            onBlur={handleInputBlur}
                                            disabled={isSubmitting}
                                        />
                                        {validationErrors.apellido && <span className="error-message-inline">{validationErrors.apellido}</span>}
                                    </div>
                                    {/* Campo Email */}
                                    <div className="form-group">
                                        <label htmlFor="email">Email*</label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            onBlur={handleInputBlur}
                                            disabled={!!currentUser || isSubmitting} // Deshabilita en edición
                                            required={!currentUser} // Requerido solo para nuevos
                                        />
                                        {validationErrors.email && <span className="error-message-inline">{validationErrors.email}</span>}
                                    </div>
                                    {/* Campo Teléfono */}
                                    <div className="form-group">
                                        <label htmlFor="telefono">Teléfono*</label>
                                        <input
                                            type="text"
                                            id="telefono"
                                            name="telefono"
                                            value={formData.telefono}
                                            onChange={handleInputChange}
                                            onBlur={handleInputBlur}
                                            disabled={isSubmitting}
                                            required
                                        />
                                        {validationErrors.telefono && <span className="error-message-inline">{validationErrors.telefono}</span>}
                                    </div>
                                    {/* Campo Dirección */}
                                    <div className="form-group">
                                        <label htmlFor="direccion">Dirección</label>
                                        <input
                                            type="text"
                                            id="direccion"
                                            name="direccion"
                                            value={formData.direccion}
                                            onChange={handleInputChange}
                                            onBlur={handleInputBlur}
                                            placeholder="Ej. Calle 15 #19C - 55"
                                            disabled={isSubmitting}
                                        />
                                        {validationErrors.direccion && <span className="error-message-inline">{validationErrors.direccion}</span>}
                                    </div>
                                    {/* Campo Tipo Documento (Select) */}
                                    <div className="form-group">
                                        <label htmlFor="tipo_documento">Tipo Documento</label>
                                        <select
                                            id="tipo_documento"
                                            name="tipo_documento"
                                            value={formData.tipo_documento}
                                            onChange={handleInputChange}
                                            onBlur={handleInputBlur}
                                            disabled={isSubmitting}
                                        >
                                            <option value="">Selecciona</option>
                                            <option value="CC">CC</option>
                                            <option value="CE">CE</option>
                                            <option value="TI">TI</option>
                                            <option value="PASAPORTE">Pasaporte</option>
                                            <option value="NIT">NIT</option>
                                        </select>
                                        {validationErrors.tipo_documento && <span className="error-message-inline">{validationErrors.tipo_documento}</span>}
                                    </div>
                                    {/* Campo Número Documento */}
                                    <div className="form-group">
                                        <label htmlFor="numero_documento">Número Documento</label>
                                        <input
                                            type="text"
                                            id="numero_documento"
                                            name="numero_documento"
                                            value={formData.numero_documento}
                                            onChange={handleInputChange}
                                            onBlur={handleInputBlur}
                                            disabled={isSubmitting}
                                        />
                                        {validationErrors.numero_documento && <span className="error-message-inline">{validationErrors.numero_documento}</span>}
                                    </div>
                                    {/* Campo Fecha Nacimiento */}
                                    <div className="form-group">
                                        <label htmlFor="fecha_nacimiento">Fecha Nacimiento</label>
                                        <input
                                            type="date"
                                            id="fecha_nacimiento"
                                            name="fecha_nacimiento"
                                            value={formData.fecha_nacimiento}
                                            onChange={handleInputChange}
                                            onBlur={handleInputBlur}
                                            disabled={isSubmitting}
                                        />
                                        {validationErrors.fecha_nacimiento && <span className="error-message-inline">{validationErrors.fecha_nacimiento}</span>}
                                    </div>
                                    {/* Campos de Contraseña (condicionales) */}
                                    {/* Se muestran si es un nuevo usuario O si es un usuario existente y el campo password tiene algún valor */}
                                    {(!currentUser || (formData.password && formData.password.length > 0)) && (
                                        <>
                                            <div className="form-group">
                                                <label htmlFor="password">Contraseña{ !currentUser ? '*' : ' (dejar en blanco para no cambiar)' }</label>
                                                <input
                                                    type="password"
                                                    id="password"
                                                    name="password"
                                                    value={formData.password}
                                                    onChange={handleInputChange}
                                                    onBlur={handleInputBlur}
                                                    disabled={isSubmitting}
                                                    required={!currentUser}
                                                />
                                                {validationErrors.password && <span className="error-message-inline">{validationErrors.password}</span>}
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="confirmPassword">Confirmar Contraseña{ !currentUser ? '*' : '' }</label>
                                                <input
                                                    type="password"
                                                    id="confirmPassword"
                                                    name="confirmPassword"
                                                    value={formData.confirmPassword}
                                                    onChange={handleInputChange}
                                                    onBlur={handleInputBlur}
                                                    disabled={isSubmitting}
                                                    // Requerido si es nuevo usuario O si el campo password tiene algo (para la coincidencia)
                                                    required={!currentUser || (formData.password && formData.password.length > 0)}
                                                />
                                                {validationErrors.confirmPassword && <span className="error-message-inline">{validationErrors.confirmPassword}</span>}
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Acciones del formulario (botones) */}
                                <div className="form-actions">
                                    <button type="button" className="cancel-btn" onClick={handleCancelForm} disabled={isSubmitting}>
                                        <FaTimes /> Cancelar
                                    </button>
                                    <button type="submit" className="save-btn" disabled={isSubmitting}>
                                        {isSubmitting ? <FaSpinner className="spinner-icon" /> : <FaSave />}
                                        {isSubmitting ? 'Guardando...' : 'Guardar'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal de Detalles del Usuario */}
            <AnimatePresence>
                {isDetailModalOpen && (
                    <motion.div
                        key="user-detail-modal"
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {/* El componente AdminUserDetail se renderiza dentro del modal */}
                        <AdminUserDetail
                            userId={selectedUserId}
                            user={user} // Pasar el usuario logueado para authFetch
                            onClose={handleCloseDetailModal} // Función para cerrar el modal
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- Contenido Principal de la Página de Usuarios --- */}
            <div className="admin-content-header">
                <h2>
                    <FaUser className="header-icon" />
                    Gestión de Propietarios
                </h2>
                <div className="header-actions">
                    {/* Caja de búsqueda */}
                    <div className="search-box">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Buscar propietarios..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            disabled={isLoading || isSubmitting}
                        />
                        {/* Botón para limpiar búsqueda */}
                        {searchTerm && (
                            <button className="clear-search" onClick={() => setSearchTerm('')} disabled={isLoading || isSubmitting}>
                                <FaTimes />
                            </button>
                        )}
                    </div>
                    {/* Contenedor de botones de filtro de estado */}
                    <div className="filter-buttons">
                        <button
                            className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                            onClick={() => setFilterStatus('all')}
                            disabled={isLoading || isSubmitting}
                        >
                            Todos
                        </button>
                        <button
                            className={`filter-btn ${filterStatus === 'active' ? 'active' : ''}`}
                            onClick={() => setFilterStatus('active')}
                            disabled={isLoading || isSubmitting}
                        >
                            Activos
                        </button>
                        <button
                            className={`filter-btn ${filterStatus === 'inactive' ? 'active' : ''}`}
                            onClick={() => setFilterStatus('inactive')}
                            disabled={isLoading || isSubmitting}
                        >
                            Inactivos
                        </button>
                    </div>
                    {/* Botón para añadir nuevo propietario */}
                    <button onClick={handleAddNew} className="add-btn" disabled={isLoading || isSubmitting}>
                        <FaPlus /> Nuevo Propietario
                    </button>
                </div>
            </div>

            {/* Tabla de usuarios */}
            <div className="admin-table-container">
                {filteredUsers.length > 0 ? (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Email</th>
                                <th>Teléfono</th>
                                <th>Mascotas</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(userItem => (
                                <tr key={userItem.id}>
                                    <td>{userItem.id}</td>
                                    <td>{userItem.name}</td>
                                    <td>{userItem.email}</td>
                                    <td>{userItem.telefono}</td>
                                    <td>{userItem.num_mascotas || 0}</td> {/* Mostrar 0 si no hay mascotas */}
                                    <td>
                                        <span className={`status-badge ${userItem.status}`}>
                                            {userItem.status === 'active' ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="actions-cell">
                                        <button className="btn-details" onClick={() => handleViewDetails(userItem.id)} disabled={isSubmitting}>
                                            <FaEye /> Detalles
                                        </button>
                                        <button className="btn-edit" onClick={() => handleEdit(userItem)} disabled={isSubmitting}>
                                            <FaEdit /> Editar
                                        </button>
                                        <button
                                            className={`btn-status ${userItem.status === 'active' ? 'inactive' : 'active'}`}
                                            onClick={() => toggleStatus(userItem.id, userItem.status)}
                                            disabled={isSubmitting}
                                        >
                                            {userItem.status === 'active' ? <FaBan /> : <FaCheck />}
                                            {userItem.status === 'active' ? 'Desactivar' : 'Activar'}
                                        </button>
                                        <button
                                            className="btn-delete"
                                            onClick={() => handleDelete(userItem.id)}
                                            disabled={isSubmitting}
                                        >
                                            <FaTrash /> Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="no-results">
                        <FaInfoCircle className="info-icon" />
                        {searchTerm || filterStatus !== 'all' ?
                            'No se encontraron usuarios que coincidan con la búsqueda o el filtro.' :
                            'No hay usuarios registrados.'}
                        <button onClick={handleAddNew} className="add-btn" disabled={isLoading || isSubmitting}>
                            <FaPlus /> Nuevo Propietario
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminUsers;
