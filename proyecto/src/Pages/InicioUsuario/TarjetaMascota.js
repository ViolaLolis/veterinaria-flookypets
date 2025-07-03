import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDog, faCat, faPaw, faEdit, faClipboardList, faCalendarAlt,
  faMars, faVenus, faWeight, faStethoscope
} from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import styles from './Styles/TarjetaMascota.module.css';

// ====================================================================
// ¡IMPORTANTE! Este componente ahora espera recibir una 'mascota' como prop.
// Ya NO tiene 'mascotasLocales' ni el '.map()' interno.
// ====================================================================
const TarjetaMascota = ({ mascota }) => { // <-- ¡Recibe 'mascota' como prop!
  const navigate = useNavigate();

  // --- Funciones helpers ---
  const getEspecieIcon = (especie) => {
    switch (especie?.toLowerCase()) {
      case 'perro': return faDog;
      case 'gato': return faCat;
      default: return faPaw;
    }
  };

  const getSexoIcon = (sexo) => {
    switch (sexo?.toLowerCase()) {
      case 'macho': return faMars;
      case 'hembra': return faVenus;
      default: return null;
    }
  };

  const formatNextAppointment = (dateString) => {
    // Current time in Soacha, Colombia: Wednesday, July 2, 2025 at 10:35:41 PM -05
    if (!dateString) return 'No programada';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  // Si por alguna razón no se pasa una mascota a este componente, no renderizamos nada
  if (!mascota) {
    return null;
  }

  return (
    // ¡Aquí ya NO hay un .map()! Solo se renderiza la única 'mascota' que se recibió.
    <motion.div
      key={mascota.id_mascota} // La key se usa aquí si este componente se mapea en el padre
      className={styles.petCard}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      // Asegúrate de usar la variable CSS si la tienes definida en InicioDashboard.css
      whileHover={{ scale: 1.02, boxShadow: '0 12px 30px var(--shadow-strong)' }}
    >
      <div className={styles.petImageContainer}>
        <img
          src={mascota.imagen}
          alt={`Foto de ${mascota.nombre}`}
          className={styles.petImage}
          onError={(e) => {
            e.target.onerror = null;
            // Fallback a un avatar generado si la imagen falla
            e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${mascota.nombre?.charAt(0) || 'P'}&backgroundType=gradientLinear&colorful=true`;
          }}
        />
        <div className={styles.petSpeciesAndSexBadges}>
          <span className={`${styles.badge} ${styles.speciesBadge}`}>
            <FontAwesomeIcon icon={getEspecieIcon(mascota.especie)} /> {mascota.especie}
          </span>
          {getSexoIcon(mascota.sexo) && (
            <span className={`${styles.badge} ${styles.sexBadge} ${mascota.sexo.toLowerCase() === 'macho' ? styles.male : styles.female}`}>
              <FontAwesomeIcon icon={getSexoIcon(mascota.sexo)} /> {mascota.sexo}
            </span>
          )}
        </div>
      </div>

      <div className={styles.petInfo}>
        <h3 className={styles.petName}>{mascota.nombre}</h3>
        <div className={styles.petDetailGrid}>
          <p><FontAwesomeIcon icon={faPaw} /> <strong>Raza:</strong> {mascota.raza}</p>
          <p><FontAwesomeIcon icon={faCalendarAlt} /> <strong>Edad:</strong> {mascota.edad} años</p>
          <p><FontAwesomeIcon icon={faWeight} /> <strong>Peso:</strong> {mascota.peso} kg</p>
          <p><FontAwesomeIcon icon={faStethoscope} /> <strong>Estado:</strong> {mascota.estado_salud}</p>
          <p><FontAwesomeIcon icon={faCalendarAlt} /> <strong>Próxima Cita:</strong> {formatNextAppointment(mascota.proxima_cita)}</p>
        </div>
      </div>

      <div className={styles.petActions}>
        <motion.button
          onClick={() => navigate(`/usuario/mascotas/editar/${mascota.id_mascota}`)}
          className={styles.petCardButton}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FontAwesomeIcon icon={faEdit} /> Editar
        </motion.button>
        <motion.button
          onClick={() => navigate(`/usuario/historial/${mascota.id_mascota}`)}
          className={styles.petCardButton}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FontAwesomeIcon icon={faClipboardList} /> Historial
        </motion.button>
      </div>
    </motion.div>
  );
};

export default TarjetaMascota;