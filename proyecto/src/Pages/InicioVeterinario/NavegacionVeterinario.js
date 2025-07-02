import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Style/NavegacionVeterinarioStyles.module.css';
import { motion, AnimatePresence } from 'framer-motion';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPaw, faUser, faCalendarAlt,
  faNotesMedical, faCheckCircle, faClock,
  faStar, faSyringe, faStethoscope, faDog,
  faPlus, faUserPlus, faClipboardList, faChevronRight
} from '@fortawesome/free-solid-svg-icons';

const NavegacionVeterinario = () => {
  const navigate = useNavigate();

  const getVetDashGreeting = useCallback(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  }, []);

  const [vetDashGreeting, setVetDashGreeting] = useState(getVetDashGreeting());

  useEffect(() => {
    const interval = setInterval(() => {
      setVetDashGreeting(getVetDashGreeting());
    }, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [getVetDashGreeting]);

  const [vetDashStats, setVetDashStats] = useState({
    totalCitasHoy: 4,
    citasCompletadasHoy: 1,
    pacientesNuevosSemana: 3,
    mascotasAtendidasTotal: 150,
    ratingPromedio: 4.8,
    recordatoriosActivos: 5
  });

  const [vetDashPendingAppointments, setVetDashPendingAppointments] = useState([
    {
      id: 1,
      time: "09:00 AM",
      mascota: "Max",
      propietario: "Juan Pérez",
      servicio: "Consulta general",
      estado: "pendiente",
      icon: faPaw,
      color: "#00acc1",
      avatar: "https://images.unsplash.com/photo-1598133894008-6f7f201889a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1ODU2NTh8MHwxfGFsbHwxfHxkb2d8ZW58MHx8fHwxNzE5NTA1MjE3fDA&ixlib=rb-4.0.3&q=80&w=40"
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
      avatar: "https://images.unsplash.com/photo-1626017042898-1e427770068a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1ODU2NTh8MHwxfGFsbHwxfHxDYXQlMjBwb3J0cmFpdHxlbnwwfHx8fDE3MTk1MDUyMjB8MA&ixlib=rb-4.0.3&q=80&w=40"
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
      avatar: "https://images.unsplash.com/photo-1543463102-12e3e528b3e8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1ODU2NTh8MHwxfGFsbHwxfHxkb2cxfGVufDB8fHx8MTcxOTUwNTIyMnww&ixlib=rb-4.0.3&q=80&w=40"
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
      avatar: "https://images.unsplash.com/photo-1591965584570-5b583f707f1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1ODU2NTh8MHwxfGFsbHwxfHxkb2d8ZW58MHx8fHwxNzE5NTA1MjE3fDA&ixlib=rb-4.0.3&q=80&w=40"
    },
  ]);

  const handleCompleteVetAppointment = useCallback((id) => {
    setVetDashPendingAppointments(prevCitas =>
      prevCitas.map(cita =>
        cita.id === id ? { ...cita, estado: "completado" } : cita
      )
    );

    setTimeout(() => {
      setVetDashPendingAppointments(prevCitas =>
        prevCitas.filter(cita => cita.id !== id)
      );
      setVetDashStats(prevStats => ({
        ...prevStats,
        citasCompletadasHoy: prevStats.citasCompletadasHoy + 1
      }));
    }, 400);
  }, []);

  const vetDashQuickActions = [
    { name: "Registrar Mascota", icon: faPaw, path: "/veterinario/mascotas/registrar", color: "#00bcd4" },
    { name: "Registrar Propietario", icon: faUserPlus, path: "/veterinario/propietarios/registrar", color: "#ff7043" },
    { name: "Ver Historiales Clínicos", icon: faClipboardList, path: "/veterinario/historiales", color: "#4CAF50" },
    { name: "Ver Todas las Citas", icon: faCalendarAlt, path: "/veterinario/citas", color: "#9c27b0" },
  ];

  const vetDashCardVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const vetDashAppointmentItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.3, ease: "easeIn" } },
    completed: { opacity: 0, x: -100, transition: { duration: 0.3, ease: "easeIn" } }
  };

  return (
    <motion.div
      className={styles.vetDash_mainContainer}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <h1 className={styles.vetDash_greetingText}>
        {vetDashGreeting}, Dr/a. **<span style={{ fontWeight: 'bold' }}>[Nombre Veterinario]</span>**!
      </h1>
      <p className={styles.vetDash_subHeaderMessage}>Aquí tienes un **resumen rápido** de tu jornada y las **acciones clave**.</p>

      {/* --- Sección: Acciones Rápidas (Quick Actions) --- */}
      <div className={styles.vetDash_sectionWrapper}>
        <h2><FontAwesomeIcon icon={faPlus} className={styles.vetDash_sectionIcon} /> Acciones Rápidas</h2>
        <div className={styles.vetDash_quickActionsGrid}>
          {vetDashQuickActions.map((action, index) => (
            <motion.div
              key={index}
              className={styles.vetDash_quickActionCard}
              onClick={() => navigate(action.path)}
              whileHover={{ scale: 1.05, boxShadow: "0 8px 25px rgba(0,0,0,0.15)" }}
              whileTap={{ scale: 0.95 }}
              variants={vetDashCardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.1 * index }}
              style={{ '--action-color': action.color }}
            >
              <FontAwesomeIcon icon={action.icon} className={styles.vetDash_quickActionIcon} />
              <p className={styles.vetDash_quickActionText}>{action.name}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* --- Sección: Resumen de Estadísticas (Dashboard Cards) --- */}
      <div className={styles.vetDash_sectionWrapper}>
        <h2><FontAwesomeIcon icon={faCalendarAlt} className={styles.vetDash_sectionIcon} /> Estadísticas Clave</h2>
        <div className={styles.vetDash_statsGrid}>
          {/* Card: Citas Pendientes Hoy */}
          <motion.div
            className={styles.vetDash_statCard}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            variants={vetDashCardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
          >
            <div className={styles.vetDash_statCardHeader}>
              <FontAwesomeIcon icon={faCalendarAlt} className={styles.vetDash_statIcon} style={{ color: 'var(--color-primary)' }} />
              <h3>Citas Pendientes Hoy</h3>
            </div>
            <p className={styles.vetDash_statHighlight}>{vetDashPendingAppointments.length}</p>
            <span className={styles.vetDash_statFooter}>¡Concéntrate en estas!</span>
          </motion.div>

          {/* Card: Citas Completadas Hoy */}
          <motion.div
            className={styles.vetDash_statCard}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            variants={vetDashCardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
          >
            <div className={styles.vetDash_statCardHeader}>
              <FontAwesomeIcon icon={faCheckCircle} className={styles.vetDash_statIcon} style={{ color: 'var(--color-success)' }} />
              <h3>Citas Completadas Hoy</h3>
            </div>
            <p className={styles.vetDash_statHighlight}>{vetDashStats.citasCompletadasHoy}</p>
            <span className={styles.vetDash_statFooter}>¡Excelente trabajo!</span>
          </motion.div>

          {/* Card: Nuevos Pacientes (Semana) */}
          <motion.div
            className={styles.vetDash_statCard}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            variants={vetDashCardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
          >
            <div className={styles.vetDash_statCardHeader}>
              <FontAwesomeIcon icon={faUser} className={styles.vetDash_statIcon} style={{ color: 'var(--color-warning)' }} />
              <h3>Nuevos Pacientes (Semana)</h3>
            </div>
            <p className={styles.vetDash_statHighlight}>{vetDashStats.pacientesNuevosSemana}</p>
            <span className={styles.vetDash_statFooter}>¡Bienvenida la nueva familia!</span>
          </motion.div>

          {/* Card: Mascotas Atendidas (Total) */}
          <motion.div
            className={styles.vetDash_statCard}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            variants={vetDashCardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.4 }}
          >
            <div className={styles.vetDash_statCardHeader}>
              <FontAwesomeIcon icon={faPaw} className={styles.vetDash_statIcon} style={{ color: 'var(--color-info)' }} />
              <h3>Mascotas Atendidas (Total)</h3>
            </div>
            <p className={styles.vetDash_statHighlight}>{vetDashStats.mascotasAtendidasTotal}</p>
            <span className={styles.vetDash_statFooter}>¡Impacto en muchas vidas!</span>
          </motion.div>

          {/* Card: Tu Rating Promedio */}
          <motion.div
            className={styles.vetDash_statCard}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            variants={vetDashCardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.5 }}
          >
            <div className={styles.vetDash_statCardHeader}>
              <FontAwesomeIcon icon={faStar} className={styles.vetDash_statIcon} style={{ color: 'var(--color-gold)' }} />
              <h3>Tu Rating Promedio</h3>
            </div>
            <p className={`${styles.vetDash_statHighlight} ${styles.vetDash_statSmallText}`}>
              <strong>{vetDashStats.ratingPromedio}</strong> / 5.0
            </p>
            <span className={styles.vetDash_statFooter}>¡Mantén el excelente servicio!</span>
          </motion.div>

          {/* Card: Recordatorios Activos */}
          <motion.div
            className={styles.vetDash_statCard}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            variants={vetDashCardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.6 }}
          >
            <div className={styles.vetDash_statCardHeader}>
              <FontAwesomeIcon icon={faNotesMedical} className={styles.vetDash_statIcon} style={{ color: 'var(--color-purple)' }} />
              <h3>Recordatorios Activos</h3>
            </div>
            <p className={styles.vetDash_statHighlight}>{vetDashStats.recordatoriosActivos}</p>
            <span className={styles.vetDash_statFooter}>¡No te pierdas nada importante!</span>
          </motion.div>
        </div>
      </div>

      {/* --- Sección: Próximas Citas --- */}
      <div className={styles.vetDash_appointmentsSection}>
        <div className={styles.vetDash_sectionHeader}>
          <h2><FontAwesomeIcon icon={faClock} className={styles.vetDash_sectionIcon} /> Próximas Citas del Día</h2>
          <motion.button
            className={styles.vetDash_viewAllButton}
            onClick={() => navigate('/veterinario/citas')}
            whileHover={{ scale: 1.05, backgroundColor: 'var(--color-secondary-dark)' }}
            whileTap={{ scale: 0.95 }}
          >
            Ver Calendario Completo <FontAwesomeIcon icon={faChevronRight} className={styles.vetDash_buttonArrow} />
          </motion.button>
        </div>

        <div className={styles.vetDash_appointmentsList}>
          <AnimatePresence mode="popLayout">
            {vetDashPendingAppointments.length > 0 ? (
              vetDashPendingAppointments.map(cita => (
                <motion.div
                  key={cita.id}
                  className={`${styles.vetDash_appointmentItem} ${cita.estado === 'completado' ? styles.vetDash_appointmentCompleted : ''}`}
                  variants={vetDashAppointmentItemVariants}
                  initial="hidden"
                  animate={cita.estado === 'completado' ? "completed" : "visible"}
                  exit="exit"
                  layout
                >
                  <div className={styles.vetDash_appointmentTimeAvatar}>
                    <img src={cita.avatar} alt={`${cita.mascota} avatar`} className={styles.vetDash_mascotaAvatar} />
                    <span className={styles.vetDash_timeDisplay} style={{ color: cita.color }}>{cita.time}</span>
                  </div>
                  <div className={styles.vetDash_appointmentDetails}>
                    <h4>
                      <FontAwesomeIcon icon={cita.icon} style={{ color: cita.color, marginRight: '10px' }} />
                      <span className={styles.vetDash_mascotaName}>{cita.mascota}</span>
                      <span className={styles.vetDash_serviceType}> - {cita.servicio}</span>
                    </h4>
                    <p className={styles.vetDash_propietarioName}>Propietario: <strong>{cita.propietario}</strong></p>
                  </div>
                  <div className={styles.vetDash_appointmentActions}>
                    <motion.button
                      className={`${styles.vetDash_actionButton} ${styles.vetDash_completeButton}`}
                      onClick={() => handleCompleteVetAppointment(cita.id)}
                      whileHover={{ scale: 1.05, backgroundColor: 'var(--color-success-dark)', color: 'white' }}
                      whileTap={{ scale: 0.95 }}
                      disabled={cita.estado === 'completado'}
                    >
                      {cita.estado === 'completado' ? 'Completada' : 'Marcar Completada'}
                    </motion.button>
                    <motion.button
                      className={`${styles.vetDash_actionButton} ${styles.vetDash_viewDetailsButton}`}
                      onClick={() => navigate(`/veterinario/citas/${cita.id}`)}
                      whileHover={{ scale: 1.05, backgroundColor: 'var(--color-primary-dark)', color: 'white' }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Ver Detalles
                    </motion.button>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div
                className={styles.vetDash_noAppointmentsMessage}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <FontAwesomeIcon icon={faCheckCircle} className={styles.vetDash_noAppointmentsIcon} />
                <p>¡Felicitaciones! Todas tus citas pendientes están al día por ahora.</p>
                <motion.button
                  className={styles.vetDash_scheduleNewButton}
                  onClick={() => navigate('/veterinario/citas/agendar')}
                  whileHover={{ scale: 1.05, backgroundColor: 'var(--color-primary-dark)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FontAwesomeIcon icon={faPlus} /> Agendar Nueva Cita
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default NavegacionVeterinario;