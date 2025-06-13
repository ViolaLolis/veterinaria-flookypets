import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import veteStyles from './Style/VerPerfilVeterinarioStyles.module.css'; // Corrected import to veteStyles
import { motion } from 'framer-motion';

// --- IMPORTANT: Ensure these imports are correct and packages are INSTALLED! ---
import {
  FontAwesomeIcon
} from '@fortawesome/react-fontawesome';
import {
  faUserCircle,
  faEdit,
  faCog,
  faSignOutAlt,// For schedule
  faSyncAlt // Added for refresh button in error state
} from '@fortawesome/free-solid-svg-icons';
// --- END IMPORTANT ---

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
    boxShadow: "0 5px 15px rgba(0, 172, 193, 0.3)" // Updated shadow color to teal
  },
  tap: {
    scale: 0.95,
    boxShadow: "0 2px 5px rgba(0, 172, 193, 0.1)" // Updated shadow color
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
    // In a real app, you'd also clear any user tokens/session data from localStorage
    if (setUser) {
      setUser(null);
      navigate('/login');
    } else {
      console.warn("The 'setUser' function was not passed as a prop. Defaulting to navigation.");
      // Fallback if setUser isn't provided, useful for testing or simple logout
      navigate('/login');
    }
  };

  useEffect(() => {
    // Simulate API call to fetch profile data
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
        setError('Error al cargar los datos del perfil. Por favor, inténtalo de nuevo más tarde.');
        setLoading(false);
      }
    }, 800); // Simulate network delay
  }, []); // Empty dependency array means this runs once on mount

  if (loading) {
    return (
      <div className={veteStyles.veteLoadingContainer}> {/* Corrected class name */}
        <div className={veteStyles.veteLoadingSpinner}></div> {/* Corrected class name */}
        <p>Cargando perfil...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={veteStyles.veteErrorContainer}> {/* Corrected class name */}
        <h3>Error al Cargar Perfil</h3>
        <p>{error}</p>
        <motion.button
          onClick={() => window.location.reload()} // Reloads the page to retry
          className={veteStyles.veteEditButton}/* Reusing styling for a button */
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <FontAwesomeIcon icon={faSyncAlt} /> Intentar de nuevo {/* Added faSyncAlt for refresh */}
        </motion.button>
      </div>
    );
  }

  if (!perfil) {
    return (
      <div className={veteStyles.veteErrorContainer}> {/* Reusing error container for no profile */}
        <p>No se encontró información del perfil. ¡Es hora de crearlo!</p>
        <Link to="/veterinario/perfil/editar" className={veteStyles.veteEditButton}>
          <FontAwesomeIcon icon={faEdit} /> Crear Perfil
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      className={veteStyles.vetePerfilContainer} // Corrected class name
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className={veteStyles.veteHeader}> {/* Corrected class name */}
        <motion.div
          className={veteStyles.veteUserIconContainer} // Corrected class name
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FontAwesomeIcon
            icon={faUserCircle}
            className={veteStyles.veteUserIcon} // Corrected class name
            size="3x"
          />
        </motion.div>

        <h2>Mi Perfil</h2>

        <div className={veteStyles.veteActions}> {/* Corrected class name */}
          <motion.a
            href="/veterinario/configuracion"
            className={veteStyles.veteHeaderButton} // Corrected class name
            title="Configuración"
            whileHover={{ rotate: 15, scale: 1.1 }}
          >
            <FontAwesomeIcon icon={faCog} />
          </motion.a>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/veterinario/perfil/editar" className={veteStyles.veteEditButton}> {/* Corrected class name */}
              <FontAwesomeIcon icon={faEdit} /> Editar Perfil
            </Link>
          </motion.div>

          <motion.button
            onClick={handleCerrarSesion}
            className={veteStyles.veteCerrarSesionBtn} // Corrected class name
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <FontAwesomeIcon icon={faSignOutAlt} /> Cerrar Sesión
          </motion.button>
        </div>
      </div>

      <motion.div
        className={veteStyles.veteInfoSection} // Corrected class name
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