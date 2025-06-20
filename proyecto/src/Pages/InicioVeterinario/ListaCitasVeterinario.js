import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import veteStyles from './Style/ListaCitasVeterinarioStyles.module.css'; // Asegúrate de que este archivo CSS exista y contenga los estilos correspondientes
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
  faSpinner,
  faExclamationTriangle // Añadido para un ícono de error más explícito
} from '@fortawesome/free-solid-svg-icons';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

// Las variantes de Framer Motion pueden ser reutilizadas o adaptadas
// para mantener la coherencia en las animaciones.
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1,
      duration: 0.3 // Ajuste de duración para que sea más similar a AgendarCita
    }
  }
};

const headerVariants = {
  initial: { y: -30, opacity: 0 }, // Un poco más pronunciado que en AgendarCita
  animate: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 120, damping: 10, delay: 0.1 } }
};

const sectionVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { delay: 0.2, type: 'spring', stiffness: 100 } }
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
    boxShadow: "0 10px 20px rgba(0, 172, 193, 0.1)", // Color de sombra adaptado
    transition: { duration: 0.3 }
  },
  tap: { scale: 0.98 }
};

const buttonVariants = {
  hover: { scale: 1.05 },
  tap: { scale: 0.95 }
};

const calendarTileVariants = {
  hover: {
    scale: 1.05,
    backgroundColor: "rgba(0, 172, 193, 0.1)" // Mantener el color del tile
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
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => { // Usamos una función async para manejar las promesas
      setLoading(true);
      setError(null); // Resetear error en cada nueva carga
      const formattedDate = selectedDate.toISOString().split('T')[0];

      try {
        // Simular fetching de citas
        const citasData = await new Promise(resolve => setTimeout(() => {
          const allCitas = [
            {
              id: 1,
              fecha: '2025-06-20T10:00:00Z',
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
              fecha: '2025-06-20T14:30:00Z',
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
              fecha: '2025-06-21T09:00:00Z',
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
              fecha: '2025-06-21T11:00:00Z',
              propietarioNombre: 'Marta Díaz',
              mascotaNombre: 'Copito',
              servicio: 'Peluquería Canina',
              telefono: '3112223344',
              direccion: 'Diagonal 80 #9-10',
              mascotaEspecie: 'Conejo',
              mascotaRaza: 'Mini Lop'
            }
          ];
          resolve(allCitas.filter(cita => cita.fecha.startsWith(formattedDate)));
        }, 500));
        setCitas(citasData);

        // Simular fetching de servicios
        const serviciosData = await new Promise(resolve => setTimeout(() => {
          resolve([
            { id: 'sg1', nombre: 'Consulta General', descripcion: 'Examen médico general de la mascota.' },
            { id: 'sv2', nombre: 'Vacunación', descripcion: 'Aplicación de vacunas según el esquema.' },
            { id: 'sp3', nombre: 'Desparasitación', descripcion: 'Tratamiento contra parásitos internos y externos.' },
            { id: 'sq4', nombre: 'Cirugía', descripcion: 'Procedimientos quirúrgicos diversos.' },
            { id: 'sl5', nombre: 'Peluquería Canina', descripcion: 'Cortes de pelo y acicalamiento.' },
          ]);
        }, 750));
        setServicios(serviciosData);

      } catch (err) {
        setError('No se pudo cargar la lista de citas o servicios.');
        console.error("Error al cargar datos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedDate]);

  const onChangeDate = (date) => {
    setSelectedDate(date);
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
          className={veteStyles.veteCalendarDot}
          variants={calendarTileVariants}
          whileHover="hover"
          whileTap="tap"
        />
      ) : null;
    }
    return null;
  };

  // Manejo de estados de carga y error similar a AgendarCita
  if (loading) {
    return (
      <motion.div
        className={veteStyles.veteLoadingContainer}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <FontAwesomeIcon icon={faSpinner} spin className={veteStyles.veteSpinner} />
        <p>Cargando información...</p>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        className={veteStyles.veteErrorContainer}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <FontAwesomeIcon icon={faExclamationTriangle} className={veteStyles.veteErrorIcon} />
        <p>Error al cargar la información: {error}</p>
        <motion.button
          onClick={() => window.location.reload()} // O una función para reintentar la carga
          className={veteStyles.veteReloadButton} // Crear un estilo para este botón
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <FontAwesomeIcon icon={faSpinner} spin={loading} /> Reintentar
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={veteStyles.veteListaContainer}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className={veteStyles.veteHeader}
        variants={headerVariants}
        initial="initial"
        animate="animate"
      >
        <div className={veteStyles.veteHeaderContent}> {/* Agregado para agrupar contenido y darle más control de layout */}
          <FontAwesomeIcon icon={faCalendarAlt} className={veteStyles.veteHeaderIcon} />
          <h2>Citas Agendadas</h2>
        </div>

        <motion.div
          className={veteStyles.veteSearchContainer}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <FontAwesomeIcon icon={faSearch} className={veteStyles.veteSearchIcon} />
          <input
            type="text"
            className={veteStyles.veteSearchInput}
            placeholder="Buscar citas por dueño, mascota o servicio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </motion.div>

        {/* El calendario se mantiene separado como un panel, pero con animaciones coherentes */}
        <motion.div
          className={veteStyles.veteCalendarPanel} // Nuevo estilo para el panel del calendario
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h3><FontAwesomeIcon icon={faCalendarAlt} /> Seleccionar Fecha</h3>
          <Calendar
            onChange={onChangeDate}
            value={selectedDate}
            locale="es-CO"
            tileContent={tileContent}
            className={veteStyles.veteCalendar}
          />
        </motion.div>
      </motion.div>

      <AnimatePresence mode="wait"> {/* Añadido mode="wait" para transiciones más suaves entre la lista vacía y llena */}
        {filteredCitas.length > 0 ? (
          <motion.ul
            className={veteStyles.veteLista}
            key="citas-list" // Key para AnimatePresence
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={containerVariants} // Reutilizar variantes para la lista
          >
            {filteredCitas.map((cita) => (
              <motion.li
                key={cita.id}
                className={veteStyles.veteListItem}
                variants={itemVariants}
                whileHover="hover"
                whileTap="tap"
                layout // Para animaciones de layout si la lista cambia
              >
                <div className={veteStyles.veteCitaInfo}>
                  <div className={veteStyles.veteInfoRow}>
                    <FontAwesomeIcon icon={faClock} className={veteStyles.veteInfoIcon} />
                    <span className={veteStyles.veteFecha}>
                      {new Date(cita.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className={veteStyles.veteInfoRow}>
                    <FontAwesomeIcon icon={faUser} className={veteStyles.veteInfoIcon} />
                    <span className={veteStyles.vetePropietario}>{cita.propietarioNombre}</span>
                  </div>

                  <div className={veteStyles.veteInfoRow}>
                    <FontAwesomeIcon icon={faPaw} className={veteStyles.veteInfoIcon} />
                    <span className={veteStyles.veteMascota}>
                      {cita.mascotaNombre} ({cita.mascotaEspecie} - {cita.mascotaRaza})
                    </span>
                  </div>

                  <div className={veteStyles.veteInfoRow}>
                    <FontAwesomeIcon icon={faTag} className={veteStyles.veteInfoIcon} />
                    <span className={veteStyles.veteServicio}>{cita.servicio}</span>
                  </div>

                  <div className={veteStyles.veteInfoRow}>
                    <FontAwesomeIcon icon={faPhone} className={veteStyles.veteInfoIcon} />
                    <span className={veteStyles.veteTelefono}>{cita.telefono}</span>
                  </div>

                  <div className={veteStyles.veteInfoRow}>
                    <FontAwesomeIcon icon={faMapMarkerAlt} className={veteStyles.veteInfoIcon} />
                    <span className={veteStyles.veteDireccion}>{cita.direccion}</span>
                  </div>
                </div>

                <motion.div
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Link
                    to={`/veterinario/citas/${cita.id}`}
                    className={veteStyles.veteVerButton}
                    title="Ver detalles de la cita"
                  >
                    <FontAwesomeIcon icon={faEye} /> Ver Detalle
                  </Link>
                </motion.div>
              </motion.li>
            ))}
          </motion.ul>
        ) : (
          <motion.div
            key="empty-message" // Key para AnimatePresence
            className={veteStyles.veteEmptyMessage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 0.3 }}
          >
            {searchTerm ?
              'No se encontraron citas que coincidan con la búsqueda.' :
              'No hay citas agendadas para la fecha seleccionada.'}

            <motion.div
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              {/* Botón para agendar nueva cita (Veterinario) */}
              <Link to="/veterinario/citas/agendar" className={veteStyles.veteAddButton}>
                <FontAwesomeIcon icon={faPlus} /> Agendar Nueva Cita
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className={veteStyles.veteServiciosSection}
        variants={sectionVariants}
        initial="initial"
        animate="animate"
      >
        <h2>
          <FontAwesomeIcon icon={faTag} className={veteStyles.veteHeaderIcon} />
          Nuestros Servicios
        </h2>

        <ul className={veteStyles.veteServiciosLista}>
          {servicios.map((servicio) => (
            <motion.li
              key={servicio.id}
              className={veteStyles.veteServicioItem}
              variants={itemVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <h3>{servicio.nombre}</h3>
              <p>{servicio.descripcion}</p>

              <motion.div
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <Link
                  to={`/veterinario/citas/agendar?servicio=${encodeURIComponent(servicio.nombre)}`}
                  className={veteStyles.veteServicioButton}
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