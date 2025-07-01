import React from 'react';
import styles from './Styles/TarjetaServicio.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldAlt, faClock, faStethoscope, faCalendarCheck } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom'; // Importar Link

const TarjetaServicio = ({ servicio, onAgendar }) => {
  return (
    <div className={styles.tarjeta}>
      <div className={styles.badge}>
        <FontAwesomeIcon icon={faShieldAlt} className={styles.badgeIcon} />
      </div>

      <div className={styles.content}>
        <h3 className={styles.title}>{servicio.nombre}</h3>
        {/* Descripción corta se puede extraer de la descripción completa o añadir un campo si es necesario */}
        <p className={styles.description}>{servicio.descripcion.substring(0, 100)}...</p> {/* Mostrar solo un fragmento */}

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
        <Link to={`/usuario/servicios/${servicio.id_servicio}`} className={styles.viewDetailsButton}>
          Ver Detalles
        </Link>
        <button
          className={styles.bookButton}
          onClick={() => onAgendar(servicio.id_servicio, servicio.nombre, servicio.precio)} // Pasar todos los datos necesarios
        >
          <FontAwesomeIcon icon={faCalendarCheck} /> Agendar
        </button>
      </div>
    </div>
  );
};

export default TarjetaServicio;