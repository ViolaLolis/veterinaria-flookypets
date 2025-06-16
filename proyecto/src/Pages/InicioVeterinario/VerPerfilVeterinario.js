import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import veteStyles from './Style/VerPerfilVeterinarioStyles.module.css';
import { motion } from 'framer-motion';

import {
  FontAwesomeIcon
} from '@fortawesome/react-fontawesome';
import {
  faUserCircle,
  faEdit,
  faSignOutAlt,
  faSyncAlt // Added for refresh button in error state
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
    boxShadow: "0 5px 15px rgba(0, 172, 193, 0.3)"
  },
  tap: {
    scale: 0.95,
    boxShadow: "0 2px 5px rgba(0, 172, 193, 0.1)"
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
    // Limpia la información del usuario del localStorage
    localStorage.removeItem('user');
    // Si la función setUser fue proporcionada, úsala para limpiar el estado de usuario global
    if (setUser) {
      setUser(null);
    } else {
      console.warn("La función 'setUser' no fue proporcionada. Asegúrate de pasarla desde App.js.");
    }
    // Redirige al usuario a la página de login
    navigate('/login');
  };

  const loadProfileData = () => {
    setLoading(true);
    setError(null); // Limpiar errores previos

    setTimeout(() => {
      try {
        // Intenta cargar el perfil desde localStorage primero
        const savedPerfil = localStorage.getItem('veterinarioProfile');
        if (savedPerfil) {
          setPerfil(JSON.parse(savedPerfil));
        } else {
          // Si no hay datos en localStorage, usa los datos simulados
          const veterinarioData = {
            nombre: 'DRA. SOFIA VARGAS', // En mayúsculas
            especialidad: 'MEDICINA GENERAL VETERINARIA', // En mayúsculas
            email: 'sofia.vargas@example.com', // Sin mayúsculas
            telefono: '3001234567', // En mayúsculas
            direccion: 'CARRERA 10 # 20-30, BOGOTA', // En mayúsculas
            experiencia: '5 AÑOS', // En mayúsculas
            universidad: 'UNIVERSIDAD NACIONAL DE COLOMBIA', // En mayúsculas
            horario: 'LUNES A VIERNES: 8:00 AM - 5:00 PM' // En mayúsculas
          };
          setPerfil(veterinarioData);
          // Opcional: Guarda estos datos simulados en localStorage para futuras cargas
          localStorage.setItem('veterinarioProfile', JSON.stringify(veterinarioData));
        }
        setLoading(false);
      } catch (err) {
        console.error("Error al cargar datos del perfil:", err);
        setError('Error al cargar los datos del perfil. Por favor, inténtalo de nuevo más tarde.');
        setLoading(false);
      }
    }, 800); // Simulate network delay
  };

  useEffect(() => {
    loadProfileData();
  }, []); // Empty dependency array means this runs once on mount

  if (loading) {
    return (
      <div className={veteStyles.veteLoadingContainer}>
        <div className={veteStyles.veteLoadingSpinner}></div>
        <p>Cargando perfil...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={veteStyles.veteErrorContainer}>
        <h3>Error al Cargar Perfil</h3>
        <p>{error}</p>
        <motion.button
          onClick={loadProfileData} // Intenta cargar de nuevo los datos
          className={`${veteStyles.veteActionButton} ${veteStyles.veteReloadButton}`} // Nuevo estilo
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <FontAwesomeIcon icon={faSyncAlt} /> Intentar de nuevo
        </motion.button>
      </div>
    );
  }

  if (!perfil) {
    return (
      <div className={veteStyles.veteErrorContainer}>
        <p>No se encontró información del perfil. ¡Es hora de crearlo!</p>
        <Link to="/veterinario/perfil/editar" className={`${veteStyles.veteActionButton} ${veteStyles.veteEditButton}`}>
          <FontAwesomeIcon icon={faEdit} /> Crear Perfil
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      className={veteStyles.vetePerfilContainer}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className={veteStyles.veteHeader}>
        <motion.div
          className={veteStyles.veteUserIconContainer}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FontAwesomeIcon
            icon={faUserCircle}
            className={veteStyles.veteUserIcon}
            size="3x"
          />
        </motion.div>

        <h2>Mi Perfil</h2>

        <div className={veteStyles.veteActions}>
          {/* El botón de configuración (faCog) ha sido eliminado de aquí */}

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/veterinario/perfil/editar" className={veteStyles.veteEditButton}>
              <FontAwesomeIcon icon={faEdit} /> Editar Perfil
            </Link>
          </motion.div>

          <motion.button
            onClick={handleCerrarSesion}
            className={veteStyles.veteCerrarSesionBtn}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <FontAwesomeIcon icon={faSignOutAlt} /> Cerrar Sesión
          </motion.button>
        </div>
      </div>

      <motion.div
        className={veteStyles.veteInfoSection}
        variants={containerVariants} // Apply item staggering to content as well
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