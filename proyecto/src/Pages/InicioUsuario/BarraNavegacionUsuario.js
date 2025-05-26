import React, { useState } from 'react';
import HistorialMedico from './HistorialMedico';
import CitasUsuario from './CitasUsuario';
import ServiciosVeterinaria from './ServiciosVeterinaria';
import styles from './Styles/InicioUsuario.module.css';
import logo from '../Inicio/Imagenes/flooty.png';
import { FaNotesMedical, FaCalendarPlus, FaShoppingCart, FaBell, FaClipboardList, FaQuestionCircle, FaUserCog, FaChevronDown } from 'react-icons/fa';

const InicioUsuario = () => {
  const [activeTab, setActiveTab] = useState('historial');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [expandedReminders, setExpandedReminders] = useState(false);
  
  // Datos del usuario
  const userData = {
    nombre: "Juan Pérez",
    mascotaActual: {
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
    { id: 1, texto: "Vacuna antirrábica - Vence en 15 días", importante: true },
    { id: 2, texto: "Control de peso mensual", importante: false }
  ];

  const renderContent = () => {
    switch(activeTab) {
      case 'historial':
        return <HistorialMedico />;
      case 'citas':
        return <CitasUsuario />;
      case 'servicios':
        return <ServiciosVeterinaria />;
      default:
        return <HistorialMedico />;
    }
  };

  return (
    <div className={styles.container}>
      {/* Encabezado */}
      <div className={styles.header}>
        <h1 className={styles.welcome}>¡Hola, <span>{userData.nombre}</span>!</h1>
        <p className={styles.subtitle}>¿Qué vamos a hacer hoy?</p>
      </div>

      {/* Sección de mascota y cita */}
      <div className={styles.highlightSection}>
        <div className={styles.petSection}>
          <h2>Mi compañero:</h2>
          <div className={styles.petInfo}>
            <strong>{userData.mascotaActual.nombre}</strong>
            <div>
              <span>{userData.mascotaActual.tipo}: {userData.mascotaActual.raza}</span>
              <span>{userData.mascotaActual.edad}</span>
            </div>
          </div>
        </div>

        <div className={styles.appointmentSection}>
          <h3>Próxima cita</h3>
          <div className={styles.appointmentDetails}>
            <p>Fecha: {proximaCita.fecha} a las {proximaCita.hora}</p>
            <p>Veterinario: {proximaCita.veterinario}</p>
            <p>Motivo: {proximaCita.motivo}</p>
            <p>Ubicación: {proximaCita.ubicacion}</p>
          </div>
          <div className={styles.appointmentActions}>
            <button className={styles.confirmButton}>Confirmar asistencia</button>
            <button className={styles.rescheduleButton}>Reagendar</button>
          </div>
        </div>
      </div>

      {/* Barra de navegación */}
      <nav className={styles.navBar}>
        <button 
          className={`${styles.navButton} ${activeTab === 'historial' ? styles.active : ''}`}
          onClick={() => setActiveTab('historial')}
        >
          <FaNotesMedical /> Historial Médico
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

      {/* Contenido principal */}
      <div className={styles.mainContent}>
        {renderContent()}
      </div>

      {/* Recordatorios */}
      <div className={styles.remindersSection}>
        <div className={styles.importantReminders}>
          <h3><FaBell /> Recordatorios importantes</h3>
          <ul>
            {recordatorios.filter(r => r.importante).map(item => (
              <li key={item.id}>{item.texto}</li>
            ))}
          </ul>
        </div>
        <div className={styles.allReminders}>
          <h3>Tus recordatorios</h3>
          <ul>
            {recordatorios.map(item => (
              <li key={item.id} className={item.importante ? styles.important : ''}>
                {item.texto}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default InicioUsuario;