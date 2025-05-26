import React, { useState } from 'react';
import MisMascotas from './MisMascotas';
import CitasUsuario from './CitasUsuario';
import ServiciosVeterinaria from './ServiciosVeterinaria';
import styles from './Styles/InicioUsuario.module.css';
import logo from '../Inicio/Imagenes/flooty.png';
import { FaPaw, FaCalendarPlus, FaShoppingCart, FaBell, FaClipboardList, FaHeart, FaQuestionCircle, FaUserCog, FaChevronDown, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import BarraNavegacionUsuario from './BarraNavegacionUsuario';

const InicioUsuario = () => {
  const [activeTab, setActiveTab] = useState('mascotas');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [expandedReminders, setExpandedReminders] = useState(false);
  const [currentPetIndex, setCurrentPetIndex] = useState(0);
  const [showPetsDropdown, setShowPetsDropdown] = useState(false);
  
  // Datos del usuario con múltiples mascotas
  const userData = {
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
      },
      {
        id: 3,
        nombre: "Rocky",
        tipo: "Perro",
        raza: "Bulldog",
        edad: "5 años",
        imagen: "https://images.unsplash.com/photo-1586671267731-da2cf3ceeb80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80"
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
    { id: 4, texto: "Renovar membresía premium - Vence en 1 mes", importante: true },
    { id: 5, texto: "Recordar desparasitación trimestral", importante: false },
    { id: 6, texto: "Revisar ofertas en alimentos este mes", importante: false }
  ];

  const renderContent = () => {
    switch(activeTab) {
      case 'mascotas':
        return <MisMascotas />;
      case 'citas':
        return <CitasUsuario />;
      case 'servicios':
        return <ServiciosVeterinaria />;
      default:
        return <MisMascotas />;
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
          <h1 className={styles.welcome}>¡Hola, <span>{userData.nombre}</span>!</h1>
          <p className={styles.subtitle}>¿Qué vamos a hacer hoy?</p>
        </div>
        
        <div className={styles.userActions}>
          <button className={styles.helpButton}>
            <FaQuestionCircle /> <span>Ayuda</span>
          </button>
          
          <div className={styles.profileContainer}>
            <button 
              className={styles.profileButton}
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <div className={styles.profileInitial}>{userData.nombre.charAt(0)}</div>
              <FaChevronDown className={`${styles.profileArrow} ${showProfileMenu ? styles.rotated : ''}`} />
            </button>
            
            {showProfileMenu && (
              <div className={styles.profileMenu}>
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
                <button className={styles.menuItem}>Mi perfil</button>
                <button className={styles.menuItem}>Configuración</button>
                <button className={styles.menuItem}>Cerrar sesión</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sección de mascota destacada y próxima cita */}
      <div className={styles.highlightSection}>
        <div className={styles.petHighlight}>
          <div className={styles.petImageContainer}>
            <img src={currentPet.imagen} alt={currentPet.nombre} className={styles.petImage} />
            <div className={styles.petImageOverlay}></div>
            <div className={styles.petNavigation}>
              <button className={styles.navArrow} onClick={handlePrevPet}>
                <FaChevronLeft />
              </button>
              <button className={styles.navArrow} onClick={handleNextPet}>
                <FaChevronRight />
              </button>
            </div>
          </div>
          <div className={styles.petInfo}>
            <div className={styles.petSelectorContainer}>
              <h3>Mi compañero:</h3>
              <div className={styles.petSelectorWrapper}>
                <button 
                  className={styles.petSelectorButton}
                  onClick={() => setShowPetsDropdown(!showPetsDropdown)}
                >
                  <span>{currentPet.nombre}</span>
                  <FaChevronDown className={styles.selectorArrow} />
                </button>
                {showPetsDropdown && (
                  <div className={styles.petsDropdown}>
                    {userData.mascotas.map((pet, index) => (
                      <button
                        key={pet.id}
                        className={`${styles.petOption} ${index === currentPetIndex ? styles.selectedPet : ''}`}
                        onClick={() => handlePetSelect(index)}
                      >
                        {pet.nombre}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className={styles.petDetails}>
              <span className={styles.petDetail}>{currentPet.tipo}</span>
              <span className={styles.petDetail}>{currentPet.raza}</span>
              <span className={styles.petDetail}>{currentPet.edad}</span>
            </div>
            <button className={styles.careButton}>
              <FaHeart /> <span>Historial de salud</span>
            </button>
          </div>
        </div>

        <div className={styles.nextAppointment}>
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
            <button className={styles.primaryButton}>Confirmar asistencia</button>
            <button className={styles.secondaryButton}>Reagendar</button>
          </div>
        </div>
      </div>

      {/* Barra de navegación integrada */}
      <nav className={styles.integratedNav}>
        <button 
          className={`${styles.navButton} ${activeTab === 'mascotas' ? styles.active : ''}`}
          onClick={() => setActiveTab('mascotas')}
        >
          <FaPaw className={styles.navIcon} />
          <span>Mis Mascotas</span>
          <div className={styles.navIndicator}></div>
        </button>
        <button 
          className={`${styles.navButton} ${activeTab === 'citas' ? styles.active : ''}`}
          onClick={() => setActiveTab('citas')}
        >
          <FaClipboardList className={styles.navIcon} />
          <span>Mis Citas</span>
          <div className={styles.navIndicator}></div>
        </button>
        <button 
          className={`${styles.navButton} ${activeTab === 'servicios' ? styles.active : ''}`}
          onClick={() => setActiveTab('servicios')}
        >
          <FaShoppingCart className={styles.navIcon} />
          <span>Servicios</span>
          <div className={styles.navIndicator}></div>
        </button>
      </nav>

      {/* Contenido principal dinámico */}
      <div className={styles.mainContent}>
        {renderContent()}
      </div>

      {/* Sidebar con recordatorios y más información */}
      <div className={styles.sidebar}>
        <div className={styles.remindersCard}>
          <div className={styles.cardHeader}>
            <FaBell className={styles.cardIcon} />
            <h3>Recordatorios importantes</h3>
          </div>
          <ul className={styles.remindersList}>
            {recordatorios.filter(r => r.importante).map(item => (
              <li key={item.id} className={styles.importantReminder}>
                <div className={styles.reminderDot}></div>
                <span>{item.texto}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.remindersCard}>
          <div className={styles.cardHeader} onClick={() => setExpandedReminders(!expandedReminders)}>
            <h3>Tus recordatorios</h3>
            <FaChevronDown className={`${styles.expandIcon} ${expandedReminders ? styles.expanded : ''}`} />
          </div>
          <ul className={`${styles.remindersList} ${expandedReminders ? styles.expanded : ''}`}>
            {recordatorios.map(item => (
              <li key={item.id} className={item.importante ? styles.importantReminder : ''}>
                <div className={`${styles.reminderDot} ${item.importante ? styles.importantDot : ''}`}></div>
                <span>{item.texto}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.tipCard}>
          <div className={styles.tipHeader}>
            <div className={styles.tipIcon}>💡</div>
            <h3>Consejos</h3>
          </div>
          <p>Los perros de razas grandes necesitan ejercicio regular pero controlado durante su crecimiento para evitar problemas articulares. 30-40 minutos dos veces al día es ideal para {currentPet.nombre}.</p>
        </div>
      </div>
    </div>
  );
};

export default InicioUsuario;