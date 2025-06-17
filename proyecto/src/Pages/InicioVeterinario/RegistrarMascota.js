import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Style/RegistrarMascotaStyles.module.css'; // Importa el CSS Module
import { motion } from 'framer-motion'; // Para animaciones
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPaw, faSpinner, faCheckCircle, faExclamationTriangle, faWeightHanging, faSearch, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';

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

const RegistrarMascota = () => {
  const navigate = useNavigate();

  // Estados para los campos de la mascota
  const [nombre, setNombre] = useState('');
  const [especie, setEspecie] = useState('');
  const [raza, setRaza] = useState('');
  const [genero, setGenero] = useState('');
  const [edadAnios, setEdadAnios] = useState('');
  const [peso, setPeso] = useState('');
  const [color, setColor] = useState('');
  const [caracteristicasEspeciales, setCaracteristicasEspeciales] = useState('');
  const [propietarioId, setPropietarioId] = useState(''); // Almacena el ID del propietario seleccionado

  // Estados para la UI y validación
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  // Simulación de una lista de propietarios (en un proyecto real, se obtendría de una API)
  const [allPropietarios, setAllPropietarios] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // Estado para el input de búsqueda de propietarios

  // Simula la obtención de propietarios al montar el componente
  useEffect(() => {
    const fetchPropietarios = async () => {
      // Simula un retraso de llamada a la API
      await new Promise(resolve => setTimeout(resolve, 500));
      const dummyPropietarios = Array.from({ length: 150 }, (_, i) => ({
        id: `${i + 1}`,
        nombreCompleto: `PROPIETARIO EJEMPLO ${String(i + 1).padStart(3, '0')}`
      }));
      setAllPropietarios(dummyPropietarios);
    };
    fetchPropietarios();
  }, []);

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
        } else if (value.length > 50) {
          error = 'Máximo 50 caracteres';
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
          error = 'Solo letras y espacios';
        }
        break;

      case 'especie':
        if (!value.trim()) {
          error = 'La especie es obligatoria';
        } else if (value.length < 3 || value.length > 30) {
          error = 'Mínimo 3, máximo 30 caracteres';
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
          error = 'Solo letras y espacios';
        }
        break;

      case 'raza':
        if (value.trim() && (value.length < 2 || value.length > 50)) {
          error = 'Mínimo 2, máximo 50 caracteres';
        } else if (value.trim() && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s-]+$/.test(value)) {
          error = 'Solo letras, espacios y guiones';
        }
        if ((allFormData.especie.toUpperCase() === 'PERRO' || allFormData.especie.toUpperCase() === 'GATO') && !value.trim()) {
          error = `La raza es obligatoria para ${allFormData.especie.toLowerCase()}s`;
        }
        break;

      case 'genero':
        if (!value) {
          error = 'El género es obligatorio';
        }
        break;

      case 'edadAnios':
        if (!value.trim()) {
          error = 'La edad es obligatoria';
        } else {
          const edad = parseInt(value, 10);
          if (isNaN(edad)) {
            error = 'La edad debe ser un número';
          } else if (edad < 0 || edad > 30) {
            error = 'La edad debe estar entre 0 y 30 años';
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
          } else if (parsedPeso > 200) {
            error = 'Peso máximo 200 kg';
          }
        }
        break;

      case 'color':
        if (!value.trim()) {
          error = 'El color es obligatorio';
        } else if (value.length < 3 || value.length > 50) {
          error = 'Mínimo 3, máximo 50 caracteres';
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s,]+$/.test(value)) {
          error = 'Solo letras, espacios y comas';
        }
        break;

      case 'caracteristicasEspeciales':
        if (value.length > 500) {
          error = 'Máximo 500 caracteres';
        }
        break;

      case 'propietarioId':
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
        nombre, especie, raza, genero, edadAnios, peso, color, caracteristicasEspeciales, propietarioId,
        [name]: newValue // Usa newValue para el campo actual que se está actualizando
      };
      const error = validateField(name, newValue, currentFormData);
      return { ...prevErrors, [name]: error };
    });

    switch (name) {
      case 'nombre': setNombre(newValue); break;
      case 'especie': setEspecie(newValue); break;
      case 'raza': setRaza(newValue); break;
      case 'genero': setGenero(newValue); break;
      case 'edadAnios': setEdadAnios(newValue); break;
      case 'peso': setPeso(newValue); break;
      case 'color': setColor(newValue); break;
      case 'caracteristicasEspeciales': setCaracteristicasEspeciales(newValue); break;
      // propietarioId ahora es manejado directamente por la lógica de selección de búsqueda
      default: break;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMensaje({ texto: '', tipo: '' });

    const allFormData = {
      nombre, especie, raza, genero, edadAnios, peso, color, caracteristicasEspeciales, propietarioId
    };

    let newErrors = {};
    Object.keys(allFormData).forEach(key => {
      const error = validateField(key, allFormData[key], allFormData);
      if (error) {
        newErrors[key] = error;
      }
    });

    setErrors(newErrors);

    // Verifica si hay algún error antes de intentar enviar
    const hasErrors = Object.values(newErrors).some(error => error !== '');

    if (hasErrors) {
      setMensaje({ texto: 'Por favor, corrige los errores en el formulario antes de enviar.', tipo: 'error' });
      setIsSubmitting(false);
      return;
    }

    const mascotaData = {
      nombre: nombre.toUpperCase(),
      especie: especie.toUpperCase(),
      raza: raza.toUpperCase(),
      genero: genero,
      edadAnios: parseInt(edadAnios, 10),
      peso: parseFloat(peso),
      color: color.toUpperCase(),
      caracteristicasEspeciales: caracteristicasEspeciales.trim(),
      propietarioId: propietarioId
    };

    console.log('Datos de la mascota a registrar:', mascotaData);

    try {
      // Simula llamada a la API
      await new Promise(resolve => setTimeout(resolve, 1500));
      // En una aplicación real, harías una solicitud API real aquí:
      // const response = await api.post('/mascotas', mascotaData);
      // console.log('Mascota registrada:', response.data);

      setMensaje({ texto: '¡Mascota registrada exitosamente!', tipo: 'exito' });
      // Limpiar campos del formulario
      setNombre('');
      setEspecie('');
      setRaza('');
      setGenero('');
      setEdadAnios('');
      setPeso('');
      setColor('');
      setCaracteristicasEspeciales(''); // <<-- CORRECCIÓN APLICADA AQUÍ
      setPropietarioId('');
      setSearchTerm(''); // Limpia el término de búsqueda después de un envío exitoso
      setErrors({}); // Limpia los errores

      // Navega después de un breve retraso para permitir que se vea el mensaje
      setTimeout(() => {
        navigate('/veterinario/mascotas');
      }, 1500);

    } catch (error) {
      console.error('Error al registrar mascota:', error);
      setMensaje({ texto: 'Error al registrar la mascota. Inténtalo de nuevo.', tipo: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

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
              <label htmlFor="genero">Género:</label>
              <motion.select
                id="genero"
                name="genero"
                value={genero}
                onChange={handleChange}
                required
                className={`${styles.selectInput} ${errors.genero ? styles.inputError : ''}`}
                variants={inputVariants}
                whileFocus="focus"
              >
                <option value="">Seleccione</option>
                <option value="MACHO">Macho</option>
                <option value="HEMBRA">Hembra</option>
              </motion.select>
              {errors.genero && <span className={styles.errorMessageField}>{errors.genero}</span>}
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="edadAnios">Edad (años):</label>
              <div className={styles.inputWithIcon}>
                <motion.input
                  type="number"
                  id="edadAnios"
                  name="edadAnios"
                  value={edadAnios}
                  onChange={handleChange}
                  required
                  min="0"
                  max="30"
                  className={errors.edadAnios ? styles.inputError : ''}
                  variants={inputVariants}
                  whileFocus="focus"
                />
                <FontAwesomeIcon icon={faCalendarAlt} className={styles.inputIcon} />
              </div>
              {errors.edadAnios && <span className={styles.errorMessageField}>{errors.edadAnios}</span>}
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
        </div>

        <div className={styles.formSection}>
          <h3>Detalles y Propietario</h3>
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
                      className={`${styles.searchResultItem} ${prop.id === propietarioId ? styles.selected : ''}`}
                      onClick={() => {
                        setPropietarioId(prop.id);
                        setSearchTerm(''); // Limpia el término de búsqueda después de la selección
                        setErrors(prev => ({ ...prev, propietarioId: '' })); // Limpia el error si se selecciona
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
            
            {propietarioId && (
              <div className={styles.selectedOwner}>
                <span className={styles.selectedOwnerText}>
                  Propietario seleccionado: {allPropietarios.find(p => p.id === propietarioId)?.nombreCompleto}
                </span>
                <span 
                  className={styles.clearSelection}
                  onClick={() => {
                    setPropietarioId(''); // Limpia el propietario seleccionado
                    setSearchTerm(''); // Limpia el término de búsqueda
                  }}
                >
                  Cambiar
                </span>
              </div>
            )}
             {/* Mensaje de validación para propietarioId debajo del área de búsqueda/selección */}
            {errors.propietarioId && <span className={styles.errorMessageField}>{errors.propietarioId}</span>}
          </div>
        </div>

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

export default RegistrarMascota;