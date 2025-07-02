import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import {
  FaPaw, FaCalendarAlt, FaShoppingBag, FaChevronDown,
  FaSignOutAlt, FaCog, FaUser, FaSpinner, FaBars, FaTimes,
  FaHome // Añadimos el icono de Home para el botón de Inicio
} from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Styles/InicioUsuario.module.css'; // Usando CSS Modules
import logo from '../Inicio/Imagenes/flooty.png';
import { authFetch } from './api'; // Asegúrate de que esta ruta sea correcta

const InicioUsuario = ({ user, setUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Estado para el menú móvil
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState(null);

  // Referencia para detectar clics fuera del menú de perfil y menú móvil
  const profileMenuRef = useRef(null);
  const mobileNavRef = useRef(null); // Cambiado de mobileMenuRef a mobileNavRef para la <nav>

  // --- Funciones Optimizadas y Mejoradas ---

  // Determina la pestaña activa basada en la URL
  const getActiveTab = useCallback(() => {
    const path = location.pathname;
    // Si la ruta es exactamente /usuario o /usuario/, se considera "dashboard"
    if (path === '/usuario' || path === '/usuario/dashboard') return 'dashboard';
    if (path.startsWith('/usuario/mascotas')) return 'mascotas';
    if (path.startsWith('/usuario/citas')) return 'citas';
    if (path.startsWith('/usuario/servicios')) return 'servicios';
    // Para Mi Perfil, ya que su ruta base es /usuario/perfil
    if (path.startsWith('/usuario/perfil')) return 'perfil';
    return 'dashboard'; // Default, para que el botón de inicio se active si no hay otra ruta específica
  }, [location.pathname]);

  // Se inicializa con 'dashboard' por defecto, y se actualiza con getActiveTab
  const [activeTab, setActiveTab] = useState(getActiveTab());

  // Actualiza la pestaña activa cuando cambia la URL
  useEffect(() => {
    setActiveTab(getActiveTab());
    // Cierra el menú móvil al navegar
    // Si usas el menú lateral full-screen, esta línea es vital
    if (isMobileMenuOpen) { // Solo cierra si está abierto para evitar cambios de estado innecesarios
      setIsMobileMenuOpen(false);
    }
  }, [getActiveTab, location.pathname, isMobileMenuOpen]); // Agregado location.pathname y isMobileMenuOpen como dependencias


  // Muestra notificaciones temporales
  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    const timer = setTimeout(() => {
      setNotification(null);
    }, 4000); // Notificación visible por 4 segundos
    return () => clearTimeout(timer); // Limpiar timeout si el componente se desmonta
  }, []);

  // Obtiene los datos del usuario logueado
  const fetchUserData = useCallback(async () => {
    // Verificar si el token existe antes de intentar una solicitud autenticada
    const token = localStorage.getItem('token');
    if (!token) {
        setError('No hay sesión activa. Por favor, inicia sesión.');
        setIsLoading(false);
        navigate('/login'); // Redirige al login si no hay token
        return;
    }

    if (!user?.id) {
        // Esto puede ocurrir si el 'user' en el estado del prop aún no se ha cargado o está incompleto.
        // En un caso real, deberías tener el user ID del token o de una sesión persistente.
        console.warn('User ID no disponible para fetchUserData. Intentando cargar desde localStorage...');
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser && storedUser.id) {
            user = storedUser; // Usar el usuario del localStorage si existe
        } else {
            setError('Usuario no identificado. Por favor, inicia sesión nuevamente.');
            setIsLoading(false);
            navigate('/login');
            return;
        }
    }

    try {
      const response = await authFetch(`/usuarios/${user.id}`); // Usa el user cargado o el prop user
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
  }, [user, showNotification, navigate]); // Añadido 'navigate' a las dependencias

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Maneja el cierre de sesión
  const handleLogout = useCallback(() => {
    setIsLoggingOut(true);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null); // Limpia el estado del usuario en el componente padre (App.js)
    showNotification('¡Hasta pronto! Cerrando tu sesión...', 'success');
    setTimeout(() => {
      navigate('/login');
      setIsLoggingOut(false);
    }, 1500); // Pequeño retraso para ver la notificación
  }, [navigate, setUser, showNotification]);

  // Cierra el menú de perfil y el menú móvil al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Cierra menú de perfil
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      // Cierra menú móvil (asegura que no sea el botón de hamburguesa quien lo cierre)
      if (mobileNavRef.current && !mobileNavRef.current.contains(event.target) && isMobileMenuOpen) {
        // Verifica si el clic no fue en el botón que abre/cierra el menú móvil
        if (!event.target.closest(`.${styles.mobileMenuButton}`)) {
            setIsMobileMenuOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]); // Dependencia para que el efecto se re-ejecute si el estado del menú móvil cambia


  // --- Renderizado Condicional ---
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

  // --- Estructura Principal del Dashboard ---
  return (
    <div className={styles.dashboardContainer}>
      {/* Notificaciones Flotantes */}
      <AnimatePresence>
        {notification && (
          <motion.div
            className={`${styles.notification} ${styles[notification.type]}`}
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <FontAwesomeIcon
              icon={
                notification.type === 'success' ? faCheckCircle :
                notification.type === 'error' ? faTimesCircle :
                faExclamationTriangle
              }
            />
            <span>{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Principal */}
      <header className={styles.header}>
        <div className={styles.logoContainer} onClick={() => navigate('/usuario')}>
          <img src={logo} alt="Flooky Pets Logo" className={styles.logo} />
          <h1>Flooky Pets</h1>
        </div>

        {/* Botón de Menú Móvil (Hamburguesa) - Visible solo en móviles */}
        <button
          className={styles.mobileMenuButton}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* Navegación Principal */}
        {/* Usamos el ref aquí para detectar clics fuera y la clase dinámica para abrir/cerrar */}
        <nav ref={mobileNavRef} className={`${styles.nav} ${isMobileMenuOpen ? styles.navOpen : ''}`}>
           {/* Botón de cierre dentro del menú móvil (opcional, si se abre como overlay) */}
           {isMobileMenuOpen && (
               <button
                   className={styles.closeMobileMenuButton} // Nuevo estilo para este botón
                   onClick={() => setIsMobileMenuOpen(false)}
                   aria-label="Cerrar menú"
               >
                   <FaTimes />
               </button>
           )}

          <button
            className={`${styles.navButton} ${activeTab === 'dashboard' ? styles.active : ''}`}
            onClick={() => { navigate('/usuario'); setIsMobileMenuOpen(false); }} // Cierra el menú al navegar
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

        {/* Sección de Perfil */}
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

          {/* Menú Desplegable del Perfil */}
          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                className={styles.profileMenu}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <button onClick={() => { navigate('/usuario/perfil'); setShowProfileMenu(false); }}>
                  <FaUser /> Mi Perfil
                </button>
                <button onClick={() => { navigate('/usuario/perfil/configuracion'); setShowProfileMenu(false); }}>
                  <FaCog /> Configuración
                </button>
                <div className={styles.divider}></div> {/* Separador visual */}
                <button onClick={handleLogout} disabled={isLoggingOut} className={styles.logoutButton}>
                  {isLoggingOut ? <FaSpinner className={styles.spinnerIcon} /> : <FaSignOutAlt />}
                  {isLoggingOut ? 'Cerrando...' : 'Cerrar Sesión'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Contenido Principal (Outlet para rutas anidadas) */}
      {/* Se añade un fondo oscuro cuando el menú móvil está abierto */}
      <main className={`${styles.mainContent} ${isMobileMenuOpen ? styles.mainContentBlurred : ''}`}>
        <Outlet context={{ user: userData || user, showNotification, fetchUserData }} /> {/* Pasamos userData o user si userData no está cargado */}
      </main>

      {/* Backdrop oscuro para el menú móvil */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className={styles.mobileMenuBackdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsMobileMenuOpen(false)} // Cierra el menú al hacer clic en el backdrop
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default InicioUsuario;