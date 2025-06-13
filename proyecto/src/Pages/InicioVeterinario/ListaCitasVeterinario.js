import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import veteStyles from './Style/ListaCitasVeterinarioStyles.module.css'; // Changed import to veteStyles
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
  faPlus,
  faSpinner // Added for loading spinner
} from '@fortawesome/free-solid-svg-icons';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Keep the default calendar styles

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
    boxShadow: "0 10px 20px rgba(0, 172, 193, 0.1)", // Teal shade
    transition: { duration: 0.3 }
  },
  tap: { scale: 0.98 }
};

const calendarTileVariants = {
  hover: {
    scale: 1.05,
    backgroundColor: "rgba(0, 172, 193, 0.1)" // Light teal hover
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
    setLoading(true); // Set loading true when date changes or component mounts
    const formattedDate = selectedDate.toISOString().split('T')[0];

    // Simulate fetching citas data
    setTimeout(() => {
      try {
        const allCitas = [
          {
            id: 1,
            fecha: '2025-06-13T10:00:00Z', // Example for current date, replace with dynamic logic if needed
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
            fecha: '2025-06-13T14:30:00Z', // Example for current date
            propietarioNombre: 'Carlos López',
            mascotaNombre: 'Luna',
            servicio: 'Vacunación',
            telefono: '3109876543',
            direccion: 'Avenida 456 #78-90',
            mascotaEspecie: 'Gato',
            mascotaRaza: 'Siamés'
          },
          {
            id: 3,
            fecha: '2025-06-14T09:00:00Z', // Example for another date
            propietarioNombre: 'Laura García',
            mascotaNombre: 'Firulais',
            servicio: 'Desparasitación',
            telefono: '3205551122',
            direccion: 'Carrera 7 #1-23',
            mascotaEspecie: 'Perro',
            mascotaRaza: 'Golden Retriever'
          },
          {
            id: 4,
            fecha: '2025-06-14T11:00:00Z', // Example for another date
            propietarioNombre: 'Marta Díaz',
            mascotaNombre: 'Copito',
            servicio: 'Peluquería Canina',
            telefono: '3112223344',
            direccion: 'Diagonal 80 #9-10',
            mascotaEspecie: 'Conejo',
            mascotaRaza: 'Mini Lop'
          }
        ];
        // Filter citas based on the selected date
        setCitas(allCitas.filter(cita => cita.fecha.startsWith(formattedDate)));
        setLoading(false);
      } catch (err) {
        setError('No se pudo cargar la lista de citas.');
        setLoading(false);
      }
    }, 500); // Simulate network delay

    // Simulate fetching servicios data (can be moved to a separate useEffect if static)
    setTimeout(() => {
      try {
        const serviciosData = [
          { id: 'sg1', nombre: 'Consulta General', descripcion: 'Examen médico general de la mascota.' },
          { id: 'sv2', nombre: 'Vacunación', descripcion: 'Aplicación de vacunas según el esquema.' },
          { id: 'sp3', nombre: 'Desparasitación', descripcion: 'Tratamiento contra parásitos internos y externos.' },
          { id: 'sq4', nombre: 'Cirugía', descripcion: 'Procedimientos quirúrgicos diversos.' },
          { id: 'sl5', nombre: 'Peluquería Canina', descripcion: 'Cortes de pelo y acicalamiento.' },
        ];
        setServicios(serviciosData);
      } catch (err) {
        console.error("Error al cargar servicios:", err);
      }
    }, 750); // Slightly longer delay for services
  }, [selectedDate]); // Re-run when selectedDate changes

  const onChangeDate = (date) => {
    setSelectedDate(date);
    // setLoading(true); // This is already handled by the useEffect
    // setCitas([]); // This will be updated by the useEffect
  };

  const filteredCitas = citas.filter(cita =>
    cita.propietarioNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cita.mascotaNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cita.servicio.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = date.toISOString().split('T')[0];
      // Check if there are any appointments for this date
      const hasCitas = citas.some(cita => cita.fecha.startsWith(dateStr));
      return hasCitas ? (
        <motion.div
          className={veteStyles.veteCalendarDot} // Corrected class name
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
        className={veteStyles.veteLoadingContainer} // Corrected class name
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className={veteStyles.veteLoadingSpinner} // Corrected class name
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
        className={veteStyles.veteErrorContainer} // Corrected class name
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className={veteStyles.veteErrorIcon}>⚠️</div> {/* Placeholder for an error icon */}
        <p>Error al cargar la información: {error}</p>
        <Link to="#" onClick={() => window.location.reload()} className={veteStyles.veteAddButton}>
          <FontAwesomeIcon icon={faSpinner} spin /> Reintentar
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={veteStyles.veteListaContainer} // Corrected class name
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className={veteStyles.veteHeader} // Corrected class name
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h2>
            <FontAwesomeIcon icon={faCalendarAlt} className={veteStyles.veteHeaderIcon} /> {/* Corrected class name */}
            Citas Agendadas
          </h2>

          <motion.div
            className={veteStyles.veteSearchContainer} // Corrected class name
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <FontAwesomeIcon icon={faSearch} className={veteStyles.veteSearchIcon} /> {/* Corrected class name */}
            <input
              type="text"
              className={veteStyles.veteSearchInput} // Corrected class name
              placeholder="Buscar citas por dueño, mascota o servicio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </motion.div>
        </div>

        <motion.div
          className={veteStyles.veteCalendarContainer} // Corrected class name
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Calendar
            onChange={onChangeDate}
            value={selectedDate}
            locale="es-CO"
            tileContent={tileContent}
            className={veteStyles.veteCalendar} // Corrected class name
          />
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {filteredCitas.length > 0 ? (
          <ul className={veteStyles.veteLista}> {/* Corrected class name */}
            {filteredCitas.map((cita) => (
              <motion.li
                key={cita.id}
                className={veteStyles.veteListItem} // Corrected class name
                variants={itemVariants}
                whileHover="hover"
                whileTap="tap"
                layout // Enables smooth layout transitions for list items
              >
                <div className={veteStyles.veteCitaInfo}> {/* Corrected class name */}
                  <div className={veteStyles.veteInfoRow}> {/* Corrected class name */}
                    <FontAwesomeIcon icon={faClock} className={veteStyles.veteInfoIcon} /> {/* Corrected class name */}
                    <span className={veteStyles.veteFecha}> {/* Corrected class name */}
                      {new Date(cita.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className={veteStyles.veteInfoRow}> {/* Corrected class name */}
                    <FontAwesomeIcon icon={faUser} className={veteStyles.veteInfoIcon} /> {/* Corrected class name */}
                    <span className={veteStyles.vetePropietario}>{cita.propietarioNombre}</span> {/* Corrected class name */}
                  </div>

                  <div className={veteStyles.veteInfoRow}> {/* Corrected class name */}
                    <FontAwesomeIcon icon={faPaw} className={veteStyles.veteInfoIcon} /> {/* Corrected class name */}
                    <span className={veteStyles.veteMascota}> {/* Corrected class name */}
                      {cita.mascotaNombre} ({cita.mascotaEspecie} - {cita.mascotaRaza})
                    </span>
                  </div>

                  <div className={veteStyles.veteInfoRow}> {/* Corrected class name */}
                    <FontAwesomeIcon icon={faTag} className={veteStyles.veteInfoIcon} /> {/* Corrected class name */}
                    <span className={veteStyles.veteServicio}>{cita.servicio}</span> {/* Corrected class name */}
                  </div>

                  <div className={veteStyles.veteInfoRow}> {/* Corrected class name */}
                    <FontAwesomeIcon icon={faPhone} className={veteStyles.veteInfoIcon} /> {/* Corrected class name */}
                    <span className={veteStyles.veteTelefono}>{cita.telefono}</span> {/* Corrected class name */}
                  </div>

                  <div className={veteStyles.veteInfoRow}> {/* Corrected class name */}
                    <FontAwesomeIcon icon={faMapMarkerAlt} className={veteStyles.veteInfoIcon} /> {/* Corrected class name */}
                    <span className={veteStyles.veteDireccion}>{cita.direccion}</span> {/* Corrected class name */}
                  </div>
                </div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to={`/veterinario/citas/${cita.id}`}
                    className={veteStyles.veteVerButton} // Corrected class name
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
            className={veteStyles.veteEmptyMessage} // Corrected class name
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
              <Link to="/veterinario/nueva-cita" className={veteStyles.veteAddButton}> {/* Corrected class name */}
                <FontAwesomeIcon icon={faPlus} /> Agendar Nueva Cita
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className={veteStyles.veteServiciosSection} // Corrected class name
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h2>
          <FontAwesomeIcon icon={faTag} className={veteStyles.veteHeaderIcon} /> {/* Corrected class name */}
          Nuestros Servicios
        </h2>

        <ul className={veteStyles.veteServiciosLista}> {/* Corrected class name */}
          {servicios.map((servicio) => (
            <motion.li
              key={servicio.id}
              className={veteStyles.veteServicioItem} // Corrected class name
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
                  className={veteStyles.veteServicioButton} // Corrected class name
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