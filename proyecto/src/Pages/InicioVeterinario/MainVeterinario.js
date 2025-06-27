import React, { useState, useEffect, useCallback } from 'react';
import styles from './Style/MainVeterinarioStyles.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPaw, faUser,
  faCalendarAlt, faNotesMedical, faCheckCircle,
  faPlus,
  faSyringe, faHome,
  faSignOutAlt // Se mantiene faUserMd si aún lo usas en alguna parte, si no, también se puede quitar
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

const MainVeterinario = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // El estado 'stats' y 'citas' se mantienen, aunque 'stats' ya no se usa visualmente.
  // Podrías considerar eliminarlos si no se usan en ningún otro lugar.
  const [stats, setStats] = useState({
    totalCitas: 12,
    citasCompletadas: 8,
    pacientesNuevos: 3,
    mascotasAtendidas: 5,
    ingresos: 2450,
    rating: 4.8,
    comentarios: 24
  });

  const [citas, setCitas] = useState({
    hoy: [
      {
        id: 1,
        fecha: new Date(Date.now() + 3600000 * 2).toISOString(),
        mascota: "Max",
        propietario: "Juan Pérez",
        direccion: "Calle Principal 123",
        servicio: "Consulta general",
        tipoMascota: "Perro",
        raza: "Labrador Retriever",
        edad: "3 años",
        estado: "pendiente",
        notas: "Control anual de salud. Observar posible dermatitis.",
        prioridad: "normal",
        foto: "https://images.unsplash.com/photo-1586671267731-da2cf3ceeb80?w=200",
        color: "#FF9800"
      },
      {
        id: 2,
        fecha: new Date(Date.now() + 3600000 * 4).toISOString(),
        mascota: "Luna",
        propietario: "María Gómez",
        direccion: "Avenida Central 456",
        servicio: "Vacunación",
        tipoMascota: "Gato",
        raza: "Siamés",
        edad: "2 años",
        estado: "confirmada",
        notas: "Vacuna antirrábica anual",
        prioridad: "alta",
        foto: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200",
        color: "#4CAF50"
      }
    ],
    proximas: [],
    historial: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completingId, setCompletingId] = useState(null);
  // Los estados de notificaciones ya no son necesarios si no hay panel de notificaciones
  // const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  // const [notifications, setNotifications] = useState([...]);

  useEffect(() => {
    if (error) return;

    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
      setStats({
        totalCitas: 15,
        citasCompletadas: 10,
        pacientesNuevos: 4,
        mascotasAtendidas: 7,
        ingresos: 3200,
        rating: 4.9,
        comentarios: 28
      });
    }, 1500);
    return () => clearTimeout(timer);
  }, [error]);

  const navigateTo = useCallback((path) => {
    navigate(`/veterinario/${path}`);
  }, [navigate]);

  const handleCompleteAppointment = useCallback(async (id) => {
    setCompletingId(id);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      setCitas(prev => {
        const completedAppointment = prev.hoy.find(c => c.id === id);
        if (!completedAppointment) return prev;

        const updatedHoy = prev.hoy.filter(c => c.id !== id);
        const updatedHistorial = [{ ...completedAppointment, estado: 'completada' }, ...prev.historial];

        return {
          ...prev,
          hoy: updatedHoy,
          historial: updatedHistorial
        };
      });

      setStats(prev => ({
        ...prev,
        citasCompletadas: prev.citasCompletadas + 1,
        mascotasAtendidas: prev.mascotasAtendidas + 1,
        ingresos: prev.ingresos + 75
      }));

      // La lógica de notificación aquí ya no creará una notificación visible para el usuario si se eliminó la UI.
      // Puedes eliminar esta sección si las notificaciones no se mostrarán en absoluto.
      const citaParaNotificacion = citas.hoy.find(c => c.id === id);
      if (citaParaNotificacion) {
        // setNotifications(prev => [ // Esto ya no es necesario si el estado de notificaciones se elimina
        //   {
        //     id: Date.now(),
        //     title: "Cita completada",
        //     message: `Has completado la cita con ${citaParaNotificacion.mascota}`,
        //     date: "Ahora",
        //     read: false,
        //     icon: faCheckCircle,
        //     color: "#4CAF50"
        //   },
        //   ...prev
        // ]);
      }
    } catch (err) {
      console.error("Error al completar la cita:", err);
      setError("Error al completar la cita. Por favor, inténtalo de nuevo.");
    } finally {
      setCompletingId(null);
    }
  }, [citas]);

  const isDashboard = location.pathname === '/veterinario' ||
    location.pathname === '/veterinario/' ||
    location.pathname === '/veterinario/navegacion';

  // Esta función ya no es necesaria si no hay panel de notificaciones
  // const markNotificationsAsRead = useCallback(() => {
  //   setNotifications(prev =>
  //     prev.map(notif => ({ ...notif, read: true }))
  //   );
  //   setShowNotificationPanel(false);
  // }, []);

  if (loading) {
    return (
      <motion.div
        className={styles.vetLoadingContainer}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1],
            y: [0, -10, 0]
          }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
            ease: "easeInOut"
          }}
          className={styles.vetLoadingSpinner}
        >
          <FontAwesomeIcon icon={faPaw} size="3x" color="#00bcd4" />
        </motion.div>
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className={styles.vetLoadingText}
        >
          Cargando tu dashboard...
        </motion.p>
        <motion.div
          className={styles.vetLoadingProgress}
          initial={{ width: 0 }}
          animate={{ width: "80%" }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        className={styles.vetErrorContainer}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring" }}
      >
        <motion.div
          animate={{ scale: [1, 1.05, 1], rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <FontAwesomeIcon icon={faPaw} size="3x" color="#FF5252" />
        </motion.div>
        <p className={styles.vetErrorMessage}>¡Ups! Algo salió mal</p>
        <p className={styles.vetErrorDetail}>{error}</p>
        <div className={styles.vetErrorActions}>
          <motion.button
            onClick={() => setError(null)}
            className={styles.vetRetryButton}
            whileHover={{ scale: 1.05, backgroundColor: "#00bcd4" }}
            whileTap={{ scale: 0.95 }}
          >
            Reintentar
          </motion.button>
          <motion.button
            onClick={() => navigate('/')}
            className={styles.vetHomeButton}
            whileHover={{ scale: 1.05, backgroundColor: "#4CAF50" }}
            whileTap={{ scale: 0.95 }}
          >
            <FontAwesomeIcon icon={faHome} />
            Volver al inicio
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={styles.vetMainContainer}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* La barra superior, el widget de estadísticas rápidas, y la sección de utilidades han sido eliminados */}

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
              DR
            </motion.div>
            <div className={styles.vetUserInfo}>
              <h3>Dr. Veterinario</h3>
              <p>Especialista en pequeños animales</p>
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

              {/* Se han eliminado las opciones de "Reportes" y "Configuración" */}
              {/*
              <motion.li
                whileHover={{ x: 5, backgroundColor: "rgba(0, 188, 212, 0.1)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigateTo('reportes')}
                className={location.pathname.includes('/veterinario/reportes') ? styles.vetActive : ''}
              >
                <div className={styles.vetNavIcon}>
                  <FontAwesomeIcon icon={faChartLine} />
                </div>
                <span>Reportes</span>
                {location.pathname.includes('/veterinario/reportes') && (
                  <motion.div className={styles.vetActiveIndicator} layoutId="activeIndicator" />
                )}
              </motion.li>

              <motion.li
                whileHover={{ x: 5, backgroundColor: "rgba(0, 188, 212, 0.1)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigateTo('configuracion')}
                className={location.pathname.includes('/veterinario/configuracion') ? styles.vetActive : ''}
              >
                <div className={styles.vetNavIcon}>
                  <FontAwesomeIcon icon={faCog} />
                </div>
                <span>Configuración</span>
                {location.pathname.includes('/veterinario/configuracion') && (
                  <motion.div className={styles.vetActiveIndicator} layoutId="activeIndicator" />
                )}
              </motion.li>
              */}
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
              onClick={() => navigateTo('propietarios/registrar')}
              className={styles.vetQuickButton}
            >
              <FontAwesomeIcon icon={faUser} />
              <span>Agregar Propietario</span>
            </motion.button>
          </div>

          {/* Las secciones de "Utilidades" (notificaciones) y el "Modo veterinario activo" han sido eliminadas */}

          <div className={styles.vetSidebarFooter}>
            <motion.button
              className={styles.vetLogoutButton}
              whileHover={{ x: 5, backgroundColor: "rgba(255, 82, 82, 0.1)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/')}
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
            <Outlet />
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default MainVeterinario;