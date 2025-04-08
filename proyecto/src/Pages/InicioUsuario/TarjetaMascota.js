import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Styles/TarjetaMascota.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDog, faCat, faPaw, faFileMedicalAlt } from '@fortawesome/free-solid-svg-icons';

const TarjetaMascota = ({ mascota }) => {
  const getPetIcon = (raza) => {
    if (raza.toLowerCase().includes('perro') || raza.toLowerCase().includes('pug')) {
      return <FontAwesomeIcon icon={faDog} className={styles.petIcon} />;
    } else if (raza.toLowerCase().includes('gato') || raza.toLowerCase().includes('siames')) {
      return <FontAwesomeIcon icon={faCat} className={styles.petIcon} />;
    } else {
      return <FontAwesomeIcon icon={faPaw} className={styles.petIcon} />;
    }
  };

  return (
    <div className={styles.tarjeta}>
      <div className={styles.imagenContainer}>
        <img src={mascota.imagen} alt={mascota.nombre} className={styles.imagen} />
      </div>
      <div className={styles.info}>
        <div className={styles.nombreIcon}>
          {getPetIcon(mascota.raza)}
          <h4>{mascota.nombre}</h4>
        </div>
        <p className={styles.razaEdad}>{mascota.raza} - {mascota.edad}</p>
        <Link to={`/usuario/mascota/${mascota.id}/historial`} className={styles.verHistorial}>
          <FontAwesomeIcon icon={faFileMedicalAlt} className={styles.historialIcon} /> Ver Historial
        </Link>
      </div>
    </div>
  );
};

export default TarjetaMascota;