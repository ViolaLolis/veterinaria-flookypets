import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import {
  FaPaw, FaCalendarAlt, FaShoppingBag, FaChevronDown,
  FaSignOutAlt, FaUser, FaSpinner, FaBars, FaTimes,
  FaHome, FaBell // Import FaBell for notifications
} from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import styles from './Styles/InicioUsuario.module.css';
import logo from '../Inicio/Imagenes/flooty.png';
import { authFetch } from './api'; // Asumiendo que `authFetch` es tu función para llamadas autenticadas

const InicioUsuario = ({ user, setUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState(null);

  const [notifications, setNotifications] = useState([]);
  const [showNotificationsMenu, setShowNotificationsMenu] = useState(false);
  const notificationsRef = useRef(null);

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
        if (setUser) {
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
      // Usar authFetch para obtener los datos del usuario real
      const response = await authFetch(`/usuarios/${currentUser.id}`); // Asumiendo que esta ruta existe
      if (response.success) {
        setUserData(response.data);
      } else {
        setError(response.message || 'Error al cargar los datos del usuario.');
        showNotification(response.message || 'Error al cargar datos del perfil', 'error');
      }
    } catch (err) {
      setError('Error de conexión con el servidor. Intenta de nuevo más tarde.');
      console.error("Error al obtener datos del usuario:", err);
      showNotification('Error de conexión', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [user, showNotification, navigate, setUser]);

  // FUNCIÓN ACTUALIZADA PARA OBTENER NOTIFICACIONES DESDE LA API
  const fetchNotifications = useCallback(async (currentUserId) => {
    if (!currentUserId) {
      console.warn('No user ID provided for fetching notifications.');
      return;
    }
    try {
      const response = await authFetch(`/api/notifications`);
      if (response.success) {
        setNotifications(response.data);
      } else {
        console.error('Error al obtener notificaciones:', response.message);
        // Opcional: showNotification('Error al cargar notificaciones', 'error');
      }
    } catch (error) {
      console.error('Error de conexión al obtener notificaciones:', error);
      // Opcional: showNotification('Error de conexión con el servidor de notificaciones', 'error');
    }
  }, []);

  useEffect(() => {
    fetchUserData();
    if (user?.id) {
      fetchNotifications(user.id);
      // Establecer un intervalo para refrescar las notificaciones cada 60 segundos
      const notificationInterval = setInterval(() => {
        fetchNotifications(user.id);
      }, 60000);
      return () => clearInterval(notificationInterval); // Limpiar el intervalo al desmontar
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

  // FUNCIÓN ACTUALIZADA PARA MARCAR NOTIFICACIÓN COMO LEÍDA EN LA API
  const markNotificationAsRead = useCallback(async (id_notificacion) => {
    try {
      const response = await authFetch(`/api/notifications/${id_notificacion}/read`, {
        method: 'PUT',
      });
      if (response.success) {
        setNotifications((prevNotifications) =>
          prevNotifications.map((n) =>
            n.id_notificacion === id_notificacion ? { ...n, leida: true } : n
          )
        );
        // Opcional: showNotification('Notificación marcada como leída', 'success');
      } else {
        console.error('Error al marcar como leída:', response.message);
        showNotification('Error al marcar notificación como leída', 'error');
      }
    } catch (error) {
      console.error('Error de conexión al marcar notificación como leída:', error);
      showNotification('Error de conexión', 'error');
    }
  }, [showNotification]);

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

  if (error && !user?.id) {
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
        <Outlet context={{ user: userData, setUser, showNotification }} />
      </main>
    </div>
  );
};

export default InicioUsuario;