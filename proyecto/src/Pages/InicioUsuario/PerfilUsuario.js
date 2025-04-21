import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './Styles/PerfilUsuario.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserCircle,
  faCog,
  faCreditCard,
  faSignOutAlt,
  faBell,
  faShieldAlt,
} from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';

const PerfilUsuario = () => {
  const navigate = useNavigate();
  const usuario = {
    nombre: 'Juan Pérez',
    email: 'juan.perez@example.com',
    ubicacion: 'Soacha, Colombia',
    descripcion: 'Amante de los animales y su bienestar.',
  };

  const handleCerrarSesion = () => {
    console.log('Cerrando sesión...');
    navigate('/login');
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeInOut' } },
  };

  const linkVariants = {
    hover: { scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.15)', transition: { duration: 0.2 } },
    tap: { scale: 0.95 },
  };

  return (
    <motion.div
      className={styles.perfilContainer}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className={styles.header}>
        <FontAwesomeIcon icon={faUserCircle} className={styles.userIcon} />
        <h2 className={styles.title}>Mi Perfil</h2>
      </div>

      <div className={styles.infoSection}>
        <h3 className={styles.infoTitle}>Información Personal</h3>
        <p><strong className={styles.strong}>Nombre:</strong> {usuario.nombre}</p>
        <p><strong className={styles.strong}>Email:</strong> {usuario.email}</p>
        {usuario.ubicacion && <p><strong className={styles.strong}>Ubicación:</strong> {usuario.ubicacion}</p>}
        {usuario.descripcion && <p><strong className={styles.strong}>Descripción:</strong> {usuario.descripcion}</p>}
      </div>

      <div className={styles.optionsSection}>
        <h3 className={styles.optionsTitle}>Opciones</h3>
        <motion.div
          className={styles.optionLink}
          onClick={() => navigate('/usuario/perfil/configuracion')}
          variants={linkVariants}
          whileHover="hover"
          whileTap="tap"
          style={{ cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}
        >
          <FontAwesomeIcon icon={faCog} className={styles.optionIcon} />
          Configuración
        </motion.div>

        <motion.div
          className={styles.optionLink}
          onClick={() => navigate('/usuario/perfil/pagos')}
          variants={linkVariants}
          whileHover="hover"
          whileTap="tap"
          style={{ cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}
        >
          <FontAwesomeIcon icon={faCreditCard} className={styles.optionIcon} />
          Métodos de Pago
        </motion.div>

        <motion.button
          className={styles.logoutButton}
          onClick={handleCerrarSesion}
          variants={linkVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <FontAwesomeIcon icon={faSignOutAlt} className={styles.logoutIcon} />
          Cerrar Sesión
        </motion.button>
      </div>
    </motion.div>
  );
};

export default PerfilUsuario;