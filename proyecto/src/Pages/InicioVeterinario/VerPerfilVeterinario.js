import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link, useOutletContext } from 'react-router-dom';
import veteStyles from './Style/VerPerfilVeterinarioStyles.module.css';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEdit,
  faSignOutAlt,
  faSyncAlt,
  faSpinner // Importar spinner
} from '@fortawesome/free-solid-svg-icons';
import { authFetch } from './api'; // Asegúrate de que la ruta sea correcta a tu archivo api.js

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

const VerPerfilVeterinario = () => {
  const { user, setUser, showNotification } = useOutletContext(); // Obtener user y setUser del contexto
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleCerrarSesion = () => {
    localStorage.removeItem('token'); // Limpia el token JWT
    localStorage.removeItem('user'); // Limpia la información del usuario del localStorage
    if (setUser) {
      setUser(null); // Limpia el estado de usuario global
    } else {
      console.warn("La función 'setUser' no fue proporcionada. Asegúrate de pasarla desde App.js.");
    }
    navigate('/login'); // Redirige al usuario a la página de login
  };

  const loadProfileData = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!user || !user.id) {
      setError('No se pudo cargar el perfil: ID de usuario no disponible. Por favor, inicia sesión de nuevo.');
      setLoading(false);
      return;
    }

    try {
      // Usar authFetch para obtener los datos del perfil del usuario logueado
      const response = await authFetch(`/usuarios/${user.id}`);
      if (response.success) {
        setPerfil(response.data);
        // Opcional: Actualizar el localStorage 'user' con los datos más recientes del perfil
        localStorage.setItem('user', JSON.stringify(response.data));
      } else {
        setError(response.message || 'Error al cargar los datos del perfil.');
        if (showNotification) showNotification(response.message || 'Error al cargar los datos del perfil.', 'error');
      }
    } catch (err) {
      console.error("Error al cargar datos del perfil:", err);
      setError('Error de conexión al servidor al cargar el perfil. Por favor, inténtalo de nuevo más tarde.');
      if (showNotification) showNotification('Error de conexión al servidor al cargar el perfil.', 'error');
    } finally {
      setLoading(false);
    }
  }, [user, showNotification]); // Dependencias: user para que se recargue si el usuario cambia, showNotification para usarlo

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]); // Ejecutar cuando loadProfileData cambie (que solo será si user o showNotification cambian)

  if (loading) {
    return (
      <div className={veteStyles.veteLoadingContainer}>
        <FontAwesomeIcon icon={faSpinner} spin size="3x" className={veteStyles.veteLoadingSpinner} />
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
          className={`${veteStyles.veteActionButton} ${veteStyles.veteReloadButton}`}
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

  // Fallback para la imagen de perfil si no hay URL o si falla la carga
  const profileImageUrl = perfil.imagen_url || `https://placehold.co/150x150/00acc1/ffffff?text=${perfil.nombre?.charAt(0) || 'V'}`;

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
          {/* Mostrar imagen de perfil o icono de usuario por defecto */}
          <img
            src={profileImageUrl}
            alt="Foto de Perfil"
            className={veteStyles.veteProfileImage}
            onError={(e) => {
              e.target.onerror = null; // Evita bucles infinitos de error
              e.target.src = `https://placehold.co/150x150/00acc1/ffffff?text=${perfil.nombre?.charAt(0) || 'V'}`;
            }}
          />
        </motion.div>

        <h2>Mi Perfil</h2>

        <div className={veteStyles.veteActions}>
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
          <strong>Nombre:</strong> {perfil.nombre} {perfil.apellido}
        </motion.p>

        {/* La "especialidad" no es un campo directo en la tabla de usuarios,
            pero se puede inferir o añadir si es necesario.
            Por ahora, usaremos "role" o "experiencia" si es para veterinarios. */}
        {perfil.role === 'veterinario' && (
            <motion.p variants={itemVariants}>
                <strong>Rol:</strong> {perfil.role}
            </motion.p>
        )}
        
        <motion.p variants={itemVariants}>
          <strong>Email:</strong> {perfil.email}
        </motion.p>

        <motion.p variants={itemVariants}>
          <strong>Teléfono:</strong> {perfil.telefono}
        </motion.p>

        <motion.p variants={itemVariants}>
          <strong>Dirección:</strong> {perfil.direccion}
        </motion.p>

        {perfil.role === 'veterinario' && (
          <>
            <motion.p variants={itemVariants}>
              <strong>Experiencia:</strong> {perfil.experiencia || 'No especificado'}
            </motion.p>

            <motion.p variants={itemVariants}>
              <strong>Universidad:</strong> {perfil.universidad || 'No especificado'}
            </motion.p>

            <motion.p variants={itemVariants}>
              <strong>Horario:</strong> {perfil.horario || 'No especificado'}
            </motion.p>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

export default VerPerfilVeterinario;