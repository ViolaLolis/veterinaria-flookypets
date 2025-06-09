import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPaw, FaCalendarPlus, FaShoppingCart, FaBell, FaClipboardList, FaHeart, FaQuestionCircle, FaUserCog, FaChevronDown, FaChevronLeft, FaChevronRight, FaSignOutAlt, FaUserEdit, FaCog } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import CitasUsuario from './CitasUsuario';
import ServiciosVeterinaria from './ServiciosVeterinaria';
import styles from './Styles/InicioUsuario.module.css';
import logo from '../Inicio/Imagenes/flooty.png';

const InicioUsuario = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('mascotas');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [expandedReminders, setExpandedReminders] = useState(false);
  const [currentPetIndex, setCurrentPetIndex] = useState(0);
  const [showPetsDropdown, setShowPetsDropdown] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Datos del usuario con múltiples mascotas
  const [userData, setUserData] = useState({
    nombre: "Juan Pérez",
    email: "juan.perez@example.com",
    membresia: "Premium",
    mascotas: [
      {
        id: 1,
        nombre: "Max",
        tipo: "Perro",
        raza: "Golden Retriever",
        edad: "3 años",
        imagen: "https://images.unsplash.com/photo-1633722715463-d30f4f325e24?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80"
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
  });

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

  // Animaciones
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } }
  };

  const slideUp = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
  };

  // Función para manejar el cierre de sesión
  const handleLogout = () => {
    setIsLoggingOut(true);
    // Simular proceso de logout
    setTimeout(() => {
      // Aquí deberías reemplazar con tu lógica real de logout
      // Por ejemplo: limpiar tokens, contexto, etc.
      navigate('/login'); // Redirigir a la página de login
    }, 1500);
  };

  // Función para navegar a perfil
  const goToProfile = () => {
    navigate('/perfil'); // Reemplaza con tu ruta de perfil
  };

  // Función para navegar a configuración
  const goToSettings = () => {
    navigate('/configuracion'); // Reemplaza con tu ruta de configuración
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'citas':
        return <CitasUsuario />;
      case 'servicios':
        return <ServiciosVeterinaria />;
      default:
        return (
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className={styles.petsContent}
          >
            <h2>Tus Mascotas</h2>
            <div className={styles.petsGrid}>
              {userData.mascotas.map((pet, index) => (
                <motion.div 
                  key={pet.id}
                  className={styles.petCard}
                  variants={slideUp}
                  whileHover={{ y: -5 }}
                >
                  <img src={pet.imagen} alt={pet.nombre} className={styles.petCardImage} />
                  <div className={styles.petCardInfo}>
                    <h3>{pet.nombre}</h3>
                    <p>{pet.tipo} • {pet.raza}</p>
                    <p>{pet.edad}</p>
                  </div>
                  <button 
                    className={styles.petCardButton}
                    onClick={() => {
                      setCurrentPetIndex(index);
                      setShowPetsDropdown(false);
                    }}
                  >
                    Ver detalles
                  </button>
                </motion.div>
              ))}
              <motion.div 
                className={styles.addPetCard}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className={styles.addPetContent}>
                  <div className={styles.addPetIcon}>+</div>
                  <p>Agregar nueva mascota</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        );
    }
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

  const currentPet = userData.mascotas[currentPetIndex];

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
                    onClick={goToProfile}
                    whileHover={{ x: 5 }}
                  >
                    <FaUserEdit className={styles.menuIcon} /> Mi perfil
                  </motion.button>
                  <motion.button 
                    className={styles.menuItem}
                    onClick={goToSettings}
                    whileHover={{ x: 5 }}
                  >
                    <FaCog className={styles.menuIcon} /> Configuración
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
            >
              Confirmar asistencia
            </motion.button>
            <motion.button 
              className={styles.secondaryButton}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
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
    </div>
  );
};

export default InicioUsuario;