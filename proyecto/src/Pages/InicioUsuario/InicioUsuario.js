import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import {
  FaPaw, FaCalendarAlt, FaShoppingBag, FaChevronDown,
  FaSignOutAlt, FaCog, FaUser, FaSpinner, FaBars, FaTimes,
  FaHome, FaBell // Import FaBell for notifications
} from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import styles from './Styles/InicioUsuario.module.css';
import logo from '../Inicio/Imagenes/flooty.png';
import { authFetch } from './api';

const InicioUsuario = ({ user, setUser }) => { // user and setUser are props coming from a higher component (e.g., App.js)
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState(null);

  // --- NUEVOS ESTADOS PARA NOTIFICACIONES ---
  const [notifications, setNotifications] = useState([]);
  const [showNotificationsMenu, setShowNotificationsMenu] = useState(false);
  const notificationsRef = useRef(null);
  // --- FIN NUEVOS ESTADOS ---

  const profileMenuRef = useRef(null);
  const mobileNavRef = useRef(null);

  const getActiveTab = useCallback(() => {
    const path = location.pathname;
    if (path === '/usuario' || path === '/usuario/dashboard') return 'dashboard';
    if (path.startsWith('/usuario/mascotas')) return 'mascotas';
    if (path.startsWith('/usuario/citas')) return 'citas';
    if (path.startsWith('/usuario/servicios')) return 'servicios';
    if (path.startsWith('/usuario/perfil')) return 'perfil';
    return 'dashboard';
  }, [location.pathname]);

  const [activeTab, setActiveTab] = useState(getActiveTab());

  useEffect(() => {
    setActiveTab(getActiveTab());
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  }, [getActiveTab, location.pathname, isMobileMenuOpen]);

  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    const timer = setTimeout(() => {
      setNotification(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  const fetchUserData = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No hay sesión activa. Por favor, inicia sesión.');
      setIsLoading(false);
      navigate('/login');
      return;
    }

    let currentUser = user;
    if (!currentUser?.id) {
      console.warn('User ID no disponible para fetchUserData. Intentando cargar desde localStorage...');
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser && storedUser.id) {
        currentUser = storedUser;
        // If user was not passed as prop, set it in parent state if possible
        if (setUser) { // Check if setUser is provided as a prop
            setUser(storedUser);
        }
      } else {
        setError('Usuario no identificado. Por favor, inicia sesión nuevamente.');
        setIsLoading(false);
        navigate('/login');
        return;
      }
    }

    try {
      // Simulamos la llamada a la API con datos mock
      // const response = await authFetch(`/usuarios/${currentUser.id}`);
      const mockUserData = {
        success: true,
        data: {
          id: currentUser.id,
          nombre: currentUser.nombre,
          email: currentUser.email,
          imagen_url: currentUser.imagen_url || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.nombre || 'U'}&chars=1&backgroundColor=00acc1,007c91,4dd0e1&fontFamily=Poppins`,
          // Add a mock 'mascotas' array for testing InicioDashboard's pet count
          mascotas: [{id:1, name:'Max'}, {id:2, name:'Luna'}] // Example mock pets
        }
      };

      if (mockUserData.success) {
        setUserData(mockUserData.data);
      } else {
        setError(mockUserData.message || 'Error al cargar los datos del usuario.');
        showNotification(mockUserData.message || 'Error al cargar datos del perfil', 'error');
      }
    } catch (err) {
      setError('Error de conexión con el servidor. Intenta de nuevo más tarde.');
      console.error("Error al obtener datos del usuario:", err);
      showNotification('Error de conexión', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [user, showNotification, navigate, setUser]); // Added setUser to dependencies

  // --- NUEVA FUNCIÓN PARA OBTENER NOTIFICACIONES (MOCK) ---
  const fetchNotifications = useCallback(async (currentUserId) => {
    const mockNotificationsData = [
      {
        id_notificacion: 1,
        id_usuario: 3, // Juan Pérez (user@example.com)
        tipo: 'cita_pendiente',
        mensaje: '¡Hola Juan! Tienes una cita pendiente para Max el 15/07/2030 a las 10:00 AM.',
        leida: false,
        fecha_creacion: '2025-07-03T10:00:00Z',
        referencia_id: 1, // id_cita
      },
      {
        id_notificacion: 2,
        id_usuario: 3, // Juan Pérez (user@example.com)
        tipo: 'historial_actualizado',
        mensaje: 'Se ha añadido una nueva entrada al historial médico de Luna.',
        leida: false,
        fecha_creacion: '2025-07-02T14:30:00Z',
        referencia_id: 2, // id_mascota
      },
      {
        id_notificacion: 3,
        id_usuario: 9, // Alejandro Rojas (user1@example.com)
        tipo: 'cita_pendiente',
        mensaje: '¡Hola Alejandro! Tienes una cita pendiente para Rocky el 15/07/2030.',
        leida: false,
        fecha_creacion: '2025-07-01T11:00:00Z',
        referencia_id: 2, // id_cita
      },
      {
        id_notificacion: 4,
        id_usuario: 3, // Juan Pérez (user@example.com)
        tipo: 'cita_aceptada',
        mensaje: 'Tu cita para Lily el 20/08/2030 ha sido aceptada.',
        leida: true,
        fecha_creacion: '2025-06-28T09:00:00Z',
        referencia_id: 12, // id_cita
      },
      {
        id_notificacion: 5,
        id_usuario: 10, // Gabriela Sánchez (user2@example.com)
        tipo: 'historial_actualizado',
        mensaje: 'Se ha añadido una nueva entrada al historial médico de Milo.',
        leida: false,
        fecha_creacion: '2025-07-03T09:00:00Z',
        referencia_id: 4, // id_mascota
      },
      {
        id_notificacion: 6,
        id_usuario: 3, // Juan Pérez (user@example.com)
        tipo: 'recordatorio_cita',
        mensaje: '¡Recordatorio! Tu cita para Max es mañana, 2025-07-04.',
        leida: false,
        fecha_creacion: '2025-07-03T08:00:00Z',
        referencia_id: 1, // id_cita
      }
    ];

    const userNotifications = mockNotificationsData.filter(
      (n) => n.id_usuario === currentUserId
    );
    setNotifications(userNotifications);
  }, []);

  useEffect(() => {
    fetchUserData();
    if (user?.id) {
      fetchNotifications(user.id);
      const notificationInterval = setInterval(() => {
        fetchNotifications(user.id);
      }, 60000);
      return () => clearInterval(notificationInterval);
    }
  }, [fetchUserData, fetchNotifications, user]);

  const handleLogout = useCallback(() => {
    setIsLoggingOut(true);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    showNotification('¡Hasta pronto! Cerrando tu sesión...', 'success');
    setTimeout(() => {
      navigate('/login');
      setIsLoggingOut(false);
    }, 1500);
  }, [navigate, setUser, showNotification]);

  const markNotificationAsRead = useCallback((id_notificacion) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((n) =>
        n.id_notificacion === id_notificacion ? { ...n, leida: true } : n
      )
    );
  }, []);

  const unreadNotificationsCount = notifications.filter(n => !n.leida).length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (mobileNavRef.current && !mobileNavRef.current.contains(event.target) && isMobileMenuOpen) {
        if (!event.target.closest(`.${styles.mobileMenuButton}`)) {
          setIsMobileMenuOpen(false);
        }
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotificationsMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <FaSpinner className={styles.spinnerIcon} />
        <p>Preparando tu espacio, un momento...</p>
      </div>
    );
  }

  // Render a specific error message if user data couldn't be loaded or identified
  if (error && !user?.id) { // Only show this error if there's an issue with user identification specifically
    return (
      <div className={styles.errorMessage}>
        <FontAwesomeIcon icon={faTimesCircle} className={styles.errorIcon} />
        <h2>¡Oh no! Ha ocurrido un problema.</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/login')} className={styles.retryButton}>
          Ir a Iniciar Sesión
        </button>
      </div>
    );
  }

  // If user data is still null but not loading (and no specific error for user ID), might be a temporary state
  if (!user && !isLoading) {
    return (
        <div className={styles.errorMessage}>
            <FaSpinner className={styles.spinnerIcon} />
            <p>Cargando información del usuario...</p>
        </div>
    );
  }


  return (
    <div className={styles.dashboardContainer}>
      {/* Notificación simple sin animaciones */}
      {notification && (
        <div className={`${styles.notification} ${styles[notification.type]}`}>
          <FontAwesomeIcon
            icon={
              notification.type === 'success' ? faCheckCircle :
                notification.type === 'error' ? faTimesCircle :
                  faExclamationTriangle
            }
          />
          <span>{notification.message}</span>
        </div>
      )}

      <header className={styles.header}>
        <div className={styles.logoContainer} onClick={() => navigate('/usuario')}>
          <img src={logo} alt="Flooky Pets Logo" className={styles.logo} />
          <h1>Flooky Pets</h1>
        </div>

        <button
          className={styles.mobileMenuButton}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        <nav ref={mobileNavRef} className={`${styles.nav} ${isMobileMenuOpen ? styles.navOpen : ''}`}>
          {isMobileMenuOpen && (
            <button
              className={styles.closeMobileMenuButton}
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Cerrar menú"
            >
              <FaTimes />
            </button>
          )}

          <button
            className={`${styles.navButton} ${activeTab === 'dashboard' ? styles.active : ''}`}
            onClick={() => { navigate('/usuario'); setIsMobileMenuOpen(false); }}
          >
            <FaHome /> Inicio
          </button>
          <button
            className={`${styles.navButton} ${activeTab === 'mascotas' ? styles.active : ''}`}
            onClick={() => { navigate('/usuario/mascotas'); setIsMobileMenuOpen(false); }}
          >
            <FaPaw /> Mis Mascotas
          </button>
          <button
            className={`${styles.navButton} ${activeTab === 'citas' ? styles.active : ''}`}
            onClick={() => { navigate('/usuario/citas'); setIsMobileMenuOpen(false); }}
          >
            <FaCalendarAlt /> Mis Citas
          </button>
          <button
            className={`${styles.navButton} ${activeTab === 'servicios' ? styles.active : ''}`}
            onClick={() => { navigate('/usuario/servicios'); setIsMobileMenuOpen(false); }}
          >
            <FaShoppingBag /> Servicios
          </button>
          {/* BOTÓN DE NOTIFICACIONES PARA MÓVIL */}
          {isMobileMenuOpen && (
            <div
              className={`${styles.navButton} ${styles.notificationMobileButton}`}
              onClick={() => { setShowNotificationsMenu(!showNotificationsMenu); }}
            >
              <FaBell /> Notificaciones
              {unreadNotificationsCount > 0 && (
                <span className={styles.notificationBadge}>{unreadNotificationsCount}</span>
              )}
            </div>
          )}
        </nav>

        <div className={styles.profileAndNotificationsSection}>
          {/* Icono de Notificaciones para Desktop */}
          <div className={styles.notificationIconContainer} ref={notificationsRef}>
            <button
              className={styles.notificationIconButton}
              onClick={() => setShowNotificationsMenu(!showNotificationsMenu)}
              aria-label="Ver notificaciones"
            >
              <FaBell />
              {unreadNotificationsCount > 0 && (
                <span className={styles.notificationBadge}>{unreadNotificationsCount}</span>
              )}
            </button>
            {showNotificationsMenu && (
              <div className={styles.notificationsDropdown}>
                <h3>Notificaciones</h3>
                {notifications.length === 0 ? (
                  <p>No tienes notificaciones nuevas.</p>
                ) : (
                  <ul>
                    {notifications
                      .sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion)) // Más recientes primero
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
                              onClick={() => markNotificationAsRead(notif.id_notificacion)}
                              title="Marcar como leída"
                            >
                              ✓
                            </button>
                          )}
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <div className={styles.profileSection} ref={profileMenuRef}>
            <div
              className={styles.profileDropdownToggle}
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              title={`Hola, ${userData?.nombre || 'Usuario'}`}
            >
              <img
                src={userData?.imagen_url || `https://api.dicebear.com/7.x/initials/svg?seed=${userData?.nombre || 'U'}&chars=1&backgroundColor=00acc1,007c91,4dd0e1&fontFamily=Poppins`}
                alt="Avatar de Usuario"
                className={styles.profileAvatar}
                onError={(e) => e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${userData?.nombre || 'U'}&chars=1&backgroundColor=00acc1,007c91,4dd0e1&fontFamily=Poppins`}
              />
              <span className={styles.profileName}>{userData?.nombre?.split(' ')[0] || 'Usuario'}</span>
              <FaChevronDown className={`${styles.dropdownIcon} ${showProfileMenu ? styles.rotate : ''}`} />
            </div>

            {showProfileMenu && (
              <div className={styles.profileDropdownMenu}>
                <button
                  className={styles.dropdownItem}
                  onClick={() => { navigate('/usuario/perfil'); setShowProfileMenu(false); }}
                >
                  <FaUser /> Mi Perfil
                </button>
                <button
                  className={styles.dropdownItem}
                  onClick={() => { navigate('/usuario/settings'); setShowProfileMenu(false); }}
                >
                  <FaCog /> Ajustes
                </button>
                <div className={styles.dropdownDivider}></div>
                <button
                  className={`${styles.dropdownItem} ${styles.logoutButton}`}
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? <FaSpinner className={styles.spinnerIcon} /> : <FaSignOutAlt />}
                  {isLoggingOut ? 'Cerrando...' : 'Cerrar Sesión'}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className={styles.mainContent}>
        {/* Pass user and showNotification (and setUser if needed by children) to the Outlet's context */}
        <Outlet context={{ user: userData, setUser, showNotification }} />
      </main>
    </div>
  );
};

export default InicioUsuario;