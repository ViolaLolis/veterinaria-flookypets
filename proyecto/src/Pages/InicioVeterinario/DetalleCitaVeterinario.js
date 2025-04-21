import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './Style/DetalleCitaVeterinarioStyles.module.css';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faCalendarCheck } from '@fortawesome/free-solid-svg-icons';

const containerVariants = {
  hidden: { opacity: 0, x: '-100vw' },
  visible: { opacity: 1, x: 0, transition: { type: 'spring', delay: 0.2, damping: 20, stiffness: 100 } },
  exit: { x: '100vw', transition: { ease: 'easeInOut' } },
};

const DetalleCitaVeterinario = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [cita, setCita] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setTimeout(() => {
      const citaData = {
        id: parseInt(id),
        fecha: '2025-04-25T11:00:00Z',
        propietario: 'Elena Gómez',
        mascota: 'Pelusa',
        servicio: 'Revisión dental',
        notas: 'Se requiere limpieza dental y revisión de encías.',
      };
      if (citaData.id === parseInt(id)) {
        setCita(citaData);
        setLoading(false);
      } else {
        setError('Cita no encontrada');
        setLoading(false);
      }
    }, 500);
  }, [id]);

  const handleVolver = () => {
    navigate(-1);
  };

  if (loading) {
    return <div>Cargando detalles de la cita...</div>;
  }

  if (error) {
    return <div>Error al cargar los detalles de la cita: {error}</div>;
  }

  if (!cita) {
    return <div>Cita no encontrada.</div>;
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
        <button onClick={handleVolver} className={styles.volverBtn}>
          <FontAwesomeIcon icon={faArrowLeft} /> Volver
        </button>
        <h2><FontAwesomeIcon icon={faCalendarCheck} /> Detalle de la Cita</h2>
      </div>
      <div className={styles.detalleInfo}>
        <p><strong>Fecha y Hora:</strong> {new Date(cita.fecha).toLocaleString()}</p>
        <p><strong>Propietario:</strong> {cita.propietario}</p>
        <p><strong>Mascota:</strong> {cita.mascota}</p>
        <p><strong>Servicio:</strong> {cita.servicio}</p>
        <p><strong>Notas:</strong> {cita.notas}</p>
        {/* Posibles acciones adicionales como "Marcar como completada" */}
      </div>
    </motion.div>
  );
};

export default DetalleCitaVeterinario;