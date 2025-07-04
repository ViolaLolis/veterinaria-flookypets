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
  const { user, setUser, showNotification } = useOutletContext();
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
  const [imagenPerfil, setImagenPerfil] = useState(null);
  const [activeSection, setActiveSection] = useState('informacion');
  const [showSubMenu, setShowSubMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errors, setErrors] = useState({}); // Estado para manejar errores de validación

  const navigate = useNavigate();

  // Función para obtener los datos del usuario
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
        setImagenPerfil(response.data.imagen_url || null); // Cargar la URL de la imagen de perfil
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
    // Validar el campo inmediatamente al cambiar
    const error = validateField(id, value, formData, false, formData.email); // isNewEntry=false para edición
    setErrors(prev => ({ ...prev, [id]: error }));
  };

  const handleImagenPerfilChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Validar el tipo de archivo y tamaño si es necesario
      if (!file.type.startsWith('image/')) {
        showNotification('Solo se permiten archivos de imagen.', 'error');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB
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
          headers: {
            // No Content-Type header when sending FormData, browser sets it
          }
        });

        if (response.success) {
          setImagenPerfil(response.imageUrl);
          // Actualizar la URL de la imagen en el perfil del usuario en la base de datos
          await authFetch(`/usuarios/${user.id}`, {
            method: 'PUT',
            body: { imagen_url: response.imageUrl },
          });
          showNotification('Imagen de perfil actualizada con éxito.', 'success');
          setUser(prevUser => ({ ...prevUser, imagen_url: response.imageUrl })); // Actualizar el contexto del usuario
        } else {
          showNotification(response.message || 'Error al subir la imagen.', 'error');
        }
      } catch (err) {
        console.error("Error uploading image:", err);
        showNotification('Error de conexión al subir la imagen.', 'error');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validar todos los campos antes de enviar
    let newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key], formData, false, user.email);
      if (error) {
        newErrors[key] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showNotification('Por favor, corrige los errores en el formulario.', 'error');
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
        // Actualizar el estado global del usuario con los nuevos datos
        setUser(prevUser => ({ ...prevUser, ...response.data }));
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
        setUser(null); // Limpiar el estado del usuario globalmente
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
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <FontAwesomeIcon icon={faCog} className={styles.icon} spin />
          <h3>Editar Perfil</h3>
          <button onClick={handleVolver} className={styles.volverBtn}>
            <FontAwesomeIcon icon={faArrowLeft} /> Volver
          </button>
        </div>
      </div>

      <div className={styles.mainLayout}>
        <div className={styles.sidePanel}>
          <div
            className={styles.profileCard}
            onClick={toggleSubMenu}
          >
            <div className={styles.profileImageContainer}>
              <img
                src={imagenPerfil || `https://placehold.co/150x150/cccccc/ffffff?text=${formData.nombre.charAt(0) || 'U'}`}
                alt="Perfil"
                className={styles.profileImage}
                onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/150x150/cccccc/ffffff?text=${formData.nombre.charAt(0) || 'U'}`; }}
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
                disabled={isSubmitting}
              />
            </div>
            <p className={styles.profileName}>{formData.nombre} {formData.apellido}</p>
            <FontAwesomeIcon
              icon={showSubMenu ? faChevronUp : faChevronDown}
              className={styles.chevronIcon}
            />
          </div>
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
                  {errors.nombre && <p className={styles.errorText}>{errors.nombre}</p>}
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
                  {errors.apellido && <p className={styles.errorText}>{errors.apellido}</p>}
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
                  {errors.email && <p className={styles.errorText}>{errors.email}</p>}
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
                  {errors.telefono && <p className={styles.errorText}>{errors.telefono}</p>}
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
                  {errors.direccion && <p className={styles.errorText}>{errors.direccion}</p>}
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
                    <option value="PASAPORTE">Pasaporte</option>
                  </select>
                  {errors.tipo_documento && <p className={styles.errorText}>{errors.tipo_documento}</p>}
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
                  {errors.numero_documento && <p className={styles.errorText}>{errors.numero_documento}</p>}
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
                  {errors.fecha_nacimiento && <p className={styles.errorText}>{errors.fecha_nacimiento}</p>}
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

          {activeSection === 'seguridad' && (
            <div className={styles.sectionContent}>
              <h4 className={styles.sectionTitle}>
                <FontAwesomeIcon icon={faShieldAlt} /> Seguridad
              </h4>

              <div className={styles.securityCard}>
                <div className={styles.securityActions}>
                  <Link to="/usuario/perfil/cambiar-contrasena" className={styles.securityBtn}> {/* Ruta para cambiar contraseña */}
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
