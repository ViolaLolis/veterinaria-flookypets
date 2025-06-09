import React from 'react';
import styles from './Styles/TarjetaServicio.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldAlt, faClock, faStethoscope, faCalendarCheck } from '@fortawesome/free-solid-svg-icons';

const TarjetaServicio = ({ servicio, onAgendar }) => {
  return (
    <div className={styles.tarjeta}>
      <div className={styles.badge}>
        <FontAwesomeIcon icon={faShieldAlt} className={styles.badgeIcon} />
      </div>
      
      <div className={styles.content}>
        <h3 className={styles.title}>{servicio.nombre}</h3>
        <p className={styles.description}>{servicio.descripcion}</p>
        
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
        <div className={styles.price}>{servicio.precio}</div>
        <button 
          className={styles.bookButton}
          onClick={() => onAgendar(servicio.id)} // Pasar el ID del servicio
        >
          <FontAwesomeIcon icon={faCalendarCheck} /> Agendar
        </button>
      </div>
    </div>
  );
};

export default TarjetaServicio;