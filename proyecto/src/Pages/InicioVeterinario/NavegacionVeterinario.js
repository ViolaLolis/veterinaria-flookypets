// NavegacionVeterinario.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Style/NavegacionVeterinarioStyles.module.css'; // Asegúrate de que esta ruta sea correcta
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faPaw, faCalendarAlt, faFileMedicalAlt, faUserCog } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';

const navItems = [
  { path: '/veterinario/propietarios', icon: faUser, label: 'Propietarios' },
  { path: '/veterinario/mascotas', icon: faPaw, label: 'Mascotas' },
  { path: '/veterinario/citas', icon: faCalendarAlt, label: 'Citas' },
  { path: '/veterinario/historiales', icon: faFileMedicalAlt, label: 'Historiales' },
  { path: '/veterinario/perfil', icon: faUserCog, label: 'Perfil' },
];

const NavegacionVeterinario = () => {
  return (
    <motion.nav className={styles.navegacion}>
      <ul className={styles.lista}>
        {navItems.map((item) => (
          <motion.li
            key={item.path}
            className={styles.item}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <NavLink
              to={item.path}
              className={({ isActive }) => isActive ? styles.activo : styles.link}
            >
              <FontAwesomeIcon icon={item.icon} className={styles.icono} />
              <span className={styles.label}>{item.label}</span>
            </NavLink>
          </motion.li>
        ))}
      </ul>
    </motion.nav>
  );
};

export default NavegacionVeterinario;