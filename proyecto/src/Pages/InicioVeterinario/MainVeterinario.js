import React, { useState, useEffect } from 'react';
import styles from './Style/MainVeterinarioStyles.module.css';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faClock, faPaw, faUser, faMapMarkerAlt, 
  faCalendarAlt, faChartLine, faDog, faCat, 
  faNotesMedical, faCheckCircle, faSpinner 
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
        estado: "pendiente"
      },
      {
        id: 2,
        fecha: new Date(Date.now() + 3600000 * 4).toISOString(),
        mascota: "Luna",
        propietario: "María García",
        direccion: "Avenida Central 456",
        servicio: "Vacunación anual",
        tipoMascota: "Gato",
        estado: "pendiente"
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
        estado: "pendiente"
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
        estado: "completada"
      }
    ]
  });

  // Estado para carga y errores
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [completingId, setCompletingId] = useState(null);

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

  // Filtrado de citas según pestaña activa
  const getFilteredCitas = () => {
    switch(activeTab) {
      case 'hoy': return citas.hoy;
      case 'proximas': return citas.proximas;
      case 'historial': return citas.historial;
      default: return citas.hoy;
    }
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
      <div className={styles.header}>
        <motion.h1 
          initial={{ x: -20 }}
          animate={{ x: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
        >
          Bienvenido, Dr. Veterinario
        </motion.h1>
        <motion.p 
          className={styles.subtitle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Tu centro de gestión de pacientes y citas
        </motion.p>
      </div>

      {isDashboard && (
        <>
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
                color: "#00acc1",
                bgColor: "rgba(0, 172, 193, 0.1)"
              },
              { 
                icon: faUser, 
                value: stats.pacientesNuevos, 
                label: "Pacientes nuevos",
                color: "#0097a7",
                bgColor: "rgba(0, 151, 167, 0.1)"
              },
              { 
                icon: faPaw, 
                value: stats.mascotasAtendidas, 
                label: "Mascotas atendidas",
                color: "#00838f",
                bgColor: "rgba(0, 131, 143, 0.1)"
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

          {/* Pestañas de navegación */}
          <motion.div 
            className={styles.tabsContainer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
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
          </motion.div>

          {/* Lista de citas */}
          <motion.div 
            className={styles.citasSection}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className={styles.citasHeader}>
              <h2>
                <FontAwesomeIcon icon={faNotesMedical} className={styles.sectionIcon} />
                {activeTab === 'hoy' ? 'Citas para Hoy' : 
                 activeTab === 'proximas' ? 'Próximas Citas' : 'Historial de Citas'}
              </h2>
              <p className={styles.citasSubtitle}>
                {activeTab === 'hoy' ? 'Gestiona las citas del día' : 
                 activeTab === 'proximas' ? 'Citas programadas para los próximos días' : 
                 'Registro de todas las citas atendidas'}
              </p>
            </div>

            {filteredCitas.length > 0 ? (
              <motion.ul 
                className={styles.citasLista}
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
                  <motion.li
                    key={cita.id}
                    className={`${styles.citaItem} ${cita.estado === 'completada' ? styles.completed : ''}`}
                    variants={cardVariants}
                    whileHover="hover"
                  >
                    <div className={styles.citaHeader}>
                      <div className={styles.citaDetalle}>
                        <FontAwesomeIcon icon={faClock} className={styles.citaIcon} />
                        <span className={styles.hora}>
                          {new Date(cita.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className={styles.fecha}>
                          {new Date(cita.fecha).toLocaleDateString()}
                        </span>
                      </div>
                      <div className={styles.mascotaType}>
                        {cita.tipoMascota === 'Perro' ? (
                          <FontAwesomeIcon icon={faDog} className={styles.petIcon} />
                        ) : (
                          <FontAwesomeIcon icon={faCat} className={styles.petIcon} />
                        )}
                      </div>
                    </div>

                    <div className={styles.citaContent}>
                      <div className={styles.citaDetalle}>
                        <FontAwesomeIcon icon={faPaw} className={styles.citaIcon} />
                        <span className={styles.mascota}>{cita.mascota}</span>
                      </div>
                      <div className={styles.citaDetalle}>
                        <FontAwesomeIcon icon={faUser} className={styles.citaIcon} />
                        <span className={styles.propietario}>{cita.propietario}</span>
                      </div>
                      <div className={styles.citaDetalle}>
                        <FontAwesomeIcon icon={faMapMarkerAlt} className={styles.citaIcon} />
                        <span className={styles.direccion}>{cita.direccion}</span>
                      </div>
                    </div>

                    <div className={styles.citaFooter}>
                      <span className={styles.servicio}>{cita.servicio}</span>
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
                    </div>
                  </motion.li>
                ))}
              </motion.ul>
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
              </motion.div>
            )}
          </motion.div>

          {/* Consejos del día */}
          <motion.div 
            className={styles.tipsSection}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <h3>Consejos del día</h3>
            <div className={styles.tipsGrid}>
              {[
                {
                  title: "Control de vacunas",
                  content: "Recuerda verificar el esquema de vacunación en cada consulta.",
                  icon: faNotesMedical
                },
                {
                  title: "Nutrición",
                  content: "Revisa la dieta de tus pacientes y recomienda ajustes según su edad.",
                  icon: faPaw
                },
                {
                  title: "Prevención",
                  content: "Educa a los dueños sobre la importancia de la prevención de parásitos.",
                  icon: faDog
                }
              ].map((tip, index) => (
                <motion.div
                  key={index}
                  className={styles.tipCard}
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className={styles.tipIcon}>
                    <FontAwesomeIcon icon={tip.icon} />
                  </div>
                  <h4>{tip.title}</h4>
                  <p>{tip.content}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </>
      )}

      <Outlet />
    </motion.div>
  );
};

export default MainVeterinario;