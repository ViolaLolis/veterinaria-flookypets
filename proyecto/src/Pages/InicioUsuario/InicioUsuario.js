import React, { useState, useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import {
  FaPaw, FaCalendarPlus, FaShoppingCart, FaBell, FaClipboardList,
  FaHeart, FaQuestionCircle, FaChevronDown,
  FaChevronLeft, FaChevronRight, FaSignOutAlt, FaCog, FaUserCog
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import CitasUsuario from './CitasUsuario'; // Asegúrate de que estos componentes existan
import ServiciosVeterinaria from './ServiciosVeterinaria'; // Asegúrate de que estos componentes existan
import TarjetaMascota from './TarjetaMascota'; // Asegúrate de que estos componentes existan
import styles from './Styles/InicioUsuario.module.css';
import logo from '../Inicio/Imagenes/flooty.png';

const InicioUsuario = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('mascotas');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [expandedReminders, setExpandedReminders] = useState(false);
  const [currentPetIndex, setCurrentPetIndex] = useState(0);
  const [showPetsDropdown, setShowPetsDropdown] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Nuevos estados para los modales de cita
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);

  // useEffect para controlar el overflow del body cuando los modales están abiertos
  useEffect(() => {
    if (showConfirmModal || showRescheduleModal) {
      document.body.classList.add(styles['modal-open']);
    } else {
      document.body.classList.remove(styles['modal-open']);
    }

    // Cleanup function: Asegura que la clase se remueva si el componente se desmonta
    return () => {
      document.body.classList.remove(styles['modal-open']);
    };
  }, [showConfirmModal, showRescheduleModal]);

  // Datos del usuario con múltiples mascotas (datos de ejemplo)
  const userData = {
    nombre: user?.nombre || "Usuario",
    email: user?.email || "usuario@example.com",
    membresia: "Premium",
    mascotas: [
      {
        id: 1,
        nombre: "Max",
        tipo: "Perro",
        raza: "Golden Retriever",
        edad: "3 años",
        imagen: "https://images.unsplash.com/photo-1633722715463-d30f4f325e24?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVu"
      },
      {
        id: 2,
        nombre: "Luna",
        tipo: "Gato",
        raza: "Siamés",
        edad: "2 años",
        imagen: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80"
      }
    ]
  };

  const proximaCita = {
    fecha: "15 de Abril",
    hora: "10:30 AM",
    veterinario: "Dr. Rodríguez",
    motivo: "Chequeo anual",
    ubicacion: "Clínica Veterinaria Central"
  };

  const recordatorios = [
    { id: 1, texto: "Vacuna antirrábica para Max - Vence en 15 días", importante: true },
    { id: 2, texto: "Comprar alimento premium para gatos", importante: false },
    { id: 3, texto: "Baño y grooming para Luna - Programar cita", importante: false },
    { id: 4, texto: "Renovar membresía premium - Vence en 1 mes", importante: true }
  ];

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
  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      localStorage.removeItem('user');
      setUser(null);
      navigate('/');
    }, 1500); // Simula un delay para el cierre de sesión
  };

  const handlePrevPet = () => {
    setCurrentPetIndex(prev =>
      prev === 0 ? userData.mascotas.length - 1 : prev - 1
    );
  };

  const handleNextPet = () => {
    setCurrentPetIndex(prev =>
      prev === userData.mascotas.length - 1 ? 0 : prev + 1
    );
  };

  const handlePetSelect = (index) => {
    setCurrentPetIndex(index);
    setShowPetsDropdown(false);
  };

  // Funciones para los nuevos modales
  const handleConfirmAssistance = () => {
    setShowConfirmModal(true);
    // Aquí se agregaría la lógica para enviar la confirmación al backend
  };

  const handleReschedule = () => {
    setShowRescheduleModal(true);
    // Aquí se agregaría la lógica para iniciar el proceso de reagendar
  };

  const currentPet = userData.mascotas[currentPetIndex];

  // Función para renderizar el contenido dinámico según la pestaña activa
  const renderContent = () => {
    switch(activeTab) {
      case 'mascotas':
        return (
          <motion.div
            className={styles.mascotasContainer}
            key="mascotas-content" // Key para animaciones de AnimatePresence
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <TarjetaMascota mascota={currentPet} />
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
            <CitasUsuario />
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
            <ServiciosVeterinaria />
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
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
            ¡Hola, <span>{userData.nombre}</span>!
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
              <div className={styles.profileInitial}>{userData.nombre.charAt(0)}</div>
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
                    <div className={styles.profileInitialLarge}>{userData.nombre.charAt(0)}</div>
                    <div>
                      <div className={styles.profileName}>{userData.nombre}</div>
                      <div className={styles.profileEmail}>{userData.email}</div>
                    </div>
                  </div>
                  <div className={styles.profileStatus}>
                    <span className={styles.membershipBadge}>{userData.membresia}</span>
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
                    >
                      {userData.mascotas.map((pet, index) => (
                        <motion.button
                          key={pet.id}
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
                {currentPet.tipo}
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
                {currentPet.edad}
              </motion.span>
            </div>
            <motion.button
              className={styles.careButton}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(`/usuario/historial/${currentPet.id}`)}
            >
              <FaHeart /> <span>Historial de salud</span>
            </motion.button>
          </div>
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
          <div className={styles.appointmentDetails}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Fecha:</span>
              <span className={styles.detailValue}>{proximaCita.fecha} a las {proximaCita.hora}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Veterinario:</span>
              <span className={styles.detailValue}>{proximaCita.veterinario}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Motivo:</span>
              <span className={styles.detailValue}>{proximaCita.motivo}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Ubicación:</span>
              <span className={styles.detailValue}>{proximaCita.ubicacion}</span>
            </div>
          </div>
          <div className={styles.appointmentActions}>
            <motion.button
              className={styles.primaryButton}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleConfirmAssistance}
            >
              Confirmar asistencia
            </motion.button>
            <motion.button
              className={styles.secondaryButton}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleReschedule}
            >
              Reagendar
            </motion.button>
          </div>
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
        <Outlet /> {/* Para renderizar las rutas hijas si aún las usas, si no, puedes quitarlo */}
      </div>

      {/* Sidebar con recordatorios y más información */}
      <div className={styles.sidebar}>
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
            {recordatorios.filter(r => r.importante).map(item => (
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
            {recordatorios.map(item => (
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
          <p>Los {currentPet.tipo === 'Perro' ? 'perros' : 'gatos'} de raza {currentPet.raza} necesitan cuidados específicos. Consulta con nuestro veterinario para recomendaciones personalizadas para {currentPet.nombre}.</p>
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
        {showConfirmModal && (
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
              onClick={(e) => e.stopPropagation()} // Evita que el clic en el modal cierre el overlay
            >
              <h3>Confirmar Asistencia</h3>
              <p>¿Estás seguro de que quieres confirmar tu asistencia a la cita del {proximaCita.fecha} a las {proximaCita.hora}?</p>
              <div className={styles.modalActions}>
                <motion.button
                  className={styles.primaryButton}
                  onClick={() => {
                    // Aquí podrías enviar la confirmación al backend
                    // En un entorno de producción, reemplaza el alert con una notificación (ej: Toast)
                    alert('Asistencia confirmada!');
                    setShowConfirmModal(false);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Sí, confirmar
                </motion.button>
                <motion.button
                  className={styles.secondaryButton}
                  onClick={() => setShowConfirmModal(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
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
        {showRescheduleModal && (
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
              onClick={(e) => e.stopPropagation()} // Evita que el clic en el modal cierre el overlay
            >
              <h3>Reagendar Cita</h3>
              <p>Por favor, selecciona una nueva fecha y hora para tu cita con el {proximaCita.veterinario}.</p>
              <input type="date" className={styles.modalInput} />
              <input type="time" className={styles.modalInput} />
              <div className={styles.modalActions}>
                <motion.button
                  className={styles.primaryButton}
                  onClick={() => {
                    // Aquí podrías enviar la solicitud de reagendamiento al backend
                    // En un entorno de producción, reemplaza el alert con una notificación (ej: Toast)
                    alert('Solicitud de reagendamiento enviada!');
                    setShowRescheduleModal(false);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Enviar Solicitud
                </motion.button>
                <motion.button
                  className={styles.secondaryButton}
                  onClick={() => setShowRescheduleModal(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
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