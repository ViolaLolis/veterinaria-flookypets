import React, { useState, useEffect, useCallback, useRef } from 'react';
import styles from './Style/MainVeterinarioStyles.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPaw, faUser,
    faCalendarAlt, faNotesMedical, faCheckCircle,
    faPlus, faHome,
    faSignOutAlt, faTimesCircle, faBell, faExclamationTriangle
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

const MainVeterinario = ({ user, setUser }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const [notification, setNotification] = useState(null);
    const [notificationTimeout, setNotificationTimeout] = useState(null);

    const [vetNotifications, setVetNotifications] = useState([]);
    const [showVetNotificationsMenu, setShowVetNotificationsMenu] = useState(false);
    const vetNotificationsRef = useRef(null);

    // Asegúrate de que esta URL base coincida con la de tu backend
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'; 

    const showNotification = useCallback((message, type = 'info', duration = 3000) => {
        if (notificationTimeout) {
            clearTimeout(notificationTimeout);
        }

        setNotification({ message, type });

        const timeout = setTimeout(() => {
            setNotification(null);
        }, duration);
        setNotificationTimeout(timeout);
    }, [notificationTimeout]);

    useEffect(() => {
        return () => {
            if (notificationTimeout) {
                clearTimeout(notificationTimeout);
            }
        };
    }, [notificationTimeout]);

    // Función para obtener notificaciones del veterinario desde el backend
    const fetchVetNotifications = useCallback(async (currentVetId) => {
        if (!currentVetId) {
            console.log("No veterinarian ID available to fetch notifications.");
            setVetNotifications([]);
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            console.error("No token found. User not authenticated.");
            showNotification('Sesión expirada o no autenticada. Por favor, inicia sesión.', 'error');
            setUser(null);
            navigate('/login');
            return;
        }

        try {
            // CORREGIDO: Cambiada la ruta a /api/notifications/user/:id para que coincida con el backend
            const response = await fetch(`${API_BASE_URL}/api/notifications/user/${currentVetId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) { // Añadido 403 para acceso denegado
                    showNotification('No autorizado. Tu sesión puede haber expirado o no tienes permisos.', 'error');
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setUser(null);
                    navigate('/login');
                } else {
                    const errorBody = await response.text();
                    console.error(`Error fetching notifications: ${response.status} ${response.statusText}. Response body: ${errorBody}`);
                    throw new Error(`Error fetching notifications: ${response.statusText}`);
                }
            }

            const data = await response.json();
            if (data.success) {
                setVetNotifications(data.data);
            } else {
                showNotification(data.message || 'Error al cargar notificaciones.', 'error');
                setVetNotifications([]);
            }
        } catch (error) {
            console.error("Failed to fetch veterinarian notifications:", error);
            showNotification(`Error de red al cargar notificaciones: ${error.message}`, 'error');
            setVetNotifications([]);
        }
    }, [API_BASE_URL, showNotification, setUser, navigate]);

    // Función para marcar una notificación como leída en el backend
    const markVetNotificationAsRead = useCallback(async (id_notificacion) => {
        const token = localStorage.getItem('token');
        if (!token) {
            showNotification('No autenticado para marcar notificación.', 'error');
            return;
        }

        try {
            // ESTA ES LA RUTA CORRECTA: /api/notifications/mark-read/:id_notificacion
            const response = await fetch(`${API_BASE_URL}/api/notifications/mark-read/${id_notificacion}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ leida: true })
            });

            if (!response.ok) {
                const errorBody = await response.text();
                console.error(`Error marking notification as read: ${response.status} ${response.statusText}. Response body: ${errorBody}`);
                throw new Error(`Error marking notification as read: ${response.statusText}`);
            }

            const data = await response.json();
            if (data.success) {
                setVetNotifications((prevNotifications) =>
                    prevNotifications.map((n) =>
                        n.id_notificacion === id_notificacion ? { ...n, leida: true } : n
                    )
                );
                showNotification('Notificación marcada como leída.', 'success', 1500);
            } else {
                showNotification(data.message || 'Error al marcar notificación como leída.', 'error');
            }
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
            showNotification(`Error de red: ${error.message}`, 'error');
        }
    }, [API_BASE_URL, showNotification]);


    useEffect(() => {
        if (user?.id && user?.role === 'veterinario') {
            fetchVetNotifications(user.id);
            const notificationInterval = setInterval(() => {
                fetchVetNotifications(user.id);
            }, 60000); // Fetch every minute
            return () => clearInterval(notificationInterval);
        }
    }, [fetchVetNotifications, user]);

    const unreadVetNotificationsCount = vetNotifications.filter(n => !n.leida).length;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (vetNotificationsRef.current && !vetNotificationsRef.current.contains(event.target)) {
                setShowVetNotificationsMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const navigateTo = useCallback((path) => {
        navigate(`/veterinario/${path}`);
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        showNotification('¡Hasta pronto! Cerrando tu sesión...', 'success');
        navigate('/login');
    };

    const isDashboard = location.pathname === '/veterinario' ||
        location.pathname === '/veterinario/' ||
        location.pathname === '/veterinario/navegacion';

    return (
        <motion.div
            className={styles.vetMainContainer}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
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
                            {user?.imagen_url ? (
                                <img
                                    src={user.imagen_url}
                                    alt="Avatar Veterinario"
                                    className={styles.vetAvatarImage}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = `https://placehold.co/150x150/00acc1/ffffff?text=${user?.nombre?.charAt(0) || 'DR'}`;
                                    }}
                                />
                            ) : (
                                user?.nombre?.charAt(0).toUpperCase() || 'DR'
                            )}
                        </motion.div>
                        <div className={styles.vetUserInfo}>
                            <h3>{user?.nombre || 'Dr. Veterinario'}</h3>
                            <p>{user?.experiencia || 'Especialista'}</p>
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

                            {/* BOTÓN DE NOTIFICACIONES */}
                            <motion.li
                                whileHover={{ x: 5, backgroundColor: "rgba(0, 188, 212, 0.1)" }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setShowVetNotificationsMenu(!showVetNotificationsMenu)}
                                className={styles.notificationSidebarItem}
                            >
                                <div className={styles.vetNavIcon}>
                                    <FontAwesomeIcon icon={faBell} />
                                </div>
                                <span>Notificaciones</span>
                                {unreadVetNotificationsCount > 0 && (
                                    <span className={styles.notificationBadge}>{unreadVetNotificationsCount}</span>
                                )}
                            </motion.li>
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
                            onClick={() => navigateTo('historiales/registrar')}
                            className={styles.vetQuickButton}
                        >
                            <FontAwesomeIcon icon={faNotesMedical} />
                            <span>Registrar Historial</span>
                        </motion.button>
                    </div>

                    <div className={styles.vetSidebarFooter}>
                        <motion.button
                            className={styles.vetLogoutButton}
                            whileHover={{ x: 5, backgroundColor: "rgba(255, 82, 82, 0.1)" }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleLogout}
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
                        <Outlet context={{ user, showNotification }} />
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* Notificación flotante (para mensajes temporales) */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        className={`${styles.floatingNotification} ${styles[notification.type]}`}
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -100, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        onClick={() => setNotification(null)}
                    >
                        <FontAwesomeIcon icon={
                            notification.type === 'success' ? faCheckCircle :
                                notification.type === 'error' ? faTimesCircle :
                                    faExclamationTriangle
                        } className={styles.notificationIcon} />
                        <span>{notification.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Menú desplegable de notificaciones del veterinario */}
            <AnimatePresence>
                {showVetNotificationsMenu && (
                    <motion.div
                        ref={vetNotificationsRef}
                        className={styles.vetNotificationsDropdown}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        <h3>Notificaciones del Veterinario</h3>
                        {vetNotifications.length === 0 ? (
                            <p>No tienes notificaciones nuevas.</p>
                        ) : (
                            <ul>
                                {vetNotifications
                                    .sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion))
                                    .map((notif) => (
                                        <li key={notif.id_notificacion} className={notif.leida ? styles.read : styles.unread}>
                                            <div className={styles.notificationContent}>
                                                <p className={styles.notificationMessage}>{notif.mensaje}</p>
                                                <span className={styles.notificationDate}>
                                                    {new Date(notif.fecha_creacion).toLocaleString()}
                                                </span>
                                            </div>
                                            {!notif.leida && (
                                                <button
                                                    className={styles.markAsReadButton}
                                                    onClick={() => markVetNotificationAsRead(notif.id_notificacion)}
                                                    title="Marcar como leída"
                                                >
                                                    ✓
                                                </button>
                                            )}
                                        </li>
                                    ))}
                            </ul>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default MainVeterinario;
