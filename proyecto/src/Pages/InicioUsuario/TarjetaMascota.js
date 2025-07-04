import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDog, faCat, faPaw, faEdit, faClipboardList, faCalendarAlt,
  faMars, faVenus, faWeight, faStethoscope
} from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import styles from './Styles/TarjetaMascota.module.css'; // ¡Importante: Aquí se importa como 'styles'!

const TarjetaMascota = ({ mascota }) => {
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

  if (!mascota) {
    return null;
  }

  return (
    <motion.div
      key={mascota.id_mascota}
      className={styles.petCard} // Usamos styles.petCard
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02, boxShadow: '0 12px 30px var(--shadow-strong)' }}
    >
      <div className={styles.petImageContainer}> {/* Usamos styles.petImageContainer */}
        <img
          src={mascota.imagen_url || `https://api.dicebear.com/7.x/initials/svg?seed=${mascota.nombre?.charAt(0) || 'P'}&backgroundType=gradientLinear&colorful=true`}
          alt={`Foto de ${mascota.nombre}`}
          className={styles.petImage} // Usamos styles.petImage
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${mascota.nombre?.charAt(0) || 'P'}&backgroundType=gradientLinear&colorful=true`;
          }}
        />
        <div className={styles.petSpeciesAndSexBadges}> {/* Usamos styles.petSpeciesAndSexBadges */}
          <span className={`${styles.badge} ${styles.speciesBadge}`}> {/* Combinación de clases */}
            <FontAwesomeIcon icon={getEspecieIcon(mascota.especie)} /> {mascota.especie}
          </span>
          {getSexoIcon(mascota.sexo) && (
            <span className={`${styles.badge} ${styles.sexBadge} ${mascota.sexo?.toLowerCase() === 'macho' ? styles.male : styles.female}`}> {/* Combinación y condicional */}
              <FontAwesomeIcon icon={getSexoIcon(mascota.sexo)} /> {mascota.sexo}
            </span>
          )}
        </div>
      </div>

      <div className={styles.petInfo}> {/* Usamos styles.petInfo */}
        <h3 className={styles.petName}>{mascota.nombre}</h3> {/* Usamos styles.petName */}
        <div className={styles.petDetailGrid}> {/* Usamos styles.petDetailGrid */}
          <p><FontAwesomeIcon icon={faPaw} /> <strong>Raza:</strong> {mascota.raza || 'N/A'}</p>
          <p><FontAwesomeIcon icon={faCalendarAlt} /> <strong>Edad:</strong> {mascota.edad ? `${mascota.edad} años` : 'N/A'}</p>
          <p><FontAwesomeIcon icon={faWeight} /> <strong>Peso:</strong> {mascota.peso ? `${mascota.peso} kg` : 'N/A'}</p>
          <p><FontAwesomeIcon icon={faStethoscope} /> <strong>Estado:</strong> {mascota.estado_salud || 'N/A'}</p>
          <p><FontAwesomeIcon icon={faCalendarAlt} /> <strong>Próxima Cita:</strong> {formatNextAppointment(mascota.proxima_cita)}</p>
        </div>
      </div>

      <div className={styles.petActions}> {/* Usamos styles.petActions */}
        <motion.button
          onClick={() => navigate(`/usuario/mascotas/editar/${mascota.id_mascota}`)}
          className={styles.petCardButton} // Usamos styles.petCardButton
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FontAwesomeIcon icon={faEdit} /> Editar
        </motion.button>
        <motion.button
          onClick={() => navigate(`/usuario/historial/${mascota.id_mascota}`)}
          className={styles.petCardButton} // Usamos styles.petCardButton
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