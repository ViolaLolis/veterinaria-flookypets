import React, { useState, useEffect } from 'react';
import styles from './Style/MainVeterinarioStyles.module.css';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faClock, faPaw, faUser, faMapMarkerAlt, 
  faCalendarAlt, faChartLine, faDog, faCat, 
  faNotesMedical, faCheckCircle, faSpinner,
  faBell, faSearch, faPlus, faEllipsisV,
  faStethoscope, faSyringe, faWeight
} from '@fortawesome/free-solid-svg-icons';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

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
};

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100
    }
  },
  hover: { 
    scale: 1.03, 
    boxShadow: "0px 10px 20px rgba(0, 188, 212, 0.1)",
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
    mascotasAtendidas: 5
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
        estado: "pendiente",
        notas: "Control anual de salud",
        prioridad: "normal"
      },
      {
        id: 2,
        fecha: new Date(Date.now() + 3600000 * 4).toISOString(),
        mascota: "Luna",
        propietario: "María García",
        direccion: "Avenida Central 456",
        servicio: "Vacunación anual",
        tipoMascota: "Gato",
        estado: "pendiente",
        notas: "Vacuna antirrábica",
        prioridad: "alta"
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
        estado: "pendiente",
        notas: "Seguimiento de dieta",
        prioridad: "normal"
      }
    ],
    historial: [
      {
        id: 4,
        fecha: new Date(Date.now() - 86400000).toISOString(),
        mascota: "Bella",
        propietario: "Ana Martínez",
        direccion: "Calle Sur 321",
        servicio: "Desparasitación",
        tipoMascota: "Perro",
        estado: "completada",
        notas: "Tratamiento antiparasitario",
        prioridad: "normal"
      }
    ]
  });

  // Estado para carga y errores
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [completingId, setCompletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

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
        )
      }));
      
      setStats(prev => ({
        ...prev,
        citasCompletadas: prev.citasCompletadas + 1
      }));
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
        cita.servicio.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  };

  const filteredCitas = getFilteredCitas();
  const isDashboard = location.pathname === '/veterinario' || location.pathname === '/veterinario/';

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className={styles.loadingSpinner}
        >
          <FontAwesomeIcon icon={faSpinner} size="2x" />
        </motion.div>
        <p>Cargando citas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div 
        className={styles.errorContainer}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <p>Error: {error}</p>
        <button 
          onClick={() => setError(null)}
          className={styles.retryButton}
        >
          Reintentar
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={styles.mainContainer}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Barra superior */}
      <div className={styles.topBar}>
        <div className={styles.searchBar}>
          <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Buscar citas, pacientes..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className={styles.topBarActions}>
          <button className={styles.notificationButton}>
            <FontAwesomeIcon icon={faBell} />
            <span className={styles.notificationBadge}>3</span>
          </button>
          <button 
            className={styles.newAppointmentButton}
            onClick={() => navigateTo('nueva-cita')}
          >
            <FontAwesomeIcon icon={faPlus} />
            <span>Nueva cita</span>
          </button>
        </div>
      </div>

      <div className={styles.contentWrapper}>
        {/* Barra lateral */}
        <div className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <h2>Flooky Pets</h2>
            <p>Centro Veterinario</p>
          </div>
          
          <div className={styles.userProfile}>
            <div className={styles.avatar}>DR</div>
            <div className={styles.userInfo}>
              <h3>Dr. Veterinario</h3>
              <p>Especialista en pequeños animales</p>
            </div>
          </div>
          
          <nav className={styles.navMenu}>
            <ul>
              <li className={styles.active}>
                <FontAwesomeIcon icon={faCalendarAlt} />
                <span>Dashboard</span>
              </li>
              <li>
                <FontAwesomeIcon icon={faPaw} />
                <span>Pacientes</span>
              </li>
              <li>
                <FontAwesomeIcon icon={faUser} />
                <span>Clientes</span>
              </li>
              <li>
                <FontAwesomeIcon icon={faNotesMedical} />
                <span>Historiales</span>
              </li>
              <li>
                <FontAwesomeIcon icon={faChartLine} />
                <span>Reportes</span>
              </li>
            </ul>
          </nav>
          
          <div className={styles.quickActions}>
            <h4>Acciones rápidas</h4>
            <button onClick={() => navigateTo('nueva-cita')}>
              <FontAwesomeIcon icon={faPlus} />
              <span>Agendar cita</span>
            </button>
            <button onClick={() => navigateTo('nuevo-paciente')}>
              <FontAwesomeIcon icon={faPaw} />
              <span>Registrar paciente</span>
            </button>
          </div>
        </div>

        {/* Contenido principal */}
        <div className={styles.mainContent}>
          {isDashboard && (
            <>
              {/* Encabezado */}
              <div className={styles.header}>
                <h1>Bienvenido, Dr. Veterinario</h1>
                <p className={styles.subtitle}>Resumen de actividades y citas</p>
              </div>

              {/* Tarjetas de estadísticas */}
              <motion.div 
                className={styles.statsContainer}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {[
                  { 
                    icon: faCalendarAlt, 
                    value: stats.totalCitas, 
                    label: "Citas totales",
                    color: "#00bcd4",
                    bgColor: "rgba(0, 188, 212, 0.1)"
                  },
                  { 
                    icon: faChartLine, 
                    value: stats.citasCompletadas, 
                    label: "Citas completadas",
                    color: "#4CAF50",
                    bgColor: "rgba(76, 175, 80, 0.1)"
                  },
                  { 
                    icon: faUser, 
                    value: stats.pacientesNuevos, 
                    label: "Pacientes nuevos",
                    color: "#FF9800",
                    bgColor: "rgba(255, 152, 0, 0.1)"
                  },
                  { 
                    icon: faPaw, 
                    value: stats.mascotasAtendidas, 
                    label: "Mascotas atendidas",
                    color: "#9C27B0",
                    bgColor: "rgba(156, 39, 176, 0.1)"
                  }
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    className={styles.statCard}
                    variants={cardVariants}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => navigateTo(stat.label.includes('Citas') ? 'citas' : 'pacientes')}
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
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Sección de citas */}
              <div className={styles.citasSection}>
                <div className={styles.sectionHeader}>
                  <div className={styles.sectionTitle}>
                    <FontAwesomeIcon icon={faNotesMedical} className={styles.sectionIcon} />
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
                      >
                        {tab === 'hoy' ? 'Hoy' : tab === 'proximas' ? 'Próximas' : 'Historial'}
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
                          staggerChildren: 0.1
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
                              <span className={styles.priorityBadge}>Alta prioridad</span>
                            )}
                          </div>
                        </div>

                        <div className={styles.citaContent}>
                          <div className={styles.petInfo}>
                            <div className={styles.petIcon}>
                              {cita.tipoMascota === 'Perro' ? (
                                <FontAwesomeIcon icon={faDog} />
                              ) : (
                                <FontAwesomeIcon icon={faCat} />
                              )}
                            </div>
                            <div>
                              <h3>{cita.mascota}</h3>
                              <p>{cita.propietario}</p>
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
                              <span>{cita.servicio}</span>
                            </div>
                            {cita.notas && (
                              <div className={styles.detailItem}>
                                <FontAwesomeIcon icon={faNotesMedical} />
                                <span>{cita.notas}</span>
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
                          
                          <button className={styles.moreOptions}>
                            <FontAwesomeIcon icon={faEllipsisV} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div 
                    className={styles.noCitas}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <FontAwesomeIcon icon={faCalendarAlt} size="3x" className={styles.noCitasIcon} />
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
                      <button 
                        className={styles.scheduleButton}
                        onClick={() => navigateTo('nueva-cita')}
                      >
                        <FontAwesomeIcon icon={faPlus} />
                        <span>Agendar nueva cita</span>
                      </button>
                    )}
                  </motion.div>
                )}
              </div>

              {/* Sección inferior */}
              <div className={styles.bottomSection}>
                {/* Consejos del día */}
                <div className={styles.tipsSection}>
                  <h3>Consejos del día</h3>
                  <div className={styles.tipsGrid}>
                    {[
                      {
                        title: "Control de vacunas",
                        content: "Recuerda verificar el esquema de vacunación en cada consulta.",
                        icon: faSyringe,
                        color: "#4CAF50"
                      },
                      {
                        title: "Nutrición",
                        content: "Revisa la dieta de tus pacientes y recomienda ajustes según su edad y condición.",
                        icon: faWeight,
                        color: "#FF9800"
                      },
                      {
                        title: "Prevención",
                        content: "Educa a los dueños sobre la importancia de la prevención de parásitos.",
                        icon: faStethoscope,
                        color: "#2196F3"
                      },
                      {
                        title: "Historial completo",
                        content: "Actualiza el historial médico con cada visita para un mejor seguimiento.",
                        icon: faNotesMedical,
                        color: "#9C27B0"
                      }
                    ].map((tip, index) => (
                      <motion.div
                        key={index}
                        className={styles.tipCard}
                        whileHover={{ y: -5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <div className={styles.tipIcon} style={{ backgroundColor: `${tip.color}20`, color: tip.color }}>
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
                  <h3>Recordatorios</h3>
                  <div className={styles.remindersList}>
                    <div className={styles.reminderItem}>
                      <div className={styles.reminderIcon}>
                        <FontAwesomeIcon icon={faBell} />
                      </div>
                      <div className={styles.reminderContent}>
                        <h4>Control de peso para Rocky</h4>
                        <p>Próximo control en 2 semanas</p>
                      </div>
                    </div>
                    <div className={styles.reminderItem}>
                      <div className={styles.reminderIcon}>
                        <FontAwesomeIcon icon={faBell} />
                      </div>
                      <div className={styles.reminderContent}>
                        <h4>Vacunación anual para Luna</h4>
                        <p>Vence en 1 mes</p>
                      </div>
                    </div>
                    <div className={styles.reminderItem}>
                      <div className={styles.reminderIcon}>
                        <FontAwesomeIcon icon={faBell} />
                      </div>
                      <div className={styles.reminderContent}>
                        <h4>Revisión dental para Max</h4>
                        <p>Programar para el próximo trimestre</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          <Outlet />
        </div>
      </div>
    </motion.div>
  );
};

export default MainVeterinario;