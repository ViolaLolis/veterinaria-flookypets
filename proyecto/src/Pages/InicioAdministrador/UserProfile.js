// src/Pages/InicioAdministrador/UserProfile.js
import React, { useState, useEffect, useCallback } from 'react';
import { FaUserCircle, FaEdit, FaSave, FaTimes, FaSpinner, FaCamera, FaInfoCircle } from 'react-icons/fa';
import { authFetch } from '../../utils/api'; // Ruta ajustada
import { validateField } from '../../utils/validation'; // Importa la función de validación
import './Styles/UserProfile.css'; // Ruta relativa al CSS
import { useNotifications } from '../../Notifications/NotificationContext'; // Ruta ajustada

function UserProfile({ user, setUser }) {
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null); // Para la nueva imagen
    const [formErrors, setFormErrors] = useState({}); // Estado para errores de formulario
    const { addNotification } = useNotifications(); // Usa el hook de notificaciones

    const fetchUserData = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            // Asumiendo que el ID del usuario está en el objeto 'user' de las props
            const responseData = await authFetch(`/usuarios/${user.id}`);
            if (responseData.success && responseData.data) {
                setUserData(responseData.data);
                // Asegura que fecha_nacimiento sea un string de fecha válido para input type="date"
                const formattedDate = responseData.data.fecha_nacimiento ? new Date(responseData.data.fecha_nacimiento).toISOString().split('T')[0] : '';
                setFormData({ ...responseData.data, fecha_nacimiento: formattedDate });
            } else {
                addNotification('error', responseData.message || 'Error al cargar los detalles de tu perfil.', 5000);
                setError(responseData.message || 'Perfil no encontrado.');
            }
        } catch (err) {
            setError(`Error de conexión al cargar tu perfil: ${err.message}`);
            addNotification('error', `Error de conexión: ${err.message}`, 5000);
            console.error('Error fetching user profile:', err);
        } finally {
            setIsLoading(false);
        }
    }, [user, authFetch, addNotification]);

    useEffect(() => {
        if (user && user.token) {
            fetchUserData();
        } else {
            setError('No autorizado. Por favor, inicie sesión.');
            setIsLoading(false);
        }
    }, [user, fetchUserData]);

    const handleFormChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;

        setFormData(prev => ({ ...prev, [name]: newValue }));

        // Validar el campo individualmente al cambiar
        const errorMessage = validateField(name, newValue, { ...formData, [name]: newValue }, false); // isNewEntry es false para edición
        setFormErrors(prev => ({ ...prev, [name]: errorMessage }));
    }, [formData]);

    const handleImageChange = useCallback((e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            // Validar el tipo de archivo y tamaño si es necesario
            if (!file.type.startsWith('image/')) {
                addNotification('error', 'Solo se permiten archivos de imagen.', 5000);
                setSelectedImage(null);
                return;
            }
            if (file.size > 5 * 1024 * 1024) { // 5 MB
                addNotification('error', 'La imagen es demasiado grande (máx. 5MB).', 5000);
                setSelectedImage(null);
                return;
            }
            setSelectedImage(file);
            setFormErrors(prev => ({ ...prev, imagen_url: null })); // Limpiar error si se selecciona una imagen válida
        }
    }, [addNotification]);

    const handleSave = useCallback(async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        // Validar todos los campos antes de enviar
        let errors = {};
        Object.keys(formData).forEach(key => {
            // No validar password aquí, ya que no se edita en este formulario
            const errorMessage = validateField(key, formData[key], formData, false); // isNewEntry es false
            if (errorMessage) {
                errors[key] = errorMessage;
            }
        });

        // Validar la imagen si se seleccionó una nueva
        if (selectedImage) {
            if (!selectedImage.type.startsWith('image/')) {
                errors.imagen_url = 'Solo se permiten archivos de imagen.';
            } else if (selectedImage.size > 5 * 1024 * 1024) {
                errors.imagen_url = 'La imagen es demasiado grande (máx. 5MB).';
            }
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            addNotification('error', 'Por favor, corrige los errores en el formulario.', 5000);
            setIsSubmitting(false);
            return;
        }

        let imageUrlToSave = userData.imagen_url; // Mantener la imagen actual por defecto

        try {
            if (selectedImage) {
                const uploadFormData = new FormData();
                uploadFormData.append('image', selectedImage);
                // Asegúrate de que tu backend tenga un endpoint '/upload-image'
                // que acepte FormData y devuelva la URL de la imagen subida.
                const uploadResponse = await authFetch('/upload-image', {
                    method: 'POST',
                    body: uploadFormData,
                    // No Content-Type aquí, el navegador lo establecerá automáticamente para FormData
                    headers: {
                        'Content-Type': undefined // Importante para que fetch no lo ponga como application/json
                    }
                });

                if (uploadResponse.success && uploadResponse.imageUrl) {
                    imageUrlToSave = uploadResponse.imageUrl;
                    addNotification('success', 'Imagen de perfil actualizada correctamente.', 3000);
                } else {
                    addNotification('error', uploadResponse.message || 'Error al subir la imagen. No se guardarán los cambios.', 5000);
                    setIsSubmitting(false);
                    return; // Detener el proceso si la subida de imagen falla
                }
            }

            const payload = { ...formData, imagen_url: imageUrlToSave };
            // Eliminar campos que no se deben enviar o que el backend no espera
            delete payload.id; // El ID va en la URL
            delete payload.created_at;
            delete payload.role; // El rol no debe ser editable desde aquí
            // La contraseña no se maneja en este formulario, así que no la enviamos.
            delete payload.password; // Asegurarse de que no se envíe una contraseña vacía si no se cambió.
            delete payload.reset_token;
            delete payload.reset_token_expires;
            delete payload.experiencia; // Campos específicos de veterinario, no de admin
            delete payload.universidad;
            delete payload.horario;


            const response = await authFetch(`/usuarios/${user.id}`, {
                method: 'PUT',
                body: payload
            });

            if (response.success) {
                addNotification('success', response.message || 'Perfil actualizado correctamente.', 5000);
                setIsEditing(false);
                fetchUserData(); // Re-fetch para mostrar los datos actualizados
                // Actualiza el usuario en el estado global de App.js si los campos nombre/apellido/imagen_url cambian
                if (setUser && (user.nombre !== payload.nombre || user.apellido !== payload.apellido || user.imagen_url !== payload.imagen_url)) {
                    setUser(prevUser => ({
                        ...prevUser,
                        nombre: payload.nombre,
                        apellido: payload.apellido,
                        imagen_url: payload.imagen_url
                    }));
                }
            } else {
                addNotification('error', response.message || 'Error al actualizar el perfil.', 5000);
            }
        } catch (err) {
            addNotification('error', `Error de conexión: ${err.message}`, 5000);
            console.error("Error saving user profile:", err);
        } finally {
            setIsSubmitting(false);
            setSelectedImage(null); // Limpiar la imagen seleccionada
        }
    }, [user, formData, selectedImage, userData?.imagen_url, authFetch, addNotification, fetchUserData, setUser]);


    if (isLoading) {
        return (
            <div className="admin-loading">
                <div className="loading-spinner">
                    <FaSpinner className="spinner-icon" />
                </div>
                <p>Cargando perfil...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-message">
                <FaInfoCircle className="info-icon" />
                {error}
                <p>Asegúrate de que el backend esté corriendo y los endpoints de API estén accesibles y funcionando correctamente.</p>
            </div>
        );
    }

    if (!userData) {
        return (
            <div className="no-results">
                <FaInfoCircle className="info-icon" />
                No se encontraron datos de perfil.
            </div>
        );
    }

    return (
        <div className="admin-content-container admin-user-profile">
            <div className="admin-content-header">
                <h2>
                    <FaUserCircle className="header-icon" />
                    Mi Perfil (Administrador)
                </h2>
                <div className="header-actions">
                    {!isEditing ? (
                        <button className="edit-btn" onClick={() => setIsEditing(true)}>
                            <FaEdit /> Editar Perfil
                        </button>
                    ) : (
                        <>
                            <button className="save-btn" onClick={handleSave} disabled={isSubmitting}>
                                {isSubmitting ? <FaSpinner className="spinner-icon" /> : <FaSave />} Guardar Cambios
                            </button>
                            <button className="cancel-btn" onClick={() => { setIsEditing(false); setFormErrors({}); setSelectedImage(null); fetchUserData(); }} disabled={isSubmitting}>
                                <FaTimes /> Cancelar
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="profile-card">
                <div className="profile-image-section">
                    <img
                        src={selectedImage ? URL.createObjectURL(selectedImage) : (userData.imagen_url || 'https://placehold.co/150x150/aabbcc/ffffff?text=No+Image')}
                        alt="Foto de Perfil"
                        className="profile-image"
                    />
                    {isEditing && (
                        <div className="image-upload-overlay">
                            <label htmlFor="image-upload" className="upload-icon">
                                <FaCamera />
                                <input
                                    id="image-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    style={{ display: 'none' }}
                                    disabled={isSubmitting}
                                />
                            </label>
                        </div>
                    )}
                    {formErrors.imagen_url && <p className="error-message-inline text-center">{formErrors.imagen_url}</p>}
                </div>

                <form className="profile-form" onSubmit={handleSave}>
                    <div className="form-group">
                        <label>Nombre:</label>
                        {isEditing ? (
                            <input type="text" name="nombre" value={formData.nombre || ''} onChange={handleFormChange} disabled={isSubmitting} />
                        ) : (
                            <p>{userData.nombre}</p>
                        )}
                        {isEditing && formErrors.nombre && <p className="error-message-inline">{formErrors.nombre}</p>}
                    </div>
                    <div className="form-group">
                        <label>Apellido:</label>
                        {isEditing ? (
                            <input type="text" name="apellido" value={formData.apellido || ''} onChange={handleFormChange} disabled={isSubmitting} />
                        ) : (
                            <p>{userData.apellido}</p>
                        )}
                        {isEditing && formErrors.apellido && <p className="error-message-inline">{formErrors.apellido}</p>}
                    </div>
                    <div className="form-group">
                        <label>Email:</label>
                        {isEditing ? (
                            <input type="email" name="email" value={formData.email || ''} onChange={handleFormChange} disabled={isSubmitting} />
                        ) : (
                            <p>{userData.email}</p>
                        )}
                        {isEditing && formErrors.email && <p className="error-message-inline">{formErrors.email}</p>}
                    </div>
                    <div className="form-group">
                        <label>Teléfono:</label>
                        {isEditing ? (
                            <input type="text" name="telefono" value={formData.telefono || ''} onChange={handleFormChange} disabled={isSubmitting} />
                        ) : (
                            <p>{userData.telefono}</p>
                        )}
                        {isEditing && formErrors.telefono && <p className="error-message-inline">{formErrors.telefono}</p>}
                    </div>
                    <div className="form-group">
                        <label>Dirección:</label>
                        {isEditing ? (
                            <input type="text" name="direccion" value={formData.direccion || ''} onChange={handleFormChange} disabled={isSubmitting} />
                        ) : (
                            <p>{userData.direccion || 'N/A'}</p>
                        )}
                        {isEditing && formErrors.direccion && <p className="error-message-inline">{formErrors.direccion}</p>}
                    </div>
                    <div className="form-group">
                        <label>Tipo de Documento:</label>
                        {isEditing ? (
                            <select name="tipo_documento" value={formData.tipo_documento || ''} onChange={handleFormChange} disabled={isSubmitting}>
                                <option value="">Seleccione</option>
                                <option value="CC">Cédula de Ciudadanía</option>
                                <option value="CE">Cédula de Extranjería</option>
                                <option value="TI">Tarjeta de Identidad</option>
                                <option value="PASAPORTE">Pasaporte</option>
                                <option value="NIT">NIT</option>
                            </select>
                        ) : (
                            <p>{userData.tipo_documento || 'N/A'}</p>
                        )}
                        {isEditing && formErrors.tipo_documento && <p className="error-message-inline">{formErrors.tipo_documento}</p>}
                    </div>
                    <div className="form-group">
                        <label>Número de Documento:</label>
                        {isEditing ? (
                            <input type="text" name="numero_documento" value={formData.numero_documento || ''} onChange={handleFormChange} disabled={isSubmitting} />
                        ) : (
                            <p>{userData.numero_documento || 'N/A'}</p>
                        )}
                        {isEditing && formErrors.numero_documento && <p className="error-message-inline">{formErrors.numero_documento}</p>}
                    </div>
                    <div className="form-group">
                        <label>Fecha de Nacimiento:</label>
                        {isEditing ? (
                            <input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento || ''} onChange={handleFormChange} disabled={isSubmitting} />
                        ) : (
                            <p>{userData.fecha_nacimiento || 'N/A'}</p>
                        )}
                        {isEditing && formErrors.fecha_nacimiento && <p className="error-message-inline">{formErrors.fecha_nacimiento}</p>}
                    </div>
                    <div className="form-group">
                        <label>Rol:</label>
                        <p>{userData.role}</p>
                    </div>
                    <div className="form-group">
                        <label>Activo:</label>
                        {isEditing ? (
                            <input type="checkbox" name="active" checked={formData.active || false} onChange={handleFormChange} disabled={isSubmitting} />
                        ) : (
                            <p>{userData.active ? 'Sí' : 'No'}</p>
                        )}
                    </div>
                    <div className="form-group">
                        <label>Fecha de Registro:</label>
                        <p>{new Date(userData.created_at).toLocaleString()}</p>
                    </div>

                    {isEditing && (
                        <div className="form-actions">
                            <button type="submit" className="submit-btn" disabled={isSubmitting}>
                                {isSubmitting ? <FaSpinner className="spinner-icon" /> : 'Guardar Cambios'}
                            </button>
                            <button type="button" className="cancel-btn" onClick={() => { setIsEditing(false); setFormErrors({}); setSelectedImage(null); fetchUserData(); }} disabled={isSubmitting}>
                                Cancelar
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}

export default UserProfile;