// src/Pages/InicioVeterinario/MainVeterinario.js
import React, { useState, useEffect, useCallback } from 'react';
import styles from './Style/MainVeterinarioStyles.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPaw, faUser,
  faCalendarAlt, faNotesMedical, faCheckCircle,
  faPlus, faHome,
  faSignOutAlt, faTimesCircle // Agregado faTimesCircle para notificaciones de error
} from '@fortawesome/free-solid-svg-icons';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

// Animaciones mejoradas
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  },
  exit: { opacity: 0, transition: { duration: 0.3 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

const MainVeterinario = ({ user, setUser }) => { // Recibe user y setUser como props
  const location = useLocation();
  const navigate = useNavigate();

  const [notification, setNotification] = useState(null); // Estado para la notificación
  const [notificationTimeout, setNotificationTimeout] = useState(null); // Para limpiar el timeout

  // Función para mostrar notificaciones
  const showNotification = useCallback((message, type = 'info', duration = 3000) => {
    // Limpiar cualquier timeout existente para que la nueva notificación se muestre inmediatamente
    if (notificationTimeout) {
      clearTimeout(notificationTimeout);
    }

    setNotification({ message, type });

    const timeout = setTimeout(() => {
      setNotification(null);
    }, duration);
    setNotificationTimeout(timeout);
  }, [notificationTimeout]);

  // Limpiar el timeout al desmontar el componente
  useEffect(() => {
    return () => {
      if (notificationTimeout) {
        clearTimeout(notificationTimeout);
      }
    };
  }, [notificationTimeout]);

  // Add this console.log for debugging context
  useEffect(() => {
    console.log("MainVeterinario rendering. User:", user);
    console.log("Context passed to Outlet:", { user, showNotification });
  }, [user, showNotification]); // Log when user or showNotification changes


  const navigateTo = useCallback((path) => {
    navigate(`/veterinario/${path}`);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null); // Limpiar el estado del usuario en App.js
    navigate('/login');
  };

  const isDashboard = location.pathname === '/veterinario' ||
    location.pathname === '/veterinario/' ||
    location.pathname === '/veterinario/navegacion';

  // No necesitamos estados de carga y error aquí, ya que los componentes hijos los manejarán
  // y usarán showNotification para comunicar mensajes.

  // NOTE: The original code had a loading state and error state here.
  // If you intend to have a global loading/error for the MainVeterinario component itself,
  // you would need to re-implement that logic. For now, I'm assuming child components
  // will handle their own loading/error and use the showNotification.

  // Removed direct loading/error states from MainVeterinario to avoid conflicts
  // with child components' loading/error states and simplify the main layout.
  // If you need a global loading overlay for the entire veterinary section,
  // consider adding it here, but ensure it doesn't block child component rendering.

  return (
    <motion.div
      className={styles.vetMainContainer}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className={styles.vetContentWrapper}>
        {/* Barra lateral */}
        <motion.div
          className={styles.vetSidebar}
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
        >
          <div className={styles.vetSidebarHeader}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className={styles.vetLogoContainer}
              onClick={() => navigate('/veterinario')}
            >
              <FontAwesomeIcon icon={faPaw} className={styles.vetLogoIcon} />
              <h2>Flooky Pets</h2>
            </motion.div>
            <p className={styles.vetClinicName}>Centro Veterinario</p>
          </div>

          <div className={styles.vetUserProfile}>
            <motion.div
              className={styles.vetAvatar}
              whileHover={{ rotate: 5, scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {user?.nombre?.charAt(0).toUpperCase() || 'DR'}
            </motion.div>
            <div className={styles.vetUserInfo}>
              <h3>{user?.nombre || 'Dr. Veterinario'}</h3>
              <p>{user?.experiencia || 'Especialista'}</p>
              <motion.button
                className={styles.vetProfileButton}
                whileHover={{ backgroundColor: "rgba(0, 188, 212, 0.2)" }}
                onClick={() => navigateTo('perfil')}
              >
                Ver perfil
              </motion.button>
            </div>
          </div>

          <nav className={styles.vetNavMenu}>
            <ul>
              <motion.li
                className={isDashboard ? styles.vetActive : ''}
                whileHover={{ x: 5, backgroundColor: "rgba(0, 188, 212, 0.1)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/veterinario/navegacion')}
              >
                <div className={styles.vetNavIcon}>
                  <FontAwesomeIcon icon={faHome} />
                </div>
                <span>Inicio</span>
                {isDashboard && <motion.div className={styles.vetActiveIndicator} layoutId="activeIndicator" />}
              </motion.li>

              <motion.li
                whileHover={{ x: 5, backgroundColor: "rgba(0, 188, 212, 0.1)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigateTo('mascotas')}
                className={location.pathname.includes('/veterinario/mascotas') ? styles.vetActive : ''}
              >
                <div className={styles.vetNavIcon}>
                  <FontAwesomeIcon icon={faPaw} />
                </div>
                <span>Mascotas</span>
                {location.pathname.includes('/veterinario/mascotas') && (
                  <motion.div className={styles.vetActiveIndicator} layoutId="activeIndicator" />
                )}
              </motion.li>

              <motion.li
                whileHover={{ x: 5, backgroundColor: "rgba(0, 188, 212, 0.1)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigateTo('propietarios')}
                className={location.pathname.includes('/veterinario/propietarios') ? styles.vetActive : ''}
              >
                <div className={styles.vetNavIcon}>
                  <FontAwesomeIcon icon={faUser} />
                </div>
                <span>Propietarios</span>
                {location.pathname.includes('/veterinario/propietarios') && (
                  <motion.div className={styles.vetActiveIndicator} layoutId="activeIndicator" />
                )}
              </motion.li>

              <motion.li
                whileHover={{ x: 5, backgroundColor: "rgba(0, 188, 212, 0.1)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigateTo('historiales')}
                className={location.pathname.includes('/veterinario/historiales') ? styles.vetActive : ''}
              >
                <div className={styles.vetNavIcon}>
                  <FontAwesomeIcon icon={faNotesMedical} />
                </div>
                <span>Historiales</span>
                {location.pathname.includes('/veterinario/historiales') && (
                  <motion.div className={styles.vetActiveIndicator} layoutId="activeIndicator" />
                )}
              </motion.li>

              <motion.li
                whileHover={{ x: 5, backgroundColor: "rgba(0, 188, 212, 0.1)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigateTo('citas')}
                className={location.pathname.includes('/veterinario/citas') ? styles.vetActive : ''}
              >
                <div className={styles.vetNavIcon}>
                  <FontAwesomeIcon icon={faCalendarAlt} />
                </div>
                <span>Citas</span>
                {location.pathname.includes('/veterinario/citas') && (
                  <motion.div className={styles.vetActiveIndicator} layoutId="activeIndicator" />
                )}
              </motion.li>
            </ul>
          </nav>

          <div className={styles.vetQuickActions}>
            <h4>Acciones rápidas</h4>
            <motion.button
              whileHover={{ x: 5, backgroundColor: "#00bcd4", color: "white" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigateTo('citas/agendar')}
              className={styles.vetQuickButton}
            >
              <FontAwesomeIcon icon={faPlus} />
              <span>Nueva Cita</span>
            </motion.button>
            <motion.button
              whileHover={{ x: 5, backgroundColor: "#4CAF50", color: "white" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigateTo('mascotas/registrar')}
              className={styles.vetQuickButton}
            >
              <FontAwesomeIcon icon={faPaw} />
              <span>Registrar Mascota</span>
            </motion.button>
            <motion.button
              whileHover={{ x: 5, backgroundColor: "#FF9800", color: "white" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigateTo('historiales/registrar')}
              className={styles.vetQuickButton}
            >
              <FontAwesomeIcon icon={faNotesMedical} />
              <span>Registrar Historial</span>
            </motion.button>
          </div>

          <div className={styles.vetSidebarFooter}>
            <motion.button
              className={styles.vetLogoutButton}
              whileHover={{ x: 5, backgroundColor: "rgba(255, 82, 82, 0.1)" }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
            >
              <FontAwesomeIcon icon={faSignOutAlt} color="#FF5252" />
              <span>Cerrar sesión</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Contenido principal */}
        <motion.div
          className={styles.vetMainContent}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <AnimatePresence mode="wait">
            {/* Pasa el usuario y la función de notificación a los componentes hijos */}
            <Outlet context={{ user, showNotification }} />
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Notificación flotante */}
      <AnimatePresence>
        {notification && (
          <motion.div
            className={`${styles.floatingNotification} ${styles[notification.type]}`}
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={() => setNotification(null)} // Cierra la notificación al hacer clic
          >
            <FontAwesomeIcon icon={notification.type === 'success' ? faCheckCircle : faTimesCircle} className={styles.notificationIcon} />
            <span>{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MainVeterinario;