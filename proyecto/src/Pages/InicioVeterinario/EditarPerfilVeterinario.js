import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft, faSave, faSpinner, faCheckCircle, faTimesCircle,
  faUser, faEnvelope, faPhone, faMapMarkerAlt, faBriefcaseMedical,
  faGraduationCap, faClock, faCamera, faEdit
} from '@fortawesome/free-solid-svg-icons';
import { authFetch } from './api'; // Asegúrate de que la ruta sea correcta
import styles from './Style/EditarPerfilVeterinarioStyles.module.css'; // Crear este archivo CSS

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
    imagen_url: '', // Para la URL de la imagen actual
    new_password: '', // Para cambiar la contraseña
    confirm_password: ''
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    // --- DEBUGGING: Log file info ---
    if (file) {
      console.log("Archivo seleccionado:", file.name, file.type, file.size, "bytes");
    } else {
      console.log("No se seleccionó ningún archivo.");
    }
    // ---------------------------------
  };

  const handleUploadImage = async () => {
    if (!selectedFile) {
      showNotification('Por favor, selecciona una imagen para subir.', 'info');
      console.warn("handleUploadImage: selectedFile es nulo."); // Debugging
      return null;
    }

    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    const imageData = new FormData();
    imageData.append('image', selectedFile); // 'image' debe coincidir con req.files.image en el servidor

    // --- DEBUGGING: Log FormData content ---
    console.log("Contenido de FormData:");
    for (let [key, value] of imageData.entries()) {
      console.log(`${key}:`, value);
    }
    // ---------------------------------------

    try {
      const response = await authFetch('/upload-image', {
        method: 'POST',
        body: imageData,
      });

      if (response.success) {
        showNotification('Imagen de perfil subida exitosamente.', 'success');
        setFormData(prev => ({ ...prev, imagen_url: response.imageUrl }));
        setSelectedFile(null); // Limpiar el archivo seleccionado
        return response.imageUrl;
      } else {
        // Ahora el mensaje de error del servidor será más específico
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

    if (formData.new_password && formData.new_password !== formData.confirm_password) {
      setError('Las nuevas contraseñas no coinciden.');
      setIsSubmitting(false);
      return;
    }

    let updatedImageUrl = formData.imagen_url;
    if (selectedFile) {
      // Sube la imagen primero y obtén la URL de Cloudinary
      updatedImageUrl = await handleUploadImage();
      if (!updatedImageUrl) {
        setIsSubmitting(false);
        return; // Si la subida falla, detener el proceso
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
      imagen_url: updatedImageUrl, // Usar la URL actualizada de la imagen (o la existente si no se subió una nueva)
    };

    // Añadir la contraseña solo si se ha introducido una nueva
    if (formData.new_password) {
      dataToUpdate.password = formData.new_password;
    }

    console.log("Datos a enviar para actualizar perfil:", dataToUpdate);

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
            apellido: response.data.apellido,
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
        <FontAwesomeIcon icon={faSpinner} spin size="3x" color="#00acc1" />
        <p>Cargando perfil...</p>
      </div>
    );
  }

  return (
    <motion.div
      className={styles.editProfileContainer}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.3 }}
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
        <h2><FontAwesomeIcon icon={faEdit} /> Editar Perfil</h2>
      </div>

      {error && (
        <motion.div
          className={styles.errorMessage}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <FontAwesomeIcon icon={faTimesCircle} /> {error}
        </motion.div>
      )}

      {successMessage && (
        <motion.div
          className={styles.successMessage}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <FontAwesomeIcon icon={faCheckCircle} /> {successMessage}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.profileImageSection}>
          <img
            src={formData.imagen_url || `https://placehold.co/150x150/00acc1/ffffff?text=${formData.nombre?.charAt(0) || 'V'}`}
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
          {selectedFile && (
            <p className={styles.fileName}>Archivo seleccionado: {selectedFile.name}</p>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="nombre"><FontAwesomeIcon icon={faUser} /> Nombre:</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            className={styles.inputField}
            required
            disabled={isSubmitting}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="apellido">Apellido:</label>
          <input
            type="text"
            id="apellido"
            name="apellido"
            value={formData.apellido}
            onChange={handleChange}
            className={styles.inputField}
            disabled={isSubmitting}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="email"><FontAwesomeIcon icon={faEnvelope} /> Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={styles.inputField}
            required
            disabled={isSubmitting}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="telefono"><FontAwesomeIcon icon={faPhone} /> Teléfono:</label>
          <input
            type="text"
            id="telefono"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            className={styles.inputField}
            required
            disabled={isSubmitting}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="direccion"><FontAwesomeIcon icon={faMapMarkerAlt} /> Dirección:</label>
          <input
            type="text"
            id="direccion"
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            className={styles.inputField}
            disabled={isSubmitting}
          />
        </div>

        {user?.role === 'veterinario' && (
          <>
            <div className={styles.formGroup}>
              <label htmlFor="experiencia"><FontAwesomeIcon icon={faBriefcaseMedical} /> Experiencia:</label>
              <input
                type="text"
                id="experiencia"
                name="experiencia"
                value={formData.experiencia}
                onChange={handleChange}
                className={styles.inputField}
                disabled={isSubmitting}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="universidad"><FontAwesomeIcon icon={faGraduationCap} /> Universidad:</label>
              <input
                type="text"
                id="universidad"
                name="universidad"
                value={formData.universidad}
                onChange={handleChange}
                className={styles.inputField}
                disabled={isSubmitting}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="horario"><FontAwesomeIcon icon={faClock} /> Horario:</label>
              <input
                type="text"
                id="horario"
                name="horario"
                value={formData.horario}
                onChange={handleChange}
                className={styles.inputField}
                disabled={isSubmitting}
              />
            </div>
          </>
        )}

        <h3 className={styles.sectionTitle}>Cambiar Contraseña (Opcional)</h3>
        <div className={styles.formGroup}>
          <label htmlFor="new_password">Nueva Contraseña:</label>
          <input
            type="password"
            id="new_password"
            name="new_password"
            value={formData.new_password}
            onChange={handleChange}
            className={styles.inputField}
            disabled={isSubmitting}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="confirm_password">Confirmar Nueva Contraseña:</label>
          <input
            type="password"
            id="confirm_password"
            name="confirm_password"
            value={formData.confirm_password}
            onChange={handleChange}
            className={styles.inputField}
            disabled={isSubmitting}
          />
        </div>

        <motion.button
          type="submit"
          className={styles.submitButton}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
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