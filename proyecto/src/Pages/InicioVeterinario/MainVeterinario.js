import React, { useState, useEffect } from 'react';
import styles from './Style/MainVeterinarioStyles.module.css';
import { motion } from 'framer-motion';
import NavegacionVeterinario from './NavegacionVeterinario';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faPaw, faUser, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

const MainVeterinario = () => {
  const [citasAgendadas, setCitasAgendadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simulación de llamada a la API para obtener las citas del veterinario para hoy
    const hoy = new Date().toISOString().split('T')[0];
    setTimeout(() => {
      const citasData = [
        {
          id: 1,
          fecha: hoy + 'T09:00:00Z',
          propietario: 'Laura Vargas',
          mascota: 'Rocky',
          direccion: 'Calle 12 # 34-56, Soacha',
          servicio: 'Consulta General',
        },
        {
          id: 2,
          fecha: hoy + 'T11:30:00Z',
          propietario: 'Pedro Jiménez',
          mascota: 'Misha',
          direccion: 'Avenida Principal # 78-90, Soacha',
          servicio: 'Vacunación',
        },
        {
          id: 3,
          fecha: hoy + 'T14:00:00Z',
          propietario: 'Ana Pérez',
          mascota: 'Luna',
          direccion: 'Carrera 5 # 11-12, Soacha',
          servicio: 'Desparasitación',
        },
        // ... más citas para hoy
      ];
      setCitasAgendadas(citasData);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return <div>Cargando citas de hoy...</div>;
  }

  if (error) {
    return <div>Error al cargar las citas: {error}</div>;
  }

  return (
    <motion.div
      className={styles.mainContainer}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className={styles.header}>
        <h2>Citas Agendadas para Hoy</h2>
      </div>
      {citasAgendadas.length > 0 ? (
        <ul className={styles.citasLista}>
          {citasAgendadas.map((cita) => (
            <li key={cita.id} className={styles.citaItem}>
              <div className={styles.citaDetalle}>
                <FontAwesomeIcon icon={faClock} className={styles.citaIcon} />
                <span className={styles.hora}>
                  {new Date(cita.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className={styles.citaDetalle}>
                <FontAwesomeIcon icon={faPaw} className={styles.citaIcon} />
                <span className={styles.mascota}>{cita.mascota}</span>
              </div>
              <div className={styles.citaDetalle}>
                <FontAwesomeIcon icon={faUser} className={styles.citaIcon} />
                <span className={styles.propietario}>({cita.propietario})</span>
              </div>
              <div className={styles.citaDetalle}>
                <FontAwesomeIcon icon={faMapMarkerAlt} className={styles.citaIcon} />
                <span className={styles.direccion}>{cita.direccion}</span>
              </div>
              <span className={styles.servicio}>[{cita.servicio}]</span>
              {/* Opcional: Botón para ver detalles de la cita */}
            </li>
          ))}
        </ul>
      ) : (
        <div className={styles.noCitas}>No hay citas agendadas para hoy.</div>
      )}
      <NavegacionVeterinario />
    </motion.div>
  );
};

export default MainVeterinario;