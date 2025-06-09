import React, { useState, useEffect } from 'react';
import styles from './Style/MainVeterinarioStyles.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faClock, faPaw, faUser, faMapMarkerAlt, 
  faCalendarAlt, faChartLine, faDog, faCat, 
  faNotesMedical, faCheckCircle, faSpinner,
  faBell, faSearch, faPlus, faEllipsisV,
  faStethoscope, faSyringe, faWeight, faHeart,
  faBone, faPills, faShieldAlt, faClipboard,
  faUserMd, faClinicMedical, faProcedures,
  faDollarSign // Agregamos esta importación
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

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10
    }
  },
  hover: { 
    scale: 1.03, 
    boxShadow: "0px 10px 25px rgba(0, 188, 212, 0.15)",
    transition: { duration: 0.3 }
  }
};

const statCardVariants = {
  hover: {
    y: -5,
    boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.1)",
    transition: { duration: 0.2 }
  }
};

const MainVeterinario = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('hoy');
  const [stats, setStats] = useState({
    totalCitas: 12,
    citasCompletadas: 8,
    pacientesNuevos: 3,
    mascotasAtendidas: 5,
    ingresos: 2450
  });

  // Estado mejorado para las citas
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
      },
      {
        id: 2,
        fecha: new Date(Date.now() + 3600000 * 4).toISOString(),
        mascota: "Luna",
        propietario: "María García",
        direccion: "Avenida Central 456",
        servicio: "Vacunación anual",
        tipoMascota: "Gato",
        raza: "Siamés",
        edad: "2 años",
        estado: "pendiente",
        notas: "Vacuna antirrábica y triple felina.",
        prioridad: "alta",
        foto: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200"
      }
    ],
    proximas: [
      {
        id: 3,
        fecha: new Date(Date.now() + 86400000).toISOString(),
        mascota: "Rocky",
        propietario: "Carlos López",
        direccion: "Boulevard Norte 789",
        servicio: "Control de peso",
        tipoMascota: "Perro",
        raza: "Bulldog Francés",
        edad: "4 años",
        estado: "pendiente",
        notas: "Seguimiento de dieta para reducción de peso.",
        prioridad: "normal",
        foto: "https://images.unsplash.com/photo-1544568100-847a948585b9?w=200"
      },
      {
        id: 4,
        fecha: new Date(Date.now() + 86400000 * 3).toISOString(),
        mascota: "Bella",
        propietario: "Ana Martínez",
        direccion: "Calle Sur 321",
        servicio: "Desparasitación",
        tipoMascota: "Perro",
        raza: "Golden Retriever",
        edad: "5 años",
        estado: "pendiente",
        notas: "Administración de antiparasitario interno y externo.",
        prioridad: "normal",
        foto: "https://images.unsplash.com/photo-1588943211346-0908a1fb0b01?w=200"
      }
    ],
    historial: [
      {
        id: 5,
        fecha: new Date(Date.now() - 86400000).toISOString(),
        mascota: "Thor",
        propietario: "Pedro Sánchez",
        direccion: "Avenida Este 654",
        servicio: "Consulta de urgencia",
        tipoMascota: "Perro",
        raza: "Pastor Alemán",
        edad: "6 años",
        estado: "completada",
        notas: "Dolor abdominal. Diagnóstico: gastritis. Tratamiento administrado.",
        prioridad: "alta",
        foto: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=200"
      },
      {
        id: 6,
        fecha: new Date(Date.now() - 86400000 * 2).toISOString(),
        mascota: "Mishi",
        propietario: "Luisa Fernández",
        direccion: "Calle Oeste 987",
        servicio: "Castración",
        tipoMascota: "Gato",
        raza: "Mestizo",
        edad: "1 año",
        estado: "completada",
        notas: "Procedimiento exitoso. Control postoperatorio en 7 días.",
        prioridad: "normal",
        foto: "https://images.unsplash.com/photo-1519052537078-e6302a4968d4?w=200"
      }
    ]
  });

  // Estado para carga y errores
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [completingId, setCompletingId] = useState(null);
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
    },
    {
      id: 2,
      title: "Nuevo mensaje",
      message: "Juan Pérez ha enviado una consulta sobre Max",
      date: "Hace 1 día",
      read: false,
      icon: faUser,
      color: "#2196F3"
    },
    {
      id: 3,
      title: "Recordatorio de cita",
      message: "Cita con Rocky mañana a las 10:00 AM",
      date: "Hace 2 días",
      read: true,
      icon: faCalendarAlt,
      color: "#4CAF50"
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

  // Manejo de completar cita con animación
  const handleCompleteAppointment = async (id) => {
    setCompletingId(id);
    try {
      // Simulación de llamada API
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
        ingresos: prev.ingresos + 75 // Simulación de ingreso por cita
      }));

      // Añadir notificación
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

  // Navegación a otras secciones
  const navigateTo = (path) => {
    navigate(`/veterinario/${path}`);
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
  const isDashboard = location.pathname === '/veterinario' || location.pathname === '/veterinario/';

  // Marcar notificaciones como leídas
  const markNotificationsAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  if (loading) {
    return (
      <motion.div 
        className={styles.loadingContainer}
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
          className={styles.loadingSpinner}
        >
          <FontAwesomeIcon icon={faPaw} size="3x" />
        </motion.div>
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          Cargando tu dashboard...
        </motion.p>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        className={styles.errorContainer}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring" }}
      >
        <motion.div 
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <FontAwesomeIcon icon={faPaw} size="2x" />
        </motion.div>
        <p>¡Ups! Algo salió mal: {error}</p>
        <motion.button 
          onClick={() => setError(null)}
          className={styles.retryButton}
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
      className={styles.mainContainer}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Barra superior */}
      <div className={styles.topBar}>
        <div className={styles.searchBar}>
          <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
          <motion.input 
            type="text" 
            placeholder="Buscar citas, pacientes, razas..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            whileFocus={{ 
              boxShadow: "0 0 0 2px rgba(0, 188, 212, 0.3)",
              borderColor: "#00bcd4"
            }}
          />
        </div>
        <div className={styles.topBarActions}>
          <div className={styles.notificationWrapper}>
            <motion.button 
              className={styles.notificationButton}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowNotificationPanel(!showNotificationPanel)}
            >
              <FontAwesomeIcon icon={faBell} />
              {notifications.some(n => !n.read) && (
                <motion.span 
                  className={styles.notificationBadge}
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
                  className={styles.notificationPanel}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ type: "spring", damping: 25 }}
                >
                  <div className={styles.notificationHeader}>
                    <h4>Notificaciones</h4>
                    <button 
                      onClick={markNotificationsAsRead}
                      className={styles.markAsRead}
                    >
                      Marcar todas como leídas
                    </button>
                  </div>
                  <div className={styles.notificationList}>
                    {notifications.length > 0 ? (
                      notifications.map(notification => (
                        <div 
                          key={notification.id} 
                          className={`${styles.notificationItem} ${!notification.read ? styles.unread : ''}`}
                        >
                          <div 
                            className={styles.notificationIcon}
                            style={{ backgroundColor: `${notification.color}20`, color: notification.color }}
                          >
                            <FontAwesomeIcon icon={notification.icon} />
                          </div>
                          <div className={styles.notificationContent}>
                            <h5>{notification.title}</h5>
                            <p>{notification.message}</p>
                            <span>{notification.date}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className={styles.noNotifications}>
                        <FontAwesomeIcon icon={faBell} size="2x" />
                        <p>No hay notificaciones</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.button 
            className={styles.newAppointmentButton}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigateTo('nueva-cita')}
          >
            <FontAwesomeIcon icon={faPlus} />
            <span>Nueva cita</span>
          </motion.button>
        </div>
      </div>

      <div className={styles.contentWrapper}>
        {/* Barra lateral */}
        <motion.div 
          className={styles.sidebar}
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className={styles.sidebarHeader}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className={styles.logoContainer}
            >
              <FontAwesomeIcon icon={faPaw} className={styles.logoIcon} />
              <h2>Flowy Pets</h2>
            </motion.div>
            <p>Centro Veterinario</p>
          </div>
          
          <div className={styles.userProfile}>
            <motion.div 
              className={styles.avatar}
              whileHover={{ rotate: 5, scale: 1.1 }}
            >
              DR
            </motion.div>
            <div className={styles.userInfo}>
              <h3>Dr. Veterinario</h3>
              <p>Especialista en pequeños animales</p>
            </div>
          </div>
          
          <nav className={styles.navMenu}>
            <ul>
              <motion.li 
                className={location.pathname === '/veterinario' ? styles.active : ''}
                whileHover={{ x: 5 }}
                onClick={() => navigate('/veterinario')}
              >
                <FontAwesomeIcon icon={faCalendarAlt} />
                <span>Dashboard</span>
              </motion.li>
              <motion.li 
                whileHover={{ x: 5 }}
                onClick={() => navigateTo('pacientes')}
              >
                <FontAwesomeIcon icon={faPaw} />
                <span>Pacientes</span>
              </motion.li>
              <motion.li 
                whileHover={{ x: 5 }}
                onClick={() => navigateTo('clientes')}
              >
                <FontAwesomeIcon icon={faUser} />
                <span>Clientes</span>
              </motion.li>
              <motion.li 
                whileHover={{ x: 5 }}
                onClick={() => navigateTo('historiales')}
              >
                <FontAwesomeIcon icon={faNotesMedical} />
                <span>Historiales</span>
              </motion.li>
              <motion.li 
                whileHover={{ x: 5 }}
                onClick={() => navigateTo('reportes')}
              >
                <FontAwesomeIcon icon={faChartLine} />
                <span>Reportes</span>
              </motion.li>
              <motion.li 
                whileHover={{ x: 5 }}
                onClick={() => navigateTo('clinica')}
              >
                <FontAwesomeIcon icon={faClinicMedical} />
                <span>Clínica</span>
              </motion.li>
            </ul>
          </nav>
          
          <div className={styles.quickActions}>
            <h4>Acciones rápidas</h4>
            <motion.button 
              whileHover={{ x: 5, backgroundColor: "#00bcd4" }}
              onClick={() => navigateTo('nueva-cita')}
            >
              <FontAwesomeIcon icon={faPlus} />
              <span>Agendar cita</span>
            </motion.button>
            <motion.button 
              whileHover={{ x: 5, backgroundColor: "#4CAF50" }}
              onClick={() => navigateTo('nuevo-paciente')}
            >
              <FontAwesomeIcon icon={faPaw} />
              <span>Registrar paciente</span>
            </motion.button>
            <motion.button 
              whileHover={{ x: 5, backgroundColor: "#FF9800" }}
              onClick={() => navigateTo('nuevo-cliente')}
            >
              <FontAwesomeIcon icon={faUser} />
              <span>Agregar cliente</span>
            </motion.button>
          </div>

          <div className={styles.sidebarFooter}>
            <motion.div 
              className={styles.statusCard}
              whileHover={{ scale: 1.02 }}
            >
              <FontAwesomeIcon icon={faUserMd} />
              <div>
                <span>Modo veterinario</span>
                <p>Activo</p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Contenido principal */}
        <div className={styles.mainContent}>
          <AnimatePresence mode="wait">
            {isDashboard ? (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Encabezado */}
                <div className={styles.header}>
                  <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    Bienvenido, <span>Dr. Veterinario</span>
                  </motion.h1>
                  <motion.p 
                    className={styles.subtitle}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    Resumen de actividades y citas - {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </motion.p>
                </div>

                {/* Tarjetas de estadísticas */}
                <motion.div 
                  className={styles.statsContainer}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  {[
                    { 
                      icon: faCalendarAlt, 
                      value: stats.totalCitas, 
                      label: "Citas totales",
                      color: "#00bcd4",
                      bgColor: "rgba(0, 188, 212, 0.1)",
                      trend: "up"
                    },
                    { 
                      icon: faChartLine, 
                      value: stats.citasCompletadas, 
                      label: "Citas completadas",
                      color: "#4CAF50",
                      bgColor: "rgba(76, 175, 80, 0.1)",
                      trend: "up"
                    },
                    { 
                      icon: faUser, 
                      value: stats.pacientesNuevos, 
                      label: "Pacientes nuevos",
                      color: "#FF9800",
                      bgColor: "rgba(255, 152, 0, 0.1)",
                      trend: "up"
                    },
                    { 
                      icon: faPaw, 
                      value: stats.mascotasAtendidas, 
                      label: "Mascotas atendidas",
                      color: "#9C27B0",
                      bgColor: "rgba(156, 39, 176, 0.1)",
                      trend: "steady"
                    },
                    { 
                      icon: faDollarSign, 
                      value: `$${stats.ingresos}`, 
                      label: "Ingresos hoy",
                      color: "#8BC34A",
                      bgColor: "rgba(139, 195, 74, 0.1)",
                      trend: "up"
                    }
                  ].map((stat, index) => (
                    <motion.div
                      key={index}
                      className={styles.statCard}
                      variants={statCardVariants}
                      whileHover="hover"
                      onClick={() => navigateTo(stat.label.includes('Citas') ? 'citas' : stat.label.includes('Pacientes') ? 'pacientes' : 'reportes')}
                    >
                      <div 
                        className={styles.statIcon} 
                        style={{ backgroundColor: stat.bgColor }}
                      >
                        <FontAwesomeIcon icon={stat.icon} style={{ color: stat.color }} />
                      </div>
                      <div className={styles.statContent}>
                        <h3>{stat.value}</h3>
                        <p>{stat.label}</p>
                        {stat.trend === "up" && (
                          <motion.span 
                            className={styles.trendUp}
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                          >
                            ↑ 12%
                          </motion.span>
                        )}
                        {stat.trend === "steady" && (
                          <span className={styles.trendSteady}>→ 0%</span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Sección de citas */}
                <div className={styles.citasSection}>
                  <div className={styles.sectionHeader}>
                    <div className={styles.sectionTitle}>
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 3 }}
                      >
                        <FontAwesomeIcon icon={faNotesMedical} className={styles.sectionIcon} />
                      </motion.div>
                      <h2>
                        {activeTab === 'hoy' ? 'Citas para Hoy' : 
                        activeTab === 'proximas' ? 'Próximas Citas' : 'Historial de Citas'}
                      </h2>
                    </div>
                    
                    <div className={styles.tabsContainer}>
                      {['hoy', 'proximas', 'historial'].map((tab) => (
                        <motion.button
                          key={tab}
                          className={`${styles.tabButton} ${activeTab === tab ? styles.activeTab : ''}`}
                          onClick={() => setActiveTab(tab)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 + (tab === 'hoy' ? 0 : tab === 'proximas' ? 0.1 : 0.2) }}
                        >
                          {tab === 'hoy' ? 'Hoy' : tab === 'proximas' ? 'Próximas' : 'Historial'}
                          {activeTab === tab && (
                            <motion.span 
                              className={styles.tabIndicator}
                              layoutId="tabIndicator"
                              transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {filteredCitas.length > 0 ? (
                    <motion.div 
                      className={styles.citasGrid}
                      initial="hidden"
                      animate="visible"
                      variants={{
                        hidden: { opacity: 0 },
                        visible: {
                          opacity: 1,
                          transition: {
                            staggerChildren: 0.1,
                            delayChildren: 0.3
                          }
                        }
                      }}
                    >
                      {filteredCitas.map((cita) => (
                        <motion.div
                          key={cita.id}
                          className={`${styles.citaCard} ${cita.estado === 'completada' ? styles.completed : ''} ${cita.prioridad === 'alta' ? styles.highPriority : ''}`}
                          variants={cardVariants}
                          whileHover="hover"
                          layout
                        >
                          <div className={styles.citaHeader}>
                            <div className={styles.citaTime}>
                              <FontAwesomeIcon icon={faClock} />
                              <span>
                                {new Date(cita.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <div className={styles.citaDate}>
                              {new Date(cita.fecha).toLocaleDateString()}
                            </div>
                            <div className={styles.citaPriority}>
                              {cita.prioridad === 'alta' && (
                                <motion.span 
                                  className={styles.priorityBadge}
                                  animate={{ 
                                    backgroundColor: ["#FF5252", "#FF4081", "#FF5252"],
                                    boxShadow: ["0 0 0 0 rgba(255, 82, 82, 0.7)", "0 0 0 10px rgba(255, 82, 82, 0)", "0 0 0 0 rgba(255, 82, 82, 0)"]
                                  }}
                                  transition={{ 
                                    repeat: Infinity, 
                                    duration: 2 
                                  }}
                                >
                                  Alta prioridad
                                </motion.span>
                              )}
                            </div>
                          </div>

                          <div className={styles.citaContent}>
                            <div className={styles.petInfo}>
                              <div className={styles.petImage}>
                                <img src={cita.foto} alt={cita.mascota} />
                              </div>
                              <div className={styles.petDetails}>
                                <h3>{cita.mascota}</h3>
                                <p>{cita.propietario}</p>
                                <div className={styles.petMeta}>
                                  <span>{cita.raza}</span>
                                  <span>{cita.edad}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className={styles.citaDetails}>
                              <div className={styles.detailItem}>
                                <FontAwesomeIcon icon={faMapMarkerAlt} />
                                <span>{cita.direccion}</span>
                              </div>
                              <div className={styles.detailItem}>
                                {cita.servicio === 'Consulta general' && <FontAwesomeIcon icon={faStethoscope} />}
                                {cita.servicio.includes('Vacunación') && <FontAwesomeIcon icon={faSyringe} />}
                                {cita.servicio.includes('peso') && <FontAwesomeIcon icon={faWeight} />}
                                {cita.servicio.includes('Desparasitación') && <FontAwesomeIcon icon={faPills} />}
                                {cita.servicio.includes('urgencia') && <FontAwesomeIcon icon={faProcedures} />}
                                <span>{cita.servicio}</span>
                              </div>
                              {cita.notas && (
                                <div className={styles.detailItem}>
                                  <FontAwesomeIcon icon={faClipboard} />
                                  <span className={styles.notes}>{cita.notas}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className={styles.citaFooter}>
                            {cita.estado === 'pendiente' ? (
                              <motion.button
                                className={styles.completeButton}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleCompleteAppointment(cita.id)}
                                disabled={completingId === cita.id}
                              >
                                {completingId === cita.id ? (
                                  <>
                                    <FontAwesomeIcon icon={faSpinner} spin />
                                    <span>Procesando...</span>
                                  </>
                                ) : (
                                  <>
                                    <FontAwesomeIcon icon={faCheckCircle} />
                                    <span>Marcar como completada</span>
                                  </>
                                )}
                              </motion.button>
                            ) : (
                              <div className={styles.completedLabel}>
                                <FontAwesomeIcon icon={faCheckCircle} />
                                <span>COMPLETADA</span>
                              </div>
                            )}
                            
                            <motion.button 
                              className={styles.moreOptions}
                              whileHover={{ rotate: 90 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <FontAwesomeIcon icon={faEllipsisV} />
                            </motion.button>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div 
                      className={styles.noCitas}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: "spring" }}
                    >
                      <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 3 }}
                      >
                        <FontAwesomeIcon icon={faCalendarAlt} size="3x" className={styles.noCitasIcon} />
                      </motion.div>
                      <h3>
                        {activeTab === 'hoy' ? 'No hay citas para hoy' : 
                        activeTab === 'proximas' ? 'No hay próximas citas programadas' : 
                        'No hay citas en el historial'}
                      </h3>
                      <p>
                        {activeTab === 'hoy' ? 'Parece que tienes un día tranquilo. ¡Aprovecha para actualizar historiales médicos!' : 
                        activeTab === 'proximas' ? 'Cuando programes nuevas citas, aparecerán aquí.' : 
                        'Todavía no hay citas completadas en el historial.'}
                      </p>
                      {activeTab !== 'historial' && (
                        <motion.button 
                          className={styles.scheduleButton}
                          onClick={() => navigateTo('nueva-cita')}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FontAwesomeIcon icon={faPlus} />
                          <span>Agendar nueva cita</span>
                        </motion.button>
                      )}
                    </motion.div>
                  )}
                </div>

                {/* Sección inferior */}
                <div className={styles.bottomSection}>
                  {/* Consejos del día */}
                  <div className={styles.tipsSection}>
                    <motion.h3
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                    >
                      Consejos del día
                    </motion.h3>
                    <div className={styles.tipsGrid}>
                      {[
                        {
                          title: "Control de vacunas",
                          content: "Recuerda verificar el esquema de vacunación en cada consulta.",
                          icon: faSyringe,
                          color: "#4CAF50",
                          delay: 0.9
                        },
                        {
                          title: "Nutrición",
                          content: "Revisa la dieta de tus pacientes y recomienda ajustes según su edad y condición.",
                          icon: faWeight,
                          color: "#FF9800",
                          delay: 1.0
                        },
                        {
                          title: "Prevención",
                          content: "Educa a los dueños sobre la importancia de la prevención de parásitos.",
                          icon: faShieldAlt,
                          color: "#2196F3",
                          delay: 1.1
                        },
                        {
                          title: "Historial completo",
                          content: "Actualiza el historial médico con cada visita para un mejor seguimiento.",
                          icon: faNotesMedical,
                          color: "#9C27B0",
                          delay: 1.2
                        }
                      ].map((tip, index) => (
                        <motion.div
                          key={index}
                          className={styles.tipCard}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: tip.delay }}
                          whileHover={{ 
                            y: -5,
                            boxShadow: "0px 10px 25px rgba(0, 0, 0, 0.1)"
                          }}
                        >
                          <div 
                            className={styles.tipIcon} 
                            style={{ 
                              backgroundColor: `${tip.color}20`, 
                              color: tip.color,
                              boxShadow: `0 5px 15px ${tip.color}40`
                            }}
                          >
                            <FontAwesomeIcon icon={tip.icon} />
                          </div>
                          <h4>{tip.title}</h4>
                          <p>{tip.content}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Recordatorios */}
                  <div className={styles.remindersSection}>
                    <motion.h3
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.3 }}
                    >
                      Recordatorios
                    </motion.h3>
                    <motion.div 
                      className={styles.remindersList}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.4 }}
                    >
                      <div className={styles.reminderItem}>
                        <div 
                          className={styles.reminderIcon}
                          style={{ backgroundColor: "rgba(255, 152, 0, 0.1)", color: "#FF9800" }}
                        >
                          <FontAwesomeIcon icon={faWeight} />
                        </div>
                        <div className={styles.reminderContent}>
                          <h4>Control de peso para Rocky</h4>
                          <p>Próximo control en 2 semanas</p>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={styles.reminderButton}
                          >
                            Programar cita
                          </motion.button>
                        </div>
                      </div>
                      <div className={styles.reminderItem}>
                        <div 
                          className={styles.reminderIcon}
                          style={{ backgroundColor: "rgba(76, 175, 80, 0.1)", color: "#4CAF50" }}
                        >
                          <FontAwesomeIcon icon={faSyringe} />
                        </div>
                        <div className={styles.reminderContent}>
                          <h4>Vacunación anual para Luna</h4>
                          <p>Vence en 1 mes</p>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={styles.reminderButton}
                          >
                            Programar cita
                          </motion.button>
                        </div>
                      </div>
                      <div className={styles.reminderItem}>
                        <div 
                          className={styles.reminderIcon}
                          style={{ backgroundColor: "rgba(33, 150, 243, 0.1)", color: "#2196F3" }}
                        >
                          <FontAwesomeIcon icon={faStethoscope} />
                        </div>
                        <div className={styles.reminderContent}>
                          <h4>Revisión dental para Max</h4>
                          <p>Programar para el próximo trimestre</p>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={styles.reminderButton}
                          >
                            Programar cita
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="outlet"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Outlet />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default MainVeterinario;