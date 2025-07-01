import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import {
  FaPaw, FaCalendarPlus, FaShoppingCart, FaBell, FaChevronDown,
  FaSignOutAlt, FaCog, FaUserCog, FaSpinner// FaTimes y FaSpinner de react-icons/fa
} from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle} from '@fortawesome/free-solid-svg-icons'; // faCheckCircle, faTimesCircle y faCalendarAlt de Font Awesome

import { motion, AnimatePresence } from 'framer-motion';
import styles from './Styles/InicioUsuario.module.css';
import logo from '../Inicio/Imagenes/flooty.png';
import { authFetch } from './api';

const InicioUsuario = ({ user, setUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState(null);

  const getActiveTab = useCallback(() => {
    if (location.pathname.startsWith('/usuario/mascotas')) {
      return 'mascotas';
    }
    if (location.pathname.startsWith('/usuario/citas')) {
      return 'citas';
    }
    if (location.pathname.startsWith('/usuario/servicios')) {
      return 'servicios';
    }
    return 'mascotas';
  }, [location.pathname]);

  const [activeTab, setActiveTab] = useState(getActiveTab());

  useEffect(() => {
    setActiveTab(getActiveTab());
  }, [getActiveTab]);


  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    const timer = setTimeout(() => {
      setNotification(null);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const fetchUserData = useCallback(async () => {
    if (!user || !user.id) {
      setError('No se pudo obtener la información del usuario. Por favor, inicia sesión.');
      setIsLoading(false);
      return;
    }
    try {
      const response = await authFetch(`/usuarios/${user.id}`);
      if (response.success) {
        setUserData(response.data);
      } else {
        setError(response.message || 'Error al obtener datos del usuario.');
      }
    } catch (err) {
      console.error("Error en authFetch para /usuarios:", err);
      setError('Error de conexión al servidor.');
    } finally {
      setIsLoading(false);
    }
  }, [user, authFetch]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleLogout = () => {
    setIsLoggingOut(true);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    showNotification('Sesión cerrada correctamente. Redirigiendo...', 'success');
    setTimeout(() => {
      navigate('/login');
    }, 1500);
  };

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <FaSpinner className={styles.spinnerIcon} /> {/* FaSpinner de react-icons/fa */}
        <p>Cargando datos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorMessage}>
        <FontAwesomeIcon icon={faTimesCircle} className={styles.errorIcon} /> {/* faTimesCircle de Font Awesome */}
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      <AnimatePresence>
        {notification && (
          <motion.div
            className={`${styles.notification} ${styles[notification.type]}`}
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
          >
            <FontAwesomeIcon icon={notification.type === 'success' ? faCheckCircle : faTimesCircle} />
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logoContainer}>
          <img src={logo} alt="Flooky Pets Logo" className={styles.logo} />
          <span className={styles.appName}>Flooky Pets</span>
        </div>
        <nav className={styles.nav}>
          <button
            className={`${styles.navButton} ${activeTab === 'mascotas' ? styles.active : ''}`}
            onClick={() => navigate('/usuario/mascotas')}
          >
            <FaPaw /> Mis Mascotas
          </button>
          <button
            className={`${styles.navButton} ${activeTab === 'citas' ? styles.active : ''}`}
            onClick={() => navigate('/usuario/citas')}
          >
            <FaCalendarPlus /> Mis Citas
          </button>
          <button
            className={`${styles.navButton} ${activeTab === 'servicios' ? styles.active : ''}`}
            onClick={() => navigate('/usuario/servicios')}
          >
            <FaShoppingCart /> Servicios
          </button>
        </nav>
        <div className={styles.profileSection}>
          <div className={styles.iconButton} onClick={toggleProfileMenu}>
            <FaBell />
            {/* <span className={styles.badge}>3</span> */}
          </div>
          <div className={styles.profileDropdownToggle} onClick={toggleProfileMenu}>
            <img
              src={userData?.imagen_url || `https://placehold.co/150x150/cccccc/ffffff?text=${user?.nombre?.charAt(0) || 'U'}`}
              alt="User Avatar"
              className={styles.profileAvatar}
              onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/150x150/cccccc/ffffff?text=${user?.nombre?.charAt(0) || 'U'}`; }}
            />
            <span>{user?.nombre || 'Usuario'}</span>
            <FaChevronDown className={styles.profileDropdownIcon} />
          </div>
          {showProfileMenu && (
            <motion.div
              className={styles.profileMenu}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <button onClick={() => { navigate('/usuario/perfil'); setShowProfileMenu(false); }}>
                <FaUserCog /> Mi Perfil
              </button>
              <button onClick={() => { navigate('/usuario/perfil/configuracion'); setShowProfileMenu(false); }}>
                <FaCog /> Configuración
              </button>
              <button onClick={handleLogout} disabled={isLoggingOut}>
                {isLoggingOut ? <FaSpinner className={styles.spinnerIcon} /> : <FaSignOutAlt />} Cerrar Sesión
              </button>
            </motion.div>
          )}
        </div>
      </header>

      {/* Main Content - RENDERIZADO POR OUTLET */}
      <main className={styles.mainContent}>
        <Outlet context={{ user, showNotification }} />
      </main>
    </div>
  );
};

export default InicioUsuario;
