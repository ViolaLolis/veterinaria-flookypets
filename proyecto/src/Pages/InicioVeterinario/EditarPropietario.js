import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft, faSave, faSpinner, faTimesCircle,
  faUser, faEnvelope, faPhone, faMapMarkerAlt, faCamera, faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import { authFetch } from './api'; // Asegúrate de que la ruta sea correcta
import styles from './Style/EditarPropietarioStyles.module.css'; // Crear este archivo CSS

const EditarPropietario = () => {
  const { id } = useParams(); // Obtener el ID del propietario de la URL
  const navigate = useNavigate();
  const { showNotification } = useOutletContext();

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccion: '',
    tipo_documento: '',
    numero_documento: '',
    fecha_nacimiento: '',
    imagen_url: '', // Para la URL de la imagen actual
    new_password: '', // Para cambiar la contraseña
    confirm_password: ''
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const loadPropietarioData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await authFetch(`/usuarios/${id}`);
      if (response.success) {
        const userData = response.data;
        setFormData({
          nombre: userData.nombre || '',
          apellido: userData.apellido || '',
          email: userData.email || '',
          telefono: userData.telefono || '',
          direccion: userData.direccion || '',
          tipo_documento: userData.tipo_documento || '',
          numero_documento: userData.numero_documento || '',
          // Formatear fecha de nacimiento a YYYY-MM-DD para input type="date"
          fecha_nacimiento: userData.fecha_nacimiento ? new Date(userData.fecha_nacimiento).toISOString().split('T')[0] : '',
          imagen_url: userData.imagen_url || '',
          new_password: '',
          confirm_password: ''
        });
      } else {
        setError(response.message || 'Error al cargar los datos del propietario.');
        if (showNotification) showNotification(response.message || 'Error al cargar los datos del propietario.', 'error');
      }
    } catch (err) {
      console.error("Error fetching propietario:", err);
      setError('Error de conexión al servidor al cargar el propietario.');
      if (showNotification) showNotification('Error de conexión al servidor al cargar el propietario.', 'error');
    } finally {
      setLoading(false);
    }
  }, [id, showNotification]);

  useEffect(() => {
    loadPropietarioData();
  }, [loadPropietarioData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Convertir a mayúsculas si no es el campo de email, fecha o contraseña
    const newValue = (name !== 'email' && name !== 'fecha_nacimiento' && name !== 'new_password' && name !== 'confirm_password')
      ? value.toUpperCase()
      : value;
    setFormData(prev => ({ ...prev, [name]: newValue }));
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUploadImage = async () => {
    if (!selectedFile) {
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
        headers: {
          // No Content-Type aquí, FormData lo establece automáticamente con el boundary
        },
        body: imageData,
      });

      if (response.success) {
        showNotification('Imagen de perfil subida exitosamente.', 'success');
        setFormData(prev => ({ ...prev, imagen_url: response.imageUrl }));
        setSelectedFile(null); // Limpiar el archivo seleccionado
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
      // No establecer isSubmitting a false aquí, ya que la subida de imagen es parte del submit general
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
      updatedImageUrl = await handleUploadImage(); // Sube la imagen primero
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
      tipo_documento: formData.tipo_documento,
      numero_documento: formData.numero_documento,
      fecha_nacimiento: formData.fecha_nacimiento,
      imagen_url: updatedImageUrl, // Usar la URL actualizada
    };

    // Añadir la contraseña solo si se ha introducido una nueva
    if (formData.new_password) {
      dataToUpdate.password = formData.new_password;
    }

    console.log("Datos a enviar para actualizar propietario:", dataToUpdate);

    try {
      const response = await authFetch(`/usuarios/${id}`, {
        method: 'PUT',
        body: JSON.stringify(dataToUpdate),
      });

      if (response.success) {
        setSuccessMessage('Propietario actualizado exitosamente.');
        if (showNotification) showNotification('Propietario actualizado exitosamente.', 'success');
        // Recargar los datos del propietario para asegurar que todo esté sincronizado
        loadPropietarioData();
        // Limpiar campos de contraseña después de un cambio exitoso
        setFormData(prev => ({ ...prev, new_password: '', confirm_password: '' }));
      } else {
        setError(response.message || 'Error al actualizar el propietario.');
        if (showNotification) showNotification(response.message || 'Error al actualizar el propietario.', 'error');
      }
    } catch (err) {
      console.error("Error updating propietario:", err);
      setError(err.message || 'Error de conexión al servidor al actualizar propietario.');
      if (showNotification) showNotification(err.message || 'Error de conexión al servidor al actualizar propietario.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <FontAwesomeIcon icon={faSpinner} spin size="3x" color="#00acc1" />
        <p>Cargando datos del propietario...</p>
      </div>
    );
  }

  // URL de previsualización de la imagen
  const previewImageUrl = selectedFile
    ? URL.createObjectURL(selectedFile)
    : (formData.imagen_url || `https://placehold.co/150x150/00acc1/ffffff?text=${formData.nombre?.charAt(0) || 'P'}`);

  return (
    <motion.div
      className={styles.editPropietarioContainer}
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
        <h2><FontAwesomeIcon icon={faUser} /> Editar Propietario</h2>
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
            src={previewImageUrl}
            alt="Imagen de Perfil"
            className={styles.profileImagePreview}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://placehold.co/150x150/00acc1/ffffff?text=${formData.nombre?.charAt(0) || 'P'}`;
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
            required
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
        <div className={styles.formGroup}>
          <label htmlFor="tipo_documento">Tipo de Documento:</label>
          <select
            id="tipo_documento"
            name="tipo_documento"
            value={formData.tipo_documento}
            onChange={handleChange}
            className={styles.inputField}
            required
            disabled={isSubmitting}
          >
            <option value="">Seleccione un tipo</option>
            <option value="CEDULA DE CIUDADANIA">Cédula de Ciudadanía</option>
            <option value="CEDULA DE EXTRANJERIA">Cédula de Extranjería</option>
            <option value="PASAPORTE">Pasaporte</option>
          </select>
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="numero_documento">Número de Documento:</label>
          <input
            type="text"
            id="numero_documento"
            name="numero_documento"
            value={formData.numero_documento}
            onChange={handleChange}
            className={styles.inputField}
            required
            disabled={isSubmitting}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="fecha_nacimiento">Fecha de Nacimiento:</label>
          <input
            type="date"
            id="fecha_nacimiento"
            name="fecha_nacimiento"
            value={formData.fecha_nacimiento}
            onChange={handleChange}
            className={styles.inputField}
            required
            disabled={isSubmitting}
          />
        </div>

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

export default EditarPropietario;
