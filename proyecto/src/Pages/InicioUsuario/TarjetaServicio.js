import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faStethoscope, faCalendarCheck, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import styles from './Styles/TarjetaServicio.module.css'; // Asegúrate de que este CSS exista

const TarjetaServicio = ({ servicio }) => {
  const navigate = useNavigate();

  const handleAgendar = () => {
    // Navega a la página de agendar cita y pasa el ID del servicio en el estado de la ubicación
    navigate('/usuario/citas/agendar', { state: { servicioId: servicio.id_servicio } });
  };

  return (
    <motion.div
      className={styles.serviceCard}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.03, boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)' }}
    >
      <div className={styles.header}>
        <div className={styles.badge}>
          <FontAwesomeIcon icon={faInfoCircle} className={styles.badgeIcon} />
        </div>
      </div>

      <div className={styles.content}>
        <h3 className={styles.title}>{servicio.nombre}</h3>
        <p className={styles.description}>{servicio.descripcion.substring(0, 100)}...</p>

        <div className={styles.detailsGrid}>
          <div className={styles.detailItem}>
            <FontAwesomeIcon icon={faClock} className={styles.detailIcon} />
            <span>30 min</span> {/* Duración fija o puedes pasarla como prop */}
          </div>
          <div className={styles.detailItem}>
            <FontAwesomeIcon icon={faStethoscope} className={styles.detailIcon} />
            <span>Especialista</span> {/* Puedes personalizar esto */}
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <div className={styles.price}>${servicio.precio}</div>
        <Link to={`/usuario/servicios/${servicio.id_servicio}`} className={styles.viewDetailsButton}>
          Ver Detalles
        </Link>
        <button
          className={styles.bookButton}
          onClick={handleAgendar} // Llama a la función que navega con el ID del servicio
        >
          <FontAwesomeIcon icon={faCalendarCheck} /> Agendar
        </button>
      </div>
    </motion.div>
  );
};

export default TarjetaServicio;
