import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import styles from './Style/RegistrarPropietarioStyles.module.css'; // Asegúrate de que este CSS exista
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft, faUserPlus, faSpinner, faCheckCircle, faExclamationTriangle,
  faEye, faEyeSlash, faCamera
} from '@fortawesome/free-solid-svg-icons';
import { authFetch } from './api'; // Asegúrate de que la ruta sea correcta a tu archivo api.js

// --- Framer Motion Variants ---
const containerVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      delay: 0.1,
      damping: 20,
      stiffness: 100
    }
  },
  exit: {
    opacity: 0,
    y: '100vh',
    transition: {
      ease: 'easeInOut',
      duration: 0.3
    }
  },
};

const inputVariants = {
  focus: {
    scale: 1.005,
    boxShadow: "0 0 0 3px rgba(0, 172, 193, 0.2)",
    borderColor: "#00acc1"
  }
};

const buttonVariants = {
  hover: {
    scale: 1.05,
    boxShadow: "0 5px 15px rgba(0, 172, 193, 0.4)"
  },
  tap: {
    scale: 0.95,
    boxShadow: "0 2px 5px rgba(0, 172, 193, 0.2)"
  },
};

const RegistrarPropietario = () => {
  const navigate = useNavigate();
  const { showNotification } = useOutletContext(); // Para mostrar notificaciones

  // Estados para los campos del formulario
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [direccion, setDireccion] = useState('');
  const [tipoDocumento, setTipoDocumento] = useState('');
  const [numeroDocumento, setNumeroDocumento] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [verificarContrasena, setVerificarContrasena] = useState('');
  const [selectedFile, setSelectedFile] = useState(null); // Para la imagen de perfil

  // Estados para la UI y validación
  const [errors, setErrors] = useState({}); // Objeto para almacenar mensajes de error por campo
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' }); // 'exito' o 'error'
  const [showPassword, setShowPassword] = useState(false); // Para mostrar/ocultar contraseña
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Para mostrar/ocultar confirmar contraseña

  const handleVolver = () => {
    navigate(-1);
  };

  // Función de validación centralizada
  const validateField = (name, value, allFormData) => {
    let error = '';
    switch (name) {
      case 'nombre':
      case 'apellido':
        if (!value.trim()) {
          error = 'Este campo es obligatorio';
        } else if (value.length < 2) {
          error = 'Mínimo 2 caracteres';
        } else if (value.length > 50) {
          error = `Máximo 50 caracteres`;
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
          error = 'Solo letras y espacios';
        }
        break;

      case 'telefono':
        if (!value.trim()) {
          error = 'Este campo es obligatorio';
        } else if (!/^\d{7,10}$/.test(value)) {
          error = 'Número de teléfono inválido (7-10 dígitos)';
        }
        break;

      case 'direccion':
        if (!value.trim()) {
          error = 'Este campo es obligatorio';
        } else if (!/^(Calle|Cll|Cl|Carrera|Cra|Cr|Avenida|Av|Avda|Avd|Transversal|Trans|Circular|Cir|Vereda|Vda)\s?(\d+\s?[a-zA-Z]?\s?#\s?\d+\s?[a-zA-Z]?\s?-\s?\d+|[a-zA-Z0-9\s]+),?.*$/i.test(value)) {
          error = 'Formato de dirección inválido (Ej: Calle 123 #45-67, Av. Principal)';
        } else if (value.length < 5) {
          error = 'Mínimo 5 caracteres';
        } else if (value.length > 100) {
          error = 'Máximo 100 caracteres';
        }
        break;

      case 'email':
        if (!value.trim()) {
          error = 'Este campo es obligatorio';
        } else {
          const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
          if (!emailRegex.test(value)) {
            error = 'Correo electrónico no válido';
          } else if (value.length > 100) {
            error = 'Máximo 100 caracteres';
          }
        }
        break;

      case 'tipoDocumento':
        if (!value) {
          error = 'Seleccione un tipo de documento';
        }
        break;

      case 'numeroDocumento':
        if (!value.trim()) {
          error = 'Este campo es obligatorio';
        } else if (allFormData.tipoDocumento === 'CEDULA DE CIUDADANIA') {
          if (!/^\d+$/.test(value)) { // Solo números para cédula
            error = 'La cédula solo puede contener números';
          } else if (value.length < 7 || value.length > 10) { // Rango común para cédulas colombianas (7 a 10 dígitos)
            error = 'La cédula debe tener entre 7 y 10 dígitos';
          }
        } else if (allFormData.tipoDocumento === 'CEDULA DE EXTRANJERIA') {
          if (!/^[a-zA-Z0-9]+$/.test(value)) { // Alfanumérico para cédula extranjera
            error = 'La cédula de extranjería solo puede contener números y letras';
          } else if (value.length < 6 || value.length > 15) { // Rango estimado para cédula extranjera
            error = 'La cédula de extranjería debe tener entre 6 y 15 caracteres';
          }
        } else if (allFormData.tipoDocumento === 'PASAPORTE') {
          if (!/^[a-zA-Z0-9]+$/.test(value)) { // Alfanumérico para pasaporte
            error = 'El pasaporte solo puede contener números y letras';
          } else if (value.length < 6 || value.length > 20) { // Rango estimado para pasaporte
            error = 'El pasaporte debe tener entre 6 y 20 caracteres';
          }
        } else if (!/^[a-zA-Z0-9]+$/.test(value)) { // Validación genérica si no es CC, CE o Pasaporte
          error = 'Este campo solo puede contener números y letras';
        } else if (value.length < 5 || value.length > 20) { // Longitud genérica
          error = 'Debe tener entre 5 y 20 caracteres';
        }
        break;

      case 'fechaNacimiento':
        if (!value) {
          error = 'Este campo es obligatorio';
        } else {
          const fechaNac = new Date(value);
          const hoy = new Date();
          let edad = hoy.getFullYear() - fechaNac.getFullYear();
          const m = hoy.getMonth() - fechaNac.getMonth();
          if (m < 0 || (m === 0 && hoy.getDate() < fechaNac.getDate())) {
            edad--;
          }
          if (edad < 18) {
            error = 'Debes tener al menos 18 años';
          } else if (edad > 120) {
            error = 'Fecha de nacimiento no válida (edad máxima 120 años)';
          } else if (fechaNac > hoy) {
            error = 'La fecha de nacimiento no puede ser en el futuro';
          }
        }
        break;

      case 'contrasena':
        if (!value.trim()) {
          error = 'Este campo es obligatorio';
        } else if (value.length < 8) {
          error = 'Mínimo 8 caracteres';
        } else if (value.length > 30) {
          error = 'Máximo 30 caracteres';
        } else if (!/(?=.*[a-z])/.test(value)) {
          error = 'Debe contener al menos una minúscula';
        } else if (!/(?=.*[A-Z])/.test(value)) {
          error = 'Debe contener al menos una mayúscula';
        } else if (!/(?=.*\d)/.test(value)) {
          error = 'Debe contener al menos un número';
        } else if (!/(?=.*[@$!%*?&.])/.test(value)) {
          error = 'Debe contener al menos un carácter especial (@$!%*?&.)';
        }
        break;

      case 'verificarContrasena':
        if (!value.trim()) {
          error = 'Este campo es obligatorio';
        } else if (value !== allFormData.contrasena) {
          error = 'Las contraseñas no coinciden';
        }
        break;

      default:
        break;
    }
    return error;
  };

  // Handler para cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    // Convertir a mayúsculas si no es el campo de email, fecha o contraseña
    if (name !== 'email' && name !== 'fechaNacimiento' && name !== 'contrasena' && name !== 'verificarContrasena') {
      newValue = value.toUpperCase();
    }

    setErrors(prevErrors => {
      const currentFormData = {
        nombre, apellido, telefono, email, direccion, tipoDocumento, numeroDocumento, fechaNacimiento, contrasena, verificarContrasena,
        [name]: newValue
      };
      const error = validateField(name, newValue, currentFormData);
      return { ...prevErrors, [name]: error };
    });

    switch (name) {
      case 'nombre': setNombre(newValue); break;
      case 'apellido': setApellido(newValue); break;
      case 'telefono': setTelefono(newValue); break;
      case 'email': setEmail(newValue); break;
      case 'direccion': setDireccion(newValue); break;
      case 'tipoDocumento': setTipoDocumento(newValue); break;
      case 'numeroDocumento': setNumeroDocumento(newValue); break;
      case 'fechaNacimiento': setFechaNacimiento(newValue); break;
      case 'contrasena': setContrasena(newValue); break;
      case 'verificarContrasena': setVerificarContrasena(newValue); break;
      default: break;
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  // Función para subir la imagen a Cloudinary
  const uploadImage = async () => {
    if (!selectedFile) {
      return null; // No hay archivo para subir
    }

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
        setSelectedFile(null); // Limpiar el archivo seleccionado
        return response.imageUrl;
      } else {
        showNotification(response.message || 'Error al subir la imagen.', 'error');
        return null;
      }
    } catch (err) {
      console.error("Error uploading image:", err);
      showNotification(err.message || 'Error de conexión al servidor al subir imagen.', 'error');
      return null;
    }
  };


  // Handler para el envío del formulario
  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMensaje({ texto: '', tipo: '' }); // Limpia mensajes anteriores

    const allFormData = {
      nombre, apellido, telefono, email, direccion, tipoDocumento, numeroDocumento, fechaNacimiento, contrasena, verificarContrasena
    };

    // Validar todos los campos antes de enviar
    let newErrors = {};
    Object.keys(allFormData).forEach(key => {
      const error = validateField(key, allFormData[key], allFormData);
      if (error) {
        newErrors[key] = error;
      }
    });

    setErrors(newErrors);

    // Si hay errores, detener el envío y mostrar un mensaje general
    if (Object.keys(newErrors).some(key => newErrors[key])) {
      setMensaje({ texto: 'Por favor, corrige los errores en el formulario antes de enviar.', tipo: 'error' });
      setIsSubmitting(false);
      return;
    }

    let imagenUrl = null;
    if (selectedFile) {
      imagenUrl = await uploadImage(); // Subir la imagen si hay una seleccionada
      if (!imagenUrl) {
        // Si la subida de imagen falla, detener el proceso de registro
        setIsSubmitting(false);
        return;
      }
    }

    const propietarioData = {
      nombre: nombre.toUpperCase(),
      apellido: apellido.toUpperCase(),
      telefono: telefono, // Mantener como está, la validación ya lo maneja
      email: email.toLowerCase(),
      direccion: direccion.toUpperCase(),
      tipo_documento: tipoDocumento.toUpperCase(),
      numero_documento: numeroDocumento.toUpperCase(),
      fecha_nacimiento: fechaNacimiento,
      password: contrasena, // Usar 'password' para el backend
      imagen_url: imagenUrl // Añadir la URL de la imagen
    };

    console.log('Datos del propietario a registrar:', propietarioData);

    try {
      const response = await authFetch('/register', {
        method: 'POST',
        body: JSON.stringify(propietarioData),
      });

      if (response.success) {
        setMensaje({ texto: '¡Propietario registrado exitosamente!', tipo: 'exito' });
        showNotification('Propietario registrado exitosamente.', 'success');
        // Limpia el formulario después de un envío exitoso
        setNombre(''); setApellido(''); setTelefono(''); setEmail(''); setDireccion('');
        setTipoDocumento(''); setNumeroDocumento(''); setFechaNacimiento('');
        setContrasena(''); setVerificarContrasena(''); setSelectedFile(null);
        setErrors({}); // Limpiar errores visuales

        setTimeout(() => {
          navigate('/veterinario/propietarios'); // Redirigir a la lista de propietarios
        }, 1500);

      } else {
        setMensaje({ texto: response.message || 'Error al registrar el propietario.', tipo: 'error' });
        showNotification(response.message || 'Error al registrar el propietario.', 'error');
      }
    } catch (error) {
      console.error('Error al registrar propietario:', error);
      setMensaje({ texto: 'Error de conexión al servidor al registrar el propietario. Inténtalo de nuevo.', tipo: 'error' });
      showNotification('Error de conexión al servidor al registrar el propietario.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // URL de previsualización de la imagen
  const previewImageUrl = selectedFile ? URL.createObjectURL(selectedFile) : `https://placehold.co/150x150/00acc1/ffffff?text=${nombre.charAt(0) || 'P'}`;

  return (
    <motion.div
      className={styles.registrarPropietarioContainer}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className={styles.header}>
        <motion.button
          onClick={handleVolver}
          className={styles.volverBtn}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Volver
        </motion.button>
        <h2><FontAwesomeIcon icon={faUserPlus} /> Registrar Propietario</h2>
      </div>

      <form onSubmit={handleSubmit} className={styles.formulario}>
        {/* Sección de Imagen de Perfil */}
        <div className={styles.profileImageSection}>
          <img
            src={previewImageUrl}
            alt="Previsualización de Perfil"
            className={styles.profileImagePreview}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://placehold.co/150x150/00acc1/ffffff?text=${nombre.charAt(0) || 'P'}`;
            }}
          />
          <label htmlFor="file-upload" className={styles.uploadButton}>
            <FontAwesomeIcon icon={faCamera} /> Subir Foto
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

        {/* Sección de Datos Personales */}
        <div className={styles.formSection}>
          <h3>Datos Personales</h3>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="nombre">Nombre:</label>
              <motion.input
                type="text"
                id="nombre"
                name="nombre"
                value={nombre}
                onChange={handleChange}
                required
                className={`${styles.uppercaseInput} ${errors.nombre ? styles.inputError : ''}`}
                variants={inputVariants}
                whileFocus="focus"
                disabled={isSubmitting}
              />
              {errors.nombre && <span className={styles.errorMessageField}>{errors.nombre}</span>}
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="apellido">Apellido:</label>
              <motion.input
                type="text"
                id="apellido"
                name="apellido"
                value={apellido}
                onChange={handleChange}
                required
                className={`${styles.uppercaseInput} ${errors.apellido ? styles.inputError : ''}`}
                variants={inputVariants}
                whileFocus="focus"
                disabled={isSubmitting}
              />
              {errors.apellido && <span className={styles.errorMessageField}>{errors.apellido}</span>}
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="telefono">Teléfono:</label>
              <motion.input
                type="tel"
                id="telefono"
                name="telefono"
                value={telefono}
                onChange={handleChange}
                required
                className={`${styles.uppercaseInput} ${errors.telefono ? styles.inputError : ''}`}
                variants={inputVariants}
                whileFocus="focus"
                disabled={isSubmitting}
              />
              {errors.telefono && <span className={styles.errorMessageField}>{errors.telefono}</span>}
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email:</label>
              <motion.input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={handleChange}
                required
                className={errors.email ? styles.inputError : ''}
                variants={inputVariants}
                whileFocus="focus"
                disabled={isSubmitting}
              />
              {errors.email && <span className={styles.errorMessageField}>{errors.email}</span>}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="direccion">Dirección:</label>
            <motion.input
              type="text"
              id="direccion"
              name="direccion"
              value={direccion}
              onChange={handleChange}
              required
              className={`${styles.uppercaseInput} ${errors.direccion ? styles.inputError : ''}`}
              variants={inputVariants}
              whileFocus="focus"
              disabled={isSubmitting}
            />
            {errors.direccion && <span className={styles.errorMessageField}>{errors.direccion}</span>}
          </div>
        </div>

        {/* Sección de Identificación */}
        <div className={styles.formSection}>
          <h3>Identificación</h3>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="tipoDocumento">Tipo de Documento:</label>
              <motion.select
                id="tipoDocumento"
                name="tipoDocumento"
                value={tipoDocumento}
                onChange={handleChange}
                required
                className={`${styles.selectInput} ${errors.tipoDocumento ? styles.inputError : ''}`}
                variants={inputVariants}
                whileFocus="focus"
                disabled={isSubmitting}
              >
                <option value="">Seleccione un tipo</option>
                <option value="CEDULA DE CIUDADANIA">Cédula de Ciudadanía</option>
                <option value="CEDULA DE EXTRANJERIA">Cédula de Extranjería</option>
                <option value="PASAPORTE">Pasaporte</option>
              </motion.select>
              {errors.tipoDocumento && <span className={styles.errorMessageField}>{errors.tipoDocumento}</span>}
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="numeroDocumento">Número de Documento:</label>
              <motion.input
                type="text"
                id="numeroDocumento"
                name="numeroDocumento"
                value={numeroDocumento}
                onChange={handleChange}
                required
                className={`${styles.uppercaseInput} ${errors.numeroDocumento ? styles.inputError : ''}`}
                variants={inputVariants}
                whileFocus="focus"
                disabled={isSubmitting}
              />
              {errors.numeroDocumento && <span className={styles.errorMessageField}>{errors.numeroDocumento}</span>}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="fechaNacimiento">Fecha de Nacimiento:</label>
            <motion.input
              type="date"
              id="fechaNacimiento"
              name="fechaNacimiento"
              value={fechaNacimiento}
              onChange={handleChange}
              required
              className={`${styles.dateInput} ${errors.fechaNacimiento ? styles.inputError : ''}`}
              variants={inputVariants}
              whileFocus="focus"
              disabled={isSubmitting}
            />
            {errors.fechaNacimiento && <span className={styles.errorMessageField}>{errors.fechaNacimiento}</span>}
          </div>
        </div>

        {/* Sección de Credenciales */}
        <div className={styles.formSection}>
          <h3>Credenciales de Acceso</h3>
          <div className={styles.formGroup}>
            <label htmlFor="contrasena">Contraseña:</label>
            <div className={styles.passwordInputContainer}>
              <motion.input
                type={showPassword ? "text" : "password"}
                id="contrasena"
                name="contrasena"
                value={contrasena}
                onChange={handleChange}
                required
                className={errors.contrasena ? styles.inputError : ''}
                variants={inputVariants}
                whileFocus="focus"
                disabled={isSubmitting}
              />
              <FontAwesomeIcon
                icon={showPassword ? faEyeSlash : faEye}
                className={styles.passwordToggleIcon}
                onClick={() => setShowPassword(!showPassword)}
              />
            </div>
            {errors.contrasena && <span className={styles.errorMessageField}>{errors.contrasena}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="verificarContrasena">Confirmar Contraseña:</label>
            <div className={styles.passwordInputContainer}>
              <motion.input
                type={showConfirmPassword ? "text" : "password"}
                id="verificarContrasena"
                name="verificarContrasena"
                value={verificarContrasena}
                onChange={handleChange}
                required
                className={errors.verificarContrasena ? styles.inputError : ''}
                variants={inputVariants}
                whileFocus="focus"
                disabled={isSubmitting}
              />
              <FontAwesomeIcon
                icon={showConfirmPassword ? faEyeSlash : faEye}
                className={styles.passwordToggleIcon}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            </div>
            {errors.verificarContrasena && <span className={styles.errorMessageField}>{errors.verificarContrasena}</span>}
          </div>
        </div>

        {/* Mensajes de estado (éxito/error) */}
        <AnimatePresence>
          {mensaje.texto && (
            <motion.div
              className={`${styles.message} ${
                mensaje.tipo === 'exito' ? styles.successMessage : styles.errorMessage
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <FontAwesomeIcon icon={mensaje.tipo === 'exito' ? faCheckCircle : faExclamationTriangle} />
              <span>{mensaje.texto}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Botones de acción */}
        <div className={styles.formActions}>
          <motion.button
            type="submit"
            className={styles.registrarBtn}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <><FontAwesomeIcon icon={faSpinner} spin /> Registrando...</>
            ) : (
              <>
                <FontAwesomeIcon icon={faUserPlus} /> Registrar
              </>
            )}
          </motion.button>
          <motion.button
            type="button"
            onClick={() => navigate('/veterinario/propietarios')}
            className={styles.cancelarBtn}
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

export default RegistrarPropietario;
