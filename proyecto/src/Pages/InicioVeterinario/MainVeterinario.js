import React, { useState, useEffect } from 'react';
import styles from './Style/MainVeterinarioStyles.module.css';
import { motion } from 'framer-motion';
import NavegacionVeterinario from './NavegacionVeterinario';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faPaw, faUser, faMapMarkerAlt, faCalendarAlt, faChartLine, faDog, faCat, faNotesMedical } from '@fortawesome/free-solid-svg-icons';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

const cardVariants = {
  hover: { scale: 1.03, boxShadow: "0px 5px 15px rgba(0,0,0,0.1)" }
};

const MainVeterinario = () => {
  const [citasAgendadas, setCitasAgendadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('hoy');
  const [stats, setStats] = useState({
    totalCitas: 12,
    citasCompletadas: 8,
    pacientesNuevos: 3,
    mascotasAtendidas: 5
  });

  useEffect(() => {
    fetch("http://localhost:5000/api/citas/hoy")
      .then((res) => res.json())
      .then((data) => {
        setCitasAgendadas(data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, []);
  
    
  const handleCompleteAppointment = (id) => {
    setCitasAgendadas(citasAgendadas.map(cita => 
      cita.id === id ? {...cita, estado: 'completada'} : cita
    ));
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
          className={styles.loadingSpinner}
        >
          <FontAwesomeIcon icon={faPaw} size="2x" />
        </motion.div>
        <p>Cargando citas...</p>
      </div>
    );
  }

  if (error) {
    return <div className={styles.errorContainer}>Error al cargar las citas: {error}</div>;
  }

  return (
    <motion.div
      className={styles.mainContainer}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className={styles.header}>
        <h1>Bienvenido, Dr. Veterinario</h1>
        <p className={styles.subtitle}>Tu centro de gestión de pacientes y citas</p>
      </div>

      <div className={styles.statsContainer}>
        <motion.div 
          className={styles.statCard}
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className={styles.statIcon} style={{ backgroundColor: '#FFF4D6' }}>
            <FontAwesomeIcon icon={faCalendarAlt} style={{ color: '#FFB347' }} />
          </div>
          <div className={styles.statContent}>
            <h3>{stats.totalCitas}</h3>
            <p>Citas totales</p>
          </div>
        </motion.div>

        <motion.div 
          className={styles.statCard}
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className={styles.statIcon} style={{ backgroundColor: '#E6F7E6' }}>
            <FontAwesomeIcon icon={faChartLine} style={{ color: '#4CAF50' }} />
          </div>
          <div className={styles.statContent}>
            <h3>{stats.citasCompletadas}</h3>
            <p>Citas completadas</p>
          </div>
        </motion.div>

        <motion.div 
          className={styles.statCard}
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className={styles.statIcon} style={{ backgroundColor: '#E6F2FF' }}>
            <FontAwesomeIcon icon={faUser} style={{ color: '#4285F4' }} />
          </div>
          <div className={styles.statContent}>
            <h3>{stats.pacientesNuevos}</h3>
            <p>Pacientes nuevos</p>
          </div>
        </motion.div>

        <motion.div 
          className={styles.statCard}
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className={styles.statIcon} style={{ backgroundColor: '#FFE6E6' }}>
            <FontAwesomeIcon icon={faPaw} style={{ color: '#FF5252' }} />
          </div>
          <div className={styles.statContent}>
            <h3>{stats.mascotasAtendidas}</h3>
            <p>Mascotas atendidas</p>
          </div>
        </motion.div>
      </div>

      <div className={styles.tabsContainer}>
        <button 
          className={`${styles.tabButton} ${activeTab === 'hoy' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('hoy')}
        >
          Hoy
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'proximas' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('proximas')}
        >
          Próximas
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'historial' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('historial')}
        >
          Historial
        </button>
      </div>

      <div className={styles.citasHeader}>
        <h2>
          <FontAwesomeIcon icon={faNotesMedical} className={styles.sectionIcon} />
          Citas Agendadas para Hoy
        </h2>
        <p className={styles.citasSubtitle}>Gestiona las citas del día y marca como completadas</p>
      </div>

      {citasAgendadas.length > 0 ? (
        <ul className={styles.citasLista}>
          {citasAgendadas.map((cita) => (
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
                  >
                    Marcar como completada
                  </motion.button>
                ) : (
                  <span className={styles.completedLabel}>COMPLETADA</span>
                )}
              </div>
            </motion.li>
          ))}
        </ul>
      ) : (
        <div className={styles.noCitas}>
          <FontAwesomeIcon icon={faCalendarAlt} size="3x" className={styles.noCitasIcon} />
          <h3>No hay citas agendadas para hoy</h3>
          <p>Parece que tienes un día tranquilo. ¡Aprovecha para actualizar historiales médicos!</p>
        </div>
      )}

      <div className={styles.tipsSection}>
        <h3>Consejos del día</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <h4>Control de vacunas</h4>
            <p>Recuerda verificar el esquema de vacunación en cada consulta.</p>
          </div>
          <div className={styles.tipCard}>
            <h4>Nutrición</h4>
            <p>Revisa la dieta de tus pacientes y recomienda ajustes según su edad.</p>
          </div>
          <div className={styles.tipCard}>
            <h4>Prevención</h4>
            <p>Educa a los dueños sobre la importancia de la prevención de parásitos.</p>
          </div>
        </div>
      </div>

      <NavegacionVeterinario />
    </motion.div>
  );
};

export default MainVeterinario;