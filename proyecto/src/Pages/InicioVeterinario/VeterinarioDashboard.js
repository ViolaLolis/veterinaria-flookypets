import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarCheck, faClock, faUser, faPaw, faTag,
  faSpinner, faExclamationTriangle, faPlus, faEye
} from '@fortawesome/free-solid-svg-icons';
import { authFetch } from './api'; // Asegúrate de que la ruta sea correcta
import styles from './Style/VeterinarioDashboardStyles.module.css'; // Crear este archivo CSS

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  hover: { scale: 1.02, boxShadow: "0 8px 20px rgba(0, 172, 193, 0.2)" }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

const VeterinarioDashboard = () => {
  const { user, showNotification } = useOutletContext(); // Obtener el usuario logeado y la función de notificación
  const [latestAppointments, setLatestAppointments] = useState([]);
  const [completedAppointmentsCount, setCompletedAppointmentsCount] = useState(0);
  const [loadingLatest, setLoadingLatest] = useState(true);
  const [loadingCompleted, setLoadingCompleted] = useState(true);
  const [errorLatest, setErrorLatest] = useState(null);
  const [errorCompleted, setErrorCompleted] = useState(null);

  // Cargar últimas citas
  const fetchLatestAppointments = useCallback(async () => {
    setLoadingLatest(true);
    setErrorLatest(null);
    try {
      // Asume que el backend filtra por el ID del veterinario logeado automáticamente
      const response = await authFetch('/veterinario/citas/ultimas'); // Endpoint para últimas citas
      if (response.success) {
        setLatestAppointments(response.data);
      } else {
        setErrorLatest(response.message || "Error al cargar las últimas citas.");
        showNotification(response.message || "Error al cargar las últimas citas.", 'error');
      }
    } catch (err) {
      console.error("Error fetching latest appointments:", err);
      setErrorLatest("Error de conexión al servidor al cargar las últimas citas.");
      showNotification("Error de conexión al servidor al cargar las últimas citas.", 'error');
    } finally {
      setLoadingLatest(false);
    }
  }, [showNotification]);

  // Cargar conteo de citas atendidas
  const fetchCompletedAppointmentsCount = useCallback(async () => {
    setLoadingCompleted(true);
    setErrorCompleted(null);
    try {
      // Asume que el backend filtra por el ID del veterinario logeado automáticamente
      const response = await authFetch('/veterinario/citas/completadas/count'); // Endpoint para conteo de citas completadas
      if (response.success) {
        setCompletedAppointmentsCount(response.count);
      } else {
        setErrorCompleted(response.message || "Error al cargar el conteo de citas atendidas.");
        showNotification(response.message || "Error al cargar el conteo de citas atendidas.", 'error');
      }
    } catch (err) {
      console.error("Error fetching completed appointments count:", err);
      setErrorCompleted("Error de conexión al servidor al cargar el conteo de citas atendidas.");
      showNotification("Error de conexión al servidor al cargar el conteo de citas atendidas.", 'error');
    } finally {
      setLoadingCompleted(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchLatestAppointments();
    fetchCompletedAppointmentsCount();
  }, [fetchLatestAppointments, fetchCompletedAppointmentsCount]);

  return (
    <motion.div
      className={styles.dashboardContainer}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className={styles.welcomeMessage}>
        Bienvenido, {user?.nombre || 'Veterinario'}!
      </h1>

      <div className={styles.statsGrid}>
        <motion.div className={styles.statCard} variants={cardVariants} whileHover="hover">
          <FontAwesomeIcon icon={faCalendarCheck} className={styles.statIcon} />
          <h3>Citas Atendidas</h3>
          {loadingCompleted ? (
            <FontAwesomeIcon icon={faSpinner} spin className={styles.spinnerSmall} />
          ) : errorCompleted ? (
            <span className={styles.statError}><FontAwesomeIcon icon={faExclamationTriangle} /> Error</span>
          ) : (
            <p className={styles.statNumber}>{completedAppointmentsCount}</p>
          )}
        </motion.div>

        {/* Puedes añadir más tarjetas de estadísticas aquí */}
        <motion.div className={styles.statCard} variants={cardVariants} whileHover="hover">
          <FontAwesomeIcon icon={faPaw} className={styles.statIcon} />
          <h3>Mascotas Registradas</h3>
          {/* Aquí podrías cargar el número total de mascotas en el sistema o del veterinario */}
          <p className={styles.statNumber}>Cargando...</p> {/* Placeholder */}
        </motion.div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <FontAwesomeIcon icon={faCalendarCheck} /> Últimas Citas Registradas
        </h2>
        {loadingLatest ? (
          <div className={styles.loadingContainer}>
            <FontAwesomeIcon icon={faSpinner} spin size="2x" className={styles.spinner} />
            <p>Cargando últimas citas...</p>
          </div>
        ) : errorLatest ? (
          <div className={styles.errorContainer}>
            <FontAwesomeIcon icon={faExclamationTriangle} className={styles.errorIcon} />
            <p>{errorLatest}</p>
          </div>
        ) : latestAppointments.length > 0 ? (
          <motion.ul className={styles.latestAppointmentsList}>
            <AnimatePresence>
              {latestAppointments.map(cita => (
                <motion.li
                  key={cita.id_cita} // Asegúrate de usar el ID correcto de la cita
                  className={styles.appointmentItem}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  whileHover="hover"
                >
                  <div className={styles.appointmentDetails}>
                    <p>
                      <FontAwesomeIcon icon={faClock} className={styles.detailIcon} />
                      {new Date(cita.fecha_cita).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                    <p>
                      <FontAwesomeIcon icon={faUser} className={styles.detailIcon} />
                      Propietario: <strong>{cita.propietario_nombre} {cita.propietario_apellido}</strong>
                    </p>
                    <p>
                      <FontAwesomeIcon icon={faPaw} className={styles.detailIcon} />
                      Mascota: <strong>{cita.mascota_nombre} ({cita.mascota_especie})</strong>
                    </p>
                    <p>
                      <FontAwesomeIcon icon={faTag} className={styles.detailIcon} />
                      Servicio: <strong>{cita.servicio_nombre}</strong>
                    </p>
                    <p className={`${styles.appointmentStatus} ${styles[cita.estado?.toLowerCase()]}`}>
                      Estado: {cita.estado}
                    </p>
                  </div>
                  <Link to={`/veterinario/citas/${cita.id_cita}`} className={styles.viewDetailsButton}>
                    <FontAwesomeIcon icon={faEye} /> Ver Detalle
                  </Link>
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        ) : (
          <div className={styles.emptyState}>
            <p>No hay últimas citas registradas.</p>
            <Link to="/veterinario/citas/agendar" className={styles.addCitaButton}>
              <FontAwesomeIcon icon={faPlus} /> Agendar Nueva Cita
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default VeterinarioDashboard;