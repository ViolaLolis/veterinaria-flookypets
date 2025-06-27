import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import {
  FaPaw, FaCalendarPlus, FaShoppingCart, FaBell, FaClipboardList,
  FaHeart, FaQuestionCircle, FaChevronDown,
  FaChevronLeft, FaChevronRight, FaSignOutAlt, FaCog, FaUserCog, FaSpinner, FaInfoCircle, FaTimes
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import CitasUsuario from './CitasUsuario'; // Asegúrate de que estos componentes existan
import ServiciosVeterinaria from './ServiciosVeterinaria'; // Asegúrate de que estos componentes existan
import TarjetaMascota from './TarjetaMascota'; // Asegúrate de que estos componentes existan
import styles from './Styles/InicioUsuario.module.css';
import logo from '../Inicio/Imagenes/flooty.png'; // Asegúrate de que la ruta sea correcta

const InicioUsuario = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('mascotas');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [expandedReminders, setExpandedReminders] = useState(false);
  const [currentPetIndex, setCurrentPetIndex] = useState(0);
  const [showPetsDropdown, setShowPetsDropdown] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Estados para datos cargados de la API
  const [userDataApi, setUserDataApi] = useState(null); // Datos del usuario
  const [userPets, setUserPets] = useState([]); // Mascotas del usuario
  const [userAppointments, setUserAppointments] = useState([]); // Citas del usuario
  const [loadingUserData, setLoadingUserData] = useState(true);
  const [loadingPets, setLoadingPets] = useState(true);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState(null);

  // Nuevos estados para los modales de cita
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [appointmentToManage, setAppointmentToManage] = useState(null); // La cita que se va a confirmar/reagendar
  const [newRescheduleDate, setNewRescheduleDate] = useState('');
  const [newRescheduleTime, setNewRescheduleTime] = useState('');
  const [isManagingAppointment, setIsManagingAppointment] = useState(false); // Para el spinner en los modales

  // Función auxiliar para obtener el token de autenticación del localStorage
  const getAuthToken = useCallback(() => {
    return localStorage.getItem('token');
  }, []);

  /**
   * Muestra una notificación temporal en la UI.
   * @param {string} message - El mensaje a mostrar.
   * @param {string} type - El tipo de notificación ('success' o 'error').
   */
  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000); // Notificación dura 3 segundos
  }, []);

  /**
   * Función mejorada para realizar peticiones fetch con autenticación JWT.
   * @param {string} endpoint - El endpoint de la API relativo.
   * @param {object} options - Opciones para la petición fetch.
   * @returns {Promise<object>} Los datos de la respuesta JSON.
   * @throws {Error} Si no se encontró el token o la respuesta de la red no es OK.
   */
  const authFetch = useCallback(async (endpoint, options = {}) => {
    const token = getAuthToken();
    if (!token) {
      showNotification('No se encontró token de autenticación. Por favor, inicie sesión nuevamente.', 'error');
      // Redirigir al login si no hay token
      navigate('/login');
      throw new Error('No se encontró token de autenticación.');
    }

    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    };

    if (options.body && typeof options.body !== 'string') {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Error ${response.status}: ${response.statusText}`;
        showNotification(`Error de API: ${errorMessage}`, 'error');
        throw new Error(errorMessage);
      }
      return response.json();
    } catch (err) {
      console.error(`Error en authFetch para ${endpoint}:`, err);
      setError(`Error de conexión: ${err.message}`); // Set general error for main component
      throw err; // Re-throw para que el caller pueda manejarlo
    }
  }, [getAuthToken, showNotification, navigate]);

  // useEffect para controlar el overflow del body cuando los modales están abiertos
  useEffect(() => {
    if (showConfirmModal || showRescheduleModal) {
      document.body.classList.add(styles['modal-open']);
    } else {
      document.body.classList.remove(styles['modal-open']);
    }

    return () => {
      document.body.classList.remove(styles['modal-open']);
    };
  }, [showConfirmModal, showRescheduleModal]);

  // Cargar datos del usuario
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user || !user.id) {
        setLoadingUserData(false);
        return;
      }
      setLoadingUserData(true);
      setError('');
      try {
        const responseData = await authFetch(`/usuarios/${user.id}`);
        if (responseData.success && responseData.data) {
          setUserDataApi(responseData.data);
        } else {
          setError(responseData.message || 'Error al cargar datos del usuario.');
        }
      } catch (err) {
        // setError handled by authFetch
      } finally {
        setLoadingUserData(false);
      }
    };
    fetchUserData();
  }, [user?.id, authFetch]); // Dependencia user?.id

  // Cargar mascotas del usuario
  useEffect(() => {
    const fetchUserPets = async () => {
      if (!user || !user.id) {
        setLoadingPets(false);
        return;
      }
      setLoadingPets(true);
      setError('');
      try {
        const responseData = await authFetch(`/mascotas?id_propietario=${user.id}`);
        if (responseData.success && responseData.data) {
          // Asigna imágenes placeholder si no hay URLs reales de imágenes en la DB
          const petsWithImages = responseData.data.map(pet => ({
            ...pet,
            imagen: `https://placehold.co/300x200/${Math.floor(Math.random()*16777215).toString(16)}/${Math.floor(Math.random()*16777215).toString(16)}?text=${pet.nombre}`
          }));
          setUserPets(petsWithImages);
          if (petsWithImages.length > 0) {
            setCurrentPetIndex(0); // Asegurarse de que haya una mascota seleccionada si hay datos
          }
        } else {
          setUserPets([]);
          setError(responseData.message || 'Error al cargar mascotas.');
        }
      } catch (err) {
        // setError handled by authFetch
      } finally {
        setLoadingPets(false);
      }
    };
    fetchUserPets();
  }, [user?.id, authFetch]);

  // Cargar citas del usuario
  const fetchUserAppointments = useCallback(async () => {
    if (!user || !user.id) {
      setLoadingAppointments(false);
      return;
    }
    setLoadingAppointments(true);
    setError('');
    try {
      const responseData = await authFetch(`/citas?id_cliente=${user.id}`);
      if (responseData.success && responseData.data) {
        setUserAppointments(responseData.data);
      } else {
        setUserAppointments([]);
        setError(responseData.message || 'Error al cargar citas.');
      }
    } catch (err) {
      // setError handled by authFetch
    } finally {
      setLoadingAppointments(false);
    }
  }, [user?.id, authFetch]);

  useEffect(() => {
    fetchUserAppointments();
  }, [fetchUserAppointments]);

  // Determinar la próxima cita
  const proximaCita = userAppointments
    .filter(cita => {
      const fechaCita = new Date(cita.fecha);
      const now = new Date();
      return fechaCita > now && (cita.estado === 'pendiente' || cita.estado === 'aceptada');
    })
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))[0];


  // Animaciones de Framer Motion
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const slideUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  // Función para manejar el cierre de sesión
  const handleLogout = useCallback(() => {
    setIsLoggingOut(true);
    setTimeout(() => {
      localStorage.removeItem('user');
      localStorage.removeItem('token'); // Asegurarse de remover el token
      setUser(null);
      navigate('/');
    }, 1500); // Simula un delay para el cierre de sesión
  }, [navigate, setUser]);

  const handlePrevPet = useCallback(() => {
    setCurrentPetIndex(prev =>
      prev === 0 ? userPets.length - 1 : prev - 1
    );
  }, [userPets]);

  const handleNextPet = useCallback(() => {
    setCurrentPetIndex(prev =>
      prev === userPets.length - 1 ? 0 : prev + 1
    );
  }, [userPets]);

  const handlePetSelect = useCallback((index) => {
    setCurrentPetIndex(index);
    setShowPetsDropdown(false);
  }, []);

  // Funciones para los nuevos modales
  const handleConfirmAssistance = useCallback((cita) => {
    setAppointmentToManage(cita);
    setShowConfirmModal(true);
  }, []);

  const handleReschedule = useCallback((cita) => {
    setAppointmentToManage(cita);
    // Establecer fecha y hora predeterminadas para el modal de reagendamiento
    const appointmentDate = new Date(cita.fecha);
    const formattedDate = appointmentDate.toISOString().split('T')[0];
    const formattedTime = appointmentDate.toTimeString().split(' ')[0].substring(0, 5);
    setNewRescheduleDate(formattedDate);
    setNewRescheduleTime(formattedTime);
    setShowRescheduleModal(true);
  }, []);

  const confirmAppointment = useCallback(async () => {
    if (!appointmentToManage) return;

    setIsManagingAppointment(true);
    try {
      await authFetch(`/citas/${appointmentToManage.id_cita}`, {
        method: 'PUT',
        body: { estado: 'completa' } // Cambiar estado a completada
      });
      showNotification('Asistencia confirmada exitosamente.', 'success');
      fetchUserAppointments(); // Recargar citas para actualizar el estado en la UI
      setShowConfirmModal(false);
    } catch (err) {
      showNotification('Error al confirmar asistencia.', 'error');
    } finally {
      setIsManagingAppointment(false);
    }
  }, [appointmentToManage, authFetch, showNotification, fetchUserAppointments]);

  const rescheduleAppointment = useCallback(async () => { // Corrected function name
    if (!appointmentToManage || !newRescheduleDate || !newRescheduleTime) {
      showNotification('Por favor, selecciona una nueva fecha y hora.', 'error');
      return;
    }

    setIsManagingAppointment(true);
    try {
      const newDateTime = `${newRescheduleDate} ${newRescheduleTime}:00`;
      await authFetch(`/citas/${appointmentToManage.id_cita}`, {
        method: 'PUT',
        body: {
          fecha: newDateTime,
          estado: 'pendiente' // O 'reagendada' si tienes ese estado en tu DB
        }
      });
      showNotification('Cita reagendada exitosamente.', 'success');
      fetchUserAppointments(); // Recargar citas para actualizar el estado en la UI
      setShowRescheduleModal(false);
    } catch (err) {
      showNotification('Error al reagendar cita.', 'error');
    } finally {
      setIsManagingAppointment(false);
    }
  }, [appointmentToManage, newRescheduleDate, newRescheduleTime, authFetch, showNotification, fetchUserAppointments]);


  const currentPet = userPets[currentPetIndex];

  // Función para renderizar el contenido dinámico según la pestaña activa
  const renderContent = () => {
    if (loadingPets || loadingAppointments || loadingUserData) {
      return (
        <div className={styles.loadingState}>
          <FaSpinner className={styles.spinnerIcon} />
          <p>Cargando información...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className={styles.errorState}>
          <FaInfoCircle className={styles.infoIcon} />
          <p>{error}</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'mascotas':
        return (
          <motion.div
            className={styles.mascotasContainer}
            key="mascotas-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {userPets.length > 0 ? (
              <TarjetaMascota mascota={currentPet} />
            ) : (
              <div className={styles.noDataMessage}>
                <p>No tienes mascotas registradas. ¡Agrega una para empezar!</p>
                <motion.button
                    className={styles.addPetButton}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/usuario/mascotas/agregar')}
                >
                    <FaPaw /> Agregar Mascota
                </motion.button>
              </div>
            )}
          </motion.div>
        );
      case 'citas':
        return (
          <motion.div
            key="citas-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <CitasUsuario user={user} authFetch={authFetch} /> {/* Pasar user y authFetch si CitasUsuario los necesita */}
          </motion.div>
        );
      case 'servicios':
        return (
          <motion.div
            key="servicios-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ServiciosVeterinaria user={user} authFetch={authFetch} /> {/* Pasar user y authFetch si ServiciosVeterinaria los necesita */}
          </motion.div>
        );
      default:
        return null;
    }
  };

  // Datos del usuario para el header (usar userDataApi si está cargado, si no, user prop)
  const displayUserName = userDataApi?.nombre || user?.nombre || "Usuario";
  const displayUserEmail = userDataApi?.email || user?.email || "usuario@example.com";
  // Asumiendo que 'membresia' no viene de la DB o es un valor fijo para este nivel
  const displayMembership = "Premium";


  return (
    <div className={styles.container}>
      {/* Notificaciones */}
      <AnimatePresence>
        {notification && (
          <motion.div
            key="notification"
            className={`${styles.notification} ${styles[notification.type]}`}
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
          >
            <FaInfoCircle className={styles.notificationIcon} />
            {notification.message}
            <button className={styles.closeNotification} onClick={() => setNotification(null)}>
              <FaTimes />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header con opciones de perfil y ayuda */}
      <div className={styles.header}>
        <div className={styles.logoContainer}>
          <img src={logo} alt="Logo Flooky Pets" className={styles.logo} />
          <div className={styles.logoText}>Flooky Pets</div>
        </div>

        <div className={styles.userWelcome}>
          <motion.h1
            className={styles.welcome}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            ¡Hola, <span>{displayUserName}</span>!
          </motion.h1>
          <motion.p
            className={styles.subtitle}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            ¿Qué vamos a hacer hoy?
          </motion.p>
        </div>

        <div className={styles.userActions}>
          <motion.button
            className={styles.helpButton}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/usuario/ayuda')}
          >
            <FaQuestionCircle /> <span>Ayuda</span>
          </motion.button>

          <div className={styles.profileContainer}>
            <motion.button
              className={styles.profileButton}
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className={styles.profileInitial}>{displayUserName.charAt(0)}</div>
              <FaChevronDown className={`${styles.profileArrow} ${showProfileMenu ? styles.rotated : ''}`} />
            </motion.button>

            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  className={styles.profileMenu}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className={styles.profileInfo}>
                    <div className={styles.profileInitialLarge}>{displayUserName.charAt(0)}</div>
                    <div>
                      <div className={styles.profileName}>{displayUserName}</div>
                      <div className={styles.profileEmail}>{displayUserEmail}</div>
                    </div>
                  </div>
                  <div className={styles.profileStatus}>
                    <span className={styles.membershipBadge}>{displayMembership}</span>
                  </div>
                  <motion.button
                    className={styles.menuItem}
                    onClick={() => navigate('/usuario/perfil')}
                    whileHover={{ x: 5 }}
                  >
                    <FaUserCog className={styles.menuIcon} /> Mi perfil
                  </motion.button>
                  <motion.button
                    className={styles.menuItem}
                    onClick={() => navigate('/usuario/perfil/configuracion')}
                    whileHover={{ x: 5 }}
                  >
                    <FaCog className={styles.menuIcon} /> Configuración
                  </motion.button>
                  <motion.button
                    className={styles.menuItem}
                    onClick={() => navigate('/usuario/perfil/pagos')}
                    whileHover={{ x: 5 }}
                  >
                    <FaHeart className={styles.menuIcon} /> Métodos de Pago
                  </motion.button>
                  <motion.button
                    className={styles.menuItem}
                    onClick={handleLogout}
                    whileHover={{ x: 5 }}
                  >
                    <FaSignOutAlt className={styles.menuIcon} /> Cerrar sesión
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Sección de mascota destacada y próxima cita */}
      <div className={styles.highlightSection}>
        <motion.div
          className={styles.petHighlight}
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          {loadingPets ? (
            <div className={styles.loadingSection}>
              <FaSpinner className={styles.spinnerIcon} />
              <p>Cargando mascotas...</p>
            </div>
          ) : userPets.length > 0 ? (
            <>
              <div className={styles.petImageContainer}>
                <img src={currentPet.imagen} alt={currentPet.nombre} className={styles.petImage} />
                <div className={styles.petImageOverlay}></div>
                <div className={styles.petNavigation}>
                  <motion.button
                    className={styles.navArrow}
                    onClick={handlePrevPet}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <FaChevronLeft />
                  </motion.button>
                  <motion.button
                    className={styles.navArrow}
                    onClick={handleNextPet}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <FaChevronRight />
                  </motion.button>
                </div>
              </div>
              <div className={styles.petInfo}>
                <div className={styles.petSelectorContainer}>
                  <h3>Mi compañero:</h3>
                  <div className={styles.petSelectorWrapper}>
                    <motion.button
                      className={styles.petSelectorButton}
                      onClick={() => setShowPetsDropdown(!showPetsDropdown)}
                      whileHover={{ scale: 1.02 }}
                    >
                      <span>{currentPet.nombre}</span>
                      <FaChevronDown className={styles.selectorArrow} />
                    </motion.button>
                    <AnimatePresence>
                      {showPetsDropdown && (
                        <motion.div
                          className={styles.petsDropdown}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ type: 'spring', stiffness: 300 }}
                        >
                          {userPets.map((pet, index) => (
                            <motion.button
                              key={pet.id_mascota}
                              className={`${styles.petOption} ${index === currentPetIndex ? styles.selectedPet : ''}`}
                              onClick={() => handlePetSelect(index)}
                              whileHover={{ x: 5 }}
                            >
                              {pet.nombre}
                            </motion.button>
                          ))}
                          <motion.button
                            className={styles.addPetOption}
                            whileHover={{ x: 5 }}
                            onClick={() => navigate('/usuario/mascotas/agregar')}
                          >
                            + Agregar mascota
                          </motion.button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                <div className={styles.petDetails}>
                  <motion.span
                    className={styles.petDetail}
                    whileHover={{ scale: 1.05 }}
                  >
                    {currentPet.especie}
                  </motion.span>
                  <motion.span
                    className={styles.petDetail}
                    whileHover={{ scale: 1.05 }}
                  >
                    {currentPet.raza}
                  </motion.span>
                  <motion.span
                    className={styles.petDetail}
                    whileHover={{ scale: 1.05 }}
                  >
                    {currentPet.edad ? `${currentPet.edad} años` : 'Edad no especificada'}
                  </motion.span>
                </div>
                <motion.button
                  className={styles.careButton}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate(`/usuario/historial/${currentPet.id_mascota}`)}
                >
                  <FaHeart /> <span>Historial de salud</span>
                </motion.button>
              </div>
            </>
          ) : (
            <div className={styles.noPetsHighlight}>
              <FaPaw className={styles.noPetsIcon} />
              <p>¡Aún no tienes mascotas registradas!</p>
              <motion.button
                className={styles.addPetButton}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/usuario/mascotas/agregar')}
              >
                Registrar Mascota
              </motion.button>
            </div>
          )}
        </motion.div>

        <motion.div
          className={styles.nextAppointment}
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <div className={styles.appointmentHeader}>
            <FaCalendarPlus className={styles.appointmentIcon} />
            <h3>Próxima cita</h3>
          </div>
          {loadingAppointments ? (
            <div className={styles.loadingSection}>
              <FaSpinner className={styles.spinnerIcon} />
              <p>Cargando cita...</p>
            </div>
          ) : proximaCita ? (
            <>
              <div className={styles.appointmentDetails}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Fecha:</span>
                  <span className={styles.detailValue}>{new Date(proximaCita.fecha).toLocaleDateString()} a las {new Date(proximaCita.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Veterinario:</span>
                  <span className={styles.detailValue}>{proximaCita.veterinario_nombre || 'No asignado'}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Servicio:</span>
                  <span className={styles.detailValue}>{proximaCita.servicio_nombre}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Estado:</span>
                  <span className={styles.detailValue}>{proximaCita.estado}</span>
                </div>
              </div>
              <div className={styles.appointmentActions}>
                <motion.button
                  className={styles.primaryButton}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleConfirmAssistance(proximaCita)}
                  disabled={isManagingAppointment}
                >
                  {isManagingAppointment ? <FaSpinner className={styles.spinnerIcon} /> : 'Confirmar asistencia'}
                </motion.button>
                <motion.button
                  className={styles.secondaryButton}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleReschedule(proximaCita)}
                  disabled={isManagingAppointment}
                >
                  {isManagingAppointment ? <FaSpinner className={styles.spinnerIcon} /> : 'Reagendar'}
                </motion.button>
              </div>
            </>
          ) : (
            <div className={styles.noAppointment}>
              <p>No tienes próximas citas. ¡Programa una!</p>
              <motion.button
                className={styles.primaryButton}
                onClick={() => setActiveTab('citas')} // O redirigir a una página de crear cita
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Programar Cita
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Barra de navegación integrada */}
      <nav className={styles.integratedNav}>
        <motion.button
          className={`${styles.navButton} ${activeTab === 'mascotas' ? styles.active : ''}`}
          onClick={() => setActiveTab('mascotas')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaPaw className={styles.navIcon} />
          <span>Mis Mascotas</span>
          <div className={styles.navIndicator}></div>
        </motion.button>
        <motion.button
          className={`${styles.navButton} ${activeTab === 'citas' ? styles.active : ''}`}
          onClick={() => setActiveTab('citas')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaClipboardList className={styles.navIcon} />
          <span>Mis Citas</span>
          <div className={styles.navIndicator}></div>
        </motion.button>
        <motion.button
          className={`${styles.navButton} ${activeTab === 'servicios' ? styles.active : ''}`}
          onClick={() => setActiveTab('servicios')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaShoppingCart className={styles.navIcon} />
          <span>Servicios</span>
          <div className={styles.navIndicator}></div>
        </motion.button>
      </nav>

      {/* Contenido principal dinámico */}
      <div className={styles.mainContent}>
        <AnimatePresence mode='wait'>
          {renderContent()}
        </AnimatePresence>
        {/* <Outlet />  Se elimina Outlet si los componentes se renderizan directamente */}
      </div>

      {/* Sidebar con recordatorios y más información */}
      <div className={styles.sidebar}>
        {/* Los recordatorios se mantienen estáticos ya que no hay una tabla para ellos */}
        <motion.div
          className={styles.remindersCard}
          initial="hidden"
          animate="visible"
          variants={slideUp}
        >
          <div className={styles.cardHeader}>
            <FaBell className={styles.cardIcon} />
            <h3>Recordatorios importantes</h3>
          </div>
          <ul className={styles.remindersList}>
            {/* Hardcoded reminders, replace with API if you add a table for them */}
            {[
              { id: 1, texto: "Vacuna antirrábica para Max - Vence en 15 días", importante: true },
              { id: 4, texto: "Renovar membresía premium - Vence en 1 mes", importante: true }
            ].filter(r => r.importante).map(item => (
              <motion.li
                key={item.id}
                className={styles.importantReminder}
                whileHover={{ x: 5 }}
              >
                <div className={styles.reminderDot}></div>
                <span>{item.texto}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          className={styles.remindersCard}
          initial="hidden"
          animate="visible"
          variants={slideUp}
        >
          <div
            className={styles.cardHeader}
            onClick={() => setExpandedReminders(!expandedReminders)}
          >
            <h3>Tus recordatorios</h3>
            <FaChevronDown className={`${styles.expandIcon} ${expandedReminders ? styles.expanded : ''}`} />
          </div>
          <motion.ul
            className={`${styles.remindersList} ${expandedReminders ? styles.expanded : ''}`}
            initial={{ height: 0 }}
            animate={{ height: expandedReminders ? 'auto' : 0 }}
          >
            {/* Hardcoded reminders, replace with API if you add a table for them */}
            {[
              { id: 1, texto: "Vacuna antirrábica para Max - Vence en 15 días", importante: true },
              { id: 2, texto: "Comprar alimento premium para gatos", importante: false },
              { id: 3, texto: "Baño y grooming para Luna - Programar cita", importante: false },
              { id: 4, texto: "Renovar membresía premium - Vence en 1 mes", importante: true }
            ].map(item => (
              <motion.li
                key={item.id}
                className={item.importante ? styles.importantReminder : ''}
                whileHover={{ x: 5 }}
              >
                <div className={`${styles.reminderDot} ${item.importante ? styles.importantDot : ''}`}></div>
                <span>{item.texto}</span>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>

        <motion.div
          className={styles.tipCard}
          initial="hidden"
          animate="visible"
          variants={slideUp}
        >
          <div className={styles.tipHeader}>
            <div className={styles.tipIcon}>💡</div>
            <h3>Consejos</h3>
          </div>
          <p>
            {currentPet ?
              `Los ${currentPet.especie === 'Perro' ? 'perros' : 'gatos'} de raza ${currentPet.raza} necesitan cuidados específicos. Consulta con nuestro veterinario para recomendaciones personalizadas para ${currentPet.nombre}.`
              : `Aquí encontrarás consejos útiles sobre el cuidado de mascotas. ¡Agrega una mascota para obtener consejos personalizados!`}
          </p>
        </motion.div>
      </div>

      {/* Overlay de logout */}
      <AnimatePresence>
        {isLoggingOut && (
          <motion.div
            className={styles.logoutOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={styles.logoutModal}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <div className={styles.spinner}></div>
              <p>Cerrando sesión...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal para Confirmar Asistencia */}
      <AnimatePresence>
        {showConfirmModal && appointmentToManage && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowConfirmModal(false)}
          >
            <motion.div
              className={styles.modalContent}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>Confirmar Asistencia</h3>
              <p>¿Estás seguro de que quieres confirmar tu asistencia a la cita del **{new Date(appointmentToManage.fecha).toLocaleDateString()}** a las **{new Date(appointmentToManage.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}**?</p>
              <div className={styles.modalActions}>
                <motion.button
                  className={styles.primaryButton}
                  onClick={confirmAppointment}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isManagingAppointment}
                >
                  {isManagingAppointment ? <><FaSpinner className={styles.spinnerIcon} /> Confirmando...</> : 'Sí, confirmar'}
                </motion.button>
                <motion.button
                  className={styles.secondaryButton}
                  onClick={() => setShowConfirmModal(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isManagingAppointment}
                >
                  Cancelar
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal para Reagendar */}
      <AnimatePresence>
        {showRescheduleModal && appointmentToManage && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowRescheduleModal(false)}
          >
            <motion.div
              className={styles.modalContent}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>Reagendar Cita</h3>
              <p>Por favor, selecciona una nueva fecha y hora para tu cita con el **{appointmentToManage.veterinario_nombre || 'veterinario asignado'}**.</p>
              <input
                type="date"
                className={styles.modalInput}
                value={newRescheduleDate}
                onChange={(e) => setNewRescheduleDate(e.target.value)}
                disabled={isManagingAppointment}
                min={new Date().toISOString().split('T')[0]} // No permitir fechas pasadas
              />
              <input
                type="time"
                className={styles.modalInput}
                value={newRescheduleTime}
                onChange={(e) => setNewRescheduleTime(e.target.value)}
                disabled={isManagingAppointment}
              />
              <div className={styles.modalActions}>
                <motion.button
                  className={styles.primaryButton}
                  onClick={rescheduleAppointment} // Corrected function name here
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isManagingAppointment}
                >
                  {isManagingAppointment ? <><FaSpinner className={styles.spinnerIcon} /> Enviando...</> : 'Enviar Solicitud'}
                </motion.button>
                <motion.button
                  className={styles.secondaryButton}
                  onClick={() => setShowRescheduleModal(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isManagingAppointment}
                >
                  Cancelar
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InicioUsuario;
