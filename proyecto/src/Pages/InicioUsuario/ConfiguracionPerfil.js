import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Styles/ConfiguracionPerfil.module.css';
import {
  faCog, faUserEdit, faEnvelope, faLock, faCheckCircle, faCamera,
  faExclamationTriangle, faArrowLeft, faPhone, faMapMarkerAlt, faCalendarAlt,
  faBell, faShieldAlt, faChevronDown, faChevronUp, faSpinner, faTimesCircle
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { authFetch } from './api'; // Importa authFetch

const ConfiguracionPerfil = ({ user, setUser }) => { // Recibe user y setUser como props
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '', // Asumiendo que también tienes apellido
    email: '',
    telefono: '',
    direccion: '',
    tipo_documento: '', // Nuevo campo
    numero_documento: '', // Nuevo campo
    fecha_nacimiento: '', // Nuevo campo
    // No incluir password aquí directamente para edición de perfil general
  });
  const [imagenPerfil, setImagenPerfil] = useState(null);
  const [notification, setNotification] = useState(null);
  const [activeSection, setActiveSection] = useState('informacion');
  const [showSubMenu, setShowSubMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // Estado para el modal de confirmación de eliminación

  const navigate = useNavigate();

  /**
   * Muestra una notificación temporal en la UI.
   * @param {string} message - El mensaje a mostrar.
   * @param {string} type - El tipo de notificación ('success' o 'error').
   */
  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    const timer = setTimeout(() => {
      setNotification(null);
    }, 3000); // La notificación desaparece después de 3 segundos
    return () => clearTimeout(timer);
  }, []);

  const fetchUserData = useCallback(async () => {
    setIsLoading(true);
    if (!user || !user.id) {
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
          tipo_documento: response.data.tipo_documento || '',
          numero_documento: response.data.numero_documento || '',
          fecha_nacimiento: response.data.fecha_nacimiento ? response.data.fecha_nacimiento.split('T')[0] : '',
        });
        // Si tienes una URL de imagen de perfil en la DB, cárgala aquí
        // setImagenPerfil(response.data.imagen_perfil_url || null);
      } else {
        showNotification(response.message || 'Error al cargar los datos del perfil.', 'error');
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      showNotification('Error de conexión al servidor.', 'error');
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
  };

  const handleImagenPerfilChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Aquí podrías subir la imagen al servidor y guardar la URL
      // Por ahora, solo se muestra la previsualización
      setImagenPerfil(URL.createObjectURL(file));
      showNotification('Imagen seleccionada. Para guardar, haz clic en "Guardar Cambios". (La carga real de la imagen requiere backend)', 'info');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setNotification(null);

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
        // No enviar imagenPerfil en el JSON directamente
      };

      const response = await authFetch(`/usuarios/${user.id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedData),
      });

      if (response.success) {
        showNotification('¡Perfil actualizado con éxito!', 'success');
        // Actualizar el estado del usuario en el contexto/global si es necesario
        setUser(prevUser => ({ ...prevUser, ...updatedData }));
      } else {
        showNotification(response.message || 'Error al actualizar el perfil.', 'error');
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      showNotification('Error de conexión al servidor al actualizar el perfil.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsSubmitting(true); // Usar isSubmitting para el spinner de eliminación
    setShowDeleteConfirm(false); // Cerrar el modal
    setNotification(null);

    try {
      const response = await authFetch(`/usuarios/${user.id}`, {
        method: 'DELETE',
      });

      if (response.success) {
        showNotification('Cuenta eliminada con éxito. Redirigiendo...', 'success');
        // Limpiar token y redirigir a la página de inicio de sesión
        localStorage.removeItem('token');
        localStorage.removeItem('user'); // Asegúrate de limpiar también el objeto user
        setUser(null); // Limpiar el estado global del usuario
        setTimeout(() => {
          navigate('/login'); // Redirigir a la página de login
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
  const toggleSubMenu = () => setShowSubMenu(!showSubMenu);

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <FontAwesomeIcon icon={faSpinner} spin className={styles.spinner} />
        <p>Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header con efecto de gradiente */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <FontAwesomeIcon icon={faCog} className={styles.icon} spin />
          <h3>Editar Perfil</h3>
          <button onClick={handleVolver} className={styles.volverBtn}>
            <FontAwesomeIcon icon={faArrowLeft} /> Volver
          </button>
        </div>
      </div>

      <AnimatePresence>
        {notification && (
          <motion.div
            className={`${styles.notification} ${styles[notification.type]}`}
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
          >
            <FontAwesomeIcon icon={notification.type === 'success' ? faCheckCircle : faTimesCircle} />
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className={styles.mainLayout}>
        {/* Panel lateral con menú interactivo */}
        <div className={styles.sidePanel}>
          <div
            className={styles.profileCard}
            onClick={toggleSubMenu}
          >
            <div className={styles.profileImageContainer}>
              <img
                src={imagenPerfil || `https://placehold.co/150x150/cccccc/ffffff?text=${formData.nombre.charAt(0)}`}
                alt="Perfil"
                className={styles.profileImage}
                onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/150x150/cccccc/ffffff?text=${formData.nombre.charAt(0)}`; }}
              />
              <label htmlFor="uploadImagen" className={styles.profileOverlay}>
                <FontAwesomeIcon icon={faCamera} />
              </label>
              <input
                type="file"
                id="uploadImagen"
                accept="image/*"
                onChange={handleImagenPerfilChange}
                className={styles.uploadInput}
              />
            </div>
            <p className={styles.profileName}>{formData.nombre} {formData.apellido}</p>
            <FontAwesomeIcon
              icon={showSubMenu ? faChevronUp : faChevronDown}
              className={styles.chevronIcon}
            />
          </div>
          {/* Contenido adicional del panel lateral */}
          <div className={styles.sidePanelContent}>
            <h4>Estadísticas</h4>
            <div className={styles.statsContainer}>
              <div className={styles.statItem}>
                <span className={styles.statValue}>N/A</span> {/* Estos datos deberían venir de la DB */}
                <span className={styles.statLabel}>Actividades</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>N/A</span> {/* Estos datos deberían venir de la DB */}
                <span className={styles.statLabel}>Perfil completo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className={styles.mainContent}>
          {activeSection === 'informacion' && (
            <form className={styles.form} onSubmit={handleSubmit}>
              <h4 className={styles.sectionTitle}>
                <FontAwesomeIcon icon={faUserEdit} /> Información Personal
              </h4>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label htmlFor="nombre" className={styles.formLabel}>
                    <FontAwesomeIcon icon={faUserEdit} className={styles.inputIcon} />
                    Nombre:
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    placeholder="Tu nombre"
                    className={styles.formInput}
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="apellido" className={styles.formLabel}>
                    <FontAwesomeIcon icon={faUserEdit} className={styles.inputIcon} />
                    Apellido:
                  </label>
                  <input
                    type="text"
                    id="apellido"
                    placeholder="Tu apellido"
                    className={styles.formInput}
                    value={formData.apellido}
                    onChange={handleChange}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.formLabel}>
                    <FontAwesomeIcon icon={faEnvelope} className={styles.inputIcon} />
                    Correo Electrónico:
                  </label>
                  <input
                    type="email"
                    id="email"
                    placeholder="tu@email.com"
                    className={styles.formInput}
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="telefono" className={styles.formLabel}>
                    <FontAwesomeIcon icon={faPhone} className={styles.inputIcon} />
                    Teléfono:
                  </label>
                  <input
                    type="tel"
                    id="telefono"
                    placeholder="Tu número de teléfono"
                    className={styles.formInput}
                    value={formData.telefono}
                    onChange={handleChange}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="direccion" className={styles.formLabel}>
                    <FontAwesomeIcon icon={faMapMarkerAlt} className={styles.inputIcon} />
                    Dirección:
                  </label>
                  <input
                    type="text"
                    id="direccion"
                    placeholder="Tu dirección"
                    className={styles.formInput}
                    value={formData.direccion}
                    onChange={handleChange}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="tipo_documento" className={styles.formLabel}>
                    <FontAwesomeIcon icon={faUserEdit} className={styles.inputIcon} />
                    Tipo de Documento:
                  </label>
                  <select
                    id="tipo_documento"
                    className={styles.formInput}
                    value={formData.tipo_documento}
                    onChange={handleChange}
                  >
                    <option value="">Selecciona</option>
                    <option value="CC">Cédula de Ciudadanía</option>
                    <option value="TI">Tarjeta de Identidad</option>
                    <option value="CE">Cédula de Extranjería</option>
                    <option value="PAS">Pasaporte</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="numero_documento" className={styles.formLabel}>
                    <FontAwesomeIcon icon={faUserEdit} className={styles.inputIcon} />
                    Número de Documento:
                  </label>
                  <input
                    type="text"
                    id="numero_documento"
                    placeholder="Número de documento"
                    className={styles.formInput}
                    value={formData.numero_documento}
                    onChange={handleChange}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="fecha_nacimiento" className={styles.formLabel}>
                    <FontAwesomeIcon icon={faCalendarAlt} className={styles.inputIcon} />
                    Fecha de Nacimiento:
                  </label>
                  <input
                    type="date"
                    id="fecha_nacimiento"
                    className={styles.formInput}
                    value={formData.fecha_nacimiento}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className={styles.formActions}>
                <motion.button
                  type="submit"
                  className={styles.guardarBtn}
                  disabled={isSubmitting || !formData.nombre || !formData.email}
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

      {/* Modal de Confirmación de Eliminación */}
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
            >
              <h3>Confirmar Eliminación de Cuenta</h3>
              <p>¿Estás seguro de que deseas eliminar tu cuenta? Esta acción es irreversible y se eliminarán todos tus datos asociados.</p>
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
