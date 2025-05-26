import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './Style/ListaCitasVeterinarioStyles.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEye, 
  faCalendarAlt, 
  faClock, 
  faPaw, 
  faUser, 
  faTag,
  faPhone,
  faMapMarkerAlt,
  faSearch,
  faPlus
} from '@fortawesome/free-solid-svg-icons';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10
    }
  },
  hover: {
    scale: 1.03,
    boxShadow: "0 10px 20px rgba(0, 172, 193, 0.1)",
    transition: { duration: 0.3 }
  },
  tap: { scale: 0.98 }
};

const calendarTileVariants = {
  hover: {
    scale: 1.05,
    backgroundColor: "rgba(0, 172, 193, 0.1)"
  },
  tap: { scale: 0.95 }
};

const ListaCitasVeterinario = () => {
  const [citas, setCitas] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const formattedDate = selectedDate.toISOString().split('T')[0];
    setTimeout(() => {
      const data = [
        { 
          id: 1, 
          fecha: formattedDate + 'T10:00:00Z', 
          propietarioNombre: 'Ana Pérez', 
          mascotaNombre: 'Max', 
          servicio: 'Consulta general', 
          telefono: '3001234567', 
          direccion: 'Calle 123 #45-67',
          mascotaEspecie: 'Perro',
          mascotaRaza: 'Labrador'
        },
        { 
          id: 2, 
          fecha: formattedDate + 'T14:30:00Z', 
          propietarioNombre: 'Carlos López', 
          mascotaNombre: 'Luna', 
          servicio: 'Vacunación', 
          telefono: '3109876543', 
          direccion: 'Avenida 456 #78-90',
          mascotaEspecie: 'Gato',
          mascotaRaza: 'Siamés'
        },
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
      ];
      setServicios(serviciosData);
    }, 750);
  }, [selectedDate]);

  const onChangeDate = (date) => {
    setSelectedDate(date);
    setLoading(true);
    setCitas([]);
  };

  const filteredCitas = citas.filter(cita =>
    cita.propietarioNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cita.mascotaNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cita.servicio.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = date.toISOString().split('T')[0];
      const hasCitas = citas.some(cita => cita.fecha.startsWith(dateStr));
      return hasCitas ? (
        <motion.div 
          className={styles.calendarDot}
          variants={calendarTileVariants}
          whileHover="hover"
          whileTap="tap"
        />
      ) : null;
    }
    return null;
  };

  if (loading) {
    return (
      <motion.div 
        className={styles.loadingContainer}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div 
          className={styles.loadingSpinner}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        />
        <p>Cargando información...</p>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        className={styles.errorContainer}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className={styles.errorIcon}>⚠️</div>
        <div>Error al cargar la información: {error}</div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={styles.listaContainer}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        className={styles.header}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h2>
            <FontAwesomeIcon icon={faCalendarAlt} className={styles.headerIcon} /> 
            Citas Agendadas
          </h2>
          
          <motion.div 
            className={styles.searchContainer}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Buscar citas por dueño, mascota o servicio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </motion.div>
        </div>
        
        <motion.div 
          className={styles.calendarContainer}
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Calendar 
            onChange={onChangeDate} 
            value={selectedDate} 
            locale="es-CO"
            tileContent={tileContent}
            className={styles.calendar}
          />
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {filteredCitas.length > 0 ? (
          <ul className={styles.lista}>
            {filteredCitas.map((cita) => (
              <motion.li 
                key={cita.id} 
                className={styles.listItem}
                variants={itemVariants}
                whileHover="hover"
                whileTap="tap"
                layout
              >
                <div className={styles.citaInfo}>
                  <div className={styles.infoRow}>
                    <FontAwesomeIcon icon={faClock} className={styles.infoIcon} />
                    <span className={styles.fecha}>
                      {new Date(cita.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  <div className={styles.infoRow}>
                    <FontAwesomeIcon icon={faUser} className={styles.infoIcon} />
                    <span className={styles.propietario}>{cita.propietarioNombre}</span>
                  </div>
                  
                  <div className={styles.infoRow}>
                    <FontAwesomeIcon icon={faPaw} className={styles.infoIcon} />
                    <span className={styles.mascota}>
                      {cita.mascotaNombre} ({cita.mascotaEspecie} - {cita.mascotaRaza})
                    </span>
                  </div>
                  
                  <div className={styles.infoRow}>
                    <FontAwesomeIcon icon={faTag} className={styles.infoIcon} />
                    <span className={styles.servicio}>{cita.servicio}</span>
                  </div>
                  
                  <div className={styles.infoRow}>
                    <FontAwesomeIcon icon={faPhone} className={styles.infoIcon} />
                    <span className={styles.telefono}>{cita.telefono}</span>
                  </div>
                  
                  <div className={styles.infoRow}>
                    <FontAwesomeIcon icon={faMapMarkerAlt} className={styles.infoIcon} />
                    <span className={styles.direccion}>{cita.direccion}</span>
                  </div>
                </div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link 
                    to={`/veterinario/citas/${cita.id}`} 
                    className={styles.verButton}
                    title="Ver detalles de la cita"
                  >
                    <FontAwesomeIcon icon={faEye} /> Ver Detalle
                  </Link>
                </motion.div>
              </motion.li>
            ))}
          </ul>
        ) : (
          <motion.div 
            className={styles.emptyMessage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            exit={{ opacity: 0 }}
          >
            {searchTerm ? 
              'No se encontraron citas que coincidan con la búsqueda.' : 
              'No hay citas agendadas para la fecha seleccionada.'}
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/veterinario/nueva-cita" className={styles.addButton}>
                <FontAwesomeIcon icon={faPlus} /> Agendar Nueva Cita
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        className={styles.serviciosSection}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h2>
          <FontAwesomeIcon icon={faTag} className={styles.headerIcon} />
          Nuestros Servicios
        </h2>
        
        <ul className={styles.serviciosLista}>
          {servicios.map((servicio) => (
            <motion.li
              key={servicio.id}
              className={styles.servicioItem}
              variants={itemVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <h3>{servicio.nombre}</h3>
              <p>{servicio.descripcion}</p>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  to={`/veterinario/nueva-cita?servicio=${encodeURIComponent(servicio.nombre)}`} 
                  className={styles.servicioButton}
                >
                  <FontAwesomeIcon icon={faPlus} /> Agendar este servicio
                </Link>
              </motion.div>
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </motion.div>
  );
};

export default ListaCitasVeterinario;