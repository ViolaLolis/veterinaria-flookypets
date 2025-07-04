import React, { useState, useEffect, useCallback, useRef } from 'react';
import styles from './Style/MainVeterinarioStyles.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPaw, faUser,
  faCalendarAlt, faNotesMedical, faCheckCircle,
  faPlus, faHome,
  faSignOutAlt, faTimesCircle, faBell, faExclamationTriangle // Agregado faBell y faExclamationTriangle
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

const MainVeterinario = ({ user, setUser }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [notification, setNotification] = useState(null); // Estado para la notificación simple
  const [notificationTimeout, setNotificationTimeout] = useState(null); // Para limpiar el timeout

  // --- NUEVOS ESTADOS PARA NOTIFICACIONES DEL VETERINARIO ---
  const [vetNotifications, setVetNotifications] = useState([]);
  const [showVetNotificationsMenu, setShowVetNotificationsMenu] = useState(false);
  const vetNotificationsRef = useRef(null);
  // --- FIN NUEVOS ESTADOS ---

  // Función para mostrar notificaciones simples (las que aparecen y desaparecen)
  const showNotification = useCallback((message, type = 'info', duration = 3000) => {
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

  // --- NUEVA FUNCIÓN PARA OBTENER NOTIFICACIONES DEL VETERINARIO (MOCK) ---
  const fetchVetNotifications = useCallback(async (currentVetId) => {
    // Simulamos datos de notificaciones para un veterinario específico
    const mockVetNotificationsData = [
      {
        id_notificacion: 101,
        id_veterinario: 1, // ID del veterinario para el ejemplo
        tipo: 'cita_pendiente_atender',
        mensaje: 'Tienes una cita pendiente para atender a Max de Juan Pérez hoy a las 11:00 AM.',
        leida: false,
        fecha_creacion: '2025-07-03T09:30:00Z',
        referencia_id: 'cita_XYZ123',
      },
      {
        id_notificacion: 102,
        id_veterinario: 1,
        tipo: 'solicitud_cita',
        mensaje: 'Nueva solicitud de cita de Ana López para Rocky el viernes, 5 de julio a las 03:00 PM. Por favor, confirma.',
        leida: false,
        fecha_creacion: '2025-07-02T16:00:00Z',
        referencia_id: 'cita_ABC456',
      },
      {
        id_notificacion: 103,
        id_veterinario: 1,
        tipo: 'recordatorio_medicamento',
        mensaje: 'Recordatorio: Administrar medicamento a Pipo de Luis García a las 05:00 PM.',
        leida: true,
        fecha_creacion: '2025-07-01T10:00:00Z',
        referencia_id: 'mascota_Pipo',
      },
      {
        id_notificacion: 104,
        id_veterinario: 1,
        tipo: 'cita_cancelada',
        mensaje: 'La cita de María Fernández para su gato Félix el 04/07 ha sido cancelada.',
        leida: false,
        fecha_creacion: '2025-07-03T08:00:00Z',
        referencia_id: 'cita_DEF789',
      },
      {
        id_notificacion: 105,
        id_veterinario: 2, // Otra notificación para otro veterinario (no se mostrará para el veterinario 1)
        tipo: 'cita_pendiente_atender',
        mensaje: 'Tienes una cita pendiente para atender a Buddy de Sofia Castro.',
        leida: false,
        fecha_creacion: '2025-07-03T10:00:00Z',
        referencia_id: 'cita_GHI012',
      },
    ];

    // Filtra las notificaciones para el veterinario actual
    const currentVetNotifications = mockVetNotificationsData.filter(
      (n) => n.id_veterinario === currentVetId
    );
    setVetNotifications(currentVetNotifications);
  }, []);

  useEffect(() => {
    // Si el usuario (veterinario) tiene un ID, obtenemos sus notificaciones
    if (user?.id) {
      fetchVetNotifications(user.id);
      // Opcional: Refrescar notificaciones cada cierto tiempo
      const notificationInterval = setInterval(() => {
        fetchVetNotifications(user.id);
      }, 60000); // Cada minuto
      return () => clearInterval(notificationInterval);
    }
  }, [fetchVetNotifications, user]);

  const markVetNotificationAsRead = useCallback((id_notificacion) => {
    setVetNotifications((prevNotifications) =>
      prevNotifications.map((n) =>
        n.id_notificacion === id_notificacion ? { ...n, leida: true } : n
      )
    );
  }, []);

  const unreadVetNotificationsCount = vetNotifications.filter(n => !n.leida).length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (vetNotificationsRef.current && !vetNotificationsRef.current.contains(event.target)) {
        setShowVetNotificationsMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  // --- FIN NUEVAS FUNCIONES Y EFECTOS PARA NOTIFICACIONES ---

  const navigateTo = useCallback((path) => {
    navigate(`/veterinario/${path}`);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    showNotification('¡Hasta pronto! Cerrando tu sesión...', 'success');
    navigate('/login');
  };

  const isDashboard = location.pathname === '/veterinario' ||
    location.pathname === '/veterinario/' ||
    location.pathname === '/veterinario/navegacion';

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
              {user?.imagen_url ? (
                <img
                  src={user.imagen_url}
                  alt="Avatar Veterinario"
                  className={styles.vetAvatarImage}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://placehold.co/150x150/00acc1/ffffff?text=${user?.nombre?.charAt(0) || 'DR'}`;
                  }}
                />
              ) : (
                user?.nombre?.charAt(0).toUpperCase() || 'DR'
              )}
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

              {/* BOTÓN DE NOTIFICACIONES */}
              <motion.li
                whileHover={{ x: 5, backgroundColor: "rgba(0, 188, 212, 0.1)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowVetNotificationsMenu(!showVetNotificationsMenu)}
                className={styles.notificationSidebarItem}
              >
                <div className={styles.vetNavIcon}>
                  <FontAwesomeIcon icon={faBell} />
                </div>
                <span>Notificaciones</span>
                {unreadVetNotificationsCount > 0 && (
                  <span className={styles.notificationBadge}>{unreadVetNotificationsCount}</span>
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
            <Outlet context={{ user, showNotification }} />
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Notificación flotante (para mensajes temporales) */}
      <AnimatePresence>
        {notification && (
          <motion.div
            className={`${styles.floatingNotification} ${styles[notification.type]}`}
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={() => setNotification(null)}
          >
            <FontAwesomeIcon icon={
              notification.type === 'success' ? faCheckCircle :
              notification.type === 'error' ? faTimesCircle :
              faExclamationTriangle
            } className={styles.notificationIcon} />
            <span>{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Menú desplegable de notificaciones del veterinario */}
      <AnimatePresence>
        {showVetNotificationsMenu && (
          <motion.div
            ref={vetNotificationsRef}
            className={styles.vetNotificationsDropdown}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <h3>Notificaciones del Veterinario</h3>
            {vetNotifications.length === 0 ? (
              <p>No tienes notificaciones nuevas.</p>
            ) : (
              <ul>
                {vetNotifications
                  .sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion))
                  .map((notif) => (
                    <li key={notif.id_notificacion} className={notif.leida ? styles.read : styles.unread}>
                      <div className={styles.notificationContent}>
                        <p className={styles.notificationMessage}>{notif.mensaje}</p>
                        <span className={styles.notificationDate}>
                          {new Date(notif.fecha_creacion).toLocaleString()}
                        </span>
                      </div>
                      {!notif.leida && (
                        <button
                          className={styles.markAsReadButton}
                          onClick={() => markVetNotificationAsRead(notif.id_notificacion)}
                          title="Marcar como leída"
                        >
                          ✓
                        </button>
                      )}
                    </li>
                  ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MainVeterinario;