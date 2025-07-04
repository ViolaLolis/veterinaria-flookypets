import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import veteStyles from './Style/ListaCitasVeterinarioStyles.module.css';
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
  faExclamationTriangle,
  faSync
} from '@fortawesome/free-solid-svg-icons';
import { authFetch } from './api';

// Framer Motion variants for consistent animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1,
      duration: 0.3
    }
  }
};

const headerVariants = {
  initial: { y: -30, opacity: 0 },
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
    boxShadow: "0 10px 20px rgba(0, 172, 193, 0.1)",
    transition: { duration: 0.3 }
  },
  tap: { scale: 0.98 }
};

const buttonVariants = {
  hover: { scale: 1.05 },
  tap: { scale: 0.95 }
};

const ListaCitasVeterinario = () => {
  const { user, showNotification } = useOutletContext();
  const [citas, setCitas] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const fetchCitasAndServicios = useCallback(async () => {
    setLoading(true);
    setError(null);
    setRefreshing(true);

    try {
      // Fetch all appointments for the logged-in veterinarian
      const citasResponse = await authFetch(`/citas`);
      if (citasResponse.success) {
        setCitas(citasResponse.data);
      } else {
        setError(citasResponse.message || 'Error al cargar las citas.');
        showNotification(citasResponse.message || 'Error al cargar las citas.', 'error');
      }

      // Fetch services
      const serviciosResponse = await authFetch('/servicios');
      if (serviciosResponse.success) {
        setServicios(serviciosResponse.data);
      } else {
        console.warn("Error al cargar servicios:", serviciosResponse.message);
      }

    } catch (err) {
      console.error("Error al cargar datos:", err);
      setError('Error de conexión al servidor al cargar citas o servicios.');
      showNotification('Error de conexión al servidor al cargar citas o servicios.', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchCitasAndServicios();
  }, [fetchCitasAndServicios]);

  const filteredCitas = citas.filter(cita =>
    (cita.propietario_nombre && cita.propietario_nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (cita.propietario_apellido && cita.propietario_apellido.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (cita.mascota_nombre && cita.mascota_nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (cita.servicio_nombre && cita.servicio_nombre.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleRefresh = () => {
    fetchCitasAndServicios();
  };

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
          onClick={handleRefresh}
          className={veteStyles.veteReloadButton}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          disabled={refreshing}
        >
          {refreshing ? (
            <>
              <FontAwesomeIcon icon={faSpinner} spin /> Reintentando...
            </>
          ) : (
            'Reintentar'
          )}
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
        <div className={veteStyles.veteHeaderContent}>
          <FontAwesomeIcon icon={faCalendarAlt} className={veteStyles.veteHeaderIcon} />
          <h2>Todas las Citas Agendadas</h2>
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

        <motion.button
          onClick={handleRefresh}
          className={veteStyles.veteRefreshButton}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          disabled={refreshing}
          style={{ marginTop: '20px' }} // Added some top margin for spacing
        >
          <FontAwesomeIcon icon={faSync} spin={refreshing} />
          {refreshing ? ' Actualizando...' : ' Actualizar Citas'}
        </motion.button>
      </motion.div>

      <AnimatePresence mode="wait">
        {filteredCitas.length > 0 ? (
          <motion.ul
            className={veteStyles.veteLista}
            key="citas-list"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={containerVariants}
          >
            {filteredCitas.map((cita) => (
              <motion.li
                key={cita.id_cita}
                className={veteStyles.veteListItem}
                variants={itemVariants}
                whileHover="hover"
                whileTap="tap"
                layout
              >
                <div className={veteStyles.veteCitaInfo}>
                  <div className={veteStyles.veteInfoRow}>
                    <FontAwesomeIcon icon={faClock} className={veteStyles.veteInfoIcon} />
                    <span className={veteStyles.veteFecha}>
                      {new Date(cita.fecha_cita).toLocaleDateString()} - {new Date(cita.fecha_cita).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className={veteStyles.veteInfoRow}>
                    <FontAwesomeIcon icon={faUser} className={veteStyles.veteInfoIcon} />
                    <span className={veteStyles.vetePropietario}>{cita.propietario_nombre} {cita.propietario_apellido}</span>
                  </div>

                  <div className={veteStyles.veteInfoRow}>
                    <FontAwesomeIcon icon={faPaw} className={veteStyles.veteInfoIcon} />
                    <span className={veteStyles.veteMascota}>
                      {cita.mascota_nombre} ({cita.mascota_especie} - {cita.mascota_raza})
                    </span>
                  </div>

                  <div className={veteStyles.veteInfoRow}>
                    <FontAwesomeIcon icon={faTag} className={veteStyles.veteInfoIcon} />
                    <span className={veteStyles.veteServicio}>{cita.servicio_nombre}</span>
                  </div>

                  <div className={veteStyles.veteInfoRow}>
                    <FontAwesomeIcon icon={faPhone} className={veteStyles.veteInfoIcon} />
                    <span className={veteStyles.veteTelefono}>{cita.propietario_telefono}</span>
                  </div>

                  <div className={veteStyles.veteInfoRow}>
                    <FontAwesomeIcon icon={faMapMarkerAlt} className={veteStyles.veteInfoIcon} />
                    <span className={veteStyles.veteDireccion}>{cita.propietario_direccion}</span>
                  </div>
                </div>

                <motion.div
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Link
                    to={`/veterinario/citas/${cita.id_cita}`}
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
            key="empty-message"
            className={veteStyles.veteEmptyMessage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 0.3 }}
          >
            {searchTerm ?
              'No se encontraron citas que coincidan con la búsqueda.' :
              'No hay citas agendadas.'}

            <motion.div
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
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
              key={servicio.id_servicio}
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