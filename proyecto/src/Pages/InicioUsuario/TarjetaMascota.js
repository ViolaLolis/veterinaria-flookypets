import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDog, faCat, faPaw, faEdit, faClipboardList, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import styles from './Styles/TarjetaMascota.module.css';

const TarjetaMascota = ({ mascota }) => {
  const navigate = useNavigate();

  if (!mascota) {
    return (
      <motion.div
        className={styles.petCard}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className={styles.noPetContent}>
          <FontAwesomeIcon icon={faPaw} className={styles.noPetIcon} />
          <h3>No hay mascota seleccionada</h3>
          <p>Por favor, selecciona o registra una mascota.</p>
        </div>
      </motion.div>
    );
  }

  const handleViewDetails = () => {
    navigate(`/usuario/mascotas/${mascota.id_mascota}`); // Navega a la ruta de detalle de mascota
  };

  const handleEditPet = () => {
    navigate(`/usuario/mascotas/editar/${mascota.id_mascota}`); // Navega a la ruta de edición de mascota
  };

  const handleViewMedicalHistory = () => {
    navigate(`/usuario/historial/${mascota.id_mascota}`); // Navega a la ruta del historial médico
  };

  return (
    <motion.div
      className={styles.petCard}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02, boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)' }}
    >
      <div className={styles.petImageContainer}>
        <img
          src={mascota.imagen || `https://placehold.co/300x200/cccccc/ffffff?text=${mascota.nombre.charAt(0) || 'P'}`}
          alt={mascota.nombre}
          className={styles.petImage}
          onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/300x200/cccccc/ffffff?text=${mascota.nombre.charAt(0) || 'P'}`; }}
        />
        <div className={styles.petBadge}>
          <FontAwesomeIcon icon={mascota.especie === 'perro' ? faDog : faCat} /> {mascota.especie}
        </div>
      </div>
      <div className={styles.petInfo}>
        <h3 className={styles.petName}>{mascota.nombre}</h3>
        <p className={styles.petDetail}>Raza: {mascota.raza || 'N/A'}</p>
        <p className={styles.petDetail}>Edad: {mascota.edad ? `${mascota.edad} años` : 'N/A'}</p>
      </div>
      <div className={styles.petActions}>
        <motion.button
          onClick={handleViewDetails}
          className={styles.petCardButton}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FontAwesomeIcon icon={faPaw} /> Ver Perfil
        </motion.button>
        <motion.button
          onClick={handleEditPet}
          className={styles.petCardButton}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FontAwesomeIcon icon={faEdit} /> Editar
        </motion.button>
        <motion.button
          onClick={handleViewMedicalHistory}
          className={styles.petCardButton}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FontAwesomeIcon icon={faClipboardList} /> Historial
        </motion.button>
        {/* Aquí podrías añadir un botón para agendar cita directamente para esta mascota */}
        {/* <motion.button
          onClick={() => navigate(`/usuario/citas/agendar`, { state: { mascotaId: mascota.id_mascota } })}
          className={styles.petCardButton}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FontAwesomeIcon icon={faCalendarAlt} /> Agendar Cita
        </motion.button> */}
      </div>
    </motion.div>
  );
};

export default TarjetaMascota;
