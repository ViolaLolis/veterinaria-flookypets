import React from 'react';
import styles from './Styles/TarjetaCita.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faInfoCircle, faTimesCircle, faClock, faClipboardList } from '@fortawesome/free-solid-svg-icons'; // Añadidos faClock y faClipboardList
import { motion } from 'framer-motion'; // Asegúrate de que framer-motion está instalado

const TarjetaCita = ({ cita, onVerDetalles, onCancelar }) => {

  // Función para formatear la fecha y hora
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'Fecha/Hora no disponible';
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true // Para formato AM/PM
      });
    } catch (e) {
      console.error("Error al formatear fecha/hora de cita:", e);
      return 'Fecha/Hora inválida';
    }
  };

  return (
    <motion.div
      className={styles.tarjeta}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      whileHover={{ scale: 1.02, boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)' }} // Efecto al pasar el ratón
    >
      <div className={styles.header}>
        <FontAwesomeIcon icon={faCalendarAlt} className={styles.headerIcon} />
        <p className={styles.fecha}>{formatDateTime(cita.fecha)}</p>
      </div>

      <div className={styles.body}>
        <div className={styles.detailItem}>
          <FontAwesomeIcon icon={faClipboardList} className={styles.detailIcon} />
          <span className={styles.detailLabel}>Servicio:</span>
          <span className={styles.detailValue}>{cita.servicio_nombre || 'N/A'}</span>
        </div>
        <div className={styles.detailItem}>
          <FontAwesomeIcon icon={faClock} className={styles.detailIcon} />
          <span className={styles.detailLabel}>Estado:</span>
          <span className={`${styles.badge} ${styles[cita.estado?.toLowerCase()]}`}> {/* Usar toLowerCase() */}
            {cita.estado || 'Desconocido'}
          </span>
        </div>
        {/* Aquí podrías añadir más detalles si los tienes en el objeto cita, por ejemplo:
        <div className={styles.detailItem}>
          <FontAwesomeIcon icon={faUserMd} className={styles.detailIcon} />
          <span className={styles.detailLabel}>Veterinario:</span>
          <span className={styles.detailValue}>{cita.veterinario_nombre || 'N/A'}</span>
        </div>
        <div className={styles.detailItem}>
          <FontAwesomeIcon icon={faPaw} className={styles.detailIcon} />
          <span className={styles.detailLabel}>Mascota:</span>
          <span className={styles.detailValue}>{cita.mascota_nombre || 'N/A'}</span>
        </div>
        */}
      </div>

      <div className={styles.opcionesCita}>
        <motion.button
          className={styles.verDetallesBtn}
          title="Ver detalles de la cita"
          onClick={() => onVerDetalles(cita)} // Pasa la cita completa
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FontAwesomeIcon icon={faInfoCircle} /> Detalles
        </motion.button>
        {cita.estado && cita.estado.toLowerCase() !== 'cancelada' && cita.estado.toLowerCase() !== 'completa' && (
          <motion.button
            className={styles.cancelarBtn}
            title="Cancelar cita"
            onClick={() => onCancelar(cita.id_cita)} // Pasa el ID de la cita
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FontAwesomeIcon icon={faTimesCircle} /> Cancelar
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default TarjetaCita;