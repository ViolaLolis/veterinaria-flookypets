import React from 'react';
import styles from './Styles/TarjetaCita.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faInfoCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

const TarjetaCita = ({ cita, onVerDetalles, onCancelar }) => {
  return (
    <div className={styles.tarjeta}>
      <div className={styles.infoCita}>
        <FontAwesomeIcon icon={faCalendarAlt} className={styles.iconoFecha} />
        <p className={styles.fecha}>{cita.fecha}</p>
      </div>
      <div className={styles.detalleCita}>
        <p className={styles.servicio}>{cita.servicio_nombre}</p> {/* Usar servicio_nombre */}
        <p className={styles.estado}>Estado: <span className={`${styles.badge} ${styles[cita.estado]}`}>{cita.estado}</span></p>
      </div>
      <div className={styles.opcionesCita}>
        <button
          className={styles.verDetallesBtn}
          title="Ver detalles de la cita"
          onClick={() => onVerDetalles(cita)} // Pasa la cita completa
        >
          <FontAwesomeIcon icon={faInfoCircle} className={styles.iconoOpcion} />
        </button>
        {cita.estado !== 'cancelada' && cita.estado !== 'completa' && (
          <button
            className={styles.cancelarBtn}
            title="Cancelar cita"
            onClick={() => onCancelar(cita.id_cita)} // Pasa el ID de la cita
          >
            <FontAwesomeIcon icon={faTimesCircle} className={styles.iconoOpcion} />
          </button>
        )}
      </div>
    </div>
  );
};

export default TarjetaCita;
