import React from 'react';

import styles from './Styles/TarjetaMascota.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDog, faCat, faPaw} from '@fortawesome/free-solid-svg-icons';

const TarjetaMascota = ({}) => {
  const getPetIcon = (raza) => {
    if (raza.toLowerCase().includes('perro') || raza.toLowerCase().includes('pug')) {
      return <FontAwesomeIcon icon={faDog} className={styles.petIcon} />;
    } else if (raza.toLowerCase().includes('gato') || raza.toLowerCase().includes('siames')) {
      return <FontAwesomeIcon icon={faCat} className={styles.petIcon} />;
    } else {
      return <FontAwesomeIcon icon={faPaw} className={styles.petIcon} />;
    }
  };

};

export default TarjetaMascota;