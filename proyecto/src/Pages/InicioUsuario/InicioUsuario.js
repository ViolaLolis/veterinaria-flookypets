import React, { useState } from 'react';
import MisMascotas from './MisMascotas';
import CitasUsuario from './CitasUsuario';
import ServiciosVeterinaria from './ServiciosVeterinaria';
import styles from './Styles/InicioUsuario.module.css';
import logo from '../Inicio/Imagenes/flooty.png';
import { FaPaw, FaCalendarPlus, FaShoppingCart, FaBell, FaClipboardList, FaHeart, FaQuestionCircle, FaUserCog } from 'react-icons/fa';

const InicioUsuario = () => {
  const [activeTab, setActiveTab] = useState('mascotas');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  // Datos del usuario simulados
  const userData = {
    nombre: "Juan Pérez",
    email: "juan.perez@example.com",
    membresia: "Premium",
    mascotaDestacada: {
      nombre: "Max",
      tipo: "Perro",
      raza: "Golden Retriever",
      edad: "3 años"
    }
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

  return (
    <div className={styles.container}>
      {/* Header con opciones de perfil y ayuda */}
      <div className={styles.header}>
        <img src={logo} alt="Logo Flooky Pets" className={styles.logo} />
        
        <div className={styles.userWelcome}>
          <h1 className={styles.welcome}>¡Hola, {userData.nombre}!</h1>
          <p className={styles.subtitle}>¿Qué vamos a hacer hoy?</p>
        </div>
        
        <div className={styles.userActions}>
          <button className={styles.helpButton}>
            <FaQuestionCircle /> Ayuda
          </button>
          
          <div className={styles.profileContainer}>
            <button 
              className={styles.profileButton}
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <FaUserCog />
            </button>
          </div>
        </div>
      </div>

      {/* Sección de mascota destacada y próxima cita */}
      <div className={styles.highlightSection}>
        <div className={styles.petHighlight}>
          <img src={userData.mascotaDestacada.imagen} alt={userData.mascotaDestacada.nombre} className={styles.petImage} />
          <div className={styles.petInfo}>
            <h3>Tu compañero: <span>{userData.mascotaDestacada.nombre}</span></h3>
            <p>{userData.mascotaDestacada.tipo} • {userData.mascotaDestacada.raza} • {userData.mascotaDestacada.edad}</p>
            <button className={styles.careButton}>
              <FaHeart /> Historial de salud
            </button>
          </div>
        </div>

        <div className={styles.nextAppointment}>
          <h3><FaCalendarPlus /> Próxima cita</h3>
          <div className={styles.appointmentDetails}>
            <p><strong>Fecha:</strong> {proximaCita.fecha} a las {proximaCita.hora}</p>
            <p><strong>Veterinario:</strong> {proximaCita.veterinario}</p>
            <p><strong>Motivo:</strong> {proximaCita.motivo}</p>
            <p><strong>Ubicación:</strong> {proximaCita.ubicacion}</p>
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
          <FaPaw /> Mis Mascotas
        </button>
        <button 
          className={`${styles.navButton} ${activeTab === 'citas' ? styles.active : ''}`}
          onClick={() => setActiveTab('citas')}
        >
          <FaClipboardList /> Mis Citas
        </button>
        <button 
          className={`${styles.navButton} ${activeTab === 'servicios' ? styles.active : ''}`}
          onClick={() => setActiveTab('servicios')}
        >
          <FaShoppingCart /> Servicios
        </button>
      </nav>

      {/* Contenido principal dinámico */}
      <div className={styles.mainContent}>
        {renderContent()}
      </div>

      {/* Sidebar con recordatorios y más información */}
      <div className={styles.sidebar}>
        <div className={styles.remindersCard}>
          <h3><FaBell /> Recordatorios importantes</h3>
          <ul className={styles.remindersList}>
            {recordatorios.filter(r => r.importante).map(item => (
              <li key={item.id} className={styles.importantReminder}>
                {item.texto}
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.remindersCard}>
          <h3><FaClipboardList /> tus recordatorios</h3>
          <ul className={styles.remindersList}>
            {recordatorios.map(item => (
              <li key={item.id} className={item.importante ? styles.importantReminder : ''}>
                {item.texto}
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.tipCard}>
          <h3>💡 Consejos</h3>
          <p>Los perros de razas grandes necesitan ejercicio regular pero controlado durante su crecimiento para evitar problemas articulares. 30-40 minutos dos veces al día es ideal para Max.</p>
        </div>
      </div>
    </div>
  );
};

export default InicioUsuario;