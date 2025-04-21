import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './Style/ListaCitasVeterinarioStyles.module.css';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faCalendarAlt, faClock, faPaw, faUser, faTag } from '@fortawesome/free-solid-svg-icons';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
  hover: { scale: 1.02, transition: { duration: 0.2 } },
  tap: { scale: 0.98 },
};

const ListaCitasVeterinario = () => {
  const [citas, setCitas] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const formattedDate = selectedDate.toISOString().split('T')[0];
    setTimeout(() => {
      const data = [
        { id: 1, fecha: formattedDate + 'T10:00:00Z', propietarioNombre: 'Ana Pérez', mascotaNombre: 'Max', servicio: 'Consulta general', telefono: '300...', direccion: 'Calle 123' },
        { id: 2, fecha: formattedDate + 'T14:30:00Z', propietarioNombre: 'Carlos López', mascotaNombre: 'Luna', servicio: 'Vacunación', telefono: '310...', direccion: 'Avenida 456' },
        // ... más citas para esta fecha
      ];
      setCitas(data.filter(cita => cita.fecha.startsWith(formattedDate)));
      setLoading(false);
    }, 500);

    // Simulación de carga de servicios de la veterinaria
    setTimeout(() => {
      const serviciosData = [
        { id: 'sg1', nombre: 'Consulta General', descripcion: 'Examen médico general de la mascota.' },
        { id: 'sv2', nombre: 'Vacunación', descripcion: 'Aplicación de vacunas según el esquema.' },
        { id: 'sp3', nombre: 'Desparasitación', descripcion: 'Tratamiento contra parásitos internos y externos.' },
        { id: 'sq4', nombre: 'Cirugía', descripcion: 'Procedimientos quirúrgicos diversos.' },
        { id: 'sl5', nombre: 'Peluquería Canina', descripcion: 'Cortes de pelo y acicalamiento.' },
        // ... más servicios
      ];
      setServicios(serviciosData);
    }, 750);
  }, [selectedDate]);

  const onChangeDate = (date) => {
    setSelectedDate(date);
    setLoading(true);
    setCitas([]);
  };

  if (loading) {
    return <div>Cargando información...</div>;
  }

  if (error) {
    return <div>Error al cargar la información: {error}</div>;
  }

  return (
    <motion.div
      className={styles.listaContainer}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className={styles.header}>
        <h2><FontAwesomeIcon icon={faCalendarAlt} className={styles.headerIcon} /> Citas Agendadas</h2>
        <div className={styles.calendarContainer}>
          <Calendar onChange={onChangeDate} value={selectedDate} locale="es-CO" />
        </div>
      </div>

      {citas.length > 0 ? (
        <ul className={styles.lista}>
          {citas.map((cita) => (
            <motion.li key={cita.id} className={styles.listItem} variants={itemVariants} whileHover="hover" whileTap="tap">
              <div className={styles.citaInfo}>
                <div className={styles.infoRow}>
                  <FontAwesomeIcon icon={faClock} className={styles.infoIcon} />
                  <span className={styles.fecha}>{new Date(cita.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className={styles.infoRow}>
                  <FontAwesomeIcon icon={faUser} className={styles.infoIcon} />
                  <span className={styles.propietario}>Dueño: {cita.propietarioNombre}</span>
                </div>
                <div className={styles.infoRow}>
                  <FontAwesomeIcon icon={faPaw} className={styles.infoIcon} />
                  <span className={styles.mascota}>Mascota: {cita.mascotaNombre}</span>
                </div>
                <div className={styles.infoRow}>
                  <FontAwesomeIcon icon={faTag} className={styles.infoIcon} />
                  <span className={styles.servicio}>Servicio: {cita.servicio}</span>
                </div>
                {/* Puedes mostrar más información aquí si es necesario */}
              </div>
              <Link to={`/veterinario/citas/${cita.id}`} className={styles.verButton} title="Ver detalles de la cita">
                <FontAwesomeIcon icon={faEye} /> Ver Detalle
              </Link>
            </motion.li>
          ))}
        </ul>
      ) : (
        <div className={styles.emptyMessage}>No hay citas agendadas para la fecha seleccionada.</div>
      )}

      <div className={styles.serviciosSection}>
        <h2>Nuestros Servicios</h2>
        <ul className={styles.serviciosLista}>
          {servicios.map((servicio) => (
            <li key={servicio.id} className={styles.servicioItem}>
              <h3>{servicio.nombre}</h3>
              <p>{servicio.descripcion}</p>
              {/* Opcional: Botón para agendar este servicio */}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};

export default ListaCitasVeterinario;