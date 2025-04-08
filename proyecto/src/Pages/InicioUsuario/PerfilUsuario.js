import React from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Import Link
import styles from './Styles/PerfilUsuario.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faCog, faCreditCard, faSignOutAlt, faEnvelope, faArrowLeft, faBell, faShieldAlt, faMapMarkerAlt, faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion'; // Import for animations

const PerfilUsuario = () => {
  const navigate = useNavigate();
  // Aquí iría la lógica para obtener la información del usuario desde un contexto, API, etc.
  const usuario = {
    nombre: 'Juan Pérez',
    email: 'juan.perez@example.com',
    ubicacion: 'Soacha, Colombia', // Ejemplo de información adicional
    descripcion: 'Apasionado por la tecnología y la buena comida.', // Ejemplo de descripción
  };

  const handleCerrarSesion = () => {
    // Aquí iría la lógica para cerrar la sesión del usuario (limpiar tokens, etc.)
    console.log('Cerrando sesión...');
    navigate('/login'); // Redirigir a la página de inicio de sesión
  };

  const handleVolver = () => {
    navigate(-1); // Volver a la página anterior
  };

  // Variantes de animación para framer-motion
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { delayChildren: 0.1, staggerChildren: 0.05 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
    hover: { scale: 1.03, transition: { duration: 0.2 } },
    tap: { scale: 0.98 },
  };

  return (
    <motion.div
      className={styles.container}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className={styles.header}>
        <button onClick={handleVolver} className={styles.volverBtn}>
          <FontAwesomeIcon icon={faArrowLeft} className={styles.volverIcon} /> Volver
        </button>
        <FontAwesomeIcon icon={faUserCircle} className={styles.userIcon} />
        <h3>Mi Perfil</h3>
      </div>
      <motion.div className={styles.info} variants={itemVariants}>
        <p><FontAwesomeIcon icon={faUserCircle} className={styles.infoIcon} /> <strong>Nombre:</strong> {usuario.nombre} <FontAwesomeIcon icon={faPencilAlt} className={styles.editIcon} /></p>
        <p><FontAwesomeIcon icon={faEnvelope} className={styles.infoIcon} /> <strong>Email:</strong> {usuario.email}</p>
        {usuario.ubicacion && <p><FontAwesomeIcon icon={faMapMarkerAlt} className={styles.infoIcon} /> <strong>Ubicación:</strong> {usuario.ubicacion}</p>}
        {usuario.descripcion && <p><FontAwesomeIcon icon={faPencilAlt} className={styles.infoIcon} /> <strong>Descripción:</strong> {usuario.descripcion} <FontAwesomeIcon icon={faPencilAlt} className={styles.editIcon} /></p>}
        {/* Puedes añadir más información del usuario aquí */}
      </motion.div>
      <div className={styles.opciones}>
        <motion.Link
          to="/usuario/perfil/configuracion" // Correct route path
          className={styles.link}
          variants={itemVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <FontAwesomeIcon icon={faCog} className={styles.linkIcon} />
          Configuración
        </motion.Link>
        <motion.Link
          to="/usuario/perfil/pagos" // Correct route path
          className={styles.link}
          variants={itemVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <FontAwesomeIcon icon={faCreditCard} className={styles.linkIcon} />
          Métodos de Pago
        </motion.Link>
        <motion.Link
          to="/usuario/perfil/notificaciones"
          className={styles.link}
          variants={itemVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <FontAwesomeIcon icon={faBell} className={styles.linkIcon} />
          Notificaciones
        </motion.Link>
        <motion.Link
          to="/usuario/perfil/seguridad"
          className={styles.link}
          variants={itemVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <FontAwesomeIcon icon={faShieldAlt} className={styles.linkIcon} />
          Seguridad
        </motion.Link>
        <motion.button
          onClick={handleCerrarSesion}
          className={styles.link}
          variants={itemVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <FontAwesomeIcon icon={faSignOutAlt} className={styles.linkIcon} />
          Cerrar Sesión
        </motion.button>
        {/* Puedes añadir más opciones aquí */}
      </div>
    </motion.div>
  );
};

export default PerfilUsuario;