import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import styles from './Style/NavegacionVeterinarioStyles.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import { authFetch } from '../../utils/api'; // Asegúrate de que la ruta sea correcta, asumo que está en utils/api

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPaw, faUser, faCalendarAlt,
    faNotesMedical, faCheckCircle, faClock, faPlus, faUserPlus, faClipboardList, faChevronRight,
    faSpinner, faExclamationTriangle, faTimesCircle, faCheck // Añadidos para carga y error, y botones de aceptar/rechazar
} from '@fortawesome/free-solid-svg-icons';

const NavegacionVeterinario = () => {
    const navigate = useNavigate();
    const { user, showNotification } = useOutletContext(); // Obtener user y showNotification del contexto

    const getVetDashGreeting = useCallback(() => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Buenos días';
        if (hour < 18) return 'Buenas tardes';
        return 'Buenas noches';
    }, []);

    const [vetDashGreeting, setVetDashGreeting] = useState(getVetDashGreeting());
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [vetDashStats, setVetDashStats] = useState({
        totalCitasHoy: 0,
        citasCompletadasHoy: 0,
        pacientesNuevosSemana: 0, // Dummy data for now, requires specific backend logic
        mascotasAtendidasTotal: 0, // Dummy data for now, requires specific backend logic
        recordatoriosActivos: 0
    });

    const [vetDashPendingAppointments, setVetDashPendingAppointments] = useState([]);

    // Actualizar el saludo cada hora
    useEffect(() => {
        const interval = setInterval(() => {
            setVetDashGreeting(getVetDashGreeting());
        }, 60 * 60 * 1000);
        return () => clearInterval(interval);
    }, [getVetDashGreeting]);

    // Función para cargar los datos del dashboard
    const fetchVetDashboardData = useCallback(async () => {
        if (!user?.id) {
            setIsLoading(false);
            setError('Usuario no autenticado.');
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            // 1. Fetch pending appointments for today, specifically for the logged-in vet
            // La ruta /veterinario/citas/ultimas ya filtra por el veterinario logeado y estado PENDIENTE
            const appointmentsResult = await authFetch(`/veterinario/citas/ultimas`);
            
            let pendingToday = [];
            if (appointmentsResult.success) {
                pendingToday = appointmentsResult.data;
            } else {
                showNotification(appointmentsResult.message || 'Error al cargar citas pendientes.', 'error');
                setError(appointmentsResult.message || 'Error al cargar citas pendientes.');
            }

            // 2. Fetch completed appointments count for today
            const completedCountResult = await authFetch(`/veterinario/citas/completadas/count`);
            let completedTodayCount = 0;
            if (completedCountResult.success) {
                completedTodayCount = completedCountResult.count;
            } else {
                showNotification(completedCountResult.message || 'Error al cargar citas completadas.', 'error');
                setError(prev => prev ? prev + ' ' + completedCountResult.message : completedCountResult.message);
            }

            // 3. Fetch unread notifications
            const notificationsResult = await authFetch(`/api/notifications/user/${user.id}`); // Usar la ruta general de notificaciones de usuario
            let unreadNotificationsCount = 0;
            if (notificationsResult.success) {
                unreadNotificationsCount = notificationsResult.data.filter(n => !n.leida).length;
            } else {
                showNotification(notificationsResult.message || 'Error al cargar notificaciones.', 'error');
                setError(prev => prev ? prev + ' ' + notificationsResult.message : notificationsResult.message);
            }

            // Update pending appointments state
            setVetDashPendingAppointments(pendingToday.map(cita => ({
                id: cita.id_cita,
                time: cita.fecha_cita.substring(11, 16), // Extract HH:MM from "YYYY-MM-DD HH:MM"
                mascota: cita.mascota_nombre,
                propietario: cita.propietario_nombre,
                servicio: cita.servicio_nombre,
                precio: cita.precio, // Asegúrate de que el backend devuelva el precio
                estado: cita.estado,
                icon: faPaw, // Default icon, consider dynamic based on service type
                color: "#00acc1", // Default color, consider dynamic
                avatar: cita.mascota_imagen_url || `https://placehold.co/40x40/cccccc/ffffff?text=${cita.mascota_nombre?.charAt(0) || 'M'}`
            })));

            // Update stats state
            setVetDashStats(prevStats => ({
                ...prevStats,
                totalCitasHoy: pendingToday.length, // totalCitasHoy ahora solo cuenta las PENDIENTES
                citasCompletadasHoy: completedTodayCount,
                recordatoriosActivos: unreadNotificationsCount
            }));

        } catch (err) {
            console.error("Error fetching vet dashboard data:", err);
            setError('Error de conexión al servidor.');
            showNotification('Error de conexión al servidor al cargar el dashboard.', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [user, showNotification, authFetch]); // Añadido authFetch a las dependencias

    useEffect(() => {
        fetchVetDashboardData();
        // Opcional: Establecer un intervalo de actualización para el dashboard
        const dashboardRefreshInterval = setInterval(fetchVetDashboardData, 60000); // Cada 60 segundos
        return () => clearInterval(dashboardRefreshInterval);
    }, [fetchVetDashboardData]);

    // Función para manejar el cambio de estado de la cita (Aceptar/Rechazar/Completar)
    const handleUpdateAppointmentStatus = useCallback(async (id, newStatus) => {
        // Optimistic UI update: Remove the appointment from the list immediately
        setVetDashPendingAppointments(prevCitas =>
            prevCitas.filter(cita => cita.id !== id)
        );
        // También actualiza el contador de citas pendientes si se acepta o rechaza
        setVetDashStats(prevStats => ({
            ...prevStats,
            totalCitasHoy: prevStats.totalCitasHoy - 1,
            citasCompletadasHoy: newStatus === 'COMPLETA' ? prevStats.citasCompletadasHoy + 1 : prevStats.citasCompletadasHoy
        }));

        try {
            const response = await authFetch(`/citas/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ estado: newStatus.toUpperCase() })
            });

            if (response.success) {
                showNotification(`Cita marcada como ${newStatus.toLowerCase()}.`, 'success');
                // Re-fetch data to ensure stats are accurate after status change
                fetchVetDashboardData();
            } else {
                showNotification(response.message || `Error al marcar cita como ${newStatus.toLowerCase()}.`, 'error');
                // Revert optimistic update if API call fails (re-fetch will handle this)
                fetchVetDashboardData();
            }
        } catch (err) {
            console.error(`Error updating appointment to ${newStatus}:`, err);
            showNotification(`Error de conexión al servidor al actualizar cita a ${newStatus}.`, 'error');
            // Revert optimistic update on network error (re-fetch will handle this)
            fetchVetDashboardData();
        }
    }, [showNotification, fetchVetDashboardData, authFetch]);


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

    if (isLoading) {
        return (
            <div className={styles.loadingContainer}>
                <FontAwesomeIcon icon={faSpinner} spin size="3x" color="#00acc1" />
                <p>Cargando datos del dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.errorContainer}>
                <FontAwesomeIcon icon={faExclamationTriangle} size="3x" color="#FF5252" />
                <p>Error al cargar el dashboard: {error}</p>
                <button onClick={fetchVetDashboardData} className={styles.retryButton}>Reintentar</button>
            </div>
        );
    }

    return (
        <motion.div
            className={styles.vetDash_mainContainer}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
        >
            <h1 className={styles.vetDash_greetingText}>
                {vetDashGreeting}, Dr/a. <span style={{ fontWeight: 'bold' }}>{user?.nombre || 'Veterinario'}</span>!
            </h1>
            <p className={styles.vetDash_subHeaderMessage}>Aquí tienes un resumen rápido de tu jornada y las acciones clave.</p>

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
                        <p className={styles.vetDash_statHighlight}>{vetDashStats.totalCitasHoy}</p>
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

                    {/* Card: Nuevos Pacientes (Semana) - DUMMY DATA */}
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

                    {/* Card: Mascotas Atendidas (Total) - DUMMY DATA */}
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

            {/* --- Sección: Citas Pendientes de Revisión --- */}
            <div className={styles.vetDash_appointmentsSection}>
                <div className={styles.vetDash_sectionHeader}>
                    <h2><FontAwesomeIcon icon={faClock} className={styles.vetDash_sectionIcon} /> Citas Pendientes de Revisión</h2>
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
                                    className={`${styles.vetDash_appointmentItem} ${cita.estado === 'COMPLETA' ? styles.vetDash_appointmentCompleted : ''}`}
                                    variants={vetDashAppointmentItemVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit" // Use "exit" for pending appointments that are removed
                                    layout
                                >
                                    <div className={styles.vetDash_appointmentTimeAvatar}>
                                        <img
                                            src={cita.avatar}
                                            alt={`${cita.mascota} avatar`}
                                            className={styles.vetDash_mascotaAvatar}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = `https://placehold.co/40x40/cccccc/ffffff?text=${cita.mascota?.charAt(0) || 'M'}`;
                                            }}
                                        />
                                        <span className={styles.vetDash_timeDisplay} style={{ color: cita.color }}>{cita.time}</span>
                                    </div>
                                    <div className={styles.vetDash_appointmentDetails}>
                                        <h4>
                                            <FontAwesomeIcon icon={cita.icon} style={{ color: cita.color, marginRight: '10px' }} />
                                            <span className={styles.vetDash_mascotaName}>{cita.mascota}</span>
                                            <span className={styles.vetDash_serviceType}> - {cita.servicio}</span>
                                        </h4>
                                        <p className={styles.vetDash_propietarioName}>Propietario: <strong>{cita.propietario}</strong></p>
                                        <p className={styles.vetDash_servicePrice}>Precio: <strong>${cita.precio?.toLocaleString('es-CO')}</strong></p>
                                    </div>
                                    <div className={styles.vetDash_appointmentActions}>
                                        {/* Botones de Aceptar/Rechazar para citas PENDIENTES */}
                                        {cita.estado === 'PENDIENTE' && (
                                            <>
                                                <motion.button
                                                    className={`${styles.vetDash_actionButton} ${styles.vetDash_acceptButton}`}
                                                    onClick={() => handleUpdateAppointmentStatus(cita.id, 'ACEPTADA')}
                                                    whileHover={{ scale: 1.05, backgroundColor: 'var(--color-success-dark)', color: 'white' }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    <FontAwesomeIcon icon={faCheck} /> Aceptar
                                                </motion.button>
                                                <motion.button
                                                    className={`${styles.vetDash_actionButton} ${styles.vetDash_rejectButton}`}
                                                    onClick={() => handleUpdateAppointmentStatus(cita.id, 'RECHAZADA')}
                                                    whileHover={{ scale: 1.05, backgroundColor: 'var(--color-danger-dark)', color: 'white' }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    <FontAwesomeIcon icon={faTimesCircle} /> Rechazar
                                                </motion.button>
                                            </>
                                        )}
                                        {/* Botón de Marcar Completada si la cita ya está ACEPTADA */}
                                        {cita.estado === 'ACEPTADA' && (
                                            <motion.button
                                                className={`${styles.vetDash_actionButton} ${styles.vetDash_completeButton}`}
                                                onClick={() => handleUpdateAppointmentStatus(cita.id, 'COMPLETA')}
                                                whileHover={{ scale: 1.05, backgroundColor: 'var(--color-primary-dark)', color: 'white' }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                Marcar Completada
                                            </motion.button>
                                        )}
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
                                <p>¡Felicitaciones! No tienes citas pendientes de revisión por ahora.</p>
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
