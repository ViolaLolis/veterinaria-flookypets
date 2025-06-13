import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import veteStyles from './Style/EditarPerfilVeterinarioStyles.module.css';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faUserCog, faSave, faSpinner } from '@fortawesome/free-solid-svg-icons'; // Added faSpinner

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
    scale: 1.005, // Slightly less scale for inputs, more subtle
    boxShadow: "0 0 0 4px rgba(0, 172, 193, 0.15)", // Teal glow
    borderColor: "#00acc1" // Teal border on focus
  }
};

const EditarPerfilVeterinario = () => {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [especialidad, setEspecialidad] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Simulación de llamada a la API
    setTimeout(() => {
      const veterinarioData = {
        nombre: '',
        especialidad: '',
        email: '',
        telefono: '',
        direccion: '',
      };
      setNombre(veterinarioData.nombre);
      setEspecialidad(veterinarioData.especialidad);
      setEmail(veterinarioData.email);
      setTelefono(veterinarioData.telefono);
      setDireccion(veterinarioData.direccion);
      setLoading(false);
    }, 800);
  }, []);

  const handleVolver = () => {
    navigate(-1);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    // Simulación de envío a la API
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Increased delay for visual feedback
      console.log('Datos actualizados:', { nombre, especialidad, email, telefono, direccion });
      navigate('/veterinario/perfil');
    } catch (err) {
      setError('Error al guardar los cambios. Por favor, inténtalo de nuevo.');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={veteStyles.veteLoadingContainer}> {/* Corrected class */}
        <div className={veteStyles.veteLoadingSpinner}></div> {/* Corrected class */}
        <p>Cargando datos del perfil...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={veteStyles.veteErrorContainer}> {/* Corrected class */}
        <h3>Error</h3>
        <p>{error}</p>
        <motion.button
          onClick={() => navigate('/veterinario/perfil')}
          className={veteStyles.veteVolverBtn} /* Reused style for consistency */
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Volver al perfil
        </motion.button>
      </div>
    );
  }

  return (
    <motion.div
      className={veteStyles.veteEditarPerfilContainer} // Corrected class
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className={veteStyles.veteHeader}> {/* Corrected class */}
        <motion.button
          onClick={handleVolver}
          className={veteStyles.veteVolverBtn} // Corrected class
          variants={buttonVariants} // Using shared button variants
          whileHover="hover"
          whileTap="tap"
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Volver
        </motion.button>
        <h2><FontAwesomeIcon icon={faUserCog} /> Editar Perfil</h2>
      </div>

      <form onSubmit={handleSubmit} className={veteStyles.veteFormulario}> {/* Corrected class */}
        <motion.div className={veteStyles.veteFormGroup}> {/* Corrected class */}
          <label htmlFor="nombre">Nombre:</label>
          <motion.input
            type="text"
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            whileFocus="focus"
            variants={inputVariants}
          />
        </motion.div>

        <motion.div className={veteStyles.veteFormGroup}> {/* Corrected class */}
          <label htmlFor="especialidad">Especialidad:</label>
          <motion.input
            type="text"
            id="especialidad"
            value={especialidad}
            onChange={(e) => setEspecialidad(e.target.value)}
            whileFocus="focus"
            variants={inputVariants}
          />
        </motion.div>

        <motion.div className={veteStyles.veteFormGroup}> {/* Corrected class */}
          <label htmlFor="email">Email:</label>
          <motion.input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            whileFocus="focus"
            variants={inputVariants}
          />
        </motion.div>

        <motion.div className={veteStyles.veteFormGroup}> {/* Corrected class */}
          <label htmlFor="telefono">Teléfono:</label>
          <motion.input
            type="tel"
            id="telefono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            whileFocus="focus"
            variants={inputVariants}
          />
        </motion.div>

        <motion.div className={veteStyles.veteFormGroup}> {/* Corrected class */}
          <label htmlFor="direccion">Dirección:</label>
          <motion.input
            type="text"
            id="direccion"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            whileFocus="focus"
            variants={inputVariants}
          />
        </motion.div>

        <motion.button
          type="submit"
          className={veteStyles.veteGuardarBtn} // Corrected class
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <><FontAwesomeIcon icon={faSpinner} spin /> Guardando...</> // Added spinner
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