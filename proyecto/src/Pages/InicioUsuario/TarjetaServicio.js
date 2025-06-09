import React from 'react';
import styles from './Styles/TarjetaServicio.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShieldAlt,
  faClock,
  faStethoscope,
  faCalendarCheck
} from '@fortawesome/free-solid-svg-icons';

const TarjetaServicio = ({ servicio }) => {
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
            <span>{servicio.duracion}</span>
          </div>
          <div className={styles.detailItem}>
            <FontAwesomeIcon icon={faStethoscope} className={styles.detailIcon} />
            <span>{servicio.especialista}</span>
          </div>
        </div>
        
        {servicio.incluye && (
          <div className={styles.includes}>
            <h4>Incluye:</h4>
            <ul>
              {servicio.incluye.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      <div className={styles.footer}>
        <div className={styles.price}>{servicio.precio}</div>
        <button className={styles.bookButton}>
          <FontAwesomeIcon icon={faCalendarCheck} />
          Agendar
        </button>
      </div>
    </div>
  );
};

export default TarjetaServicio;