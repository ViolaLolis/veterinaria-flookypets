import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import veteStyles from './Style/DetalleMascotaStyles.module.css';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faPaw,
  faDog,
  faCat,
  faVenusMars,
  faCalendarAlt,
  faUser,
  faFileMedical,
  faNotesMedical,
  faSpinner, // Added for loading state
  faExclamationTriangle // Added for error state
} from '@fortawesome/free-solid-svg-icons';
import { authFetch } from './api'; // Asegúrate de que la ruta sea correcta

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

const DetalleMascotaVeterinario = () => { // Renombrado para claridad
  const navigate = useNavigate();
  const { id } = useParams(); // id_mascota
  const { showNotification } = useOutletContext();
  const [mascota, setMascota] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMascotaDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authFetch(`/mascotas/${id}`); // Endpoint para obtener detalles de mascota por ID
      if (response.success) {
        const fetchedMascota = response.data;
        // Calcular edad si la fecha de nacimiento está disponible
        if (fetchedMascota.fecha_nacimiento) {
          const birthDate = new Date(fetchedMascota.fecha_nacimiento);
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const m = today.getMonth() - birthDate.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          fetchedMascota.edad_calculada = `${age} años`;
        } else {
          fetchedMascota.edad_calculada = 'N/A';
        }

        setMascota(fetchedMascota);
      } else {
        setError(response.message || 'Mascota no encontrada.');
        showNotification(response.message || 'Mascota no encontrada.', 'error');
      }
    } catch (err) {
      console.error("Error fetching mascota details:", err);
      setError('Error de conexión al servidor al cargar los detalles de la mascota.');
      showNotification('Error de conexión al servidor al cargar los detalles de la mascota.', 'error');
    } finally {
      setLoading(false);
    }
  }, [id, showNotification]);

  useEffect(() => {
    fetchMascotaDetails();
  }, [fetchMascotaDetails]);

  const handleVolver = () => {
    navigate(-1);
  };

  const getEspecieIcon = () => {
    if (!mascota || !mascota.especie) return faPaw; // Default icon
    return mascota.especie.toLowerCase() === 'perro' ? faDog :
           mascota.especie.toLowerCase() === 'gato' ? faCat : faPaw;
  };

  if (loading) {
    return (
      <div className={veteStyles.veteLoadingContainer}>
        <FontAwesomeIcon icon={faSpinner} spin size="3x" className={veteStyles.veteLoadingSpinner} />
        <p>Cargando detalles de la mascota...</p>
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

  if (!mascota) {
    return (
      <div className={veteStyles.veteErrorContainer}>
        <p>Mascota no encontrada.</p>
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
        <h2><FontAwesomeIcon icon={faPaw} /> Detalle de la Mascota</h2>
      </div>

      <div className={veteStyles.veteDetalleInfo}>
        <div className={veteStyles.veteInfoGrid}>
          <motion.div
            className={veteStyles.veteInfoCard}
            variants={cardVariants}
            whileHover="hover"
          >
            <h3><FontAwesomeIcon icon={faPaw} /> Nombre</h3>
            <p>{mascota.nombre}</p>
          </motion.div>

          <motion.div
            className={veteStyles.veteInfoCard}
            variants={cardVariants}
            whileHover="hover"
          >
            <h3><FontAwesomeIcon icon={getEspecieIcon()} /> Especie</h3>
            <p>{mascota.especie}</p>
          </motion.div>

          <motion.div
            className={veteStyles.veteInfoCard}
            variants={cardVariants}
            whileHover="hover"
          >
            <h3><FontAwesomeIcon icon={faPaw} /> Raza</h3>
            <p>{mascota.raza || 'N/A'}</p>
          </motion.div>

          <motion.div
            className={veteStyles.veteInfoCard}
            variants={cardVariants}
            whileHover="hover"
          >
            <h3><FontAwesomeIcon icon={faVenusMars} /> Sexo</h3>
            <p>{mascota.sexo || 'N/A'}</p>
          </motion.div>

          <motion.div
            className={veteStyles.veteInfoCard}
            variants={cardVariants}
            whileHover="hover"
          >
            <h3><FontAwesomeIcon icon={faCalendarAlt} /> Fecha Nacimiento</h3>
            <p>{mascota.fecha_nacimiento ? new Date(mascota.fecha_nacimiento).toLocaleDateString('es-ES') : 'N/A'} ({mascota.edad_calculada})</p>
          </motion.div>

          <motion.div
            className={veteStyles.veteInfoCard}
            variants={cardVariants}
            whileHover="hover"
          >
            <h3><FontAwesomeIcon icon={faUser} /> Propietario</h3>
            <p>{mascota.propietario_nombre}<br />({mascota.propietario_telefono || 'N/A'})</p>
          </motion.div>

          <motion.div
            className={veteStyles.veteInfoCard}
            variants={cardVariants}
            whileHover="hover"
          >
            <h3><FontAwesomeIcon icon={faPaw} /> Peso</h3>
            <p>{mascota.peso ? `${mascota.peso} kg` : 'N/A'}</p>
          </motion.div>

          <motion.div
            className={veteStyles.veteInfoCard}
            variants={cardVariants}
            whileHover="hover"
          >
            <h3><FontAwesomeIcon icon={faNotesMedical} /> Características Especiales</h3>
            <p>{mascota.caracteristicas_especiales || 'Ninguna'}</p>
          </motion.div>

          <motion.div
            className={veteStyles.veteInfoCard}
            variants={cardVariants}
            whileHover="hover"
          >
            <h3><FontAwesomeIcon icon={faFileMedical} /> Microchip</h3>
            <p>{mascota.microchip || 'No registrado'}</p>
          </motion.div>

        </div>
      </div>
    </motion.div>
  );
};

export default DetalleMascotaVeterinario;