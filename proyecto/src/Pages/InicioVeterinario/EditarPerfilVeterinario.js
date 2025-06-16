import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import veteStyles from './Style/EditarPerfilVeterinarioStyles.module.css'; // Asegúrate que esta ruta sea correcta
import { motion } from 'framer-motion';
import { FontAwesomeIcon }
from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faUserCog,
  faSave,
  faSpinner,
  faCheckCircle,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';

// --- Framer Motion Variants ---
const containerVariants = {
  hidden: { opacity: 0, x: '-100vw' },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring',
      delay: 0.2,
      damping: 20,
      stiffness: 100
    }
  },
  exit: {
    x: '100vw',
    transition: {
      ease: 'easeInOut',
      duration: 0.3
    }
  },
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

const inputVariants = {
  focus: {
    scale: 1.005,
    boxShadow: "0 0 0 4px rgba(0, 172, 193, 0.15)",
    borderColor: "#00acc1"
  }
};

// --- Componente EditarPerfilVeterinario ---
const EditarPerfilVeterinario = () => {
  const navigate = useNavigate();

  // Estados para los campos del formulario
  const [nombre, setNombre] = useState('');
  const [especialidad, setEspecialidad] = useState(''); // Campo de solo lectura
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [experiencia, setExperiencia] = useState(''); // Campo de solo lectura
  const [universidad, setUniversidad] = useState(''); // Campo de solo lectura
  const [horario, setHorario] = useState(''); // Campo de solo lectura

  // Estados de UI y control de flujo
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' }); // Para mensajes de éxito/error

  // Efecto para cargar los datos del perfil al montar el componente
  useEffect(() => {
    const loadProfile = () => {
      setLoading(true);
      setError(null);
      setMensaje({ texto: '', tipo: '' }); // Limpia mensajes anteriores al recargar

      setTimeout(() => { // Simula una llamada asíncrona a una API
        try {
          const savedProfile = localStorage.getItem('veterinarioProfile');
          let currentProfileData = {};

          if (savedProfile) {
            currentProfileData = JSON.parse(savedProfile);
          } else {
            // Datos predeterminados si no hay nada guardado, para que los campos de solo lectura tengan contenido inicial
            currentProfileData = {
              nombre: '',
              especialidad: 'MEDICINA VETERINARIA Y ZOOTECNIA', // Valor inicial de solo lectura en mayúsculas
              email: '', // Correo electrónico sin mayúsculas iniciales
              telefono: '',
              direccion: '',
              experiencia: '5 AÑOS EN CLÍNICA DE PEQUEÑOS ANIMALES', // Valor inicial de solo lectura en mayúsculas
              universidad: 'UNIVERSIDAD NACIONAL', // Valor inicial de solo lectura en mayúsculas
              horario: 'L-V: 9 AM - 6 PM, S: 9 AM - 1 PM' // Valor inicial de solo lectura en mayúsculas
            };
          }

          // Asigna los datos a los estados del formulario
          setNombre(currentProfileData.nombre || '');
          setEspecialidad(currentProfileData.especialidad || '');
          setEmail(currentProfileData.email || '');
          setTelefono(currentProfileData.telefono || '');
          setDireccion(currentProfileData.direccion || '');
          setExperiencia(currentProfileData.experiencia || '');
          setUniversidad(currentProfileData.universidad || '');
          setHorario(currentProfileData.horario || '');

          setLoading(false);
        } catch (err) {
          console.error("Error al cargar el perfil desde localStorage:", err);
          setError('Error al cargar los datos del perfil. Por favor, inténtalo de nuevo.');
          setLoading(false);
        }
      }, 800); // 800ms de simulación de carga
    };

    loadProfile();
  }, []); // El array vacío asegura que este efecto se ejecute solo una vez al montar

  // Función para volver a la página anterior
  const handleVolver = () => {
    navigate(-1);
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (event) => {
    event.preventDefault(); // Previene el comportamiento por defecto del formulario
    setIsSubmitting(true);
    setMensaje({ texto: '', tipo: '' }); // Limpia cualquier mensaje anterior

    // --- Validaciones básicas de campos editables ---
    if (!nombre.trim()) {
      setMensaje({ texto: 'El campo Nombre es obligatorio.', tipo: 'error' });
      setIsSubmitting(false);
      return;
    }
    if (!email.trim()) {
      setMensaje({ texto: 'El campo Email es obligatorio.', tipo: 'error' });
      setIsSubmitting(false);
      return;
    }
    // Simple validación de formato de email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMensaje({ texto: 'Por favor, introduce un email válido.', tipo: 'error' });
      setIsSubmitting(false);
      return;
    }

    // Objeto con todos los datos del perfil, incluyendo los campos de solo lectura
    const updatedProfile = {
      // Aseguramos que los campos editables también se guarden en mayúsculas
      nombre: nombre.toUpperCase(),
      especialidad, // Se incluye aunque sea de solo lectura para persistirlo
      email: email.toLowerCase(), // ¡Convertir a minúsculas antes de guardar!
      telefono: telefono.toUpperCase(), // Convertir a mayúsculas antes de guardar
      direccion: direccion.toUpperCase(), // Convertir a mayúsculas antes de guardar
      experiencia,  // Se incluye aunque sea de solo lectura
      universidad,  // Se incluye aunque sea de solo lectura
      horario       // Se incluye aunque sea de solo lectura
    };

    // --- Simulación de envío a una API (aquí se usa localStorage) ---
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simula un retraso de API

      localStorage.setItem('veterinarioProfile', JSON.stringify(updatedProfile)); // Guarda en localStorage

      setMensaje({ texto: '¡Perfil actualizado exitosamente!', tipo: 'exito' });
      // Navega de vuelta al perfil después de un breve momento para que el mensaje sea visible
      setTimeout(() => {
        navigate('/veterinario/perfil');
      }, 1500); // Espera 1.5 segundos antes de navegar

    } catch (err) {
      console.error('Error al guardar el perfil:', err);
      setMensaje({ texto: 'Error al guardar los cambios. Por favor, inténtalo de nuevo.', tipo: 'error' });
      setIsSubmitting(false); // Permite al usuario reintentar
    }
  };

  // --- Renderizado Condicional: Carga, Error, Formulario ---

  // Mostrar spinner de carga si `loading` es true
  if (loading) {
    return (
      <div className={veteStyles.veteLoadingContainer}>
        <div className={veteStyles.veteLoadingSpinner}></div>
        <p>Cargando datos del perfil...</p>
      </div>
    );
  }

  // Mostrar mensaje de error si `error` no es nulo
  if (error) {
    return (
      <div className={veteStyles.veteErrorContainer}>
        <h3>Error al cargar</h3>
        <p>{error}</p>
        <motion.button
          onClick={() => navigate('/veterinario/perfil')} // Botón para volver o reintentar
          className={`${veteStyles.veteActionButton} ${veteStyles.veteVolverBtn}`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Volver al perfil
        </motion.button>
      </div>
    );
  }

  // Renderizar el formulario de edición una vez que los datos estén cargados
  return (
    <motion.div
      className={veteStyles.veteEditarPerfilContainer}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className={veteStyles.veteHeader}>
        <motion.button
          onClick={handleVolver}
          className={`${veteStyles.veteActionButton} ${veteStyles.veteVolverBtn}`}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Volver
        </motion.button>
        <h2><FontAwesomeIcon icon={faUserCog} /> Editar Perfil</h2>
      </div>

      <form onSubmit={handleSubmit} className={veteStyles.veteFormulario}>
        {/* Campo Nombre (Editable y se verá en mayúsculas) */}
        <motion.div className={veteStyles.veteFormGroup}>
          <label htmlFor="nombre">Nombre:</label>
          <motion.input
            type="text"
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value.toUpperCase())} // Convertir a mayúsculas al escribir
            required
            className={veteStyles.uppercaseInput} // Clase para el CSS
            whileFocus="focus"
            variants={inputVariants}
          />
        </motion.div>

        {/* Campo Especialidad (Solo lectura y se verá en mayúsculas) */}
        <motion.div className={veteStyles.veteFormGroup}>
          <label htmlFor="especialidad">Especialidad:</label>
          <motion.input
            type="text"
            id="especialidad"
            value={especialidad}
            readOnly // ¡Importante: hace el campo de solo lectura!
            className={`${veteStyles.readOnlyInput} ${veteStyles.uppercaseInput}`} // Aplica estilo de solo lectura y mayúsculas
            whileFocus="focus"
            variants={inputVariants}
          />
        </motion.div>

        {/* Campo Email (Editable y NO se verá en mayúsculas) */}
        <motion.div className={veteStyles.veteFormGroup}>
          <label htmlFor="email">Email:</label>
          <motion.input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)} // ¡Eliminada la conversión a mayúsculas aquí!
            required
            // NOTA: Eliminada la clase veteStyles.uppercaseInput para este campo en particular
            whileFocus="focus"
            variants={inputVariants}
          />
        </motion.div>

        {/* Campo Teléfono (Editable y se verá en mayúsculas) */}
        <motion.div className={veteStyles.veteFormGroup}>
          <label htmlFor="telefono">Teléfono:</label>
          <motion.input
            type="tel"
            id="telefono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value.toUpperCase())} // Convertir a mayúsculas al escribir
            className={veteStyles.uppercaseInput} // Clase para el CSS
            whileFocus="focus"
            variants={inputVariants}
          />
        </motion.div>

        {/* Campo Dirección (Editable y se verá en mayúsculas) */}
        <motion.div className={veteStyles.veteFormGroup}>
          <label htmlFor="direccion">Dirección:</label>
          <motion.input
            type="text"
            id="direccion"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value.toUpperCase())} // Convertir a mayúsculas al escribir
            className={veteStyles.uppercaseInput} // Clase para el CSS
            whileFocus="focus"
            variants={inputVariants}
          />
        </motion.div>

        {/* Campo Experiencia (Solo lectura y se verá en mayúsculas) */}
        <motion.div className={veteStyles.veteFormGroup}>
          <label htmlFor="experiencia">Experiencia:</label>
          <motion.input
            type="text"
            id="experiencia"
            value={experiencia}
            readOnly // Campo de solo lectura
            className={`${veteStyles.readOnlyInput} ${veteStyles.uppercaseInput}`}
            whileFocus="focus"
            variants={inputVariants}
          />
        </motion.div>

        {/* Campo Universidad (Solo lectura y se verá en mayúsculas) */}
        <motion.div className={veteStyles.veteFormGroup}>
          <label htmlFor="universidad">Universidad:</label>
          <motion.input
            type="text"
            id="universidad"
            value={universidad}
            readOnly // Campo de solo lectura
            className={`${veteStyles.readOnlyInput} ${veteStyles.uppercaseInput}`}
            whileFocus="focus"
            variants={inputVariants}
          />
        </motion.div>

        {/* Campo Horario (Solo lectura y se verá en mayúsculas) */}
        <motion.div className={veteStyles.veteFormGroup}>
          <label htmlFor="horario">Horario:</label>
          <motion.input
            type="text"
            id="horario"
            value={horario}
            readOnly // Campo de solo lectura
            className={`${veteStyles.readOnlyInput} ${veteStyles.uppercaseInput}`}
            whileFocus="focus"
            variants={inputVariants}
          />
        </motion.div>

        {/* Sección para mostrar mensajes de estado (éxito/error) */}
        {mensaje.texto && (
          <motion.div
            className={`${veteStyles.veteMessage} ${
              mensaje.tipo === 'exito' ? veteStyles.veteSuccessMessage : veteStyles.veteErrorMessage
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <FontAwesomeIcon icon={mensaje.tipo === 'exito' ? faCheckCircle : faExclamationTriangle} />
            <span>{mensaje.texto}</span>
          </motion.div>
        )}

        {/* Botón de Guardar Cambios */}
        <motion.button
          type="submit"
          className={`${veteStyles.veteActionButton} ${veteStyles.veteGuardarBtn}`}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          disabled={isSubmitting} // Deshabilita el botón mientras se está enviando
        >
          {isSubmitting ? (
            <><FontAwesomeIcon icon={faSpinner} spin /> Guardando...</> // Muestra spinner al guardar
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