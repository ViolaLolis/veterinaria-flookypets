import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserCircle, faSignOutAlt, faEdit, faCheckCircle, // Añadidos faEnvelope, faPhone
  faSpinner, faInfoCircle, faTimesCircle, faPaw, faCalendarCheck // Añadidos faMapMarkerAlt, faPaw, faCalendarCheck
} from '@fortawesome/free-solid-svg-icons';
import styles from './Styles/PerfilUsuario.module.css';
import { authFetch } from './api'; // Importa authFetch

const PerfilUsuario = ({ user, setUser }) => { // Recibe user y setUser como props
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  /**
   * Muestra una notificación temporal en la UI.
   * @param {string} message - El mensaje a mostrar.
   * @param {string} type - El tipo de notificación ('success' o 'error').
   */
  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    const timer = setTimeout(() => {
      setNotification(null);
    }, 3000); // La notificación desaparece después de 3 segundos
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
    localStorage.removeItem('user'); // Limpia también el objeto user del localStorage
    setUser(null); // Limpia el estado global del usuario
    showNotification('Sesión cerrada correctamente. Redirigiendo...', 'success');
    setTimeout(() => {
      navigate('/login'); // Redirigir a la página de login
    }, 1500);
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

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <FontAwesomeIcon icon={faSpinner} spin className={styles.spinner} />
        <p>Cargando perfil...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorMessage}>
        <FontAwesomeIcon icon={faTimesCircle} className={styles.errorIcon} />
        <p>{error}</p>
        <button onClick={() => navigate(-1)} className={styles.backButton}>
          Volver
        </button>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className={styles.noDataMessage}>
        <FontAwesomeIcon icon={faInfoCircle} className={styles.infoIcon} />
        <p>No se encontraron datos de perfil.</p>
        <button onClick={() => navigate(-1)} className={styles.backButton}>
          Volver
        </button>
      </div>
    );
  }

  // Determinar si el usuario es veterinario o admin para mostrar campos adicionales
  const isVetOrAdmin = usuario.role === 'veterinario' || usuario.role === 'admin';

  return (
    <motion.div
      className={styles.container}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <AnimatePresence>
        {notification && (
          <motion.div
            className={`${styles.notification} ${styles[notification.type]}`}
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
          >
            <FontAwesomeIcon icon={notification.type === 'success' ? faCheckCircle : faTimesCircle} />
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

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
            <img
              src={usuario.imagenPerfil || `https://placehold.co/150x150/cccccc/ffffff?text=${usuario.nombre.charAt(0)}`}
              alt="Perfil"
              className={styles.profileImage}
              onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/150x150/cccccc/ffffff?text=${usuario.nombre.charAt(0)}`; }}
            />
            <button
              className={styles.editProfileButton}
              onClick={() => navigate('/usuario/perfil/configuracion')}
            >
              <FontAwesomeIcon icon={faEdit} />
            </button>
          </motion.div>
          <div>
            <h1>{usuario.nombre} {usuario.apellido}</h1>
            <p className={styles.userEmail}>{usuario.email}</p>
            {usuario.role && (
              <div className={styles.membershipBadge}>
                {usuario.role.charAt(0).toUpperCase() + usuario.role.slice(1)} {/* Muestra el rol */}
              </div>
            )}
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
          whileHover="hover"
          variants={cardHover}
        >
          <FontAwesomeIcon icon={faPaw} className={styles.statIcon} />
          <h3>{usuario.mascotasRegistradas || 0}</h3> {/* Asume que estos datos vienen de la DB */}
          <p>Mascotas</p>
        </motion.div>
        <motion.div
          className={styles.statCard}
          whileHover="hover"
          variants={cardHover}
        >
          <FontAwesomeIcon icon={faCalendarCheck} className={styles.statIcon} />
          <h3>{usuario.citasRealizadas || 0}</h3> {/* Asume que estos datos vienen de la DB */}
          <p>Citas</p>
        </motion.div>
        <motion.div
          className={styles.statCard}
          whileHover="hover"
          variants={cardHover}
        >
          <FontAwesomeIcon icon={faInfoCircle} className={styles.statIcon} />
          <h3>4.9</h3> {/* Calificación estática, podrías hacerla dinámica */}
          <p>Calificación</p>
        </motion.div>
      </motion.div>

      {/* Información del usuario */}
      <motion.div
        className={styles.infoCard}
        variants={itemVariants}
        whileHover="hover"
        variants={cardHover}
      >
        <h2 className={styles.cardTitle}>
          <FontAwesomeIcon icon={faUserCircle} className={styles.cardIcon} />
          Información Personal
        </h2>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <label>Nombre completo</label>
            <p>{usuario.nombre} {usuario.apellido}</p>
          </div>
          <div className={styles.infoItem}>
            <label>Correo electrónico</label>
            <p>{usuario.email}</p>
          </div>
          <div className={styles.infoItem}>
            <label>Teléfono</label>
            <p>{usuario.telefono || 'N/A'}</p>
          </div>
          <div className={styles.infoItem}>
            <label>Dirección</label>
            <p>{usuario.direccion || 'N/A'}</p>
          </div>
          {usuario.tipo_documento && (
            <div className={styles.infoItem}>
              <label>Documento</label>
              <p>{usuario.tipo_documento}: {usuario.numero_documento}</p>
            </div>
          )}
          {usuario.fecha_nacimiento && (
            <div className={styles.infoItem}>
              <label>Fecha de Nacimiento</label>
              <p>{usuario.fecha_nacimiento.split('T')[0]}</p>
            </div>
          )}
          {isVetOrAdmin && usuario.experiencia && ( // Solo para veterinarios/admin
            <div className={styles.infoItemFull}>
              <label>Experiencia</label>
              <p>{usuario.experiencia}</p>
            </div>
          )}
          {isVetOrAdmin && usuario.universidad && ( // Solo para veterinarios/admin
            <div className={styles.infoItemFull}>
              <label>Universidad</label>
              <p>{usuario.universidad}</p>
            </div>
          )}
          {isVetOrAdmin && usuario.horario && ( // Solo para veterinarios/admin
            <div className={styles.infoItemFull}>
              <label>Horario</label>
              <p>{usuario.horario}</p>
            </div>
          )}
        </div>
        <motion.button
          className={styles.editButton}
          onClick={() => navigate('/usuario/perfil/configuracion')}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <FontAwesomeIcon icon={faEdit} /> Editar información
        </motion.button>
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
