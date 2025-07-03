// src/Pages/InicioAdministrador/AdminUserDetail.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaUser, FaEdit, FaSpinner, FaInfoCircle, FaSave, FaTimes, FaCamera } from 'react-icons/fa';
import { authFetch } from './api'; // Asegúrate de que la ruta sea correcta
import './Styles/AdminUser.css'; // Asegúrate de que este CSS exista
import { useNotifications } from '../../Notifications/NotificationContext'; // Importa el hook de notificaciones

function AdminUserDetail({ user }) {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null); // Para la nueva imagen
    const { addNotification } = useNotifications(); // Usa el hook de notificaciones

    const fetchUserData = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const responseData = await authFetch(`/usuarios/${userId}`); // Endpoint para detalles de usuario
            if (responseData.success && responseData.data) {
                setUserData(responseData.data);
                setFormData(responseData.data); // Inicializa formData con los datos del usuario
            } else {
                addNotification('error', responseData.message || 'Error al cargar los detalles del usuario.', 5000);
                setError(responseData.message || 'Usuario no encontrado.');
            }
        } catch (err) {
            setError(`Error de conexión al cargar usuario: ${err.message}`);
            addNotification('error', `Error de conexión: ${err.message}`, 5000);
            console.error('Error fetching user details:', err);
        } finally {
            setIsLoading(false);
        }
    }, [userId, authFetch, addNotification]);

    useEffect(() => {
        if (user && user.token) {
            fetchUserData();
        } else {
            setError('No autorizado. Por favor, inicie sesión.');
            setIsLoading(false);
        }
    }, [user, fetchUserData]);

    const handleFormChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleImageChange = useCallback((e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedImage(e.target.files[0]);
        }
    }, []);

    const handleSave = useCallback(async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        let imageUrlToSave = formData.imagen_url;

        try {
            if (selectedImage) {
                const uploadFormData = new FormData();
                uploadFormData.append('image', selectedImage);
                const uploadResponse = await authFetch('/upload-image', {
                    method: 'POST',
                    body: uploadFormData,
                    headers: {
                        // No Content-Type aquí, el navegador lo establecerá automáticamente para FormData
                        'Content-Type': undefined // Importante para que fetch no lo ponga como application/json
                    }
                });

                if (uploadResponse.success) {
                    imageUrlToSave = uploadResponse.imageUrl;
                    addNotification('success', 'Imagen de perfil actualizada correctamente.', 3000);
                } else {
                    addNotification('error', uploadResponse.message || 'Error al subir la imagen.', 5000);
                    setIsSubmitting(false);
                    return; // Detener el proceso si la subida de imagen falla
                }
            }

            const payload = { ...formData, imagen_url: imageUrlToSave };
            // Eliminar campos que no se deben enviar o que el backend no espera
            delete payload.id; // El ID va en la URL
            delete payload.created_at;
            delete payload.role; // El rol no debe ser editable desde aquí
            delete payload.password; // La contraseña se maneja por separado si se actualiza

            const response = await authFetch(`/usuarios/${userId}`, {
                method: 'PUT',
                body: payload
            });

            if (response.success) {
                addNotification('success', response.message || 'Perfil de usuario actualizado correctamente.', 5000);
                setIsEditing(false);
                fetchUserData(); // Re-fetch para mostrar los datos actualizados
            } else {
                addNotification('error', response.message || 'Error al actualizar el perfil del usuario.', 5000);
            }
        } catch (err) {
            addNotification('error', `Error de conexión: ${err.message}`, 5000);
            console.error("Error saving user details:", err);
        } finally {
            setIsSubmitting(false);
            setSelectedImage(null); // Limpiar la imagen seleccionada
        }
    }, [userId, formData, selectedImage, authFetch, addNotification, fetchUserData]);


    if (isLoading) {
        return (
            <div className="admin-loading">
                <div className="loading-spinner">
                    <FaSpinner className="spinner-icon" />
                </div>
                <p>Cargando detalles del cliente...</p>
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
                No se encontraron datos para este cliente.
            </div>
        );
    }

    return (
        <div className="admin-content-container admin-user-detail">
            <div className="admin-content-header">
                <h2>
                    <FaUser className="header-icon" />
                    Detalles del Cliente: {userData.nombre} {userData.apellido}
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
                            <button className="cancel-btn" onClick={() => setIsEditing(false)} disabled={isSubmitting}>
                                <FaTimes /> Cancelar
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="user-detail-card">
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
                </div>

                <form className="user-detail-form" onSubmit={handleSave}>
                    <div className="form-group">
                        <label>Nombre:</label>
                        {isEditing ? (
                            <input type="text" name="nombre" value={formData.nombre || ''} onChange={handleFormChange} disabled={isSubmitting} />
                        ) : (
                            <p>{userData.nombre}</p>
                        )}
                    </div>
                    <div className="form-group">
                        <label>Apellido:</label>
                        {isEditing ? (
                            <input type="text" name="apellido" value={formData.apellido || ''} onChange={handleFormChange} disabled={isSubmitting} />
                        ) : (
                            <p>{userData.apellido}</p>
                        )}
                    </div>
                    <div className="form-group">
                        <label>Email:</label>
                        {isEditing ? (
                            <input type="email" name="email" value={formData.email || ''} onChange={handleFormChange} disabled={isSubmitting} />
                        ) : (
                            <p>{userData.email}</p>
                        )}
                    </div>
                    <div className="form-group">
                        <label>Teléfono:</label>
                        {isEditing ? (
                            <input type="text" name="telefono" value={formData.telefono || ''} onChange={handleFormChange} disabled={isSubmitting} />
                        ) : (
                            <p>{userData.telefono}</p>
                        )}
                    </div>
                    <div className="form-group">
                        <label>Dirección:</label>
                        {isEditing ? (
                            <input type="text" name="direccion" value={formData.direccion || ''} onChange={handleFormChange} disabled={isSubmitting} />
                        ) : (
                            <p>{userData.direccion || 'N/A'}</p>
                        )}
                    </div>
                    <div className="form-group">
                        <label>Tipo de Documento:</label>
                        {isEditing ? (
                            <input type="text" name="tipo_documento" value={formData.tipo_documento || ''} onChange={handleFormChange} disabled={isSubmitting} />
                        ) : (
                            <p>{userData.tipo_documento || 'N/A'}</p>
                        )}
                    </div>
                    <div className="form-group">
                        <label>Número de Documento:</label>
                        {isEditing ? (
                            <input type="text" name="numero_documento" value={formData.numero_documento || ''} onChange={handleFormChange} disabled={isSubmitting} />
                        ) : (
                            <p>{userData.numero_documento || 'N/A'}</p>
                        )}
                    </div>
                    <div className="form-group">
                        <label>Fecha de Nacimiento:</label>
                        {isEditing ? (
                            <input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento ? formData.fecha_nacimiento.split('T')[0] : ''} onChange={handleFormChange} disabled={isSubmitting} />
                        ) : (
                            <p>{userData.fecha_nacimiento || 'N/A'}</p>
                        )}
                    </div>
                    <div className="form-group">
                        <label>Rol:</label>
                        <p>{userData.role}</p>
                    </div>
                    <div className="form-group">
                        <label>Activo:</label>
                        {isEditing ? (
                            <input type="checkbox" name="active" checked={formData.active || false} onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))} disabled={isSubmitting} />
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
                            <button type="button" className="cancel-btn" onClick={() => setIsEditing(false)} disabled={isSubmitting}>
                                Cancelar
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}

export default AdminUserDetail;