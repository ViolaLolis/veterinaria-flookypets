import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import {
  FaPaw, FaCalendarAlt, FaShoppingBag, FaChevronDown,
  FaSignOutAlt, FaCog, FaUser, FaSpinner, FaBars, FaTimes,
  FaHome
} from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
// import { motion, AnimatePresence } from 'framer-motion'; // ¡IMPORTACIONES QUITADAS!
import styles from './Styles/InicioUsuario.module.css';
import logo from '../Inicio/Imagenes/flooty.png';
import { authFetch } from './api';

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

    if (!user?.id) {
      console.warn('User ID no disponible para fetchUserData. Intentando cargar desde localStorage...');
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser && storedUser.id) {
        user = storedUser;
      } else {
        setError('Usuario no identificado. Por favor, inicia sesión nuevamente.');
        setIsLoading(false);
        navigate('/login');
        return;
      }
    }

    try {
      const response = await authFetch(`/usuarios/${user.id}`);
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
  }, [user, showNotification, navigate]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

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

  if (error) {
    return (
      <div className={styles.errorMessage}>
        <FontAwesomeIcon icon={faTimesCircle} className={styles.errorIcon} />
        <h2>¡Oh no! Ha ocurrido un problema.</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className={styles.retryButton}>
          <FaSpinner className={styles.spinnerIcon} /> Reintentar
        </button>
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
        </nav>

        <div className={styles.profileSection} ref={profileMenuRef}>
          <div
            className={styles.profileDropdownToggle}
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            title={`Hola, ${user?.nombre || 'Usuario'}`}
          >
            <img
              src={userData?.imagen_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.nombre || 'U'}&chars=1&backgroundColor=00acc1,007c91,4dd0e1&fontFamily=Poppins`}
              alt="Avatar de Usuario"
              className={styles.profileAvatar}
              onError={(e) => e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${user?.nombre || 'U'}&chars=1&backgroundColor=00acc1,007c91,4dd0e1&fontFamily=Poppins`}
            />
            <span className={styles.profileName}>{user?.nombre?.split(' ')[0] || 'Usuario'}</span>
            <FaChevronDown className={`${styles.dropdownIcon} ${showProfileMenu ? styles.rotate : ''}`} />
          </div>

          {/* Menú desplegable sin animaciones */}
          {showProfileMenu && (
            <div className={styles.profileMenu}>
              <button onClick={() => { navigate('/usuario/perfil'); setShowProfileMenu(false); }}>
                <FaUser /> Mi Perfil
              </button>
              <button onClick={() => { navigate('/usuario/perfil/configuracion'); setShowProfileMenu(false); }}>
                <FaCog /> Configuración
              </button>
              <div className={styles.divider}></div>
              <button onClick={handleLogout} disabled={isLoggingOut} className={styles.logoutButton}>
                {isLoggingOut ? <FaSpinner className={styles.spinnerIcon} /> : <FaSignOutAlt />}
                {isLoggingOut ? 'Cerrando...' : 'Cerrar Sesión'}
              </button>
            </div>
          )}
        </div>
      </header>

      <main className={`${styles.mainContent} ${isMobileMenuOpen ? styles.mainContentBlurred : ''}`}>
        <Outlet context={{ user: userData || user, showNotification, fetchUserData }} />
      </main>

      {/* Backdrop sin animaciones */}
      {isMobileMenuOpen && (
        <div
          className={styles.mobileMenuBackdrop}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default InicioUsuario;
