import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import veteStyles from './Style/EditarMascotaStyles.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft, faPaw, faSpinner, faCheckCircle, faExclamationTriangle, faSearch, faSync // Added faSync for retry button
} from '@fortawesome/free-solid-svg-icons';
import { authFetch } from './api'; // Asegúrate de que la ruta sea correcta

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

const EditarMascotaVeterinario = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // id_mascota
  const [formData, setFormData] = useState({
    nombre: '',
    especie: '',
    raza: '',
    sexo: '',
    fecha_nacimiento: '',
    peso: '',
    color: '',
    microchip: '',
    caracteristicas_especiales: '',
    id_propietario: ''
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState({}); // Inicializado como objeto vacío
  const [successMessage, setSuccessMessage] = useState(null);

  // Estados para la lista de propietarios
  const [allPropietarios, setAllPropietarios] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingPropietarios, setLoadingPropietarios] = useState(true);
  const [errorPropietarios, setErrorPropietarios] = useState(null);

  // Cargar datos de la mascota y propietarios al montar
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError({}); // Limpiar errores al iniciar la carga
    setLoadingPropietarios(true);
    setErrorPropietarios(null);
    setSuccessMessage(null); // Limpiar mensajes de éxito/error anteriores

    try {
      // Fetch mascota details
      const mascotaResponse = await authFetch(`/mascotas/${id}`);
      if (mascotaResponse.success) {
        const data = mascotaResponse.data;
        setFormData({
          nombre: data.nombre || '',
          especie: data.especie || '',
          raza: data.raza || '',
          sexo: data.sexo || '',
          fecha_nacimiento: data.fecha_nacimiento ? new Date(data.fecha_nacimiento).toISOString().split('T')[0] : '',
          peso: data.peso || '',
          color: data.color || '',
          microchip: data.microchip || '',
          caracteristicas_especiales: data.caracteristicas_especiales || '',
          id_propietario: data.id_propietario ? data.id_propietario.toString() : ''
        });
      } else {
        setError({ fetch: mascotaResponse.message || 'Mascota no encontrada.' });
      }

      // Fetch propietarios
      const propietariosResponse = await authFetch('/usuarios?role=usuario');
      if (propietariosResponse.success) {
        setAllPropietarios(propietariosResponse.data.map(p => ({
          id: p.id,
          nombreCompleto: `${p.nombre} ${p.apellido} (Tel: ${p.telefono || 'N/A'})`
        })));
      } else {
        setErrorPropietarios(propietariosResponse.message || 'Error al cargar la lista de propietarios.');
      }

    } catch (err) {
      console.error("Error fetching data:", err);
      setError({ fetch: 'Error de conexión al servidor al cargar los datos.' });
    } finally {
      setLoading(false);
      setLoadingPropietarios(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filtrar propietarios por búsqueda (memoizado)
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

  const validateField = (name, value) => {
    let fieldError = '';
    switch (name) {
      case 'nombre':
        if (!value.trim()) fieldError = 'El nombre es obligatorio';
        else if (value.length < 2 || value.length > 100) fieldError = 'Mínimo 2, máximo 100 caracteres';
        else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) fieldError = 'Solo letras y espacios';
        break;
      case 'especie':
        if (!value.trim()) fieldError = 'La especie es obligatoria';
        else if (value.length < 3 || value.length > 50) fieldError = 'Mínimo 3, máximo 50 caracteres';
        else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) fieldError = 'Solo letras y espacios';
        break;
      case 'raza':
        if (value.trim() && (value.length < 2 || value.length > 50)) fieldError = 'Mínimo 2, máximo 50 caracteres';
        else if (value.trim() && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s-]+$/.test(value)) fieldError = 'Solo letras, espacios y guiones';
        break;
      case 'sexo':
        // AÑADIDO CONSOLE.LOG PARA DEPURACIÓN
        console.log(`Validando sexo: value=${value}, typeof value=${typeof value}`);
        if (!value) fieldError = 'El género es obligatorio';
        console.log(`validateField para sexo devuelve: ${fieldError}, typeof return: ${typeof fieldError}`);
        break;
      case 'fecha_nacimiento':
        if (!value) fieldError = 'La fecha de nacimiento es obligatoria';
        else if (new Date(value) > new Date()) fieldError = 'La fecha no puede ser en el futuro';
        break;
      case 'peso':
        if (!value.trim()) fieldError = 'El peso es obligatorio';
        else {
          const parsedPeso = parseFloat(value);
          if (isNaN(parsedPeso) || parsedPeso <= 0 || parsedPeso > 200) fieldError = 'Peso inválido (0.01-200 kg)';
        }
        break;
      case 'color':
        if (!value.trim()) fieldError = 'El color es obligatorio';
        else if (value.length < 3 || value.length > 50) fieldError = 'Mínimo 3, máximo 50 caracteres';
        else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s,]+$/.test(value)) fieldError = 'Solo letras, espacios y comas';
        break;
      case 'microchip':
        if (value.trim() && (value.length < 5 || value.length > 50)) fieldError = 'Mínimo 5, máximo 50 caracteres para el microchip';
        break;
      case 'caracteristicas_especiales':
        if (value.length > 500) fieldError = 'Máximo 500 caracteres';
        break;
      case 'id_propietario':
        if (!value) fieldError = 'Debe seleccionar un propietario';
        break;
      default:
        break;
    }
    return fieldError;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    if (['nombre', 'especie', 'raza', 'color'].includes(name)) {
      newValue = value.toUpperCase();
    }

    setFormData(prev => ({ ...prev, [name]: newValue }));
    setError(prevErrors => ({ ...prevErrors, [name]: validateField(name, newValue) }));
    setSuccessMessage(null); // Limpiar mensajes de éxito/error al cambiar un campo
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage(null);
    setError({}); // Limpiar todos los errores al inicio del envío

    let currentErrors = {};
    Object.keys(formData).forEach(key => {
      const fieldError = validateField(key, formData[key]);
      if (fieldError) {
        currentErrors[key] = fieldError;
      }
    });
    setError(currentErrors);

    const hasErrors = Object.values(currentErrors).some(errorMsg => errorMsg !== '');

    if (hasErrors) {
      setSuccessMessage({ texto: 'Por favor, corrige los errores en el formulario antes de enviar.', tipo: 'error' });
      setIsSubmitting(false);
      return;
    }

    const dataToUpdate = {
      nombre: formData.nombre.toUpperCase(),
      especie: formData.especie.toUpperCase(),
      raza: formData.raza.toUpperCase() || null,
      sexo: formData.sexo,
      fecha_nacimiento: formData.fecha_nacimiento,
      peso: parseFloat(formData.peso),
      color: formData.color.toUpperCase(),
      microchip: formData.microchip.trim() || null,
      caracteristicas_especiales: formData.caracteristicas_especiales.trim() || null,
      id_propietario: parseInt(formData.id_propietario, 10),
    };

    try {
      const response = await authFetch(`/mascotas/${id}`, {
        method: 'PUT',
        body: JSON.stringify(dataToUpdate),
      });

      if (response.success) {
        setSuccessMessage({ texto: '¡Mascota actualizada exitosamente!', tipo: 'exito' });
        setTimeout(() => {
          navigate('/veterinario/mascotas'); // Redirigir a la lista de mascotas
        }, 1500);
      } else {
        setSuccessMessage({ texto: response.message || 'Error al actualizar la mascota. Inténtalo de nuevo.', tipo: 'error' });
      }
    } catch (err) {
      console.error('Error al actualizar mascota:', err);
      setSuccessMessage({ texto: 'Error de conexión al servidor al actualizar la mascota. Inténtalo de nuevo.', tipo: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || loadingPropietarios) {
    return (
      <div className={veteStyles.veteLoadingContainer}>
        <FontAwesomeIcon icon={faSpinner} spin size="3x" color="#00acc1" />
        <p>Cargando datos de la mascota y propietarios...</p>
      </div>
    );
  }

  if (error.fetch || errorPropietarios) { // Mostrar error de carga inicial si existe
    return (
      <div className={veteStyles.veteErrorContainer}>
        <FontAwesomeIcon icon={faExclamationTriangle} size="3x" color="#dc3545" />
        <p>Error al cargar: {error.fetch || errorPropietarios}</p>
        <motion.button
          onClick={fetchData}
          className={veteStyles.veteVolverBtn}
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
      className={veteStyles.veteEditarContainer}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className={veteStyles.veteHeader}>
        <motion.button
          onClick={handleVolver}
          className={veteStyles.veteVolverBtn}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Volver
        </motion.button>
        <h2><FontAwesomeIcon icon={faPaw} /> Editar Mascota</h2>
      </div>
      <form onSubmit={handleSubmit} className={veteStyles.veteFormulario}>
        <div className={veteStyles.veteFormSection}>
          <h3>Datos Básicos</h3>
          <div className={veteStyles.veteFormRow}>
            <div className={veteStyles.veteFormGroup}>
              <label htmlFor="nombre">Nombre:</label>
              <motion.input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                className={`${veteStyles.uppercaseInput} ${error?.nombre ? veteStyles.inputError : ''}`}
                variants={inputVariants}
                whileFocus="focus"
              />
              {error?.nombre && <span className={veteStyles.errorMessageField}>{error.nombre}</span>}
            </div>
            <div className={veteStyles.veteFormGroup}>
              <label htmlFor="especie">Especie:</label>
              <motion.input
                type="text"
                id="especie"
                name="especie"
                value={formData.especie}
                onChange={handleChange}
                required
                className={`${veteStyles.uppercaseInput} ${error?.especie ? veteStyles.inputError : ''}`}
                variants={inputVariants}
                whileFocus="focus"
                placeholder="Ej: Perro, Gato, Ave"
              />
              {error?.especie && <span className={veteStyles.errorMessageField}>{error.especie}</span>}
            </div>
          </div>

          <div className={veteStyles.veteFormRow}>
            <div className={veteStyles.veteFormGroup}>
              <label htmlFor="raza">Raza:</label>
              <motion.input
                type="text"
                id="raza"
                name="raza"
                value={formData.raza}
                onChange={handleChange}
                className={`${veteStyles.uppercaseInput} ${error?.raza ? veteStyles.inputError : ''}`}
                variants={inputVariants}
                whileFocus="focus"
                placeholder="Ej: Labrador, Siames (Opcional)"
              />
              {error?.raza && <span className={veteStyles.errorMessageField}>{error.raza}</span>}
            </div>
            <div className={veteStyles.veteFormGroup}>
              <label htmlFor="sexo">Género:</label>
              <motion.select
                id="sexo"
                name="sexo"
                value={formData.sexo}
                onChange={handleChange}
                required
                className={`${veteStyles.selectInput} ${error?.sexo ? veteStyles.inputError : ''}`}
                variants={inputVariants}
                whileFocus="focus"
              >
                <option value="">Seleccione</option>
                <option value="MACHO">Macho</option>
                <option value="HEMBRA">Hembra</option>
              </motion.select>
              {error?.sexo && <span className={veteStyles.errorMessageField}>{error.sexo}</span>}
            </div>
          </div>

          <div className={veteStyles.veteFormRow}>
            <div className={veteStyles.veteFormGroup}>
              <label htmlFor="fecha_nacimiento">Fecha de Nacimiento:</label>
              <div className={veteStyles.inputWithIcon}>
                <motion.input
                  type="date"
                  id="fecha_nacimiento"
                  name="fecha_nacimiento"
                  value={formData.fecha_nacimiento}
                  onChange={handleChange}
                  required
                  className={error?.fecha_nacimiento ? veteStyles.inputError : ''}
                  variants={inputVariants}
                  whileFocus="focus"
                />
                <FontAwesomeIcon className={veteStyles.inputIcon} />
              </div>
              {error?.fecha_nacimiento && <span className={veteStyles.errorMessageField}>{error.fecha_nacimiento}</span>}
            </div>
            <div className={veteStyles.veteFormGroup}>
              <label htmlFor="peso">Peso (kg):</label>
              <div className={veteStyles.inputWithIcon}>
                <motion.input
                  type="number"
                  id="peso"
                  name="peso"
                  value={formData.peso}
                  onChange={handleChange}
                  required
                  step="0.01"
                  min="0.01"
                  max="200"
                  className={error?.peso ? veteStyles.inputError : ''}
                  variants={inputVariants}
                  whileFocus="focus"
                />
                <FontAwesomeIcon className={veteStyles.inputIcon} />
              </div>
              {error?.peso && <span className={veteStyles.errorMessageField}>{error.peso}</span>}
            </div>
          </div>

          <div className={veteStyles.veteFormRow}>
            <div className={veteStyles.veteFormGroup}>
              <label htmlFor="color">Color / Patrón:</label>
              <motion.input
                type="text"
                id="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
                required
                className={`${veteStyles.uppercaseInput} ${error?.color ? veteStyles.inputError : ''}`}
                variants={inputVariants}
                whileFocus="focus"
                placeholder="Ej: Negro, Atigrado, Blanco y Negro"
              />
              {error?.color && <span className={veteStyles.errorMessageField}>{error.color}</span>}
            </div>
            <div className={veteStyles.veteFormGroup}>
              <label htmlFor="microchip">Número de Microchip (Opcional):</label>
              <motion.input
                type="text"
                id="microchip"
                name="microchip"
                value={formData.microchip}
                onChange={handleChange}
                className={`${veteStyles.uppercaseInput} ${error?.microchip ? veteStyles.inputError : ''}`}
                variants={inputVariants}
                whileFocus="focus"
                placeholder="Ej: 900123456789012"
              />
              {error?.microchip && <span className={veteStyles.errorMessageField}>{error.microchip}</span>}
            </div>
          </div>
        </div>

        <div className={veteStyles.veteFormSection}>
          <h3>Detalles Adicionales y Propietario</h3>
          <div className={veteStyles.veteFormGroup}>
            <label htmlFor="caracteristicas_especiales">Características Especiales (Alergias, Enfermedades, Comportamiento):</label>
            <motion.textarea
              id="caracteristicas_especiales"
              name="caracteristicas_especiales"
              value={formData.caracteristicas_especiales}
              onChange={handleChange}
              rows="3"
              className={error?.caracteristicas_especiales ? veteStyles.inputError : ''}
              variants={inputVariants}
              whileFocus="focus"
              placeholder="Ej: Alergia al polen, Epilepsia, Tímido con extraños"
            ></motion.textarea>
            {error?.caracteristicas_especiales && <span className={veteStyles.errorMessageField}>{error.caracteristicas_especiales}</span>}
          </div>

          {/* Búsqueda mejorada de propietarios */}
          <div className={veteStyles.propietarioSearchContainer}>
            <label htmlFor="searchPropietario">Buscar Propietario:</label>
            <div className={veteStyles.searchInputContainer}>
              <FontAwesomeIcon icon={faSearch} className={veteStyles.searchIcon} />
              <input
                type="text"
                id="searchPropietario"
                placeholder="Escribe para buscar un propietario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={veteStyles.searchInput}
              />
            </div>

            {searchTerm && (
              <div className={veteStyles.searchResults}>
                {filteredPropietarios.length > 0 ? (
                  filteredPropietarios.map((prop) => (
                    <div
                      key={prop.id}
                      className={`${veteStyles.searchResultItem} ${prop.id.toString() === formData.id_propietario ? veteStyles.selected : ''}`}
                      onClick={() => {
                        setFormData(prev => ({ ...prev, id_propietario: prop.id.toString() }));
                        setSearchTerm('');
                        setError(prev => ({ ...prev, id_propietario: '' }));
                      }}
                    >
                      {prop.nombreCompleto}
                    </div>
                  ))
                ) : (
                  <div className={veteStyles.searchResultItem}>No se encontraron propietarios</div>
                )}
              </div>
            )}

            {formData.id_propietario && (
              <div className={veteStyles.selectedOwner}>
                <span className={veteStyles.selectedOwnerText}>
                  Propietario seleccionado: {allPropietarios.find(p => p.id.toString() === formData.id_propietario)?.nombreCompleto}
                </span>
                <span
                  className={veteStyles.clearSelection}
                  onClick={() => {
                    setFormData(prev => ({ ...prev, id_propietario: '' }));
                    setSearchTerm('');
                  }}
                >
                  Cambiar
                </span>
              </div>
            )}
            {error?.id_propietario && <span className={veteStyles.errorMessageField}>{error.id_propietario}</span>}
          </div>
        </div>

        {successMessage && (
          <AnimatePresence>
            <motion.div
              className={`${veteStyles.message} ${
                successMessage.tipo === 'exito' ? veteStyles.successMessage : veteStyles.errorMessage
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

        <div className={veteStyles.veteFormActions}>
          <motion.button
            type="submit"
            className={veteStyles.veteGuardarBtn}
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
            onClick={() => navigate('/veterinario/mascotas')}
            className={veteStyles.veteCancelarBtn}
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

export default EditarMascotaVeterinario;
