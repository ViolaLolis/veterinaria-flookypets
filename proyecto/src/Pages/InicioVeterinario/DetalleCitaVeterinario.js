import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
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
  faNotesMedical,
  faSpinner, // Añadido para loading state
  faExclamationTriangle // Añadido para error state
} from '@fortawesome/free-solid-svg-icons';
import { authFetch } from './api'; // Importa authFetch

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
    boxShadow: '0 10px 20px rgba(0, 172, 193, 0.2)'
  }
};

const DetalleCitaVeterinario = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showNotification } = useOutletContext(); // Para mostrar notificaciones
  const [cita, setCita] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCitaDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authFetch(`/citas/${id}`); // Endpoint para obtener detalles de una cita por ID
      if (response.success) {
        setCita(response.data);
      } else {
        setError(response.message || 'Cita no encontrada.');
        showNotification(response.message || 'Cita no encontrada.', 'error');
      }
    } catch (err) {
      console.error("Error fetching cita details:", err);
      setError('Error de conexión al servidor al cargar los detalles de la cita.');
      showNotification('Error de conexión al servidor al cargar los detalles de la cita.', 'error');
    } finally {
      setLoading(false);
    }
  }, [id, showNotification]);

  useEffect(() => {
    fetchCitaDetails();
  }, [fetchCitaDetails]);

  const handleVolver = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className={veteStyles.veteLoadingContainer}>
        <FontAwesomeIcon icon={faSpinner} spin size="3x" className={veteStyles.veteLoadingSpinner} />
        <p>Cargando detalles de la cita...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={veteStyles.veteErrorContainer}>
        <h3><FontAwesomeIcon icon={faExclamationTriangle} /> Error</h3>
        <p>{error}</p>
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

  if (!cita) {
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
      className={veteStyles.veteDetalleContainer}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className={veteStyles.veteHeader}>
        <motion.button
          onClick={handleVolver}
          className={veteStyles.veteVolverBtn}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Volver
        </motion.button>
        <h2><FontAwesomeIcon icon={faCalendarCheck} /> Detalle de la Cita</h2>
      </div>

      <div className={veteStyles.veteDetalleInfo}>
        <div className={veteStyles.veteInfoGrid}>
          <motion.div
            className={veteStyles.veteInfoCard}
            variants={cardVariants}
            whileHover="hover"
          >
            <h3><FontAwesomeIcon icon={faClock} /> Fecha y Hora</h3>
            <p>{new Date(cita.fecha_cita).toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'short' })}</p>
            {cita.duracion && <p><strong>Duración:</strong> {cita.duracion}</p>}
          </motion.div>

          <motion.div
            className={veteStyles.veteInfoCard}
            variants={cardVariants}
            whileHover="hover"
          >
            <h3><FontAwesomeIcon icon={faUser} /> Propietario</h3>
            <p>{cita.propietario_nombre} {cita.propietario_apellido}</p>
            {cita.propietario_telefono && <p><strong>Teléfono:</strong> {cita.propietario_telefono}</p>}
            {cita.propietario_direccion && <p><strong>Dirección:</strong> {cita.propietario_direccion}</p>}
          </motion.div>

          <motion.div
            className={veteStyles.veteInfoCard}
            variants={cardVariants}
            whileHover="hover"
          >
            <h3><FontAwesomeIcon icon={faPaw} /> Mascota</h3>
            <p>{cita.mascota_nombre} ({cita.mascota_especie} - {cita.mascota_raza})</p>
          </motion.div>

          <motion.div
            className={veteStyles.veteInfoCard}
            variants={cardVariants}
            whileHover="hover"
          >
            <h3><FontAwesomeIcon icon={faStethoscope} /> Servicio</h3>
            <p>{cita.servicio_nombre}</p>
            {cita.veterinario_nombre && <p><strong>Atiende:</strong> {cita.veterinario_nombre} {cita.veterinario_apellido}</p>}
          </motion.div>
        </div>

        <motion.div
          className={veteStyles.veteNotasCard}
          variants={cardVariants}
          whileHover="hover"
        >
          <h3><FontAwesomeIcon icon={faNotesMedical} /> Observaciones</h3>
          <p>{cita.observaciones || 'No hay observaciones para esta cita.'}</p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DetalleCitaVeterinario;
