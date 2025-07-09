import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserCircle, faSignOutAlt, faEdit, faCheckCircle,
  faSpinner, faInfoCircle, faTimesCircle, faBriefcase,
  faGraduationCap, faClock
} from '@fortawesome/free-solid-svg-icons';

import styles from './Styles/PerfilUsuario.module.css';
import { authFetch } from './api';

const PerfilUsuario = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    const timer = setTimeout(() => {
      setNotification(null);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const fetchUserData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    if (!user || !user.id) {
      setError('No se pudo obtener la información del usuario. Por favor, inicia sesión.');
      setIsLoading(false);
      return;
    }
    try {
      const response = await authFetch(`/usuarios/${user.id}`);
      if (response.success) {
        setUsuario(response.data);
      } else {
        setError(response.message || 'Error al cargar los datos del perfil.');
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError('Error de conexión al servidor.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleCerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    showNotification('Sesión cerrada correctamente. Redirigiendo...', 'success');
    setTimeout(() => {
      navigate('/login');
    }, 1500);
  };

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
        stiffness: 100,
        damping: 12
      }
    }
  };

  const cardHover = {
    hover: {
      y: -5,
      boxShadow: "0 15px 35px rgba(0, 172, 193, 0.2)",
      transition: { duration: 0.3 }
    }
  };

  if (isLoading) {
    return (
      <div className={styles.perfilLoadingContainer}>
        <FontAwesomeIcon icon={faSpinner} spin className={styles.perfilSpinner} />
        <p>Cargando perfil...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.perfilErrorMessage}>
        <FontAwesomeIcon icon={faTimesCircle} className={styles.perfilErrorIcon} />
        <p>{error}</p>
        <button onClick={() => navigate(-1)} className={styles.perfilBackButton}>
          Volver
        </button>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className={styles.perfilNoDataMessage}>
        <FontAwesomeIcon icon={faInfoCircle} className={styles.perfilInfoIcon} />
        <p>No se encontraron datos de perfil.</p>
        <button onClick={() => navigate(-1)} className={styles.perfilBackButton}>
          Volver
        </button>
      </div>
    );
  }

  const isVetOrAdmin = usuario.role === 'veterinario' || usuario.role === 'admin';

  return (
    <motion.div
      className={styles.perfilContainer}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <AnimatePresence>
        {notification && (
          <motion.div
            className={`${styles.perfilNotification} ${styles[notification.type]}`}
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
          >
            <FontAwesomeIcon icon={notification.type === 'success' ? faCheckCircle : faTimesCircle} />
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className={styles.perfilHeader}
        variants={itemVariants}
      >
        <div className={styles.perfilHeaderContent}>
          <motion.div
            className={styles.perfilProfileImageContainer}
            whileHover={{ scale: 1.05 }}
          >
            <img
              src={usuario.imagenPerfil || `https://placehold.co/120x120/00acc1/ffffff?text=${usuario.nombre.charAt(0).toUpperCase()}`}
              alt="Perfil"
              className={styles.perfilProfileImage}
              onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/120x120/00acc1/ffffff?text=${usuario.nombre.charAt(0).toUpperCase()}`; }}
            />
            <button
              className={styles.perfilEditProfileButton}
              onClick={() => navigate('/usuario/perfil/configuracion')}
            >
              <FontAwesomeIcon icon={faEdit} />
            </button>
          </motion.div>
          <div>
            <h1>{usuario.nombre} {usuario.apellido}</h1>
            <p className={styles.perfilUserEmail}>{usuario.email}</p>
            {usuario.role && (
              <div className={styles.perfilMembershipBadge}>
                {usuario.role.charAt(0).toUpperCase() + usuario.role.slice(1)}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <motion.div
        className={styles.perfilInfoCard}
        variants={itemVariants}
        whileHover="hover"
        custom={cardHover}
      >
        <h2 className={styles.perfilCardTitle}>
          <FontAwesomeIcon icon={faUserCircle} className={styles.perfilCardIcon} />
          Información Personal
        </h2>
        <div className={styles.perfilInfoGrid}>
          <div className={styles.perfilInfoItem}>
            <label>Nombre completo</label>
            <p>{usuario.nombre} {usuario.apellido}</p>
          </div>
          <div className={styles.perfilInfoItem}>
            <label>Correo electrónico</label>
            <p>{usuario.email}</p>
          </div>
          <div className={styles.perfilInfoItem}>
            <label>Teléfono</label>
            <p>{usuario.telefono || 'N/A'}</p>
          </div>
          <div className={styles.perfilInfoItem}>
            <label>Dirección</label>
            <p>{usuario.direccion || 'N/A'}</p>
          </div>
          {usuario.tipo_documento && (
            <div className={styles.perfilInfoItem}>
              <label>Documento</label>
              <p>{usuario.tipo_documento}: {usuario.numero_documento}</p>
            </div>
          )}
          {usuario.fecha_nacimiento && (
            <div className={styles.perfilInfoItem}>
              <label>Fecha de Nacimiento</label>
              <p>{new Date(usuario.fecha_nacimiento).toLocaleDateString()}</p>
            </div>
          )}
          {isVetOrAdmin && usuario.experiencia && (
            <div className={styles.perfilInfoItem}>
              <label><FontAwesomeIcon icon={faBriefcase} /> Experiencia</label>
              <p>{usuario.experiencia}</p>
            </div>
          )}
          {isVetOrAdmin && usuario.universidad && (
            <div className={styles.perfilInfoItem}>
              <label><FontAwesomeIcon icon={faGraduationCap} /> Universidad</label>
              <p>{usuario.universidad}</p>
            </div>
          )}
          {isVetOrAdmin && usuario.horario && (
            <div className={styles.perfilInfoItem}>
              <label><FontAwesomeIcon icon={faClock} /> Horario</label>
              <p>{usuario.horario}</p>
            </div>
          )}
        </div>
        <motion.button
          className={styles.perfilEditButton}
          onClick={() => navigate('/usuario/perfil/configuracion')}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <FontAwesomeIcon icon={faEdit} /> Editar información
        </motion.button>
      </motion.div>

      <motion.button
        className={styles.perfilLogoutButton}
        onClick={handleCerrarSesion}
        variants={itemVariants}
        whileHover={{ scale: 1.03, backgroundColor: '#c82333' }}
        whileTap={{ scale: 0.97 }}
      >
        <FontAwesomeIcon icon={faSignOutAlt} /> Cerrar sesión
      </motion.button>
    </motion.div>
  );
};

export default PerfilUsuario;