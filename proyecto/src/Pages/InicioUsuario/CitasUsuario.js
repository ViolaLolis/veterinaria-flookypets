import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Styles/CitasUsuario.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faPlusCircle, faClock, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons'; // Importa más iconos

const CitasUsuario = () => {
  const navigate = useNavigate(); // Inicializa useNavigate

  // Aquí iría la lógica para obtener las próximas citas del usuario (simulado)
  const citas = [
    { id: 1, fecha: '15 de Mayo', hora: '10:00 AM', servicio: 'Consulta General para Max', veterinario: 'Dra. Ana Pérez', lugar: 'Consultorio Principal' },
    { id: 2, fecha: '20 de Mayo', hora: '03:30 PM', servicio: 'Vacunación de Luna', veterinario: 'Dr. Carlos López', lugar: 'Sucursal Norte' },
    { id: 3, fecha: '25 de Mayo', hora: '11:15 AM', servicio: 'Revisión Dental de Toby', veterinario: 'Dra. Sofía Gómez', lugar: 'Consultorio Principal' },
  ];

  const handleVolver = () => {
    navigate(-1); // Vuelve a la página anterior
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <FontAwesomeIcon icon={faCalendarAlt} className={styles.icon} />
        <h3>Mis Próximas Citas</h3>
      </div>
      {citas.length > 0 ? (
        <ul className={styles.listaCitas}>
          {citas.map(cita => (
            <li key={cita.id} className={styles.citaItem}>
              <div className={styles.citaInfo}>
                <div className={styles.citaFecha}>
                  <FontAwesomeIcon icon={faCalendarAlt} className={styles.citaIcon} />
                  <span>{cita.fecha}</span>
                </div>
                <div className={styles.citaHora}>
                  <FontAwesomeIcon icon={faClock} className={styles.citaIcon} />
                  <span>{cita.hora}</span>
                </div>
                <div className={styles.citaServicio}>
                  <span className={styles.servicioLabel}>Servicio:</span> {cita.servicio}
                </div>
                <div className={styles.citaVeterinario}>
                  <span className={styles.veterinarioLabel}>Veterinario:</span> {cita.veterinario}
                </div>
                <div className={styles.citaLugar}>
                  <FontAwesomeIcon icon={faMapMarkerAlt} className={styles.citaIcon} />
                  <span>{cita.lugar}</span>
                </div>
              </div>
              <div className={styles.citaActions}>
                <button className={styles.accionBtn}>Ver Detalles</button>
                <button className={styles.accionBtn}>Cancelar</button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className={styles.noCitas}>
          <p>No tienes citas programadas.</p>
          <FontAwesomeIcon icon={faCalendarAlt} className={styles.noCitasIcon} />
          <p>¡Programa una ahora!</p>
        </div>
      )}
      <Link to="/usuario/citas/agendar" className={styles.verTodas}>
        <FontAwesomeIcon icon={faPlusCircle} className={styles.plusIcon} />
        Agendar Nueva Cita y Ver Todas
      </Link>
    </div>
  );
};

export default CitasUsuario;