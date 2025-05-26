import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './Style/DetalleCitaVeterinarioStyles.module.css';
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
  faCheckCircle,
  faTimesCircle,
  faEdit,
  faFileMedical
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
    boxShadow: '0 10px 20px rgba(0, 172, 193, 0.2)'
  }
};

const DetalleCitaVeterinario = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [cita, setCita] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [estado, setEstado] = useState('pendiente'); // 'pendiente', 'completada', 'cancelada'

  useEffect(() => {
    setTimeout(() => {
      try {
        const citaData = {
          id: parseInt(id),
          fecha: '2025-04-25T11:00:00Z',
          propietario: 'Elena Gómez',
          telefono: '3101234567',
          mascota: 'Pelusa (Gato Persa)',
          servicio: 'Revisión dental y limpieza',
          notas: 'Se requiere limpieza dental completa y revisión de encías. El propietario reporta mal aliento en la mascota.',
          direccion: 'Calle 123 #45-67, Bogotá',
          veterinario: 'Dr. Carlos Rodríguez',
          duracion: '45 minutos estimados'
        };
        if (citaData.id === parseInt(id)) {
          setCita(citaData);
          setLoading(false);
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

  const cambiarEstado = (nuevoEstado) => {
    setEstado(nuevoEstado);
    // Aquí iría la lógica para actualizar el estado en la API
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Cargando detalles de la cita...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h3>Error</h3>
        <p>{error}</p>
        <motion.button
          onClick={handleVolver}
          className={styles.volverBtn}
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
      <div className={styles.errorContainer}>
        <p>Cita no encontrada.</p>
        <motion.button
          onClick={handleVolver}
          className={styles.volverBtn}
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
      className={styles.detalleContainer}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className={styles.header}>
        <motion.button 
          onClick={handleVolver} 
          className={styles.volverBtn}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Volver
        </motion.button>
        <h2><FontAwesomeIcon icon={faCalendarCheck} /> Detalle de la Cita</h2>
      </div>
      
      <div className={styles.detalleInfo}>
        <div className={styles.infoGrid}>
          <motion.div 
            className={styles.infoCard}
            variants={cardVariants}
            whileHover="hover"
          >
            <h3><FontAwesomeIcon icon={faClock} /> Fecha y Hora</h3>
            <p>{new Date(cita.fecha).toLocaleString()}</p>
            {cita.duracion && <p><strong>Duración:</strong> {cita.duracion}</p>}
          </motion.div>
          
          <motion.div 
            className={styles.infoCard}
            variants={cardVariants}
            whileHover="hover"
          >
            <h3><FontAwesomeIcon icon={faUser} /> Propietario</h3>
            <p>{cita.propietario}</p>
            {cita.telefono && <p><strong>Teléfono:</strong> {cita.telefono}</p>}
          </motion.div>
          
          <motion.div 
            className={styles.infoCard}
            variants={cardVariants}
            whileHover="hover"
          >
            <h3><FontAwesomeIcon icon={faPaw} /> Mascota</h3>
            <p>{cita.mascota}</p>
          </motion.div>
          
          <motion.div 
            className={styles.infoCard}
            variants={cardVariants}
            whileHover="hover"
          >
            <h3><FontAwesomeIcon icon={faStethoscope} /> Servicio</h3>
            <p>{cita.servicio}</p>
            {cita.veterinario && <p><strong>Veterinario:</strong> {cita.veterinario}</p>}
          </motion.div>
        </div>
        
        <motion.div 
          className={styles.notasCard}
          variants={cardVariants}
          whileHover="hover"
        >
          <h3><FontAwesomeIcon icon={faNotesMedical} /> Notas</h3>
          <p>{cita.notas}</p>
        </motion.div>
        
        <motion.div 
          className={styles.accionesSection}
          variants={cardVariants}
        >
          <h3><FontAwesomeIcon icon={faCalendarCheck} /> Acciones</h3>
          <div className={styles.accionesGrid}>
            <motion.button
              className={`${styles.accionBtn} ${estado === 'completada' ? styles.completada : ''}`}
              onClick={() => cambiarEstado('completada')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FontAwesomeIcon icon={faCheckCircle} /> Marcar como Completada
            </motion.button>
            
            <motion.button
              className={`${styles.accionBtn} ${estado === 'cancelada' ? styles.cancelada : ''}`}
              onClick={() => cambiarEstado('cancelada')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FontAwesomeIcon icon={faTimesCircle} /> Cancelar Cita
            </motion.button>
            
            <motion.button
              className={styles.accionBtn}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FontAwesomeIcon icon={faEdit} /> Editar Cita
            </motion.button>
            
            <motion.button
              className={styles.accionBtn}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FontAwesomeIcon icon={faFileMedical} /> Crear Historial
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DetalleCitaVeterinario;