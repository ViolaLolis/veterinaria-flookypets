import React from 'react';
import styles from './Styles/TarjetaServicio.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboardList, faCalendarPlus } from '@fortawesome/free-solid-svg-icons';

const TarjetaServicio = ({ servicio }) => {
  return (
    <div className={styles.tarjeta}>
      <div className={styles.header}>
        <FontAwesomeIcon icon={faClipboardList} className={styles.iconoServicio} />
        <h4 className={styles.nombreServicio}>{servicio.nombre}</h4>
      </div>
      <p className={styles.descripcion}>{servicio.descripcion}</p>
      <div className={styles.footer}>
        <p className={styles.precio}>{servicio.precio}</p>
        <button className={styles.agendar}>
          <FontAwesomeIcon icon={faCalendarPlus} className={styles.iconoAgendar} />
          Agendar
        </button>
      </div>
    </div>
  );
};

export default TarjetaServicio;