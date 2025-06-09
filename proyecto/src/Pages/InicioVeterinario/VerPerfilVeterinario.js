import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './Style/VerPerfilVeterinarioStyles.module.css';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUserCircle, 
  faEdit, 
  faCog, 
  faPhone, 
  faSignOutAlt 
} from '@fortawesome/free-solid-svg-icons';

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.5, 
      ease: 'easeInOut',
      when: "beforeChildren",
      staggerChildren: 0.1
    } 
  },
};

const buttonVariants = {
  hover: { 
    scale: 1.05,
    boxShadow: "0 5px 15px rgba(0, 188, 212, 0.3)"
  },
  tap: { 
    scale: 0.95,
    boxShadow: "0 2px 5px rgba(0, 188, 212, 0.1)"
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
};

const VerPerfilVeterinario = ({ setUser }) => {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleCerrarSesion = () => {
    if (setUser) {
      setUser(null);
      navigate('/login');
    } else {
      console.warn("La función 'setUser' no se pasó como prop.");
    }
  };

  useEffect(() => {
    // Simulación de llamada a la API
    setTimeout(() => {
      try {
        const veterinarioData = {
          nombre: 'Dra. Sofia Vargas',
          especialidad: 'Medicina General Veterinaria',
          email: 'sofia.vargas@example.com',
          telefono: '3001234567',
          direccion: 'Carrera 10 # 20-30, Bogotá',
          experiencia: '5 años',
          universidad: 'Universidad Nacional de Colombia',
          horario: 'Lunes a Viernes: 8:00 AM - 5:00 PM'
        };
        setPerfil(veterinarioData);
        setLoading(false);
      } catch (err) {
        setError('Error al cargar los datos del perfil');
        setLoading(false);
      }
    }, 800);
  }, []);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Cargando perfil...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h3>Error</h3>
        <p>{error}</p>
        <motion.button
          onClick={() => window.location.reload()}
          className={styles.editButton}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          Intentar de nuevo
        </motion.button>
      </div>
    );
  }

  if (!perfil) {
    return (
      <div className={styles.errorContainer}>
        <p>No se encontró información del perfil.</p>
        <Link to="/veterinario/perfil/editar" className={styles.editButton}>
          <FontAwesomeIcon icon={faEdit} /> Crear Perfil
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      className={styles.perfilContainer}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className={styles.header}>
        <motion.div 
          className={styles.userIconContainer}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FontAwesomeIcon 
            icon={faUserCircle} 
            className={styles.userIcon} 
            size="3x" 
          />
        </motion.div>
        
        <h2>Mi Perfil</h2>
        
        <div className={styles.actions}>
          <motion.a
            href="/veterinario/configuracion"
            className={styles.headerButton}
            title="Configuración"
            whileHover={{ rotate: 15, scale: 1.1 }}
          >
            <FontAwesomeIcon icon={faCog} />
          </motion.a>
          
          <motion.a
            href="/veterinario/llamada"
            className={styles.headerButton}
            title="Llamada"
            whileHover={{ rotate: -15, scale: 1.1 }}
          >
            <FontAwesomeIcon icon={faPhone} />
          </motion.a>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/veterinario/perfil/editar" className={styles.editButton}>
              <FontAwesomeIcon icon={faEdit} /> Editar Perfil
            </Link>
          </motion.div>
          
          <motion.button
            onClick={handleCerrarSesion}
            className={styles.cerrarSesionBtn}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <FontAwesomeIcon icon={faSignOutAlt} /> Cerrar Sesión
          </motion.button>
        </div>
      </div>
      
      <motion.div 
        className={styles.infoSection}
        variants={containerVariants}
      >
        <h3>Información Personal</h3>
        
        <motion.p variants={itemVariants}>
          <strong>Nombre:</strong> {perfil.nombre}
        </motion.p>
        
        <motion.p variants={itemVariants}>
          <strong>Especialidad:</strong> {perfil.especialidad}
        </motion.p>
        
        <motion.p variants={itemVariants}>
          <strong>Email:</strong> {perfil.email}
        </motion.p>
        
        <motion.p variants={itemVariants}>
          <strong>Teléfono:</strong> {perfil.telefono}
        </motion.p>
        
        <motion.p variants={itemVariants}>
          <strong>Dirección:</strong> {perfil.direccion}
        </motion.p>
        
        <motion.p variants={itemVariants}>
          <strong>Experiencia:</strong> {perfil.experiencia}
        </motion.p>
        
        <motion.p variants={itemVariants}>
          <strong>Universidad:</strong> {perfil.universidad}
        </motion.p>
        
        <motion.p variants={itemVariants}>
          <strong>Horario:</strong> {perfil.horario}
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

export default VerPerfilVeterinario;