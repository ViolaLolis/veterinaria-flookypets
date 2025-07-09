import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft, faSpinner, faCheckCircle,
  faUser, faExclamationTriangle, faSync
} from '@fortawesome/free-solid-svg-icons';
import { authFetch } from './api'; // Asegúrate de que la ruta sea correcta
import styles from './Style/EditarPropietarioStyles.module.css'; // Crear/Actualizar este archivo CSS

// Variantes de Framer Motion para consistencia con EditarMascota
const containerVariants = {
  hidden: { opacity: 0, x: '-100vw' },
  visible: { opacity: 1, x: 0, transition: { type: 'spring', delay: 0.2, damping: 20, stiffness: 100 } },
  exit: { x: '100vw', transition: { ease: 'easeInOut' } },
};

const buttonVariants = {
  hover: { scale: 1.05, boxShadow: '0 5px 15px rgba(0, 172, 193, 0.2)' },
  tap: { scale: 0.95 },
};

const inputVariants = {
  focus: {
    scale: 1.005,
    boxShadow: "0 0 0 3px rgba(0, 172, 193, 0.2)",
    borderColor: "#00acc1"
  }
};

const EditarPropietario = () => {
  const { id } = useParams(); // Obtener el ID del propietario de la URL
  const navigate = useNavigate();
  // Asumiendo que showNotification se pasa a través de un OutletContext o un contexto global
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

  // Eliminado: const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // error ahora es un objeto para manejar errores por campo
  const [error, setError] = useState({});
  // successMessage ahora es un objeto para consistencia con mascotas
  const [successMessage, setSuccessMessage] = useState(null);

  // Función de validación de campos, adaptada para propietario
  const validateField = useCallback((name, value) => {
    let fieldError = '';
    switch (name) {
      case 'nombre':
        if (!value.trim()) fieldError = 'El nombre es obligatorio.';
        else if (value.length < 2 || value.length > 100) fieldError = 'Mínimo 2, máximo 100 caracteres.';
        else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) fieldError = 'Solo letras y espacios.';
        break;
      case 'apellido':
        if (!value.trim()) fieldError = 'El apellido es obligatorio.';
        else if (value.length < 2 || value.length > 100) fieldError = 'Mínimo 2, máximo 100 caracteres.';
        else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) fieldError = 'Solo letras y espacios.';
        break;
      case 'email':
        if (!value.trim()) fieldError = 'El correo electrónico es obligatorio.';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) fieldError = 'Formato de correo inválido.';
        else if (value.length > 150) fieldError = 'Máximo 150 caracteres.';
        break;
      case 'telefono':
        if (!value.trim()) fieldError = 'El teléfono es obligatorio.';
        else if (!/^\d{10}$/.test(value)) fieldError = 'El teléfono debe tener 10 dígitos numéricos.'; // Ajustar según el formato de teléfono esperado
        break;
      case 'direccion':
        if (!value.trim()) fieldError = 'La dirección es obligatoria.';
        else if (value.length < 5 || value.length > 200) fieldError = 'Mínimo 5, máximo 200 caracteres.';
        break;
      case 'tipo_documento':
        if (!value) fieldError = 'Debe seleccionar un tipo de documento.';
        break;
      case 'numero_documento':
        if (!value.trim()) fieldError = 'El número de documento es obligatorio.';
        else if (!/^[a-zA-Z0-9]{5,20}$/.test(value)) fieldError = 'Mínimo 5, máximo 20 caracteres alfanuméricos.'; // Ajustar regex si es solo números, etc.
        break;
      case 'fecha_nacimiento':
        if (!value) fieldError = 'La fecha de nacimiento es obligatoria.';
        else if (new Date(value) >= new Date()) fieldError = 'La fecha no puede ser hoy o en el futuro.';
        break;
      case 'new_password':
        if (value.trim() && value.length < 8) fieldError = 'La contraseña debe tener al menos 8 caracteres.';
        // Puedes añadir más validaciones de complejidad de contraseña aquí (mayúsculas, números, símbolos)
        break;
      case 'confirm_password':
        // La validación de coincidencia se hace en handleSubmit, pero aquí puedes pre-validar
        if (formData.new_password && value !== formData.new_password) fieldError = 'Las contraseñas no coinciden.';
        break;
      default:
        break;
    }
    return fieldError;
  }, [formData.new_password]); // Dependencia para validar confirm_password

  const loadPropietarioData = useCallback(async () => {
    setLoading(true);
    setError({}); // Limpiar errores al cargar
    setSuccessMessage(null); // Limpiar mensajes
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
          fecha_nacimiento: userData.fecha_nacimiento ? new Date(userData.fecha_nacimiento).toISOString().split('T')[0] : '',
          imagen_url: userData.imagen_url || '',
          new_password: '',
          confirm_password: ''
        });
      } else {
        setError({ fetch: response.message || 'Error al cargar los datos del propietario.' });
        if (showNotification) showNotification(response.message || 'Error al cargar los datos del propietario.', 'error');
      }
    } catch (err) {
      console.error("Error fetching propietario:", err);
      setError({ fetch: 'Error de conexión al servidor al cargar el propietario.' });
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
    const newValue = (name !== 'email' && name !== 'fecha_nacimiento' && name !== 'new_password' && name !== 'confirm_password')
      ? value.toUpperCase()
      : value;
    setFormData(prev => ({ ...prev, [name]: newValue }));
    setError(prevErrors => ({ ...prevErrors, [name]: validateField(name, newValue) })); // Validar en cada cambio
    setSuccessMessage(null); // Limpiar mensajes de éxito/error al cambiar un campo
  };

  // Eliminado: handleFileChange y handleUploadImage

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage(null);
    setError({}); // Limpiar todos los errores al inicio del envío

    let currentErrors = {};
    // Validar todos los campos antes de enviar
    Object.keys(formData).forEach(key => {
      // Excluir new_password y confirm_password de la validación inicial si no se están cambiando
      if ((key === 'new_password' || key === 'confirm_password') && !formData.new_password.trim()) {
        return;
      }
      const fieldError = validateField(key, formData[key]);
      if (fieldError) {
        currentErrors[key] = fieldError;
      }
    });

    // Validación específica para contraseñas si se están cambiando
    if (formData.new_password.trim() || formData.confirm_password.trim()) {
      if (formData.new_password !== formData.confirm_password) {
        currentErrors.confirm_password = 'Las nuevas contraseñas no coinciden.';
      }
      if (formData.new_password.length < 8) {
        currentErrors.new_password = 'La contraseña debe tener al menos 8 caracteres.';
      }
    }

    setError(currentErrors);
    const hasErrors = Object.values(currentErrors).some(errorMsg => errorMsg !== '');

    if (hasErrors) {
      setSuccessMessage({ texto: 'Por favor, corrige los errores en el formulario antes de enviar.', tipo: 'error' });
      setIsSubmitting(false);
      return;
    }

    // Eliminado: Lógica de subida de imagen (handleUploadImage)

    const dataToUpdate = {
      nombre: formData.nombre,
      apellido: formData.apellido,
      email: formData.email,
      telefono: formData.telefono,
      direccion: formData.direccion,
      tipo_documento: formData.tipo_documento,
      numero_documento: formData.numero_documento,
      fecha_nacimiento: formData.fecha_nacimiento,
      imagen_url: formData.imagen_url, // Siempre usa la URL existente, no hay nueva subida
    };

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
        setSuccessMessage({ texto: 'Propietario actualizado exitosamente.', tipo: 'exito' });
        if (showNotification) showNotification('Propietario actualizado exitosamente.', 'success');

        // Recargar los datos para asegurar que la UI refleje los cambios guardados
        // y limpiar campos de contraseña
        loadPropietarioData();
      } else {
        setSuccessMessage({ texto: response.message || 'Error al actualizar el propietario. Inténtalo de nuevo.', tipo: 'error' });
        if (showNotification) showNotification(response.message || 'Error al actualizar el propietario.', 'error');
      }
    } catch (err) {
      console.error("Error updating propietario:", err);
      setSuccessMessage({ texto: err.message || 'Error de conexión al servidor al actualizar propietario.', tipo: 'error' });
      if (showNotification) showNotification(err.message || 'Error de conexión al servidor al actualizar propietario.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVolver = () => {
    navigate(-1);
  };

  // URL de previsualización de la imagen
  const previewImageUrl = useMemo(() => {
    // Si no hay archivo seleccionado (porque ya no se permite), solo usa la URL existente o un placeholder
    return formData.imagen_url || `https://placehold.co/150x150/00acc1/ffffff?text=${formData.nombre?.charAt(0) || 'P'}`;
  }, [formData.imagen_url, formData.nombre]);


  if (loading) {
    return (
      <div className={styles.veteLoadingContainer}>
        <FontAwesomeIcon icon={faSpinner} spin size="3x" color="#00acc1" />
        <p>Cargando datos del propietario...</p>
      </div>
    );
  }

  // Si hay un error de carga inicial, mostrar un mensaje y botón de reintento
  if (error.fetch) {
    return (
      <div className={styles.veteErrorContainer}>
        <FontAwesomeIcon icon={faExclamationTriangle} size="3x" color="#dc3545" />
        <p>Error al cargar: {error.fetch}</p>
        <motion.button
          onClick={loadPropietarioData}
          className={styles.veteVolverBtn} // Reutilizando el estilo del botón
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <FontAwesomeIcon icon={faSync} /> Reintentar
        </motion.button>
      </div>
    );
  }

  return (
    <motion.div
      className={styles.veteEditarContainer} // Usar el estilo consistente
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className={styles.veteHeader}>
        <motion.button
          onClick={handleVolver}
          className={styles.veteVolverBtn}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Volver
        </motion.button>
        <h2><FontAwesomeIcon icon={faUser} /> Editar Propietario</h2>
      </div>

      <form onSubmit={handleSubmit} className={styles.veteFormulario}> {/* Usar estilo consistente */}
        {/* Sección de Imagen de Perfil - Ahora solo muestra, no permite editar */}
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
          {/* Eliminado: Botón para cambiar foto y input de archivo */}
          {error?.image && <span className={styles.errorMessageField}>{error.image}</span>}
        </div>

        {/* Sección de Datos Personales */}
        <div className={styles.veteFormSection}>
          <h3>Datos Personales</h3>
          <div className={styles.veteFormRow}>
            <div className={styles.veteFormGroup}>
              <label htmlFor="nombre">Nombre:</label>
              <motion.input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                className={`${styles.uppercaseInput} ${error?.nombre ? styles.inputError : ''}`}
                variants={inputVariants}
                whileFocus="focus"
                disabled={isSubmitting}
              />
              {error?.nombre && <span className={styles.errorMessageField}>{error.nombre}</span>}
            </div>
            <div className={styles.veteFormGroup}>
              <label htmlFor="apellido">Apellido:</label>
              <motion.input
                type="text"
                id="apellido"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                required
                className={`${styles.uppercaseInput} ${error?.apellido ? styles.inputError : ''}`}
                variants={inputVariants}
                whileFocus="focus"
                disabled={isSubmitting}
              />
              {error?.apellido && <span className={styles.errorMessageField}>{error.apellido}</span>}
            </div>
          </div>

          <div className={styles.veteFormRow}>
            <div className={styles.veteFormGroup}>
              <label htmlFor="tipo_documento">Tipo de Documento:</label>
              <motion.select
                id="tipo_documento"
                name="tipo_documento"
                value={formData.tipo_documento}
                onChange={handleChange}
                required
                className={`${styles.selectInput} ${error?.tipo_documento ? styles.inputError : ''}`}
                variants={inputVariants}
                whileFocus="focus"
                disabled={isSubmitting}
              >
                <option value="">Seleccione un tipo</option>
                <option value="CEDULA DE CIUDADANIA">Cédula de Ciudadanía</option>
                <option value="CEDULA DE EXTRANJERIA">Cédula de Extranjería</option>
                <option value="PASAPORTE">Pasaporte</option>
              </motion.select>
              {error?.tipo_documento && <span className={styles.errorMessageField}>{error.tipo_documento}</span>}
            </div>
            <div className={styles.veteFormGroup}>
              <label htmlFor="numero_documento">Número de Documento:</label>
              <motion.input
                type="text"
                id="numero_documento"
                name="numero_documento"
                value={formData.numero_documento}
                onChange={handleChange}
                required
                className={error?.numero_documento ? styles.inputError : ''}
                variants={inputVariants}
                whileFocus="focus"
                disabled={isSubmitting}
              />
              {error?.numero_documento && <span className={styles.errorMessageField}>{error.numero_documento}</span>}
            </div>
          </div>

          <div className={styles.veteFormRow}>
            <div className={styles.veteFormGroup}>
              <label htmlFor="fecha_nacimiento">Fecha de Nacimiento:</label>
              <motion.input
                type="date"
                id="fecha_nacimiento"
                name="fecha_nacimiento"
                value={formData.fecha_nacimiento}
                onChange={handleChange}
                required
                className={error?.fecha_nacimiento ? styles.inputError : ''}
                variants={inputVariants}
                whileFocus="focus"
                disabled={isSubmitting}
              />
              {error?.fecha_nacimiento && <span className={styles.errorMessageField}>{error.fecha_nacimiento}</span>}
            </div>
          </div>
        </div>

        {/* Sección de Contacto */}
        <div className={styles.veteFormSection}>
          <h3>Información de Contacto</h3>
          <div className={styles.veteFormRow}>
            <div className={styles.veteFormGroup}>
              <label htmlFor="email">Email:</label>
              <motion.input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={error?.email ? styles.inputError : ''}
                variants={inputVariants}
                whileFocus="focus"
                disabled={isSubmitting}
              />
              {error?.email && <span className={styles.errorMessageField}>{error.email}</span>}
            </div>
            <div className={styles.veteFormGroup}>
              <label htmlFor="telefono">Teléfono:</label>
              <motion.input
                type="text"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                required
                className={error?.telefono ? styles.inputError : ''}
                variants={inputVariants}
                whileFocus="focus"
                disabled={isSubmitting}
              />
              {error?.telefono && <span className={styles.errorMessageField}>{error.telefono}</span>}
            </div>
          </div>
          <div className={styles.veteFormGroup}>
            <label htmlFor="direccion">Dirección:</label>
            <motion.input
              type="text"
              id="direccion"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              className={error?.direccion ? styles.inputError : ''}
              variants={inputVariants}
              whileFocus="focus"
              disabled={isSubmitting}
            />
            {error?.direccion && <span className={styles.errorMessageField}>{error.direccion}</span>}
          </div>
        </div>

        {/* Sección de Cambio de Contraseña */}
        <div className={styles.veteFormSection}>
          <h3>Cambiar Contraseña (Opcional)</h3>
          <div className={styles.veteFormGroup}>
            <label htmlFor="new_password">Nueva Contraseña:</label>
            <motion.input
              type="password"
              id="new_password"
              name="new_password"
              value={formData.new_password}
              onChange={handleChange}
              className={error?.new_password ? styles.inputError : ''}
              variants={inputVariants}
              whileFocus="focus"
              disabled={isSubmitting}
            />
            {error?.new_password && <span className={styles.errorMessageField}>{error.new_password}</span>}
          </div>
          <div className={styles.veteFormGroup}>
            <label htmlFor="confirm_password">Confirmar Nueva Contraseña:</label>
            <motion.input
              type="password"
              id="confirm_password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              className={error?.confirm_password ? styles.inputError : ''}
              variants={inputVariants}
              whileFocus="focus"
              disabled={isSubmitting}
            />
            {error?.confirm_password && <span className={styles.errorMessageField}>{error.confirm_password}</span>}
          </div>
        </div>

        {/* Mensajes de éxito/error generales del formulario */}
        {successMessage && (
          <AnimatePresence>
            <motion.div
              className={`${styles.message} ${
                successMessage.tipo === 'exito' ? styles.successMessage : styles.errorMessage
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <FontAwesomeIcon icon={successMessage.tipo === 'exito' ? faCheckCircle : faExclamationTriangle} />
              <span>{successMessage.texto}</span>
            </motion.div>
          </AnimatePresence>
        )}

        <div className={styles.veteFormActions}>
          <motion.button
            type="submit"
            className={styles.veteGuardarBtn}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <><FontAwesomeIcon icon={faSpinner} spin /> Guardando...</>
            ) : (
              'Guardar Cambios'
            )}
          </motion.button>
          <motion.button
            type="button"
            onClick={() => navigate('/veterinario/propietarios')}
            className={styles.veteCancelarBtn}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            disabled={isSubmitting}
          >
            Cancelar
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

export default EditarPropietario;
