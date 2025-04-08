import React from 'react';
import styles from './Styles/TarjetaCita.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faInfoCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

const TarjetaCita = ({ cita }) => {
  return (
    <div className={styles.tarjeta}>
      <div className={styles.infoCita}>
        <FontAwesomeIcon icon={faCalendarAlt} className={styles.iconoFecha} />
        <p className={styles.fecha}>{cita.fecha}</p>
      </div>
      <div className={styles.detalleCita}>
        <p className={styles.servicio}>{cita.servicio}</p>
      </div>
      <div className={styles.opcionesCita}>
        <button className={styles.verDetallesBtn} title="Ver detalles de la cita">
          <FontAwesomeIcon icon={faInfoCircle} className={styles.iconoOpcion} />
        </button>
        <button className={styles.cancelarBtn} title="Cancelar cita">
          <FontAwesomeIcon icon={faTimesCircle} className={styles.iconoOpcion} />
        </button>
      </div>
    </div>
  );
};

export default TarjetaCita;