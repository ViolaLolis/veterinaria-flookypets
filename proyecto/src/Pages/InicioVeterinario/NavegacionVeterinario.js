import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Style/NavegacionVeterinarioStyles.module.css'; // Asegúrate de que esta ruta sea correcta
import { motion } from 'framer-motion';

// Asegúrate de que estas importaciones sean correctas y los paquetes estén instalados.
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPaw, faUser, faCalendarAlt,
  faNotesMedical, faCheckCircle, faClock,
  faStar, faSyringe, faStethoscope, faDog,
  faPlus, faUserPlus, faClipboardList
} from '@fortawesome/free-solid-svg-icons';

const NavegacionVeterinario = () => { // Cambiado a NavegacionVeterinario
  const navigate = useNavigate();

  // Función para obtener un saludo dinámico según la hora del día
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const [greeting, setGreeting] = useState(getGreeting());

  // Actualiza el saludo al montar el componente (si necesitas que cambie durante el día sin recargar)
  useEffect(() => {
    const interval = setInterval(() => {
      setGreeting(getGreeting());
    }, 60 * 60 * 1000); // Actualiza cada hora
    return () => clearInterval(interval);
  }, []);

  const [stats, setStats] = useState({
    totalCitasHoy: 4,
    citasCompletadasHoy: 1,
    pacientesNuevosSemana: 3,
    mascotasAtendidasTotal: 150,
    ratingPromedio: 4.8,
    recordatoriosActivos: 5
  });

  const [citasPendientes, setCitasPendientes] = useState([
    {
      id: 1,
      time: "09:00 AM",
      mascota: "Max",
      propietario: "Juan Pérez",
      servicio: "Consulta general",
      estado: "pendiente",
      icon: faPaw,
      color: "#00acc1",
      avatar: "https://via.placeholder.com/40/00acc1/FFFFFF?text=M"
    },
    {
      id: 2,
      time: "10:30 AM",
      mascota: "Bella",
      propietario: "María García",
      servicio: "Vacunación anual",
      estado: "pendiente",
      icon: faSyringe,
      color: "#FF9800",
      avatar: "https://via.placeholder.com/40/FF9800/FFFFFF?text=B"
    },
    {
      id: 3,
      time: "11:45 AM",
      mascota: "Rocky",
      propietario: "Pedro Ramirez",
      servicio: "Revisión post-operatoria",
      estado: "pendiente",
      icon: faStethoscope,
      color: "#4CAF50",
      avatar: "https://via.placeholder.com/40/4CAF50/FFFFFF?text=R"
    },
    {
      id: 4,
      time: "02:00 PM",
      mascota: "Luna",
      propietario: "Laura Sánchez",
      servicio: "Revisión de piel",
      estado: "pendiente",
      icon: faDog,
      color: "#F44336",
      avatar: "https://via.placeholder.com/40/F44336/FFFFFF?text=L"
    },
  ]);

  const handleCompleteAppointment = (id) => {
    const updatedCitas = citasPendientes.map(cita =>
      cita.id === id ? { ...cita, estado: "completado" } : cita
    );
    setCitasPendientes(updatedCitas);

    setTimeout(() => {
      setCitasPendientes(prevCitas =>
        prevCitas.filter(cita => cita.id !== id)
      );
      setStats(prevStats => ({
        ...prevStats,
        citasCompletadasHoy: prevStats.citasCompletadasHoy + 1
      }));
    }, 300);
  };

  const quickActions = [
    { name: "Registrar Mascota", icon: faPaw, path: "/veterinario/registrar-mascota", color: "#00bcd4" },
    { name: "Registrar Propietario", icon: faUserPlus, path: "/veterinario/registrar-propietario", color: "#ff7043" },
    { name: "Ver Historiales Clínicos", icon: faClipboardList, path: "/veterinario/historiales", color: "#4CAF50" },
    { name: "Ver Todas las Citas", icon: faCalendarAlt, path: "/veterinario/citas", color: "#9c27b0" },
  ];

  return (
    <motion.div
      className={styles.vetHome_container}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h1 className={styles.vetHome_greeting}>{greeting}, Dr/a. [Nombre Veterinario]!</h1>
      <p className={styles.vetHome_subHeader}>Aquí tienes un resumen de tu jornada hoy.</p>

      {/* --- Sección: Acciones Rápidas (Quick Actions) --- */}
      <div className={styles.vetHome_section}>
        <h2>Acciones Rápidas</h2>
        <div className={styles.vetDashboard_quickActionsGrid}>
          {quickActions.map((action, index) => (
            <motion.div
              key={index}
              className={styles.vetDashboard_quickActionCard}
              onClick={() => navigate(action.path)}
              whileHover={{ scale: 1.05, boxShadow: "0 8px 25px rgba(0,0,0,0.15)" }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 * index }}
              style={{ '--action-color': action.color }}
            >
              <FontAwesomeIcon icon={action.icon} className={styles.vetDashboard_quickActionIcon} />
              <p>{action.name}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* --- Sección: Resumen de Estadísticas (Dashboard Cards) --- */}
      <div className={styles.vetHome_section}>
        <h2>Estadísticas Clave</h2>
        <div className={styles.vetDashboard_grid}>
          {/* Card: Citas Pendientes Hoy */}
          <motion.div
            className={styles.vetDashboard_card}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className={styles.vetDashboard_cardHeader}>
              <FontAwesomeIcon icon={faCalendarAlt} className={styles.vetDashboard_icon} style={{ color: '#00acc1' }} />
              <h3>Citas Pendientes Hoy</h3>
            </div>
            <p className={styles.vetDashboard_cardContent}>{citasPendientes.length}</p>
            <span className={styles.vetDashboard_cardFooter}>¡Concéntrate en estas!</span>
          </motion.div>

          {/* Card: Citas Completadas Hoy */}
          <motion.div
            className={styles.vetDashboard_card}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className={styles.vetDashboard_cardHeader}>
              <FontAwesomeIcon icon={faCheckCircle} className={styles.vetDashboard_icon} style={{ color: '#4CAF50' }} />
              <h3>Citas Completadas Hoy</h3>
            </div>
            <p className={styles.vetDashboard_cardContent}>{stats.citasCompletadasHoy}</p>
            <span className={styles.vetDashboard_cardFooter}>¡Excelente trabajo!</span>
          </motion.div>

          {/* Card: Nuevos Pacientes (Semana) */}
          <motion.div
            className={styles.vetDashboard_card}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <div className={styles.vetDashboard_cardHeader}>
              <FontAwesomeIcon icon={faUser} className={styles.vetDashboard_icon} style={{ color: '#ff7043' }} />
              <h3>Nuevos Pacientes (Semana)</h3>
            </div>
            <p className={styles.vetDashboard_cardContent}>{stats.pacientesNuevosSemana}</p>
            <span className={styles.vetDashboard_cardFooter}>¡Bienvenida la nueva familia!</span>
          </motion.div>

          {/* Card: Mascotas Atendidas (Total) */}
          <motion.div
            className={styles.vetDashboard_card}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <div className={styles.vetDashboard_cardHeader}>
              <FontAwesomeIcon icon={faPaw} className={styles.vetDashboard_icon} style={{ color: '#03a9f4' }} />
              <h3>Mascotas Atendidas (Total)</h3>
            </div>
            <p className={styles.vetDashboard_cardContent}>{stats.mascotasAtendidasTotal}</p>
            <span className={styles.vetDashboard_cardFooter}>¡Impacto en muchas vidas!</span>
          </motion.div>

          {/* Card: Tu Rating Promedio */}
          <motion.div
            className={styles.vetDashboard_card}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <div className={styles.vetDashboard_cardHeader}>
              <FontAwesomeIcon icon={faStar} className={styles.vetDashboard_icon} style={{ color: '#FFD700' }} />
              <h3>Tu Rating Promedio</h3>
            </div>
            <p className={`${styles.vetDashboard_cardContent} ${styles.vetDashboard_smallText}`}>
              <strong>{stats.ratingPromedio}</strong> / 5.0
            </p>
            <span className={styles.vetDashboard_cardFooter}>¡Mantén el excelente servicio!</span>
          </motion.div>

          {/* Card: Recordatorios Activos */}
          <motion.div
            className={styles.vetDashboard_card}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.6 }}
          >
            <div className={styles.vetDashboard_cardHeader}>
              <FontAwesomeIcon icon={faNotesMedical} className={styles.vetDashboard_icon} style={{ color: '#9c27b0' }} />
              <h3>Recordatorios Activos</h3>
            </div>
            <p className={styles.vetDashboard_cardContent}>{stats.recordatoriosActivos}</p>
            <span className={styles.vetDashboard_cardFooter}>¡No te pierdas nada importante!</span>
          </motion.div>
        </div>
      </div>

      {/* --- Sección: Próximas Citas --- */}
      <div className={styles.vetHome_appointmentsSection}>
        <div className={styles.vetHome_sectionHeader}>
          <h2><FontAwesomeIcon icon={faClock} /> Próximas Citas del Día</h2>
          <motion.button
            className={styles.vetHome_viewAllButton}
            onClick={() => navigate('/veterinario/citas')}
            whileHover={{ scale: 1.05, backgroundColor: 'var(--color-secondary-dark)' }}
            whileTap={{ scale: 0.95 }}
          >
            Ver Calendario Completo
          </motion.button>
        </div>

        <div className={styles.vetHome_appointmentsList}>
          {citasPendientes.length > 0 ? (
            citasPendientes.map(cita => (
              <motion.div
                key={cita.id}
                // Aquí está la línea potencialmente problemática, re-escrita con cuidado:
                className={`${styles.vetHome_appointmentItem} ${cita.estado === 'completado' ? styles.vetHome_completed : ''}`}
                initial={{ x: 0, opacity: 1 }}
                animate={{ x: cita.estado === 'completado' ? -100 : 0, opacity: cita.estado === 'completado' ? 0 : 1 }}
                exit={{ x: -100, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className={styles.vetHome_appointmentTimeIcon}>
                    <img src={cita.avatar} alt={`${cita.mascota} avatar`} className={styles.vetHome_mascotaAvatar} />
                    <span style={{color: cita.color}}>{cita.time}</span>
                </div>
                <div className={styles.vetHome_appointmentDetails}>
                  <h4><FontAwesomeIcon icon={cita.icon} style={{color: cita.color, marginRight: '10px'}} /> {cita.mascota} <span className={styles.vetHome_serviceType}>- {cita.servicio}</span></h4>
                  <p className={styles.vetHome_propietarioName}>Propietario: {cita.propietario}</p>
                </div>
                <div className={styles.vetHome_appointmentActions}>
                  <motion.button
                    className={`${styles.vetHome_actionButton} ${styles.vetHome_complete}`}
                    onClick={() => handleCompleteAppointment(cita.id)}
                    whileHover={{ scale: 1.05, backgroundColor: '#4CAF50', color: 'white' }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Marcar Completada
                  </motion.button>
                  <motion.button
                    className={`${styles.vetHome_actionButton} ${styles.vetHome_view}`}
                    onClick={() => navigate(`/veterinario/citas/${cita.id}`)}
                    whileHover={{ scale: 1.05, backgroundColor: '#00acc1', color: 'white' }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Ver Detalles
                  </motion.button>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              className={styles.vetHome_noAppointments}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <FontAwesomeIcon icon={faCheckCircle} className={styles.vetDashboard_icon} />
              <p>¡Felicitaciones! Todas tus citas pendientes están al día por ahora.</p>
              <motion.button
                className={styles.vetHome_scheduleNewButton}
                onClick={() => navigate('/veterinario/agendar-cita')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FontAwesomeIcon icon={faPlus} /> Agendar Nueva Cita
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default NavegacionVeterinario; // Cambiado a NavegacionVeterinario