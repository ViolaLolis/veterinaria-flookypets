import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft, faSave, faSpinner, faCheckCircle, faTimesCircle,
  faUser, faEnvelope, faPhone, faMapMarkerAlt, faBriefcaseMedical,
  faGraduationCap, faClock, faCamera, faEdit, faLock, faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
import { authFetch } from './api';
import styles from './Style/EditarPerfilVeterinarioStyles.module.css';

const EditarPerfilVeterinario = () => {
  const { user, setUser, showNotification } = useOutletContext();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccion: '',
    experiencia: '',
    universidad: '',
    horario: '',
    imagen_url: '',
    new_password: '',
    confirm_password: ''
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: "easeIn" } },
  };

  const messageVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
  };

  const loadProfileData = useCallback(async () => {
    setLoading(true);
    setError('');
    if (!user || !user.id) {
      setError('ID de usuario no disponible. Por favor, inicia sesión de nuevo.');
      setLoading(false);
      return;
    }
    try {
      const response = await authFetch(`/usuarios/${user.id}`);
      if (response.success) {
        const userData = response.data;
        setFormData({
          nombre: userData.nombre || '',
          apellido: userData.apellido || '',
          email: userData.email || '',
          telefono: userData.telefono || '',
          direccion: userData.direccion || '',
          experiencia: userData.experiencia || '',
          universidad: userData.universidad || '',
          horario: userData.horario || '',
          imagen_url: userData.imagen_url || '',
          new_password: '',
          confirm_password: ''
        });
      } else {
        setError(response.message || 'Error al cargar los datos del perfil.');
        if (showNotification) showNotification(response.message || 'Error al cargar los datos del perfil.', 'error');
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError('Error de conexión al servidor al cargar el perfil.');
      if (showNotification) showNotification('Error de conexión al servidor al cargar el perfil.', 'error');
    } finally {
      setLoading(false);
    }
  }, [user, showNotification]);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  // Funciones de validación
  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'nombre':
      case 'apellido':
        if (!value.trim()) {
          error = 'Este campo no puede estar vacío.';
        } else if (/\d/.test(value)) {
          error = 'No se permiten números.';
        } else if (!/^[A-ZÑÁÉÍÓÚÜ\s]+$/.test(value)) { // Permite solo mayúsculas, espacios y Ñ
            error = 'Solo se permiten letras mayúsculas, sin números ni caracteres especiales.';
        }
        break;
      case 'email':
        if (!value.trim()) {
          error = 'El email es requerido.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Formato de email inválido (ej: correo@dominio.com).';
        }
        break;
      case 'telefono':
        if (!value.trim()) {
          error = 'El teléfono es requerido.';
        } else if (!/^\+?[0-9\s-]{7,20}$/.test(value)) {
          error = 'Formato de teléfono inválido (solo números, guiones o +, mínimo 7 dígitos).';
        }
        break;
      case 'direccion':
        if (!value.trim()) {
            error = 'La dirección es requerida.';
        } else if (value.length < 5) {
            error = 'La dirección debe tener al menos 5 caracteres.';
        } else if (!/^[a-zA-Z0-9\s.,#-]+$/.test(value)) { // Permite letras, números, espacios, ., #, -
            error = 'La dirección contiene caracteres inválidos.';
        }
        break;
      case 'experiencia':
        if (value.trim() && !/^\d+$/.test(value)) { // Solo si hay valor, valida que sean dígitos
            error = 'La experiencia debe ser un número.';
        } else if (value.trim() && (parseInt(value, 10) < 0 || parseInt(value, 10) > 50)) {
            error = 'La experiencia debe estar entre 0 y 50 años.';
        }
        break;
      case 'universidad':
        if (value.trim() && !/^[a-zA-Z0-9\s.,-]+$/.test(value)) { // Permite letras, números, espacios, ., -
            error = 'La universidad contiene caracteres inválidos.';
        } else if (value.trim() && value.length < 3) {
            error = 'El nombre de la universidad es muy corto.';
        }
        break;
      case 'horario':
        if (value.trim() && value.length < 5) {
            error = 'El horario es muy corto. Proporciona más detalles.';
        }
        // Puedes agregar una regex más estricta si el formato de horario es fijo
        break;
      case 'new_password':
        if (value && value.length < 8) {
          error = 'La contraseña debe tener al menos 8 caracteres.';
        } else if (value && !/(?=.*[a-z])/.test(value)) {
          error = 'La contraseña debe contener al menos una minúscula.';
        } else if (value && !/(?=.*[A-Z])/.test(value)) {
          error = 'La contraseña debe contener al menos una mayúscula.';
        } else if (value && !/(?=.*\d)/.test(value)) {
          error = 'La contraseña debe contener al menos un número.';
        } else if (value && !/(?=.*[!@#$%^&*()_+={}\[\]:;"'<>,.?/\\|-])/.test(value)) { // Más símbolos
          error = 'La contraseña debe contener al menos un símbolo (!@#$%^&*()_+={}[];:"<>,.?/\\|-).';
        }
        break;
      case 'confirm_password':
        if (formData.new_password && value !== formData.new_password) {
          error = 'Las contraseñas no coinciden.';
        }
        break;
      default:
        break;
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    // Lógica para forzar "MAYÚSCULA SOSTENIDA" y restringir caracteres para nombre y apellido
    if (name === 'nombre' || name === 'apellido') {
        // Solo permitir letras (mayúsculas, minúsculas, ñ, acentos) y espacios
        // Convertir a mayúsculas inmediatamente
        newValue = newValue.replace(/[^a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s]/g, '').toUpperCase();
    } else if (name === 'telefono') {
        // Filtrar para permitir solo números, +, - y espacios
        newValue = newValue.replace(/[^0-9+\s-]/g, '');
    } else if (name === 'experiencia') {
        // Filtrar para permitir solo números
        newValue = newValue.replace(/[^0-9]/g, '');
    }

    setFormData(prev => ({ ...prev, [name]: newValue }));

    // Validar en tiempo real y actualizar errores
    const fieldError = validateField(name, newValue);
    setValidationErrors(prev => ({ ...prev, [name]: fieldError }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    // Puedes agregar validación para el tipo de archivo o tamaño aquí si lo deseas
    setSelectedFile(file);
  };

  const handleUploadImage = async () => {
    if (!selectedFile) {
      showNotification('Por favor, selecciona una imagen para subir.', 'info');
      return null;
    }

    // Validar tamaño de archivo (ej. max 5MB)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
    if (selectedFile.size > MAX_FILE_SIZE) {
        showNotification('El tamaño de la imagen no puede exceder 5MB.', 'error');
        setSelectedFile(null);
        return null;
    }

    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    const imageData = new FormData();
    imageData.append('image', selectedFile);

    try {
      const response = await authFetch('/upload-image', {
        method: 'POST',
        body: imageData,
      });

      if (response.success) {
        showNotification('Imagen de perfil subida exitosamente.', 'success');
        setFormData(prev => ({ ...prev, imagen_url: response.imageUrl }));
        setSelectedFile(null);
        return response.imageUrl;
      } else {
        setError(response.message || 'Error al subir la imagen.');
        if (showNotification) showNotification(response.message || 'Error al subir la imagen.', 'error');
        return null;
      }
    } catch (err) {
      console.error("Error uploading image:", err);
      setError(err.message || 'Error de conexión al servidor al subir imagen.');
      if (showNotification) showNotification(err.message || 'Error de conexión al servidor al subir imagen.', 'error');
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');
    setValidationErrors({}); // Limpiar errores previos

    let errors = {};
    // Validar todos los campos antes de enviar
    Object.keys(formData).forEach(key => {
        // No validar new_password y confirm_password si ambos están vacíos
        // Solo validar si el campo es requerido o si tiene un valor (para campos opcionales)
        if (key === 'new_password' || key === 'confirm_password') {
            if (formData.new_password || formData.confirm_password) { // Solo si al menos uno tiene valor
                const error = validateField(key, formData[key]);
                if (error) {
                    errors[key] = error;
                }
            }
        } else if (['nombre', 'apellido', 'email', 'telefono'].includes(key) || (key === 'direccion' && formData.direccion.trim() !== '')) {
            // Campos requeridos o dirección que tiene valor
            const error = validateField(key, formData[key]);
            if (error) {
                errors[key] = error;
            }
        } else if (user?.role === 'veterinario' && ['experiencia', 'universidad', 'horario'].includes(key) && formData[key].trim() !== '') {
            // Campos de veterinario que tienen valor
            const error = validateField(key, formData[key]);
            if (error) {
                errors[key] = error;
            }
        }
    });


    if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        setError('Por favor, corrige los errores en el formulario antes de guardar.');
        if (showNotification) showNotification('Por favor, corrige los errores en el formulario.', 'error');
        setIsSubmitting(false);
        return;
    }

    let updatedImageUrl = formData.imagen_url;
    if (selectedFile) {
      updatedImageUrl = await handleUploadImage();
      if (!updatedImageUrl) {
        setIsSubmitting(false);
        return;
      }
    }

    const dataToUpdate = {
      nombre: formData.nombre,
      apellido: formData.apellido,
      email: formData.email,
      telefono: formData.telefono,
      direccion: formData.direccion,
      experiencia: formData.experiencia,
      universidad: formData.universidad,
      horario: formData.horario,
      imagen_url: updatedImageUrl,
    };

    if (formData.new_password) {
      dataToUpdate.password = formData.new_password;
    }

    try {
      const response = await authFetch(`/usuarios/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToUpdate),
      });

      if (response.success) {
        setSuccessMessage('Perfil actualizado exitosamente.');
        if (showNotification) showNotification('Perfil actualizado exitosamente.', 'success');
        if (setUser) {
          setUser(prevUser => ({
            ...prevUser,
            nombre: response.data.nombre,
                        apellido: response.data.apellido, // Asegurar que el apellido también se actualice
            email: response.data.email,
            imagen_url: response.data.imagen_url,
          }));
        }
        loadProfileData();
        setFormData(prev => ({ ...prev, new_password: '', confirm_password: '' }));
      } else {
        setError(response.message || 'Error al actualizar el perfil.');
        if (showNotification) showNotification(response.message || 'Error al actualizar el perfil.', 'error');
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.message || 'Error de conexión al servidor al actualizar perfil.');
      if (showNotification) showNotification(err.message || 'Error de conexión al servidor al actualizar perfil.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <FontAwesomeIcon icon={faSpinner} spin size="3x" className={styles.spinnerIcon} />
        <p className={styles.loadingText}>Cargando perfil...</p>
      </div>
    );
  }

  return (
    <motion.div
      className={styles.editProfileContainer}
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className={styles.header}>
        <motion.button
          onClick={() => navigate(-1)}
          className={styles.backButton}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Volver
        </motion.button>
        <h2 className={styles.title}><FontAwesomeIcon icon={faEdit} className={styles.titleIcon} /> Editar Perfil</h2>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            className={styles.errorMessage}
            variants={messageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <FontAwesomeIcon icon={faTimesCircle} className={styles.messageIcon} /> {error}
          </motion.div>
        )}
        {successMessage && (
          <motion.div
            className={styles.successMessage}
            variants={messageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <FontAwesomeIcon icon={faCheckCircle} className={styles.messageIcon} /> {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.profileImageSection}>
          <div className={styles.imagePreviewWrapper}>
            <img
              src={selectedFile ? URL.createObjectURL(selectedFile) : (formData.imagen_url || `https://placehold.co/150x150/00acc1/ffffff?text=${formData.nombre?.charAt(0) || 'V'}`)}
              alt="Imagen de Perfil"
              className={styles.profileImagePreview}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://placehold.co/150x150/00acc1/ffffff?text=${formData.nombre?.charAt(0) || 'V'}`;
              }}
            />
            <label htmlFor="file-upload" className={styles.uploadButton}>
              <FontAwesomeIcon icon={faCamera} /> Cambiar Foto
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className={styles.fileInput}
                disabled={isSubmitting}
              />
            </label>
          </div>
          {selectedFile && (
            <motion.p
              className={styles.fileName}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <FontAwesomeIcon icon={faInfoCircle} /> Archivo seleccionado: {selectedFile.name}
            </motion.p>
          )}
        </div>

        <h3 className={styles.sectionTitle}>Información Personal</h3>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label htmlFor="nombre"><FontAwesomeIcon icon={faUser} /> Nombre:</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className={`${styles.inputField} ${validationErrors.nombre ? styles.inputError : ''}`}
              required
              disabled={isSubmitting}
              placeholder="INGRESA TU NOMBRE EN MAYÚSCULAS"
              maxLength={50} // Ejemplo de longitud máxima
            />
            {validationErrors.nombre && <p className={styles.validationError}>{validationErrors.nombre}</p>}
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="apellido"><FontAwesomeIcon icon={faUser} /> Apellido:</label>
            <input
              type="text"
              id="apellido"
              name="apellido"
              value={formData.apellido}
              onChange={handleChange}
              className={`${styles.inputField} ${validationErrors.apellido ? styles.inputError : ''}`}
              required // Añadido como requerido
              disabled={isSubmitting}
              placeholder="INGRESA TU APELLIDO EN MAYÚSCULAS"
              maxLength={50} // Ejemplo de longitud máxima
            />
            {validationErrors.apellido && <p className={styles.validationError}>{validationErrors.apellido}</p>}
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="email"><FontAwesomeIcon icon={faEnvelope} /> Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`${styles.inputField} ${validationErrors.email ? styles.inputError : ''}`}
              required
              disabled={isSubmitting}
              placeholder="tu@email.com"
              maxLength={100}
            />
            {validationErrors.email && <p className={styles.validationError}>{validationErrors.email}</p>}
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="telefono"><FontAwesomeIcon icon={faPhone} /> Teléfono:</label>
            <input
              type="text"
              id="telefono"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              className={`${styles.inputField} ${validationErrors.telefono ? styles.inputError : ''}`}
              required
              disabled={isSubmitting}
              placeholder="Ej: +57 3XX XXX XXXX"
              maxLength={20}
            />
            {validationErrors.telefono && <p className={styles.validationError}>{validationErrors.telefono}</p>}
          </div>
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label htmlFor="direccion"><FontAwesomeIcon icon={faMapMarkerAlt} /> Dirección:</label>
            <input
              type="text"
              id="direccion"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              className={`${styles.inputField} ${validationErrors.direccion ? styles.inputError : ''}`}
              disabled={isSubmitting}
              placeholder="Ej: Calle 10 # 5-20, Soacha"
              maxLength={150}
            />
            {validationErrors.direccion && <p className={styles.validationError}>{validationErrors.direccion}</p>}
          </div>
        </div>

        {user?.role === 'veterinario' && (
          <>
            <h3 className={styles.sectionTitle}>Información Profesional</h3>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="experiencia"><FontAwesomeIcon icon={faBriefcaseMedical} /> Experiencia (años):</label>
                <input
                  type="text" // Mantener como text para manejar la limpieza de caracteres
                  id="experiencia"
                  name="experiencia"
                  value={formData.experiencia}
                  onChange={handleChange}
                  className={`${styles.inputField} ${validationErrors.experiencia ? styles.inputError : ''}`}
                  disabled={isSubmitting}
                  placeholder="Ej: 5 (años)"
                  maxLength={2} // Máximo 2 dígitos para experiencia (0-99)
                />
                {validationErrors.experiencia && <p className={styles.validationError}>{validationErrors.experiencia}</p>}
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="universidad"><FontAwesomeIcon icon={faGraduationCap} /> Universidad:</label>
                <input
                  type="text"
                  id="universidad"
                  name="universidad"
                  value={formData.universidad}
                  onChange={handleChange}
                  className={`${styles.inputField} ${validationErrors.universidad ? styles.inputError : ''}`}
                  disabled={isSubmitting}
                  placeholder="Tu universidad de egreso"
                  maxLength={100}
                />
                {validationErrors.universidad && <p className={styles.validationError}>{validationErrors.universidad}</p>}
              </div>
              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label htmlFor="horario"><FontAwesomeIcon icon={faClock} /> Horario de Atención:</label>
                <input
                  type="text"
                  id="horario"
                  name="horario"
                  value={formData.horario}
                  onChange={handleChange}
                  className={`${styles.inputField} ${validationErrors.horario ? styles.inputError : ''}`}
                  disabled={isSubmitting}
                  placeholder="Ej: L-V 9:00 - 18:00, S 9:00 - 12:00"
                  maxLength={100}
                />
                {validationErrors.horario && <p className={styles.validationError}>{validationErrors.horario}</p>}
              </div>
            </div>
          </>
        )}

        <h3 className={styles.sectionTitle}>Cambiar Contraseña (Opcional)</h3>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label htmlFor="new_password"><FontAwesomeIcon icon={faLock} /> Nueva Contraseña:</label>
            <input
              type="password"
              id="new_password"
              name="new_password"
              value={formData.new_password}
              onChange={handleChange}
              className={`${styles.inputField} ${validationErrors.new_password ? styles.inputError : ''}`}
              disabled={isSubmitting}
              placeholder="Mínimo 8 caracteres, Mayús, Minús, Número, Símbolo"
              maxLength={50}
            />
            {validationErrors.new_password && <p className={styles.validationError}>{validationErrors.new_password}</p>}
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="confirm_password"><FontAwesomeIcon icon={faLock} /> Confirmar Nueva Contraseña:</label>
            <input
              type="password"
              id="confirm_password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              className={`${styles.inputField} ${validationErrors.confirm_password ? styles.inputError : ''}`}
              disabled={isSubmitting}
              placeholder="Repite la nueva contraseña"
              maxLength={50}
            />
            {validationErrors.confirm_password && <p className={styles.validationError}>{validationErrors.confirm_password}</p>}
          </div>
        </div>

        <motion.button
          type="submit"
          className={styles.submitButton}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <FontAwesomeIcon icon={faSpinner} spin /> Guardando...
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faSave} /> Guardar Cambios
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default EditarPerfilVeterinario;