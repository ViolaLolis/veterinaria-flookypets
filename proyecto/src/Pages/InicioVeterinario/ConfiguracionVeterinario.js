// src/Components/ConfiguracionVeterinario.js (or similar name based on your structure)
import React, { useState, useEffect, useCallback } from 'react';
import veteStyles from './Style/ConfiguracionVeterinarioStyles.module.css';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCog, faBell, faSave, faTimesCircle, faArrowLeft,
  faClock, faCheckCircle, faExclamationTriangle, faSpinner, faInfoCircle,
  faEnvelope, faPhone, faMapMarkerAlt, faBriefcaseMedical, faGraduationCap
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { authFetch } from '../../utils/api'; // Ruta ajustada a tu api.js
import { validateField } from '../../utils/validation'; // Importa la función de validación
import { useNotifications } from '../../Notifications/NotificationContext'; // Ruta ajustada

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: 'easeInOut',
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
};

const buttonVariants = {
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2
    }
  },
  tap: {
    scale: 0.95
  }
};

const ConfiguracionVeterinario = () => {
  const navigate = useNavigate();
  const { user, setUser } = useOutletContext(); // Contexto para obtener y actualizar el usuario global
  const { addNotification } = useNotifications();

  const [perfil, setPerfil] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccion: '',
    experiencia: '', // Solo para veterinarios
    universidad: '', // Solo para veterinarios
    horario: '',     // Solo para veterinarios
    imagen_url: '',  // URL de la imagen de perfil
    currentPassword: '', // Para la validación de cambio de contraseña
    newPassword: '',
    confirmNewPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [originalEmail, setOriginalEmail] = useState(''); // Para pasar a validateField


  // Función para obtener el perfil del usuario/veterinario
  const fetchProfile = useCallback(async () => {
    if (!user || !user.id) {
      navigate('/login'); // Redirigir si no hay usuario logueado
      return;
    }
    setLoading(true);
    try {
      const response = await authFetch(`/api/profile/${user.id}`);
      if (response.success) {
        const fetchedPerfil = response.data;
        setPerfil({
          ...fetchedPerfil,
          // Asegúrate de que los campos específicos de veterinario se carguen
          experiencia: fetchedPerfil.experiencia || '',
          universidad: fetchedPerfil.universidad || '',
          horario: fetchedPerfil.horario || '',
          // No cargar contraseñas aquí por seguridad
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: ''
        });
        setOriginalEmail(fetchedPerfil.email); // Guarda el email original
      } else {
        setMessage(response.message || "Error al cargar el perfil.");
        setMessageType('error');
      }
    } catch (error) {
      console.error("Error al cargar el perfil:", error);
      setMessage(error.message || "Error de red al cargar el perfil.");
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);


  // Manejar cambios en los inputs del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPerfil(prevPerfil => ({
      ...prevPerfil,
      [name]: value
    }));

    // Validación en tiempo real al cambiar el campo
    let error = null;
    if (name === 'newPassword' || name === 'confirmNewPassword') {
        // Para contraseñas, validamos ambas juntas para la confirmación
        const allFormData = { ...perfil, [name]: value };
        error = validateField(name, value, allFormData, false); // isNewEntry = false for profile edit
        if (name === 'newPassword' && !error) { // Also validate confirmNewPassword if newPassword is valid
            error = validateField('confirmNewPassword', allFormData.confirmNewPassword, allFormData, false);
        } else if (name === 'confirmNewPassword' && !error) { // Also validate newPassword if confirmNewPassword is valid
            error = validateField('newPassword', allFormData.newPassword, allFormData, false);
        }
    } else {
        error = validateField(name, value, perfil, false, originalEmail); // Pass originalEmail
    }

    setErrors(prevErrors => ({
      ...prevErrors,
      [name]: error
    }));
  };

  // Validar todo el formulario antes de enviar
  const validateForm = () => {
    let newErrors = {};
    const fieldsToValidate = [
      'nombre', 'apellido', 'email', 'telefono', 'direccion'
    ];

    // Add veterinarian specific fields if role is 'veterinario'
    if (user.role === 'veterinario') {
      fieldsToValidate.push('experiencia', 'universidad', 'horario');
    }

    // Only validate password fields if they are being changed
    if (perfil.newPassword || perfil.confirmNewPassword) {
        fieldsToValidate.push('newPassword', 'confirmNewPassword');
    }

    fieldsToValidate.forEach(field => {
      const error = validateField(field, perfil[field], perfil, false, originalEmail); // Pass originalEmail
      if (error) {
        newErrors[field] = error;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar el envío del formulario de actualización de perfil
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setMessage("Por favor, corrige los errores en el formulario.");
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');
    setMessageType('');

    try {
      const dataToUpdate = {
        nombre: perfil.nombre,
        apellido: perfil.apellido,
        email: perfil.email,
        telefono: perfil.telefono,
        direccion: perfil.direccion,
      };

      if (user.role === 'veterinario') {
        dataToUpdate.experiencia = perfil.experiencia;
        dataToUpdate.universidad = perfil.universidad;
        dataToUpdate.horario = perfil.horario;
      }

      // Handle password change separately if newPassword is provided
      if (perfil.newPassword) {
          // You would typically have a separate endpoint for password changes
          // or handle it within the same update if your backend supports it.
          // For now, let's assume it's part of the general profile update
          // or require a specific 'change-password' endpoint.
          // For simplicity, I'll add a placeholder for password update logic.
          // In a real app, this should be a separate, secure flow.
          // If the password fields are part of this update, ensure your backend handles currentPassword verification.
          await authFetch(`/api/change-password/${user.id}`, {
              method: 'PUT',
              body: {
                  currentPassword: perfil.currentPassword,
                  newPassword: perfil.newPassword
              }
          });
          // Clear password fields after successful update
          setPerfil(prev => ({...prev, currentPassword: '', newPassword: '', confirmNewPassword: ''}));
          addNotification({ message: 'Contraseña actualizada exitosamente.', type: 'success', ephemeral: true });
      }

      const response = await authFetch(`/api/profile/${user.id}`, {
        method: 'PUT',
        body: dataToUpdate
      });

      if (response.success) {
        setMessage("Perfil actualizado exitosamente.");
        setMessageType('success');
        addNotification({ message: 'Perfil actualizado exitosamente.', type: 'success', ephemeral: true });
        // Actualizar el contexto del usuario global si se cambió el nombre o email, etc.
        setUser(prevUser => ({
            ...prevUser,
            nombre: perfil.nombre,
            apellido: perfil.apellido,
            email: perfil.email,
            imagen_url: perfil.imagen_url // Si se actualiza la imagen también
        }));
      } else {
        setMessage(response.message || "Error al actualizar el perfil.");
        setMessageType('error');
        // Si hay errores de validación del servidor, mostrarlos
        if (response.errors) {
            setErrors(response.errors);
        }
      }
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      setMessage(error.message || "Error de red al actualizar perfil.");
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };


  // Manejar la subida de imagen
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setMessage('');
    setMessageType('');

    const formData = new FormData();
    formData.append('profileImage', file);

    try {
      const response = await authFetch(`/api/profile/${user.id}/upload-image`, {
        method: 'POST',
        body: formData,
        headers: {
          // No set Content-Type here, browser will set it with boundary for FormData
        },
      });

      if (response.success) {
        setPerfil(prevPerfil => ({ ...prevPerfil, imagen_url: response.imageUrl }));
        setMessage("Imagen de perfil subida exitosamente.");
        setMessageType('success');
        addNotification({ message: 'Imagen de perfil actualizada.', type: 'success', ephemeral: true });
        // Update global user context with new image URL
        setUser(prevUser => ({ ...prevUser, imagen_url: response.imageUrl }));
      } else {
        setMessage(response.message || "Error al subir la imagen.");
        setMessageType('error');
      }
    } catch (error) {
      console.error("Error al subir imagen:", error);
      setMessage(error.message || "Error de red al subir imagen.");
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };


  return (
    <motion.div
      className={veteStyles.configContainer}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 variants={itemVariants} className={veteStyles.title}>
        <FontAwesomeIcon icon={faCog} /> Configuración de Perfil
      </motion.h1>

      {loading && (
        <motion.p variants={itemVariants} className={veteStyles.loadingMessage}>
          <FontAwesomeIcon icon={faSpinner} spin /> Cargando...
        </motion.p>
      )}

      {message && (
        <motion.div
          variants={itemVariants}
          className={`${veteStyles.message} ${messageType === 'success' ? veteStyles.successMessage : veteStyles.errorMessage}`}
        >
          <FontAwesomeIcon icon={messageType === 'success' ? faCheckCircle : faExclamationTriangle} /> {message}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className={veteStyles.form}>
        <motion.div variants={itemVariants} className={veteStyles.formGroup}>
          <label htmlFor="nombre">Nombre:</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={perfil.nombre}
            onChange={handleChange}
            className={errors.nombre ? veteStyles.inputError : ''}
          />
          {errors.nombre && <p className={veteStyles.errorText}><FontAwesomeIcon icon={faInfoCircle} /> {errors.nombre}</p>}
        </motion.div>

        <motion.div variants={itemVariants} className={veteStyles.formGroup}>
          <label htmlFor="apellido">Apellido:</label>
          <input
            type="text"
            id="apellido"
            name="apellido"
            value={perfil.apellido}
            onChange={handleChange}
            className={errors.apellido ? veteStyles.inputError : ''}
          />
          {errors.apellido && <p className={veteStyles.errorText}><FontAwesomeIcon icon={faInfoCircle} /> {errors.apellido}</p>}
        </motion.div>

        <motion.div variants={itemVariants} className={veteStyles.formGroup}>
          <label htmlFor="email"><FontAwesomeIcon icon={faEnvelope} /> Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={perfil.email}
            onChange={handleChange}
            className={errors.email ? veteStyles.inputError : ''}
          />
          {errors.email && <p className={veteStyles.errorText}><FontAwesomeIcon icon={faInfoCircle} /> {errors.email}</p>}
        </motion.div>

        <motion.div variants={itemVariants} className={veteStyles.formGroup}>
          <label htmlFor="telefono"><FontAwesomeIcon icon={faPhone} /> Teléfono:</label>
          <input
            type="text"
            id="telefono"
            name="telefono"
            value={perfil.telefono}
            onChange={handleChange}
            className={errors.telefono ? veteStyles.inputError : ''}
          />
          {errors.telefono && <p className={veteStyles.errorText}><FontAwesomeIcon icon={faInfoCircle} /> {errors.telefono}</p>}
        </motion.div>

        <motion.div variants={itemVariants} className={veteStyles.formGroup}>
          <label htmlFor="direccion"><FontAwesomeIcon icon={faMapMarkerAlt} /> Dirección:</label>
          <input
            type="text"
            id="direccion"
            name="direccion"
            value={perfil.direccion}
            onChange={handleChange}
            className={errors.direccion ? veteStyles.inputError : ''}
          />
          {errors.direccion && <p className={veteStyles.errorText}><FontAwesomeIcon icon={faInfoCircle} /> {errors.direccion}</p>}
        </motion.div>

        {user && user.role === 'veterinario' && (
          <>
            <motion.div variants={itemVariants} className={veteStyles.formGroup}>
              <label htmlFor="experiencia"><FontAwesomeIcon icon={faBriefcaseMedical} /> Experiencia:</label>
              <textarea
                id="experiencia"
                name="experiencia"
                value={perfil.experiencia}
                onChange={handleChange}
                className={errors.experiencia ? veteStyles.inputError : ''}
              ></textarea>
              {errors.experiencia && <p className={veteStyles.errorText}><FontAwesomeIcon icon={faInfoCircle} /> {errors.experiencia}</p>}
            </motion.div>

            <motion.div variants={itemVariants} className={veteStyles.formGroup}>
              <label htmlFor="universidad"><FontAwesomeIcon icon={faGraduationCap} /> Universidad:</label>
              <input
                type="text"
                id="universidad"
                name="universidad"
                value={perfil.universidad}
                onChange={handleChange}
                className={errors.universidad ? veteStyles.inputError : ''}
              />
              {errors.universidad && <p className={veteStyles.errorText}><FontAwesomeIcon icon={faInfoCircle} /> {errors.universidad}</p>}
            </motion.div>

            <motion.div variants={itemVariants} className={veteStyles.formGroup}>
              <label htmlFor="horario"><FontAwesomeIcon icon={faClock} /> Horario:</label>
              <input
                type="text"
                id="horario"
                name="horario"
                value={perfil.horario}
                onChange={handleChange}
                className={errors.horario ? veteStyles.inputError : ''}
              />
              {errors.horario && <p className={veteStyles.errorText}><FontAwesomeIcon icon={faInfoCircle} /> {errors.horario}</p>}
            </motion.div>
          </>
        )}

        {/* Sección de cambio de contraseña */}
        <motion.h2 variants={itemVariants} className={veteStyles.subTitle}>
            Cambiar Contraseña
        </motion.h2>
        <motion.div variants={itemVariants} className={veteStyles.formGroup}>
          <label htmlFor="currentPassword">Contraseña Actual:</label>
          <input
            type="password"
            id="currentPassword"
            name="currentPassword"
            value={perfil.currentPassword}
            onChange={handleChange}
          />
        </motion.div>
        <motion.div variants={itemVariants} className={veteStyles.formGroup}>
          <label htmlFor="newPassword">Nueva Contraseña:</label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            value={perfil.newPassword}
            onChange={handleChange}
            className={errors.newPassword ? veteStyles.inputError : ''}
          />
          {errors.newPassword && <p className={veteStyles.errorText}><FontAwesomeIcon icon={faInfoCircle} /> {errors.newPassword}</p>}
        </motion.div>
        <motion.div variants={itemVariants} className={veteStyles.formGroup}>
          <label htmlFor="confirmNewPassword">Confirmar Nueva Contraseña:</label>
          <input
            type="password"
            id="confirmNewPassword"
            name="confirmNewPassword"
            value={perfil.confirmNewPassword}
            onChange={handleChange}
            className={errors.confirmNewPassword ? veteStyles.inputError : ''}
          />
          {errors.confirmNewPassword && <p className={veteStyles.errorText}><FontAwesomeIcon icon={faInfoCircle} /> {errors.confirmNewPassword}</p>}
        </motion.div>

        {/* Sección para subir imagen de perfil */}
        <motion.h2 variants={itemVariants} className={veteStyles.subTitle}>
            Imagen de Perfil
        </motion.h2>
        <motion.div variants={itemVariants} className={veteStyles.formGroup}>
          <label htmlFor="profileImage">Subir Imagen:</label>
          <input
            type="file"
            id="profileImage"
            name="profileImage"
            accept="image/*"
            onChange={handleImageUpload}
          />
          {perfil.imagen_url && (
            <div className={veteStyles.profileImagePreview}>
              <p>Imagen actual:</p>
              <img src={perfil.imagen_url} alt="Perfil" />
            </div>
          )}
        </motion.div>


        <motion.div variants={itemVariants} className={veteStyles.buttonGroup}>
          <motion.button
            type="submit"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            className={veteStyles.saveButton}
            disabled={loading}
          >
            <FontAwesomeIcon icon={faSave} /> {loading ? 'Guardando...' : 'Guardar Cambios'}
          </motion.button>
          <motion.button
            type="button"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            className={veteStyles.cancelButton}
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            <FontAwesomeIcon icon={faArrowLeft} /> Volver
          </motion.button>
        </motion.div>
      </form>
    </motion.div>
  );
};

export default ConfiguracionVeterinario;