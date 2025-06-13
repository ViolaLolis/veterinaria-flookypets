import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import veteStyles from './Style/DetalleCitaVeterinarioStyles.module.css';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faCalendarCheck,
  faClock,
  faUser,
  faPaw,
  faStethoscope,
  faNotesMedical
  // Added spinner for loading state
} from '@fortawesome/free-solid-svg-icons';

const containerVariants = {
  hidden: { opacity: 0, x: '-100vw' },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring',
      delay: 0.2,
      damping: 20,
      stiffness: 100,
      when: "beforeChildren",
      staggerChildren: 0.1
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

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  hover: {
    y: -5,
    boxShadow: '0 10px 20px rgba(0, 172, 193, 0.2)' // Enhanced shadow with teal
  }
};

const DetalleCitaVeterinario = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [cita, setCita] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  

  useEffect(() => {
    // Simulate API call to fetch appointment details
    setTimeout(() => {
      try {
        const mockCitaData = { // Renamed to avoid conflict with `cita` state
          id: parseInt(id),
          fecha: '2025-06-15T11:00:00Z', // Updated date to be relevant to current time
          propietario: 'Elena Gómez',
          telefono: '3101234567',
          mascota: 'Pelusa (Gato Persa)',
          servicio: 'Revisión dental y limpieza',
          notas: 'Se requiere limpieza dental completa y revisión de encías. El propietario reporta mal aliento en la mascota. Paciente con antecedentes de gingivitis leve.',
          direccion: 'Calle 123 #45-67, Soacha, Cundinamarca', // Updated for context
          veterinario: 'Dr. Carlos Rodríguez',
          duracion: '45 minutos estimados'
        };

        if (mockCitaData.id === parseInt(id)) {
          setCita(mockCitaData);
          setLoading(false);
          // Simulate initial state from data, or keep it 'pendiente' by default
          // For now, it defaults to 'pendiente' as per useState init
        } else {
          throw new Error('Cita no encontrada');
        }
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }, 800);
  }, [id]);

  const handleVolver = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className={veteStyles.veteLoadingContainer}> {/* Corrected class */}
        <div className={veteStyles.veteLoadingSpinner}></div> {/* Corrected class */}
        <p>Cargando detalles de la cita...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={veteStyles.veteErrorContainer}> {/* Corrected class */}
        <h3>Error</h3>
        <p>{error}</p>
        <motion.button
          onClick={handleVolver}
          className={veteStyles.veteVolverBtn} /* Reusing primary button style */
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Volver
        </motion.button>
      </div>
    );
  }

  if (!cita) { // This case should ideally be covered by the error handling if ID mismatch
    return (
      <div className={veteStyles.veteErrorContainer}>
        <p>Cita no encontrada.</p>
        <motion.button
          onClick={handleVolver}
          className={veteStyles.veteVolverBtn}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Volver
        </motion.button>
      </div>
    );
  }

  return (
    <motion.div
      className={veteStyles.veteDetalleContainer} /* Corrected class */
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className={veteStyles.veteHeader}> 
        <motion.button
          onClick={handleVolver}
          className={veteStyles.veteVolverBtn} /* Corrected class */
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Volver
        </motion.button>
        <h2><FontAwesomeIcon icon={faCalendarCheck} /> Detalle de la Cita</h2>
      </div>

      <div className={veteStyles.veteDetalleInfo}> {/* Corrected class */}
        <div className={veteStyles.veteInfoGrid}> {/* Corrected class */}
          <motion.div
            className={veteStyles.veteInfoCard} /* Corrected class */
            variants={cardVariants}
            whileHover="hover"
          >
            <h3><FontAwesomeIcon icon={faClock} /> Fecha y Hora</h3>
            <p>{new Date(cita.fecha).toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'short' })}</p>
            {cita.duracion && <p><strong>Duración:</strong> {cita.duracion}</p>}
          </motion.div>

          <motion.div
            className={veteStyles.veteInfoCard} /* Corrected class */
            variants={cardVariants}
            whileHover="hover"
          >
            <h3><FontAwesomeIcon icon={faUser} /> Propietario</h3>
            <p>{cita.propietario}</p>
            {cita.telefono && <p><strong>Teléfono:</strong> {cita.telefono}</p>}
            {cita.direccion && <p><strong>Dirección:</strong> {cita.direccion}</p>} {/* Added address */}
          </motion.div>

          <motion.div
            className={veteStyles.veteInfoCard} /* Corrected class */
            variants={cardVariants}
            whileHover="hover"
          >
            <h3><FontAwesomeIcon icon={faPaw} /> Mascota</h3>
            <p>{cita.mascota}</p>
          </motion.div>

          <motion.div
            className={veteStyles.veteInfoCard} /* Corrected class */
            variants={cardVariants}
            whileHover="hover"
          >
            <h3><FontAwesomeIcon icon={faStethoscope} /> Servicio</h3>
            <p>{cita.servicio}</p>
            {cita.veterinario && <p><strong>Atiende:</strong> {cita.veterinario}</p>} {/* Changed text to Atiende */}
          </motion.div>
        </div>

        <motion.div
          className={veteStyles.veteNotasCard} /* Corrected class */
          variants={cardVariants}
          whileHover="hover"
        >
          <h3><FontAwesomeIcon icon={faNotesMedical} /> Detalles Tratamiento</h3> {/* Changed title */}
          <p>{cita.notas}</p>
        </motion.div>

        <motion.div
        >
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DetalleCitaVeterinario;