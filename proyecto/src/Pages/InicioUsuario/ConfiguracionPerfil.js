import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Styles/ConfiguracionPerfil.module.css';
import {
    faCog, faUserEdit, faEnvelope, faLock, faCheckCircle, faCamera,
    faExclamationTriangle, faArrowLeft, faPhone, faMapMarkerAlt, faCalendarAlt,
    faBell, faShieldAlt, faChevronDown, faChevronUp, faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { authFetch } from '../../utils/api'; // Importar la función authFetch
import { validateField } from '../../utils/validation'; // Importar la función de validación

const ConfiguracionPerfil = () => {
    // Extraer user, setUser, y showNotification del contexto global proporcionado por Outlet
    const { user, setUser, showNotification } = useOutletContext();

    // Estado para los datos del formulario del perfil
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        direccion: '',
        tipo_documento: '',
        numero_documento: '',
        fecha_nacimiento: '',
    });

    // Estado para la URL de la imagen de perfil
    const [imagenPerfil, setImagenPerfil] = useState(null);
    // Estado para la sección activa del menú (informacion, seguridad, notificaciones, preferencias)
    const [activeSection, setActiveSection] = useState('informacion');
    // Estado para controlar la visibilidad del submenú en el panel lateral
    const [showSubMenu, setShowSubMenu] = useState(false);
    // Estado para indicar si la información inicial del perfil está cargando
    const [isLoading, setIsLoading] = useState(true);
    // Estado para indicar si alguna operación (guardar, subir imagen, eliminar) está en progreso
    const [isSubmitting, setIsSubmitting] = useState(false);
    // Estado para controlar la visibilidad del modal de confirmación de eliminación de cuenta
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    // Estado para manejar los errores de validación de los campos del formulario
    const [errors, setErrors] = useState({});

    const navigate = useNavigate(); // Hook para la navegación programática

    // Función useCallback para memoizar la función de obtener datos del usuario
    const fetchUserData = useCallback(async () => {
        setIsLoading(true); // Iniciar estado de carga

        // Validar si el usuario y su ID están disponibles antes de intentar la llamada API
        if (!user?.id) {
            showNotification('No se pudo cargar la información del usuario. Por favor, inicia sesión.', 'error');
            setIsLoading(false);
            return;
        }

        try {
            const response = await authFetch(`/usuarios/${user.id}`); // Realizar la llamada API para obtener datos del usuario

            if (response.success) {
                // Actualizar el estado del formulario con los datos recibidos
                setFormData({
                    nombre: response.data.nombre || '',
                    apellido: response.data.apellido || '',
                    email: response.data.email || '',
                    telefono: response.data.telefono || '',
                    direccion: response.data.direccion || '',
                    tipo_documento: response.data.tipo_documento || '',
                    numero_documento: response.data.numero_documento || '',
                    // Formatear la fecha para el input type="date"
                    fecha_nacimiento: response.data.fecha_nacimiento ? response.data.fecha_nacimiento.split('T')[0] : '',
                });
                setImagenPerfil(response.data.imagen_url || null); // Cargar la URL de la imagen de perfil
            } else {
                // Mostrar notificación de error si la API no fue exitosa
                showNotification(response.message || 'Error al cargar los datos del perfil.', 'error');
            }
        } catch (err) {
            console.error("Error fetching user data:", err); // Log de errores de conexión
            showNotification('Error de conexión al servidor al cargar el perfil.', 'error');
        } finally {
            setIsLoading(false); // Finalizar estado de carga
        }
    }, [user, showNotification]); // Dependencias del useCallback

    // useEffect para cargar los datos del usuario al montar el componente o cuando fetchUserData cambie
    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    // Manejador de cambios en los inputs del formulario
    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value })); // Actualizar el estado del formulario

        // Validar el campo inmediatamente al cambiar y actualizar el estado de errores
        const error = validateField(id, value, formData, false, user.email); // isNewEntry=false para edición
        setErrors(prev => ({ ...prev, [id]: error }));
    };

    // Manejador para el cambio de la imagen de perfil
    const handleImagenPerfilChange = async (e) => {
        if (!e.target.files || !e.target.files[0]) {
            return; // No hay archivo seleccionado
        }

        const file = e.target.files[0];

        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
            showNotification('Solo se permiten archivos de imagen.', 'error');
            return;
        }
        // Validar tamaño de archivo (5MB)
        if (file.size > 5 * 1024 * 1024) {
            showNotification('La imagen no debe exceder los 5MB.', 'error');
            return;
        }

        setIsSubmitting(true); // Indicar que se está subiendo la imagen
        try {
            const formDataImage = new FormData();
            formDataImage.append('image', file); // 'image' debe coincidir con el nombre esperado en el backend

            const response = await authFetch('/upload-image', {
                method: 'POST',
                body: formDataImage,
                // ¡IMPORTANTE! No establecer Content-Type cuando se usa FormData, el navegador lo hace automáticamente.
                // headers: { 'Content-Type': 'multipart/form-data' } - Esto causaría problemas.
            });

            if (response.success) {
                setImagenPerfil(response.imageUrl); // Actualizar la vista previa de la imagen
                // Actualizar la URL de la imagen en el perfil del usuario en la base de datos
                await authFetch(`/usuarios/${user.id}`, {
                    method: 'PUT',
                    body: { imagen_url: response.imageUrl }, // Enviar solo la URL de la imagen para actualizar
                });
                showNotification('Imagen de perfil actualizada con éxito.', 'success');
                // Actualizar el contexto global del usuario para que la imagen se refleje en toda la aplicación
                setUser(prevUser => ({ ...prevUser, imagen_url: response.imageUrl }));
            } else {
                showNotification(response.message || 'Error al subir la imagen.', 'error');
            }
        } catch (err) {
            console.error("Error uploading image:", err);
            showNotification('Error de conexión al servidor al subir la imagen.', 'error');
        } finally {
            setIsSubmitting(false); // Finalizar estado de envío
        }
    };

    // Manejador para el envío del formulario de actualización de perfil
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevenir el comportamiento por defecto del formulario
        setIsSubmitting(true); // Indicar que se está enviando el formulario

        // Validar todos los campos antes de enviar
        let newErrors = {};
        Object.keys(formData).forEach(key => {
            // El tercer argumento `formData` se pasa para validaciones que dependen de otros campos (ej. confirmación de contraseña, aunque no aplica aquí)
            // El cuarto argumento `false` indica que no es una nueva entrada (isNewEntry)
            // El quinto argumento `user.email` se pasa para validar si el email ha cambiado y evitar duplicados si es el mismo
            const error = validateField(key, formData[key], formData, false, user.email);
            if (error) {
                newErrors[key] = error;
            }
        });

        // Actualizar el estado de errores con todos los errores encontrados
        setErrors(newErrors);

        // Si hay errores, detener el envío
        if (Object.keys(newErrors).length > 0) {
            showNotification('Por favor, corrige los errores en el formulario antes de guardar.', 'error');
            setIsSubmitting(false);
            return;
        }

        try {
            // Datos a enviar, asegurando que se envían solo los campos necesarios y actualizados
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
                body: updatedData, // authFetch se encarga de JSON.stringify
            });

            if (response.success) {
                showNotification('¡Perfil actualizado con éxito!', 'success');
                // Actualizar el estado global del usuario con los nuevos datos recibidos del backend
                // Esto es crucial para que los cambios se reflejen en otras partes de la UI
                setUser(prevUser => ({ ...prevUser, ...response.data }));
            } else {
                showNotification(response.message || 'Error al actualizar el perfil.', 'error');
                // Si el error es por un email ya existente, actualizar el error específico del campo
                if (response.message && response.message.includes('El email ya está registrado')) {
                    setErrors(prev => ({ ...prev, email: 'Este correo electrónico ya está en uso.' }));
                }
            }
        } catch (err) {
            console.error("Error updating profile:", err);
            showNotification('Error de conexión al servidor al actualizar el perfil.', 'error');
        } finally {
            setIsSubmitting(false); // Finalizar estado de envío
        }
    };

    // Manejador para eliminar la cuenta del usuario
    const handleDeleteAccount = async () => {
        setIsSubmitting(true); // Indicar que la eliminación está en progreso
        setShowDeleteConfirm(false); // Cerrar el modal de confirmación

        try {
            const response = await authFetch(`/usuarios/${user.id}`, {
                method: 'DELETE',
            });

            if (response.success) {
                showNotification('Cuenta eliminada con éxito. Redirigiendo...', 'success');
                // Limpiar el token y la información del usuario del almacenamiento local
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setUser(null); // Limpiar el estado del usuario globalmente

                // Redirigir al usuario a la página de login después de un breve retraso
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
            setIsSubmitting(false); // Finalizar estado de envío
        }
    };

    // Función para volver a la página anterior
    const handleVolver = () => navigate(-1);
    // Función para alternar la visibilidad del submenú
    const toggleSubMenu = () => setShowSubMenu(prev => !prev);

    // Función para cambiar la sección activa
    const handleSectionChange = (section) => {
        setActiveSection(section);
        // Opcional: Cerrar el submenú si se selecciona una opción desde él
        if (showSubMenu) {
            setShowSubMenu(false);
        }
    };

    // Renderizado condicional mientras se carga la información del perfil
    if (isLoading) {
        return (
            <div className={styles.loadingContainer}>
                <FontAwesomeIcon icon={faSpinner} spin className={styles.spinner} />
                <p>Cargando perfil...</p>
            </div>
        );
    }

    // Calcular la primera letra del nombre para el placeholder si no hay imagen
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
                {/* Panel Lateral de Navegación */}
                <div className={styles.sidePanel}>
                    <div
                        className={styles.profileCard}
                        onClick={toggleSubMenu}
                        role="button" // Para indicar que es un elemento interactivo
                        tabIndex={0} // Para que sea accesible con teclado
                        aria-expanded={showSubMenu} // Para accesibilidad
                        aria-controls="profile-menu" // Asociar con el menú desplegable
                    >
                        <div className={styles.profileImageContainer}>
                            <img
                                src={imagenPerfil || `https://placehold.co/150x150/cccccc/ffffff?text=${firstLetter}`}
                                alt="Perfil"
                                className={styles.profileImage}
                                // Manejo de error para la imagen: si falla la carga, muestra el placeholder
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
                        <FontAwesomeIcon
                            icon={showSubMenu ? faChevronUp : faChevronDown}
                            className={styles.chevronIcon}
                        />
                    </div>

                    {/* Submenú de navegación del perfil (visible al hacer click en profileCard) */}
                    <AnimatePresence>
                        {showSubMenu && (
                            <motion.div
                                id="profile-menu"
                                className={styles.sidePanelMenu}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <button
                                    className={`${styles.menuItem} ${activeSection === 'informacion' ? styles.active : ''}`}
                                    onClick={() => handleSectionChange('informacion')}
                                >
                                    <FontAwesomeIcon icon={faUserEdit} /> Información Personal
                                </button>
                                <button
                                    className={`${styles.menuItem} ${activeSection === 'seguridad' ? styles.active : ''}`}
                                    onClick={() => handleSectionChange('seguridad')}
                                >
                                    <FontAwesomeIcon icon={faShieldAlt} /> Seguridad
                                </button>
                                <button
                                    className={`${styles.menuItem} ${activeSection === 'notificaciones' ? styles.active : ''}`}
                                    onClick={() => handleSectionChange('notificaciones')}
                                >
                                    <FontAwesomeIcon icon={faBell} /> Notificaciones
                                </button>
                                <button
                                    className={`${styles.menuItem} ${activeSection === 'preferencias' ? styles.active : ''}`}
                                    onClick={() => handleSectionChange('preferencias')}
                                >
                                    <FontAwesomeIcon icon={faCog} /> Preferencias
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className={styles.sidePanelContent}>
                        <h4>Estadísticas</h4>
                        <div className={styles.statsContainer}>
                            <div className={styles.statItem}>
                                <span className={styles.statValue}>N/A</span>
                                <span className={styles.statLabel}>Actividades</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statValue}>N/A</span>
                                <span className={styles.statLabel}>Perfil completo</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contenido Principal (Formularios y Secciones) */}
                <div className={styles.mainContent}>
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
                                        value={formData.tipo_documento}
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
                                    // Deshabilitar si está enviando o si hay errores en el formulario
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

                    {activeSection === 'seguridad' && (
                        <div className={styles.sectionContent}>
                            <h4 className={styles.sectionTitle}>
                                <FontAwesomeIcon icon={faShieldAlt} /> Seguridad
                            </h4>

                            <div className={styles.securityCard}>
                                <div className={styles.securityActions}>
                                    {/* Enlace para cambiar contraseña (debería ser una ruta separada) */}
                                    <Link to="/usuario/perfil/cambiar-contrasena" className={styles.securityBtn}>
                                        <FontAwesomeIcon icon={faLock} /> Cambiar Contraseña
                                    </Link>
                                    <motion.button
                                        className={styles.securityBtnDanger}
                                        onClick={() => setShowDeleteConfirm(true)}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        disabled={isSubmitting}
                                    >
                                        <FontAwesomeIcon icon={faExclamationTriangle} /> Eliminar Cuenta
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'notificaciones' && (
                        <div className={styles.sectionContent}>
                            <h4 className={styles.sectionTitle}>
                                <FontAwesomeIcon icon={faBell} /> Configuración de Notificaciones
                            </h4>

                            <div className={styles.notificationSettings}>
                                <div className={styles.notificationItem}>
                                    <div className={styles.notificationInfo}>
                                        <h5>Notificaciones por Email</h5>
                                        <p>Recibe actualizaciones importantes por correo electrónico</p>
                                    </div>
                                    <label className={styles.switch}>
                                        <input type="checkbox" defaultChecked />
                                        <span className={styles.slider}></span>
                                    </label>
                                </div>

                                <div className={styles.notificationItem}>
                                    <div className={styles.notificationInfo}>
                                        <h5>Notificaciones Push</h5>
                                        <p>Recibe alertas en tu dispositivo</p>
                                    </div>
                                    <label className={styles.switch}>
                                        <input type="checkbox" />
                                        <span className={styles.slider}></span>
                                    </label>
                                </div>

                                <div className={styles.notificationItem}>
                                    <div className={styles.notificationInfo}>
                                        <h5>Recordatorios</h5>
                                        <p>Notificaciones para actividades pendientes</p>
                                    </div>
                                    <label className={styles.switch}>
                                        <input type="checkbox" defaultChecked />
                                        <span className={styles.slider}></span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'preferencias' && (
                        <div className={styles.sectionContent}>
                            <h4 className={styles.sectionTitle}>
                                <FontAwesomeIcon icon={faCog} /> Preferencias
                            </h4>

                            <div className={styles.preferencesGrid}>
                                <div className={styles.preferenceItem}>
                                    <h5>Tema de la aplicación</h5>
                                    <div className={styles.themeOptions}>
                                        <button className={`${styles.themeBtn} ${styles.themeLight}`}>Claro</button>
                                        <button className={`${styles.themeBtn} ${styles.themeDark}`}>Oscuro</button>
                                        <button className={`${styles.themeBtn} ${styles.themeSystem}`}>Sistema</button>
                                    </div>
                                </div>

                                <div className={styles.preferenceItem}>
                                    <h5>Idioma</h5>
                                    <select className={styles.selectInput}>
                                        <option>Español</option>
                                        <option>English</option>
                                        <option>Français</option>
                                    </select>
                                </div>

                                <div className={styles.preferenceItem}>
                                    <h5>Privacidad</h5>
                                    <div className={styles.privacyOptions}>
                                        <label className={styles.radioOption}>
                                            <input type="radio" name="privacy" defaultChecked />
                                            <span className={styles.radioLabel}>Perfil público</span>
                                        </label>
                                        <label className={styles.radioOption}>
                                            <input type="radio" name="privacy" />
                                            <span className={styles.radioLabel}>Perfil privado</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
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
                        onClick={() => setShowDeleteConfirm(false)} // Permite cerrar el modal haciendo clic fuera
                    >
                        <motion.div
                            className={styles.modalContent}
                            initial={{ y: "-100vh", opacity: 0 }}
                            animate={{ y: "0", opacity: 1 }}
                            exit={{ y: "100vh", opacity: 0 }}
                            transition={{ type: "spring", stiffness: 100, damping: 15 }}
                            onClick={(e) => e.stopPropagation()} // Evita que el clic dentro del modal cierre el overlay
                            role="dialog" // Rol para accesibilidad
                            aria-modal="true" // Indica que es un modal
                            aria-labelledby="delete-account-title" // Etiqueta el título del modal
                            aria-describedby="delete-account-description" // Etiqueta la descripción del modal
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
                                    disabled={isSubmitting} // Deshabilitar durante el envío
                                >
                                    {isSubmitting ? <><FontAwesomeIcon icon={faSpinner} spin /> Eliminando...</> : 'Sí, Eliminar Mi Cuenta'}
                                </motion.button>
                                <motion.button
                                    className={styles.cancelBtn}
                                    onClick={() => setShowDeleteConfirm(false)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    disabled={isSubmitting} // Deshabilitar durante el envío
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