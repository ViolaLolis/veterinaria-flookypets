import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './Style/DetalleHistorialVeterinarioStyles.module.css';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faFileMedicalAlt } from '@fortawesome/free-solid-svg-icons';

const containerVariants = {
  hidden: { opacity: 0, x: '-100vw' },
  visible: { opacity: 1, x: 0, transition: { type: 'spring', delay: 0.2, damping: 20, stiffness: 100 } },
  exit: { x: '100vw', transition: { ease: 'easeInOut' } },
};

const DetalleHistorialVeterinario = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [historial, setHistorial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setTimeout(() => {
      const historialData = { id: parseInt(id), mascota: 'Max', fecha: '2024-04-01', diagnostico: 'Chequeo general', notas: 'El paciente se encuentra en buen estado general.' };
      if (historialData.id === parseInt(id)) {
        setHistorial(historialData);
        setLoading(false);
      } else {
        setError('Historial médico no encontrado');
        setLoading(false);
      }
    }, 500);
  }, [id]);

  const handleVolver = () => {
    navigate(-1);
  };

  if (loading) {
    return <div>Cargando detalles del historial médico...</div>;
  }

  if (error) {
    return <div>Error al cargar los detalles del historial médico: {error}</div>;
  }

  if (!historial) {
    return <div>Historial médico no encontrado.</div>;
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
        <h2><FontAwesomeIcon icon={faFileMedicalAlt} /> Detalle del Historial Médico</h2>
      </div>
      <div className={styles.detalleInfo}>
        <p><strong>Mascota:</strong> {historial.mascota}</p>
        <p><strong>Fecha:</strong> {historial.fecha}</p>
        <p><strong>Diagnóstico:</strong> {historial.diagnostico}</p>
        <p><strong>Notas:</strong> {historial.notas}</p>
        {/* Posibles acciones adicionales */}
      </div>
    </motion.div>
  );
};

export default DetalleHistorialVeterinario;