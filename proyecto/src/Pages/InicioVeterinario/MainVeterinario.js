import React, { useState, useEffect } from 'react';
import styles from './Style/MainVeterinarioStyles.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPaw, faUser, 
  faCalendarAlt, faChartLine, 
  faNotesMedical, faCheckCircle, 
  faBell, faSearch, faPlus,
   faSyringe,faUserMd,
  
} from '@fortawesome/free-solid-svg-icons';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

// Animaciones
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
  exit: { opacity: 0 }
};


const MainVeterinario = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab] = useState('hoy');
  const [setStats] = useState({
    totalCitas: 12,
    citasCompletadas: 8,
    pacientesNuevos: 3,
    mascotasAtendidas: 5,
    ingresos: 2450,
    rating: 4.8,
    comentarios: 24
  });

  // Estado para las citas (ejemplo)
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
        foto: "https://images.unsplash.com/photo-1586671267731-da2cf3ceeb80?w=200"
      }
    ],
    proximas: [],
    historial: []
  });

  // Estado para carga y errores
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [setCompletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Recordatorio de vacunación",
      message: "Luna necesita su vacuna antirrábica anual",
      date: "Hace 2 horas",
      read: false,
      icon: faSyringe,
      color: "#FF5252"
    }
  ]);

  // Efecto para simular carga inicial
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Navegación a otras secciones
  const navigateTo = (path) => {
    navigate(`/veterinario/${path}`);
  };

  // Manejo de completar cita con animación
  const handleCompleteAppointment = async (id) => {
    setCompletingId(id);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setCitas(prev => ({
        ...prev,
        hoy: prev.hoy.map(c => 
          c.id === id ? { ...c, estado: 'completada' } : c
        ),
        historial: [
          ...prev.hoy.filter(c => c.id === id).map(c => ({ ...c, estado: 'completada' })),
          ...prev.historial
        ]
      }));
      
      setStats(prev => ({
        ...prev,
        citasCompletadas: prev.citasCompletadas + 1,
        mascotasAtendidas: prev.mascotasAtendidas + 1,
        ingresos: prev.ingresos + 75
      }));

      const citaCompletada = citas.hoy.find(c => c.id === id);
      setNotifications(prev => [
        {
          id: Date.now(),
          title: "Cita completada",
          message: `Has completado la cita con ${citaCompletada.mascota}`,
          date: "Ahora",
          read: false,
          icon: faCheckCircle,
          color: "#4CAF50"
        },
        ...prev
      ]);
    } catch (err) {
      setError("Error al completar la cita");
    } finally {
      setCompletingId(null);
    }
  };

  // Filtrado de citas según pestaña activa y término de búsqueda
  const getFilteredCitas = () => {
    let filtered = [];
    switch(activeTab) {
      case 'hoy': filtered = citas.hoy; break;
      case 'proximas': filtered = citas.proximas; break;
      case 'historial': filtered = citas.historial; break;
      default: filtered = citas.hoy;
    }
    
    if (searchTerm) {
      return filtered.filter(cita => 
        cita.mascota.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cita.propietario.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cita.servicio.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cita.raza.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  };

  const filteredCitas = getFilteredCitas();
  const isDashboard = location.pathname === '/veterinario' || 
                      location.pathname === '/veterinario/' || 
                      location.pathname === '/veterinario/navegacion';

  // Marcar notificaciones como leídas
  const markNotificationsAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

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
            scale: [1, 1.2, 1]
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
          Cargando 
        </motion.p>
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
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <FontAwesomeIcon icon={faPaw} size="2x" color="#00bcd4" />
        </motion.div>
        <p className={styles.vetErrorMessage}>¡Ups! Algo salió mal: {error}</p>
        <motion.button 
          onClick={() => setError(null)}
          className={styles.vetRetryButton}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Reintentar
        </motion.button>
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
      {/* Barra superior */}
      <div className={styles.vetTopBar}>
        <div className={styles.vetSearchBar}>
          <FontAwesomeIcon icon={faSearch} className={styles.vetSearchIcon} />
          <motion.input 
            type="text" 
            placeholder="Buscar citas, mascotas, propietarios..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            whileFocus={{ 
              boxShadow: "0 0 0 2px rgba(0, 188, 212, 0.3)",
              borderColor: "#00bcd4"
            }}
            className={styles.vetSearchInput}
          />
        </div>
        <div className={styles.vetTopBarActions}>
          <div className={styles.vetNotificationWrapper}>
            <motion.button 
              className={styles.vetNotificationButton}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowNotificationPanel(!showNotificationPanel)}
            >
              <FontAwesomeIcon icon={faBell} color="#00bcd4" />
              {notifications.some(n => !n.read) && (
                <motion.span 
                  className={styles.vetNotificationBadge}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  {notifications.filter(n => !n.read).length}
                </motion.span>
              )}
            </motion.button>

            {/* Panel de notificaciones */}
            <AnimatePresence>
              {showNotificationPanel && (
                <motion.div 
                  className={styles.vetNotificationPanel}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ type: "spring", damping: 25 }}
                >
                  <div className={styles.vetNotificationHeader}>
                    <h4>Notificaciones</h4>
                    <button 
                      onClick={markNotificationsAsRead}
                      className={styles.vetMarkAsRead}
                    >
                      Marcar todas como leídas
                    </button>
                  </div>
                  <div className={styles.vetNotificationList}>
                    {notifications.length > 0 ? (
                      notifications.map(notification => (
                        <div 
                          key={notification.id} 
                          className={`${styles.vetNotificationItem} ${!notification.read ? styles.vetUnread : ''}`}
                        >
                          <div 
                            className={styles.vetNotificationIcon}
                            style={{ backgroundColor: `${notification.color}20`, color: notification.color }}
                          >
                            <FontAwesomeIcon icon={notification.icon} />
                          </div>
                          <div className={styles.vetNotificationContent}>
                            <h5>{notification.title}</h5>
                            <p>{notification.message}</p>
                            <span>{notification.date}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className={styles.vetNoNotifications}>
                        <FontAwesomeIcon icon={faBell} size="2x" color="#00bcd4" />
                        <p>No hay notificaciones</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.button 
            className={styles.vetNewAppointmentButton}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigateTo('citas')}
          >
            <FontAwesomeIcon icon={faPlus} />
            <span>Ver Citas</span>
          </motion.button>
        </div>
      </div>

      <div className={styles.vetContentWrapper}>
        {/* Barra lateral */}
        <motion.div 
          className={styles.vetSidebar}
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className={styles.vetSidebarHeader}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className={styles.vetLogoContainer}
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
            >
              DR
            </motion.div>
            <div className={styles.vetUserInfo}>
              <h3>Bienvenido Veterinario</h3>
              <p>Especialista en pequeños animales</p>
            </div>
          </div>
          
          <nav className={styles.vetNavMenu}>
            <ul>
              <motion.li 
                className={isDashboard ? styles.vetActive : ''}
                whileHover={{ x: 5 }}
                onClick={() => navigate('/veterinario/navegacion')}
              >
                <FontAwesomeIcon icon={faCalendarAlt} />
                <span>Inicio pagina</span>
              </motion.li>
              <motion.li 
                whileHover={{ x: 5 }}
                onClick={() => navigateTo('mascotas')}
                className={location.pathname.includes('/veterinario/mascotas') ? styles.vetActive : ''}
              >
                <FontAwesomeIcon icon={faPaw} />
                <span>Mascotas</span>
              </motion.li>
              <motion.li 
                whileHover={{ x: 5 }}
                onClick={() => navigateTo('propietarios')}
                className={location.pathname.includes('/veterinario/propietarios') ? styles.vetActive : ''}
              >
                <FontAwesomeIcon icon={faUser} />
                <span>Propietarios</span>
              </motion.li>
              <motion.li 
                whileHover={{ x: 5 }}
                onClick={() => navigateTo('historiales')}
                className={location.pathname.includes('/veterinario/historiales') ? styles.vetActive : ''}
              >
                <FontAwesomeIcon icon={faNotesMedical} />
                <span>Historiales</span>
              </motion.li>
              <motion.li 
                whileHover={{ x: 5 }}
                onClick={() => navigateTo('citas')}
                className={location.pathname.includes('/veterinario/citas') ? styles.vetActive : ''}
              >
                <FontAwesomeIcon icon={faChartLine} />
                <span>Citas</span>
              </motion.li>
              <motion.li 
                whileHover={{ x: 5 }}
                onClick={() => navigateTo('perfil')}
                className={location.pathname.includes('/veterinario/perfil') ? styles.vetActive : ''}
              >
                <FontAwesomeIcon icon={faUserMd} />
                <span>Perfil</span>
              </motion.li>
            </ul>
          </nav>
          
          <div className={styles.vetQuickActions}>
            <h4>Acciones rápidas</h4>
            <motion.button 
              whileHover={{ x: 5, backgroundColor: "#00bcd4" }}
              onClick={() => navigateTo('citas')}
              className={styles.vetQuickButton}
            >
              <FontAwesomeIcon icon={faPlus} />
              <span>Ver Citas</span>
            </motion.button>
            <motion.button 
              whileHover={{ x: 5, backgroundColor: "#4CAF50" }}
              onClick={() => navigateTo('mascotas/registrar')}
              className={styles.vetQuickButton}
            >
              <FontAwesomeIcon icon={faPaw} />
              <span>Registrar Mascota</span>
            </motion.button>
            <motion.button 
              whileHover={{ x: 5, backgroundColor: "#FF9800" }}
              onClick={() => navigateTo('propietarios/registrar')}
              className={styles.vetQuickButton}
            >
              <FontAwesomeIcon icon={faUser} />
              <span>Agregar Propietario</span>
            </motion.button>
          </div>

          <div className={styles.vetSidebarFooter}>
            <motion.div 
              className={styles.vetStatusCard}
              whileHover={{ scale: 1.02 }}
            >
              <FontAwesomeIcon icon={faUserMd} color="#00bcd4" />
              <div>
                <span>Modo veterinario</span>
                <p>Activo</p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Contenido principal */}
        <div className={styles.vetMainContent}>
          <AnimatePresence mode="wait">
            <Outlet />
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default MainVeterinario;