// VeterinarioInicio.js
import React, { useState } from 'react'; // No need for useEffect here if not fetching data
import { useNavigate } from 'react-router-dom';
import veteStyles from './Style/NavegacionVeterinarioStyles.module.css'; // Asegúrate de que esta ruta sea correcta
import { motion } from 'framer-motion';

// Ensure these imports are correct and packages are installed!
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPaw, faUser, faCalendarAlt,
  faNotesMedical, faCheckCircle, faClock,
  faStar, faSyringe, faStethoscope,faDog,
   // Added for "Ver Historiales Clínicos" quick action
} from '@fortawesome/free-solid-svg-icons';

const VeterinarioInicio = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalCitasHoy: 4,
    citasCompletadasHoy: 1,
    pacientesNuevosSemana: 3,
    mascotasAtendidasTotal: 150,
    ratingPromedio: 4.8,
    recordatoriosActivos: 5
  });

  const [citasPendientes, setCitasPendientes] = useState([
    {
      id: 1,
      time: "09:00 AM",
      mascota: "Max",
      propietario: "Juan Pérez",
      servicio: "Consulta general",
      estado: "pendiente",
      icon: faPaw,
      color: "#00acc1"
    },
    {
      id: 2,
      time: "10:30 AM",
      mascota: "Bella",
      propietario: "María García",
      servicio: "Vacunación anual",
      estado: "pendiente",
      icon: faSyringe,
      color: "#FF9800" // Orange for vaccination
    },
    {
      id: 3,
      time: "11:45 AM",
      mascota: "Rocky",
      propietario: "Pedro Ramirez",
      servicio: "Revisión post-operatoria",
      estado: "pendiente",
      icon: faStethoscope,
      color: "#4CAF50" // Green for check-up
    },
    {
      id: 4,
      time: "02:00 PM",
      mascota: "Luna",
      propietario: "Laura Sánchez",
      servicio: "Revisión de piel",
      estado: "pendiente",
      icon: faDog, // Using dog icon for generic pet issue
      color: "#F44336" // Red for something potentially urgent
    },
  ]);

  const handleCompleteAppointment = (id) => {
    setCitasPendientes(prevCitas =>
      prevCitas.filter(cita => cita.id !== id) // Remove from pending
    );
    setStats(prevStats => ({
        ...prevStats,
        citasCompletadasHoy: prevStats.citasCompletadasHoy + 1
    }));
  };

  return (
    <motion.div
      className={veteStyles.veteInicioContainer}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h1 className={veteStyles.veteGreeting}>Estadísticas</h1>

      {/* --- Section: Key Metrics Overview (Dashboard Cards) --- */}
      <div className={veteStyles.veteDashboardGrid}>
        <motion.div
          className={veteStyles.veteDashboardCard}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className={veteStyles.veteCardHeader}>
            <FontAwesomeIcon icon={faCalendarAlt} className={veteStyles.veteIcon} />
            <h3>Citas Pendientes Hoy</h3>
          </div>
          <p className={veteStyles.veteCardContent}>{citasPendientes.length}</p>
        </motion.div>

        <motion.div
          className={veteStyles.veteDashboardCard}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className={veteStyles.veteCardHeader}>
            <FontAwesomeIcon icon={faCheckCircle} className={veteStyles.veteIcon} />
            <h3>Citas Completadas Hoy</h3>
          </div>
          <p className={veteStyles.veteCardContent}>{stats.citasCompletadasHoy}</p>
        </motion.div>

        <motion.div
          className={veteStyles.veteDashboardCard}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className={veteStyles.veteCardHeader}>
            <FontAwesomeIcon icon={faUser} className={veteStyles.veteIcon} />
            <h3>Nuevos Pacientes (Semana)</h3>
          </div>
          <p className={veteStyles.veteCardContent}>{stats.pacientesNuevosSemana}</p>
        </motion.div>

        <motion.div
          className={veteStyles.veteDashboardCard}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className={veteStyles.veteCardHeader}>
            <FontAwesomeIcon icon={faPaw} className={veteStyles.veteIcon} />
            <h3>Mascotas Atendidas (Total)</h3>
          </div>
          <p className={veteStyles.veteCardContent}>{stats.mascotasAtendidasTotal}</p>
        </motion.div>

        <motion.div
          className={veteStyles.veteDashboardCard}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className={veteStyles.veteCardHeader}>
            <FontAwesomeIcon icon={faStar} className={veteStyles.veteIcon} />
            <h3>Tu Rating Promedio</h3>
          </div>
          <p className={`${veteStyles.veteCardContent} ${veteStyles.smallText}`}>
            <strong>{stats.ratingPromedio}</strong> / 5.0
          </p>
        </motion.div>

        <motion.div
          className={veteStyles.veteDashboardCard}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className={veteStyles.veteCardHeader}>
            <FontAwesomeIcon icon={faNotesMedical} className={veteStyles.veteIcon} />
            <h3>Recordatorios Activos</h3>
          </div>
          <p className={veteStyles.veteCardContent}>{stats.recordatoriosActivos}</p>
        </motion.div>
      </div>

    
      {/* --- Section: Upcoming Appointments List --- */}
      <div className={veteStyles.veteAppointmentsSection}>
        <div className={veteStyles.veteSectionHeader}>
          <h2><FontAwesomeIcon icon={faClock} /> Próximas Citas</h2>
          <motion.button
            className={veteStyles.veteViewAllButton}
            onClick={() => navigate('/veterinario/citas')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Ver Todas
          </motion.button>
        </div>

        <div className={veteStyles.veteAppointmentsList}>
          {citasPendientes.length > 0 ? (
            citasPendientes.map(cita => (
              <motion.div
                key={cita.id}
                className={veteStyles.veteAppointmentItem}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className={veteStyles.veteAppointmentTime} style={{color: cita.color}}>{cita.time}</div>
                <div className={veteStyles.veteAppointmentDetails}>
                  <h4><FontAwesomeIcon icon={cita.icon} style={{color: cita.color, marginRight: '10px'}} /> {cita.mascota} - {cita.servicio}</h4>
                  <p>Propietario: {cita.propietario}</p>
                </div>
                <div className={veteStyles.veteAppointmentActions}>
                  <motion.button
                    className={`${veteStyles.veteActionButton} ${veteStyles.veteComplete}`}
                    onClick={() => handleCompleteAppointment(cita.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Completar
                  </motion.button>
                  <motion.button
                    className={`${veteStyles.veteActionButton} ${veteStyles.veteView}`}
                    onClick={() => navigate(`/veterinario/citas/${cita.id}`)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Ver Detalles
                  </motion.button>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              className={veteStyles.veteNoAppointments}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <FontAwesomeIcon icon={faCheckCircle} className={veteStyles.veteIcon} />
              <p>¡Todas tus citas pendientes están al día!</p>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default VeterinarioInicio;