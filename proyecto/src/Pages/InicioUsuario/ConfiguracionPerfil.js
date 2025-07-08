import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Styles/ConfiguracionPerfil.module.css';
import {
    faCog, faUserEdit, faEnvelope, faCheckCircle, faCamera, faArrowLeft, faPhone, faMapMarkerAlt, faCalendarAlt, faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { authFetch } from '../../utils/api';
import { validateField } from '../../utils/validation';

const ConfiguracionPerfil = () => {
    const { user, setUser, showNotification } = useOutletContext();
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        direccion: '',
        tipo_documento: '', // Inicializar aquí para preselección
        numero_documento: '',
        fecha_nacimiento: '',
    });
    const [imagenPerfil, setImagenPerfil] = useState(null);
    const [activeSection] = useState('informacion');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const fetchUserData = useCallback(async () => {
        setIsLoading(true);

        if (!user?.id) {
            showNotification('No se pudo cargar la información del usuario. Por favor, inicia sesión.', 'error');
            setIsLoading(false);
            return;
        }

        try {
            const response = await authFetch(`/usuarios/${user.id}`);

            if (response.success) {
                setFormData({
                    nombre: response.data.nombre || '',
                    apellido: response.data.apellido || '',
                    email: response.data.email || '',
                    telefono: response.data.telefono || '',
                    direccion: response.data.direccion || '',
                    tipo_documento: response.data.tipo_documento || '', // ¡Asegurado para preselección!
                    numero_documento: response.data.numero_documento || '',
                    fecha_nacimiento: response.data.fecha_nacimiento ? response.data.fecha_nacimiento.split('T')[0] : '',
                });
                setImagenPerfil(response.data.imagen_url || null);
            } else {
                showNotification(response.message || 'Error al cargar los datos del perfil.', 'error');
            }
        } catch (err) {
            console.error("Error fetching user data:", err);
            showNotification('Error de conexión al servidor al cargar el perfil.', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [user, showNotification]);

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));

        const error = validateField(id, value, formData, false, user.email);
        setErrors(prev => ({ ...prev, [id]: error }));
    };

    const handleImagenPerfilChange = async (e) => {
        if (!e.target.files || !e.target.files[0]) {
            return;
        }

        const file = e.target.files[0];
        if (!file.type.startsWith('image/')) {
            showNotification('Solo se permiten archivos de imagen.', 'error');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            showNotification('La imagen no debe exceder los 5MB.', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            const formDataImage = new FormData();
            formDataImage.append('image', file);

            const response = await authFetch('/upload-image', {
                method: 'POST',
                body: formDataImage,
            });
            if (response.success) {
                setImagenPerfil(response.imageUrl);
                await authFetch(`/usuarios/${user.id}`, {
                    method: 'PUT',
                    body: { imagen_url: response.imageUrl },
                });
                showNotification('Imagen de perfil actualizada con éxito.', 'success');
                setUser(prevUser => ({ ...prevUser, imagen_url: response.imageUrl }));
            } else {
                showNotification(response.message || 'Error al subir la imagen.', 'error');
            }
        } catch (err) {
            console.error("Error uploading image:", err);
            showNotification('Error de conexión al servidor al subir la imagen.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        let newErrors = {};
        Object.keys(formData).forEach(key => {
            const error = validateField(key, formData[key], formData, false, user.email);
            if (error) {
                // Modificación para numero_documento y fecha_nacimiento:
                // Si el campo ya tiene un valor (fue pre-llenado o ya existe) y no está vacío,
                // no lo consideramos un error que impida el envío, asumiendo que el 'validateField'
                // podría ser demasiado estricto para campos opcionales que ya tienen datos.
                // Sin embargo, si el usuario lo modifica a un valor que el validador considera erróneo (ej. formato),
                // el error sí se mostrará.
                if (!((key === 'numero_documento' || key === 'fecha_nacimiento') && formData[key])) {
                    newErrors[key] = error;
                }
            }
        });
        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            showNotification('Por favor, corrige los errores en el formulario antes de guardar.', 'error');
            setIsSubmitting(false);
            return;
        }

        try {
            const updatedData = {
                nombre: formData.nombre,
                apellido: formData.apellido,
                email: formData.email,
                telefono: formData.telefono,
                direccion: formData.direccion,
                tipo_documento: formData.tipo_documento,
                numero_documento: formData.numero_documento,
                fecha_nacimiento: formData.fecha_nacimiento,
            };
            const response = await authFetch(`/usuarios/${user.id}`, {
                method: 'PUT',
                body: updatedData,
            });
            if (response.success) {
                showNotification('¡Perfil actualizado con éxito!', 'success');
                setUser(prevUser => ({ ...prevUser, ...response.data }));
            } else {
                showNotification(response.message || 'Error al actualizar el perfil.', 'error');
                if (response.message && response.message.includes('El email ya está registrado')) {
                    setErrors(prev => ({ ...prev, email: 'Este correo electrónico ya está en uso.' }));
                }
            }
        } catch (err) {
            console.error("Error updating profile:", err);
            showNotification('Error de conexión al servidor al actualizar el perfil.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteAccount = async () => {
        setIsSubmitting(true);
        setShowDeleteConfirm(false);

        try {
            const response = await authFetch(`/usuarios/${user.id}`, {
                method: 'DELETE',
            });
            if (response.success) {
                showNotification('Cuenta eliminada con éxito. Redirigiendo...', 'success');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setUser(null);

                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                showNotification(response.message || 'Error al eliminar la cuenta.', 'error');
            }
        } catch (err) {
            console.error("Error deleting account:", err);
            showNotification('Error de conexión al servidor al eliminar la cuenta.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleVolver = () => navigate(-1);

    if (isLoading) {
        return (
            <div className={styles.loadingContainer}>
                <FontAwesomeIcon icon={faSpinner} spin className={styles.spinner} />
                <p>Cargando perfil...</p>
            </div>
        );
    }

    const firstLetter = formData.nombre?.charAt(0)?.toUpperCase() || 'U';

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <FontAwesomeIcon icon={faCog} className={styles.icon} spin />
                    <h3>Editar Perfil</h3>
                    <button onClick={handleVolver} className={styles.volverBtn} aria-label="Volver">
                        <FontAwesomeIcon icon={faArrowLeft} /> Volver
                    </button>
                </div>
            </div>

            <div className={styles.mainLayout}>
                {/* Panel Lateral de Navegación - Solo muestra la información del perfil */}
                <div className={styles.sidePanel}>
                    <div className={styles.profileCard}>
                        <div className={styles.profileImageContainer}>
                            <img
                                src={imagenPerfil || `https://placehold.co/150x150/cccccc/ffffff?text=${firstLetter}`}
                                alt="Perfil"
                                className={styles.profileImage}
                                onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/150x150/cccccc/ffffff?text=${firstLetter}`; }}
                            />
                            <label htmlFor="uploadImagen" className={styles.profileOverlay} aria-label="Cambiar imagen de perfil">
                                <FontAwesomeIcon icon={faCamera} />
                            </label>
                            <input
                                type="file"
                                id="uploadImagen"
                                accept="image/*"
                                onChange={handleImagenPerfilChange}
                                className={styles.uploadInput}
                                disabled={isSubmitting}
                            />
                        </div>
                        <p className={styles.profileName}>{formData.nombre || 'Usuario'} {formData.apellido || ''}</p>
                    </div>

                    {/* La sección de estadísticas se ha eliminado */}
                </div>

                {/* Contenido Principal - Solo muestra la sección de Información Personal */}
                <div className={styles.mainContent}>
                    {/* Solo se renderiza la sección de Información Personal */}
                    {activeSection === 'informacion' && (
                        <form className={styles.form} onSubmit={handleSubmit}>
                            <h4 className={styles.sectionTitle}>
                                <FontAwesomeIcon icon={faUserEdit} /> Información Personal
                            </h4>

                            <div className={styles.formGrid}>
                                {/* Nombre */}
                                <div className={styles.formGroup}>
                                    <label htmlFor="nombre" className={styles.formLabel}>
                                        <FontAwesomeIcon icon={faUserEdit} className={styles.inputIcon} />
                                        Nombre:
                                    </label>
                                    <input
                                        type="text"
                                        id="nombre"
                                        placeholder="Tu nombre"
                                        className={`${styles.formInput} ${errors.nombre ? styles.inputError : ''}`}
                                        value={formData.nombre}
                                        onChange={handleChange}
                                        required
                                        aria-invalid={errors.nombre ? "true" : "false"}
                                        aria-describedby="error-nombre"
                                    />
                                    {errors.nombre && <p id="error-nombre" className={styles.errorText}>{errors.nombre}</p>}
                                </div>

                                {/* Apellido */}
                                <div className={styles.formGroup}>
                                    <label htmlFor="apellido" className={styles.formLabel}>
                                        <FontAwesomeIcon icon={faUserEdit} className={styles.inputIcon} />
                                        Apellido:
                                    </label>
                                    <input
                                        type="text"
                                        id="apellido"
                                        placeholder="Tu apellido"
                                        className={`${styles.formInput} ${errors.apellido ? styles.inputError : ''}`}
                                        value={formData.apellido}
                                        onChange={handleChange}
                                        aria-invalid={errors.apellido ? "true" : "false"}
                                        aria-describedby="error-apellido"
                                    />
                                    {errors.apellido && <p id="error-apellido" className={styles.errorText}>{errors.apellido}</p>}
                                </div>

                                {/* Email */}
                                <div className={styles.formGroup}>
                                    <label htmlFor="email" className={styles.formLabel}>
                                        <FontAwesomeIcon icon={faEnvelope} className={styles.inputIcon} />
                                        Correo Electrónico:
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        placeholder="tu@email.com"
                                        className={`${styles.formInput} ${errors.email ? styles.inputError : ''}`}
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        aria-invalid={errors.email ? "true" : "false"}
                                        aria-describedby="error-email"
                                    />
                                    {errors.email && <p id="error-email" className={styles.errorText}>{errors.email}</p>}
                                </div>

                                {/* Teléfono */}
                                <div className={styles.formGroup}>
                                    <label htmlFor="telefono" className={styles.formLabel}>
                                        <FontAwesomeIcon icon={faPhone} className={styles.inputIcon} />
                                        Teléfono:
                                    </label>
                                    <input
                                        type="tel"
                                        id="telefono"
                                        placeholder="Tu número de teléfono"
                                        className={`${styles.formInput} ${errors.telefono ? styles.inputError : ''}`}
                                        value={formData.telefono}
                                        onChange={handleChange}
                                        aria-invalid={errors.telefono ? "true" : "false"}
                                        aria-describedby="error-telefono"
                                    />
                                    {errors.telefono && <p id="error-telefono" className={styles.errorText}>{errors.telefono}</p>}
                                </div>

                                {/* Dirección */}
                                <div className={styles.formGroup}>
                                    <label htmlFor="direccion" className={styles.formLabel}>
                                        <FontAwesomeIcon icon={faMapMarkerAlt} className={styles.inputIcon} />
                                        Dirección:
                                    </label>
                                    <input
                                        type="text"
                                        id="direccion"
                                        placeholder="Tu dirección"
                                        className={`${styles.formInput} ${errors.direccion ? styles.inputError : ''}`}
                                        value={formData.direccion}
                                        onChange={handleChange}
                                        aria-invalid={errors.direccion ? "true" : "false"}
                                        aria-describedby="error-direccion"
                                    />
                                    {errors.direccion && <p id="error-direccion" className={styles.errorText}>{errors.direccion}</p>}
                                </div>

                                {/* Tipo de Documento */}
                                <div className={styles.formGroup}>
                                    <label htmlFor="tipo_documento" className={styles.formLabel}>
                                        <FontAwesomeIcon icon={faUserEdit} className={styles.inputIcon} />
                                        Tipo de Documento:
                                    </label>
                                    <select
                                        id="tipo_documento"
                                        className={`${styles.formInput} ${errors.tipo_documento ? styles.inputError : ''}`}
                                        value={formData.tipo_documento} // Asegura la preselección
                                        onChange={handleChange}
                                        aria-invalid={errors.tipo_documento ? "true" : "false"}
                                        aria-describedby="error-tipo_documento"
                                    >
                                        <option value="">Selecciona</option>
                                        <option value="CC">Cédula de Ciudadanía</option>
                                        <option value="TI">Tarjeta de Identidad</option>
                                        <option value="CE">Cédula de Extranjería</option>
                                        <option value="PASAPORTE">Pasaporte</option>
                                    </select>
                                    {errors.tipo_documento && <p id="error-tipo_documento" className={styles.errorText}>{errors.tipo_documento}</p>}
                                </div>

                                {/* Número de Documento */}
                                <div className={styles.formGroup}>
                                    <label htmlFor="numero_documento" className={styles.formLabel}>
                                        <FontAwesomeIcon icon={faUserEdit} className={styles.inputIcon} />
                                        Número de Documento:
                                    </label>
                                    <input
                                        type="text"
                                        id="numero_documento"
                                        placeholder="Número de documento"
                                        className={`${styles.formInput} ${errors.numero_documento ? styles.inputError : ''}`}
                                        value={formData.numero_documento}
                                        onChange={handleChange}
                                        aria-invalid={errors.numero_documento ? "true" : "false"}
                                        aria-describedby="error-numero_documento"
                                    />
                                    {errors.numero_documento && <p id="error-numero_documento" className={styles.errorText}>{errors.numero_documento}</p>}
                                </div>

                                {/* Fecha de Nacimiento */}
                                <div className={styles.formGroup}>
                                    <label htmlFor="fecha_nacimiento" className={styles.formLabel}>
                                        <FontAwesomeIcon icon={faCalendarAlt} className={styles.inputIcon} />
                                        Fecha de Nacimiento:
                                    </label>
                                    <input
                                        type="date"
                                        id="fecha_nacimiento"
                                        className={`${styles.formInput} ${errors.fecha_nacimiento ? styles.inputError : ''}`}
                                        value={formData.fecha_nacimiento}
                                        onChange={handleChange}
                                        aria-invalid={errors.fecha_nacimiento ? "true" : "false"}
                                        aria-describedby="error-fecha_nacimiento"
                                    />
                                    {errors.fecha_nacimiento && <p id="error-fecha_nacimiento" className={styles.errorText}>{errors.fecha_nacimiento}</p>}
                                </div>
                            </div>

                            <div className={styles.formActions}>
                                <motion.button
                                    type="submit"
                                    className={styles.guardarBtn}
                                    disabled={isSubmitting || Object.values(errors).some(error => error !== null)}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <FontAwesomeIcon icon={faSpinner} spin />
                                            <span>Guardando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <FontAwesomeIcon icon={faCheckCircle} /> Guardar Cambios
                                        </>
                                    )}
                                </motion.button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {/* Modal de Confirmación de Eliminación de Cuenta */}
            <AnimatePresence>
                {showDeleteConfirm && (
                    <motion.div
                        className={styles.modalOverlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowDeleteConfirm(false)}
                    >
                        <motion.div
                            className={styles.modalContent}
                            initial={{ y: "-100vh", opacity: 0 }}
                            animate={{ y: "0", opacity: 1 }}
                            exit={{ y: "100vh", opacity: 0 }}
                            transition={{ type: "spring", stiffness: 100, damping: 15 }}
                            onClick={(e) => e.stopPropagation()}
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="delete-account-title"
                            aria-describedby="delete-account-description"
                        >
                            <h3 id="delete-account-title">Confirmar Eliminación de Cuenta</h3>
                            <p id="delete-account-description">
                                ¿Estás seguro de que deseas eliminar tu cuenta? Esta acción es irreversible y se eliminarán todos tus datos asociados.
                                Esta acción **no se puede deshacer**.
                            </p>
                            <div className={styles.modalActions}>
                                <motion.button
                                    className={styles.submitBtn}
                                    onClick={handleDeleteAccount}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? <><FontAwesomeIcon icon={faSpinner} spin /> Eliminando...</> : 'Sí, Eliminar Mi Cuenta'}
                                </motion.button>
                                <motion.button
                                    className={styles.cancelBtn}
                                    onClick={() => setShowDeleteConfirm(false)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    disabled={isSubmitting}
                                >
                                    Cancelar
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ConfiguracionPerfil;