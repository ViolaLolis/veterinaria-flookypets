import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserCircle,
  faSignOutAlt,
  faEdit,
} from '@fortawesome/free-solid-svg-icons';
import styles from './Styles/PerfilUsuario.module.css';

const PerfilUsuario = () => {
  const navigate = useNavigate();
  
  // Datos del usuario con más información
  const usuario = {
    nombre: 'Juan Pérez',
    email: 'juan.perez@example.com',
    telefono: '+57 310 123 4567',
    ubicacion: 'Soacha, Colombia',
    descripcion: 'Amante de los animales y su bienestar.',
    membresia: 'Premium',
    mascotasRegistradas: 3,
    citasRealizadas: 12,
    imagenPerfil: 'https://randomuser.me/api/portraits/men/32.jpg'
  };

  const handleCerrarSesion = () => {
    console.log('Cerrando sesión...');
    navigate('/login');
  };

  // Animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        when: "beforeChildren"
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  const cardHover = {
    hover: { 
      y: -5,
      boxShadow: "0 10px 20px rgba(0, 172, 193, 0.2)",
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div 
      className={styles.container}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header con gradiente */}
      <motion.div 
        className={styles.header}
        variants={itemVariants}
      >
        <div className={styles.headerContent}>
          <motion.div 
            className={styles.profileImageContainer}
            whileHover={{ scale: 1.05 }}
          >
            <img src={usuario.imagenPerfil} alt="Perfil" className={styles.profileImage} />
            <button className={styles.editProfileButton}>
              <FontAwesomeIcon icon={faEdit} />
            </button>
          </motion.div>
          <div>
            <h1>{usuario.nombre}</h1>
            <p className={styles.userEmail}>{usuario.email}</p>
            <div className={styles.membershipBadge}>
              {usuario.membresia}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Estadísticas rápidas */}
      <motion.div 
        className={styles.statsContainer}
        variants={itemVariants}
      >
        <motion.div 
          className={styles.statCard}
          variants={itemVariants}
          whileHover="hover"
          variantas={cardHover}
        >
          <h3>{usuario.mascotasRegistradas}</h3>
          <p>Mascotas</p>
        </motion.div>
        <motion.div 
          className={styles.statCard}
          variants={itemVariants}
          whileHover="hover"
          variantssss={cardHover}
        >
          <h3>{usuario.citasRealizadas}</h3>
          <p>Citas</p>
        </motion.div>
        <motion.div 
          className={styles.statCard}
          variants={itemVariants}
          whileHover="hover"
          variantsss={cardHover}
        >
          <h3>4.9</h3>
          <p>Calificación</p>
        </motion.div>
      </motion.div>

      {/* Información del usuario */}
      <motion.div 
        className={styles.infoCard}
        variants={itemVariants}
        whileHover="hover"
        variantss={cardHover}
      >
        <h2 className={styles.cardTitle}>
          <FontAwesomeIcon icon={faUserCircle} className={styles.cardIcon} />
          Información Personal
        </h2>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <label>Nombre completo</label>
            <p>{usuario.nombre}</p>
          </div>
          <div className={styles.infoItem}>
            <label>Correo electrónico</label>
            <p>{usuario.email}</p>
          </div>
          <div className={styles.infoItem}>
            <label>Teléfono</label>
            <p>{usuario.telefono}</p>
          </div>
          <div className={styles.infoItem}>
            <label>Ubicación</label>
            <p>{usuario.ubicacion}</p>
          </div>
          <div className={styles.infoItemFull}>
            <label>Sobre mí</label>
            <p>{usuario.descripcion}</p>
          </div>
        </div>
        <motion.button
        className={styles.editButton}
          onClick={() => navigate('/usuario/perfil/configuracion')}
          whileHover="hover"
          variants={cardHover}
          while={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <FontAwesomeIcon icon={faEdit} /> Editar información
        </motion.button>
      </motion.div>
      

      {/* Menú de opciones */}
      <motion.div 
        className={styles.optionsContainer}
        variants={itemVariants}
      >
      </motion.div>

      {/* Botón de cerrar sesión */}
      <motion.button
        className={styles.logoutButton}
        onClick={handleCerrarSesion}
        variants={itemVariants}
        whileHover={{ scale: 1.03, backgroundColor: '#e53935' }}
        whileTap={{ scale: 0.97 }}
      >
        <FontAwesomeIcon icon={faSignOutAlt} /> Cerrar sesión
      </motion.button>
    </motion.div>
  );
};

export default PerfilUsuario;