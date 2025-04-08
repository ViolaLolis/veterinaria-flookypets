import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom'; // Importa useNavigate
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaw, faCalendarCheck, faList, faUser, faQuestionCircle, faArrowLeft } from '@fortawesome/free-solid-svg-icons'; // Importa faArrowLeft
import styles from './Styles/BarraNavegacionUsuario.module.css';

const BarraNavegacionUsuario = () => {
  const navigate = useNavigate(); // Hook para la navegación programática

  const handleVolverInicio = () => {
    navigate('/usuario'); // Navega a la ruta principal del usuario
  };

  return (
    <nav className={styles.navbar}>
      <NavLink
        to="/usuario/mascotas"
        className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
      >
        <FontAwesomeIcon icon={faPaw} className={styles.navIcon} />
        Mascotas
      </NavLink>
      <NavLink
        to="/usuario/citas"
        className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
      >
        <FontAwesomeIcon icon={faCalendarCheck} className={styles.navIcon} />
        Citas
      </NavLink>
      <NavLink
        to="/usuario/servicios"
        className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
      >
        <FontAwesomeIcon icon={faList} className={styles.navIcon} />
        Servicios
      </NavLink>
      <NavLink
        to="/usuario/perfil"
        className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
      >
        <FontAwesomeIcon icon={faUser} className={styles.navIcon} />
        Perfil
      </NavLink>
      <NavLink
        to="/usuario/ayuda"
        className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
      >
        <FontAwesomeIcon icon={faQuestionCircle} className={styles.navIcon} />
        Ayuda
      </NavLink>
    </nav>
  );
};

export default BarraNavegacionUsuario;