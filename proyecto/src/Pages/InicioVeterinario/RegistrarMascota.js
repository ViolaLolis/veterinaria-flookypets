import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Style/RegistrarMascotaStyles.module.css'; // Importa el CSS Module
import { motion, AnimatePresence } from 'framer-motion'; // Para animaciones
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPaw, faSpinner, faCheckCircle, faExclamationTriangle, faWeightHanging, faSearch, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { authFetch } from './api'; // Asegúrate de que la ruta sea correcta

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

const RegistrarMascotaVeterinario = () => { // Renombrado para claridad
  const navigate = useNavigate();

  // Estados para los campos de la mascota
  const [nombre, setNombre] = useState('');
  const [especie, setEspecie] = useState('');
  const [raza, setRaza] = useState('');
  const [sexo, setSexo] = useState(''); // Cambiado de 'genero' a 'sexo' para coincidir con BD
  const [fechaNacimiento, setFechaNacimiento] = useState(''); // Nuevo campo fecha_nacimiento
  const [peso, setPeso] = useState('');
  const [color, setColor] = useState('');
  const [microchip, setMicrochip] = useState(''); // Nuevo campo microchip
  const [caracteristicasEspeciales, setCaracteristicasEspeciales] = useState('');
  const [idPropietario, setIdPropietario] = useState(''); // Cambiado de 'propietarioId' a 'idPropietario'

  // Estados para la UI y validación
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  // Lista de propietarios
  const [allPropietarios, setAllPropietarios] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // Estado para el input de búsqueda de propietarios
  const [loadingPropietarios, setLoadingPropietarios] = useState(true);
  const [errorPropietarios, setErrorPropietarios] = useState(null);

  // Obtener propietarios al montar el componente
  const fetchPropietarios = useCallback(async () => {
    setLoadingPropietarios(true);
    setErrorPropietarios(null);
    try {
      const response = await authFetch('/usuarios?role=usuario'); // Obtener solo usuarios con rol 'usuario'
      if (response.success) {
        setAllPropietarios(response.data.map(p => ({
          id: p.id,
          nombreCompleto: `${p.nombre} ${p.apellido} (Tel: ${p.telefono || 'N/A'})`
        })));
      } else {
        setErrorPropietarios(response.message || 'Error al cargar la lista de propietarios.');
      }
    } catch (err) {
      console.error("Error fetching propietarios:", err);
      setErrorPropietarios('Error de conexión al servidor al cargar propietarios.');
    } finally {
      setLoadingPropietarios(false);
    }
  }, []);

  useEffect(() => {
    fetchPropietarios();
  }, [fetchPropietarios]);

  // Filtra propietarios basado en el término de búsqueda (memoizado para rendimiento)
  const filteredPropietarios = useMemo(() => {
    if (!searchTerm) {
      return allPropietarios;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return allPropietarios.filter(prop =>
      prop.nombreCompleto.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [allPropietarios, searchTerm]);

  const handleVolver = () => {
    navigate(-1);
  };

  const validateField = (name, value, allFormData) => {
    let error = '';
    switch (name) {
      case 'nombre':
        if (!value.trim()) {
          error = 'El nombre es obligatorio';
        } else if (value.length < 2) {
          error = 'Mínimo 2 caracteres';
        } else if (value.length > 100) { // Ajustado a 100 según BD
          error = 'Máximo 100 caracteres';
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
          error = 'Solo letras y espacios';
        }
        break;

      case 'especie':
        if (!value.trim()) {
          error = 'La especie es obligatoria';
        } else if (value.length < 3 || value.length > 50) { // Ajustado a 50 según BD
          error = 'Mínimo 3, máximo 50 caracteres';
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
          error = 'Solo letras y espacios';
        }
        break;

      case 'raza':
        if (value.trim() && (value.length < 2 || value.length > 50)) { // Ajustado a 50 según BD
          error = 'Mínimo 2, máximo 50 caracteres';
        } else if (value.trim() && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s-]+$/.test(value)) {
          error = 'Solo letras, espacios y guiones';
        }
        // No se requiere raza si la especie no es perro/gato, pero se puede validar si es obligatoria para ciertas especies
        break;

      case 'sexo': // Validar sexo
        if (!value) {
          error = 'El sexo es obligatorio';
        }
        break;

      case 'fechaNacimiento': // Validar fecha de nacimiento
        if (!value) {
          error = 'La fecha de nacimiento es obligatoria';
        } else {
          const birthDate = new Date(value);
          const today = new Date();
          if (birthDate > today) {
            error = 'La fecha de nacimiento no puede ser en el futuro';
          }
        }
        break;

      case 'peso':
        if (!value.trim()) {
          error = 'El peso es obligatorio';
        } else {
          const parsedPeso = parseFloat(value);
          if (isNaN(parsedPeso)) {
            error = 'El peso debe ser un número';
          } else if (parsedPeso <= 0) {
            error = 'El peso debe ser un número positivo';
          } else if (parsedPeso > 200) { // Límite de peso
            error = 'Peso máximo 200 kg';
          }
        }
        break;

      case 'color':
        if (!value.trim()) {
          error = 'El color es obligatorio';
        } else if (value.length < 3 || value.length > 50) { // Ajustado a 50 según BD
          error = 'Mínimo 3, máximo 50 caracteres';
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s,]+$/.test(value)) {
          error = 'Solo letras, espacios y comas';
        }
        break;

      case 'microchip':
        if (value.trim() && (value.length < 5 || value.length > 50)) { // Ejemplo de validación para microchip
          error = 'Mínimo 5, máximo 50 caracteres para el microchip';
        }
        break;

      case 'caracteristicasEspeciales':
        if (value.length > 500) {
          error = 'Máximo 500 caracteres';
        }
        break;

      case 'idPropietario':
        if (!value) {
          error = 'Debe seleccionar un propietario';
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

    if (['nombre', 'especie', 'raza', 'color'].includes(name)) {
      newValue = value.toUpperCase();
    }

    setErrors(prevErrors => {
      const currentFormData = {
        nombre, especie, raza, sexo, fechaNacimiento, peso, color, microchip, caracteristicasEspeciales, idPropietario,
        [name]: newValue
      };
      const error = validateField(name, newValue, currentFormData);
      return { ...prevErrors, [name]: error };
    });

    switch (name) {
      case 'nombre': setNombre(newValue); break;
      case 'especie': setEspecie(newValue); break;
      case 'raza': setRaza(newValue); break;
      case 'sexo': setSexo(newValue); break;
      case 'fechaNacimiento': setFechaNacimiento(newValue); break;
      case 'peso': setPeso(newValue); break;
      case 'color': setColor(newValue); break;
      case 'microchip': setMicrochip(newValue); break;
      case 'caracteristicasEspeciales': setCaracteristicasEspeciales(newValue); break;
      default: break;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMensaje({ texto: '', tipo: '' });

    const allFormData = {
      nombre, especie, raza, sexo, fechaNacimiento, peso, color, microchip, caracteristicasEspeciales, idPropietario
    };

    let newErrors = {};
    Object.keys(allFormData).forEach(key => {
      const error = validateField(key, allFormData[key], allFormData);
      if (error) {
        newErrors[key] = error;
      }
    });

    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some(error => error !== '');

    if (hasErrors) {
      setMensaje({ texto: 'Por favor, corrige los errores en el formulario antes de enviar.', tipo: 'error' });
      setIsSubmitting(false);
      return;
    }

    const mascotaData = {
      nombre: nombre.toUpperCase(),
      especie: especie.toUpperCase(),
      raza: raza.toUpperCase() || null,
      sexo: sexo,
      fecha_nacimiento: fechaNacimiento, // Usar fecha_nacimiento
      peso: parseFloat(peso),
      color: color.toUpperCase(),
      microchip: microchip.trim() || null,
      caracteristicas_especiales: caracteristicasEspeciales.trim() || null,
      id_propietario: parseInt(idPropietario, 10), // Usar id_propietario
    };

    console.log('Datos de la mascota a registrar:', mascotaData);

    try {
      const response = await authFetch('/mascotas', {
        method: 'POST',
        body: JSON.stringify(mascotaData),
      });

      if (response.success) {
        setMensaje({ texto: '¡Mascota registrada exitosamente!', tipo: 'exito' });
        // Limpiar campos del formulario
        setNombre('');
        setEspecie('');
        setRaza('');
        setSexo('');
        setFechaNacimiento('');
        setPeso('');
        setColor('');
        setMicrochip('');
        setCaracteristicasEspeciales('');
        setIdPropietario('');
        setSearchTerm('');
        setErrors({});

        setTimeout(() => {
          navigate('/veterinario/mascotas');
        }, 1500);

      } else {
        setMensaje({ texto: response.message || 'Error al registrar la mascota. Inténtalo de nuevo.', tipo: 'error' });
      }
    } catch (error) {
      console.error('Error al registrar mascota:', error);
      setMensaje({ texto: 'Error de conexión al servidor al registrar la mascota. Inténtalo de nuevo.', tipo: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingPropietarios) {
    return (
      <div className={styles.loadingContainer}>
        <FontAwesomeIcon icon={faSpinner} spin size="3x" color="#00acc1" />
        <p>Cargando propietarios...</p>
      </div>
    );
  }

  if (errorPropietarios) {
    return (
      <div className={styles.errorContainer}>
        <FontAwesomeIcon icon={faExclamationTriangle} size="3x" color="#dc3545" />
        <p>Error al cargar propietarios: {errorPropietarios}</p>
        <button onClick={fetchPropietarios} className={styles.volverBtn}>Reintentar</button>
      </div>
    );
  }

  return (
    <motion.div
      className={styles.registrarMascotaContainer}
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
        <h2><FontAwesomeIcon icon={faPaw} /> Registrar Nueva Mascota</h2>
      </div>

      <form onSubmit={handleSubmit} className={styles.formulario}>
        <div className={styles.formSection}>
          <h3>Datos Básicos</h3>
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
              />
              {errors.nombre && <span className={styles.errorMessageField}>{errors.nombre}</span>}
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="especie">Especie:</label>
              <motion.input
                type="text"
                id="especie"
                name="especie"
                value={especie}
                onChange={handleChange}
                required
                className={`${styles.uppercaseInput} ${errors.especie ? styles.inputError : ''}`}
                variants={inputVariants}
                whileFocus="focus"
                placeholder="Ej: Perro, Gato, Ave"
              />
              {errors.especie && <span className={styles.errorMessageField}>{errors.especie}</span>}
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="raza">Raza:</label>
              <motion.input
                type="text"
                id="raza"
                name="raza"
                value={raza}
                onChange={handleChange}
                className={`${styles.uppercaseInput} ${errors.raza ? styles.inputError : ''}`}
                variants={inputVariants}
                whileFocus="focus"
                placeholder="Ej: Labrador, Siames (Opcional)"
              />
              {errors.raza && <span className={styles.errorMessageField}>{errors.raza}</span>}
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="sexo">Género:</label> {/* Cambiado a Sexo */}
              <motion.select
                id="sexo"
                name="sexo"
                value={sexo}
                onChange={handleChange}
                required
                className={`${styles.selectInput} ${errors.sexo ? styles.inputError : ''}`}
                variants={inputVariants}
                whileFocus="focus"
              >
                <option value="">Seleccione</option>
                <option value="MACHO">Macho</option>
                <option value="HEMBRA">Hembra</option>
              </motion.select>
              {errors.sexo && <span className={styles.errorMessageField}>{errors.sexo}</span>}
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="fechaNacimiento">Fecha de Nacimiento:</label> {/* Nuevo campo */}
              <div className={styles.inputWithIcon}>
                <motion.input
                  type="date"
                  id="fechaNacimiento"
                  name="fechaNacimiento"
                  value={fechaNacimiento}
                  onChange={handleChange}
                  required
                  className={errors.fechaNacimiento ? styles.inputError : ''}
                  variants={inputVariants}
                  whileFocus="focus"
                />
                <FontAwesomeIcon icon={faCalendarAlt} className={styles.inputIcon} />
              </div>
              {errors.fechaNacimiento && <span className={styles.errorMessageField}>{errors.fechaNacimiento}</span>}
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="peso">Peso (kg):</label>
              <div className={styles.inputWithIcon}>
                <motion.input
                  type="number"
                  id="peso"
                  name="peso"
                  value={peso}
                  onChange={handleChange}
                  required
                  step="0.01"
                  min="0.01"
                  max="200"
                  className={errors.peso ? styles.inputError : ''}
                  variants={inputVariants}
                  whileFocus="focus"
                />
                <FontAwesomeIcon icon={faWeightHanging} className={styles.inputIcon} />
              </div>
              {errors.peso && <span className={styles.errorMessageField}>{errors.peso}</span>}
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="color">Color / Patrón:</label>
              <motion.input
                type="text"
                id="color"
                name="color"
                value={color}
                onChange={handleChange}
                required
                className={`${styles.uppercaseInput} ${errors.color ? styles.inputError : ''}`}
                variants={inputVariants}
                whileFocus="focus"
                placeholder="Ej: Negro, Atigrado, Blanco y Negro"
              />
              {errors.color && <span className={styles.errorMessageField}>{errors.color}</span>}
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="microchip">Número de Microchip (Opcional):</label> {/* Nuevo campo */}
              <motion.input
                type="text"
                id="microchip"
                name="microchip"
                value={microchip}
                onChange={handleChange}
                className={`${styles.uppercaseInput} ${errors.microchip ? styles.inputError : ''}`}
                variants={inputVariants}
                whileFocus="focus"
                placeholder="Ej: 900123456789012"
              />
              {errors.microchip && <span className={styles.errorMessageField}>{errors.microchip}</span>}
            </div>
          </div>
        </div>

        <div className={styles.formSection}>
          <h3>Detalles Adicionales y Propietario</h3>
          <div className={styles.formGroup}>
            <label htmlFor="caracteristicasEspeciales">Características Especiales (Alergias, Enfermedades, Comportamiento):</label>
            <motion.textarea
              id="caracteristicasEspeciales"
              name="caracteristicasEspeciales"
              value={caracteristicasEspeciales}
              onChange={handleChange}
              rows="3"
              className={errors.caracteristicasEspeciales ? styles.inputError : ''}
              variants={inputVariants}
              whileFocus="focus"
              placeholder="Ej: Alergia al polen, Epilepsia, Tímido con extraños"
            ></motion.textarea>
            {errors.caracteristicasEspeciales && <span className={styles.errorMessageField}>{errors.caracteristicasEspeciales}</span>}
          </div>

          {/* Búsqueda mejorada de propietarios */}
          <div className={styles.propietarioSearchContainer}>
            <label htmlFor="searchPropietario">Buscar Propietario:</label>
            <div className={styles.searchInputContainer}>
              <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
              <input
                type="text"
                id="searchPropietario"
                placeholder="Escribe para buscar un propietario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            {searchTerm && (
              <div className={styles.searchResults}>
                {filteredPropietarios.length > 0 ? (
                  filteredPropietarios.map((prop) => (
                    <div
                      key={prop.id}
                      className={`${styles.searchResultItem} ${prop.id === idPropietario ? styles.selected : ''}`}
                      onClick={() => {
                        setIdPropietario(prop.id.toString()); // Asegura que sea string para el estado
                        setSearchTerm('');
                        setErrors(prev => ({ ...prev, idPropietario: '' }));
                      }}
                    >
                      {prop.nombreCompleto}
                    </div>
                  ))
                ) : (
                  <div className={styles.searchResultItem}>No se encontraron propietarios</div>
                )}
              </div>
            )}

            {idPropietario && (
              <div className={styles.selectedOwner}>
                <span className={styles.selectedOwnerText}>
                  Propietario seleccionado: {allPropietarios.find(p => p.id.toString() === idPropietario)?.nombreCompleto}
                </span>
                <span
                  className={styles.clearSelection}
                  onClick={() => {
                    setIdPropietario('');
                    setSearchTerm('');
                  }}
                >
                  Cambiar
                </span>
              </div>
            )}
            {errors.idPropietario && <span className={styles.errorMessageField}>{errors.idPropietario}</span>}
          </div>
        </div>

        {mensaje.texto && (
          <AnimatePresence>
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
          </AnimatePresence>
        )}

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
                <FontAwesomeIcon icon={faPaw} /> Registrar Mascota
              </>
            )}
          </motion.button>
          <motion.button
            type="button"
            onClick={() => navigate('/veterinario/mascotas')}
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

export default RegistrarMascotaVeterinario;
