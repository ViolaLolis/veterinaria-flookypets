import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate, Link, useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarAlt, faPaw, faUser,
  faSpinner, faSearch, faClock,
  faCheckCircle, faExclamationCircle, faTimes, faChevronDown, faConciergeBell
} from '@fortawesome/free-solid-svg-icons';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import es from 'date-fns/locale/es';
import { authFetch } from './api'; // Importa authFetch

// Importa el archivo CSS correctamente
import './Style/CrearCitaVeterinario.css'; // Asegúrate de que este archivo CSS exista

// Variantes de Framer Motion (mantengo las que ya tenías)
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1,
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

const headerVariants = {
  initial: { y: -30, opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 120,
      damping: 10,
      delay: 0.1
    }
  }
};

const sectionVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.2,
      type: 'spring',
      stiffness: 100,
      duration: 0.6
    }
  }
};

const inputFieldVariants = {
  initial: { opacity: 0, x: -20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 10,
      duration: 0.4
    }
  },
  focus: {
    scale: 1.01,
    boxShadow: "0 0 0 3px rgba(79, 172, 254, 0.2)"
  }
};

const buttonVariants = {
  hover: {
    scale: 1.05,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 10
    }
  },
  tap: {
    scale: 0.95,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 10
    }
  }
};

const messageVariants = {
  initial: { opacity: 0, y: -20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 15
    }
  },
  exit: {
    opacity: 0,
    y: 20,
    transition: {
      ease: 'easeIn'
    }
  }
};

const CrearCitaVeterinario = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, showNotification } = useOutletContext(); // Obtener el usuario logeado y la función de notificación

  // Estados del formulario
  const [clientes, setClientes] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [mascotasCliente, setMascotasCliente] = useState([]);

  const [selectedCliente, setSelectedCliente] = useState('');
  const [selectedMascota, setSelectedMascota] = useState('');
  const [selectedServicio, setSelectedServicio] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(null);

  // Estados para el filtro de clientes
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [filteredClientes, setFilteredClientes] = useState([]);

  // ID del veterinario logeado (obtenido del contexto)
  const loggedInVeterinarioId = user?.id;

  // Estados de UI
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [clientesResponse, serviciosResponse] = await Promise.all([
          authFetch('/usuarios?role=usuario'), // Obtener solo usuarios con rol 'usuario'
          authFetch('/servicios')
        ]);

        if (clientesResponse.success) {
          setClientes(clientesResponse.data);
          setFilteredClientes(clientesResponse.data);
        } else {
          setError(clientesResponse.message || 'Error al cargar los clientes.');
          showNotification(clientesResponse.message || 'Error al cargar los clientes.', 'error');
        }

        if (serviciosResponse.success) {
          setServicios(serviciosResponse.data);
        } else {
          setError(prev => prev || serviciosResponse.message || 'Error al cargar los servicios.'); // Mantener error si ya existe
          showNotification(serviciosResponse.message || 'Error al cargar los servicios.', 'error');
        }

        // Procesar parámetros de URL (ej. para agendar servicio desde la lista de servicios)
        const serviceFromUrl = searchParams.get('servicio');
        if (serviceFromUrl) {
          const foundService = serviciosResponse.data.find(s => s.nombre === serviceFromUrl);
          if (foundService) {
            setSelectedServicio(foundService.id_servicio.toString());
          }
        }

        const dateFromUrl = searchParams.get('fecha');
        if (dateFromUrl) {
            try {
                const parsedDate = new Date(dateFromUrl);
                if (!isNaN(parsedDate.getTime())) {
                    setSelectedDate(parsedDate);
                } else {
                    setSelectedDate(new Date());
                }
            } catch (e) {
                console.error("Error al parsear la fecha de la URL:", e);
                setSelectedDate(new Date());
            }
        } else {
            setSelectedDate(new Date());
        }

      } catch (err) {
        setError('Error de conexión al servidor al cargar datos iniciales. Por favor, intente de nuevo.');
        console.error("Error fetching initial data:", err);
        showNotification('Error de conexión al servidor al cargar datos iniciales.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchParams, showNotification]);

  // Cargar mascotas del cliente seleccionado
  useEffect(() => {
    const fetchMascotas = async () => {
      if (selectedCliente) {
        try {
          const response = await authFetch(`/mascotas?id_propietario=${selectedCliente}`);
          if (response.success) {
            setMascotasCliente(response.data);
            setSelectedMascota(''); // Resetea la mascota seleccionada al cambiar de cliente
          } else {
            setMascotasCliente([]);
            setSelectedMascota('');
            showNotification(response.message || 'Error al cargar las mascotas del cliente.', 'error');
          }
        } catch (err) {
          console.error("Error fetching mascotas:", err);
          setMascotasCliente([]);
          setSelectedMascota('');
          showNotification('Error de conexión al servidor al cargar mascotas.', 'error');
        }
      } else {
        setMascotasCliente([]);
        setSelectedMascota('');
      }
    };
    fetchMascotas();
  }, [selectedCliente, showNotification]);

  // Filtrar clientes por búsqueda
  useEffect(() => {
    const query = clientSearchQuery.toLowerCase();
    setFilteredClientes(
      query
        ? clientes.filter(cliente =>
            (cliente.nombre && cliente.nombre.toLowerCase().includes(query)) ||
            (cliente.apellido && cliente.apellido.toLowerCase().includes(query)) ||
            (cliente.telefono && cliente.telefono.includes(query))
          )
        : clientes
    );
  }, [clientSearchQuery, clientes]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    if (!selectedCliente || !selectedMascota || !selectedServicio || !selectedDate || !selectedTime) {
      setError('Por favor, complete todos los campos requeridos (Cliente, Mascota, Servicio, Hora).');
      setSubmitting(false);
      return;
    }

    if (!loggedInVeterinarioId) {
      setError('No se pudo obtener el ID del veterinario logeado. Por favor, intente recargar la página.');
      showNotification('No se pudo obtener el ID del veterinario logeado.', 'error');
      setSubmitting(false);
      return;
    }

    const fullDateTime = new Date(selectedDate);
    fullDateTime.setHours(selectedTime.getHours());
    fullDateTime.setMinutes(selectedTime.getMinutes());
    fullDateTime.setSeconds(0);
    fullDateTime.setMilliseconds(0);

    const newCita = {
      id_cliente: parseInt(selectedCliente),
      id_mascota: parseInt(selectedMascota),
      id_servicio: parseInt(selectedServicio),
      id_veterinario: loggedInVeterinarioId,
      fecha_cita: fullDateTime.toISOString().slice(0, 19).replace('T', ' '), // Formato YYYY-MM-DD HH:MM:SS
      estado: 'pendiente' // Estado inicial
    };

    console.log("Intentando agendar cita:", newCita);

    try {
      const response = await authFetch('/citas/agendar', {
        method: 'POST',
        body: JSON.stringify(newCita),
      });

      if (response.success) {
        setSuccessMessage('¡Cita agendada exitosamente!');
        showNotification('Cita agendada exitosamente.', 'success');

        // Limpiar formulario después de éxito
        setSelectedCliente('');
        setSelectedMascota('');
        setSelectedServicio('');
        setSelectedTime(null);
        setClientSearchQuery('');
        setMascotasCliente([]); // Limpiar mascotas del cliente
        // Opcional: Redirigir al listado de citas después de un tiempo
        setTimeout(() => navigate('/veterinario/citas'), 1500);

      } else {
        setError(response.message || 'Hubo un problema al agendar la cita. Por favor, intente de nuevo.');
        showNotification(response.message || 'Hubo un problema al agendar la cita.', 'error');
      }
    } catch (err) {
      setError(err.message || 'Error de conexión al servidor al agendar la cita. Por favor, intente de nuevo.');
      console.error("Error submitting cita:", err);
      showNotification('Error de conexión al servidor al agendar la cita.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <motion.div
        className="loading-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <FontAwesomeIcon icon={faSpinner} spin className="spinner" />
        <p>Cargando datos para el formulario...</p>
      </motion.div>
    );
  }

  if (!loading && error && !successMessage) {
      return (
          <motion.div
              className="error-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
          >
              <FontAwesomeIcon icon={faExclamationCircle} className="error-icon" />
              <p>{error}</p>
              <motion.button
                  onClick={() => navigate('/veterinario/citas')}
                  className="secondary-button"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
              >
                  Volver al listado de Citas
              </motion.button>
          </motion.div>
      );
  }

  return (
    <motion.div
      className="crear-cita-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* HEADER */}
      <motion.div
        className="header"
        variants={headerVariants}
        initial="initial"
        animate="animate"
      >
        <FontAwesomeIcon icon={faCalendarAlt} className="header-icon" />
        <h2>Agendar Nueva Cita Veterinaria</h2>
        <p className="help-text">
            Fecha de la cita: <strong>{selectedDate ? selectedDate.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'No definida'}</strong>
        </p>
        {user && (
          <p className="help-text">
              Asignado a: <strong>{user.nombre} {user.apellido}</strong>
          </p>
        )}
      </motion.div>

      {/* FORMULARIO */}
      <form onSubmit={handleSubmit} className="cita-form">
        {/* Sección de Cliente y Mascota */}
        <motion.div className="form-section" variants={sectionVariants}>
          <h3 className="section-title">
            <FontAwesomeIcon icon={faUser} /> Datos del Cliente y Mascota
          </h3>

          <motion.div className="input-group" variants={inputFieldVariants}>
              <label htmlFor="searchCliente" className="label">Buscar Cliente:</label>
              <div className="input-with-icon">
                <motion.input
                    type="text"
                    id="searchCliente"
                    className="input-field"
                    value={clientSearchQuery}
                    onChange={(e) => setClientSearchQuery(e.target.value)}
                    placeholder="Buscar por nombre o teléfono..."
                    whileFocus="focus"
                    variants={inputFieldVariants}
                />
                <FontAwesomeIcon icon={faSearch} className="input-icon" />
              </div>
          </motion.div>

          <motion.div className="input-group" variants={inputFieldVariants}>
            <label htmlFor="cliente" className="label">Seleccionar Cliente:</label>
            <div className="select-container">
              <motion.select
                id="cliente"
                className="select-field"
                value={selectedCliente}
                onChange={(e) => setSelectedCliente(e.target.value)}
                required
                whileFocus="focus"
                variants={inputFieldVariants}
              >
                <option value="">Seleccione un cliente</option>
                {filteredClientes.length > 0 ? (
                  filteredClientes.map(cliente => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nombre} {cliente.apellido} (Tel: {cliente.telefono})
                    </option>
                  ))
                ) : (
                    <option value="" disabled>No se encontraron clientes para "{clientSearchQuery}"</option>
                )}
              </motion.select>
              <FontAwesomeIcon icon={faChevronDown} className="select-arrow" />
            </div>
          </motion.div>

          {selectedCliente && (
            <motion.div className="input-group" variants={inputFieldVariants}>
              <label htmlFor="mascota" className="label">Mascota:</label>
              <div className="select-container">
                <motion.select
                  id="mascota"
                  className="select-field"
                  value={selectedMascota}
                  onChange={(e) => setSelectedMascota(e.target.value)}
                  required
                  whileFocus="focus"
                  variants={inputFieldVariants}
                >
                  <option value="">Seleccione una mascota</option>
                  {mascotasCliente.length > 0 ? (
                    mascotasCliente.map(mascota => (
                      <option key={mascota.id_mascota} value={mascota.id_mascota}>
                        {mascota.nombre} ({mascota.especie} - {mascota.raza})
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>No hay mascotas registradas para este cliente.</option>
                  )}
                </motion.select>
                <FontAwesomeIcon icon={faPaw} className="select-arrow" />
              </div>
              {mascotasCliente.length === 0 && selectedCliente && (
                <p className="help-text">
                  Este cliente no tiene mascotas registradas.
                  Puedes <Link to="/veterinario/mascotas/registrar" className="inline-link">registrar una aquí</Link>.
                </p>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Sección de Detalles de la Cita */}
        <motion.div className="form-section" variants={sectionVariants}>
          <h3 className="section-title">
            <FontAwesomeIcon icon={faCalendarAlt} /> Detalles de la Cita
          </h3>
          <motion.div className="input-group" variants={inputFieldVariants}>
            <label htmlFor="servicio" className="label">Servicio:</label>
            <div className="select-container">
              <motion.select
                id="servicio"
                className="select-field"
                value={selectedServicio}
                onChange={(e) => setSelectedServicio(e.target.value)}
                required
                whileFocus="focus"
                variants={inputFieldVariants}
              >
                <option value="">Seleccione un servicio</option>
                {servicios.map(servicio => (
                  <option key={servicio.id_servicio} value={servicio.id_servicio}>
                    {servicio.nombre} - {servicio.precio}
                  </option>
                ))}
              </motion.select>
              <FontAwesomeIcon icon={faConciergeBell} className="select-arrow" />
            </div>
          </motion.div>

          <p className="info-text">
              Esta cita se asignará automáticamente a usted.
          </p>

          <motion.div className="input-group" variants={inputFieldVariants}>
            <label htmlFor="hora" className="label">Hora de la Cita:</label>
            <div className="time-picker-container">
              <DatePicker
                selected={selectedTime}
                onChange={setSelectedTime}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15}
                timeCaption="Hora"
                dateFormat="h:mm aa"
                locale={es}
                className="time-picker-input"
                placeholderText="Seleccione la hora"
                required
              />
              <FontAwesomeIcon icon={faClock} className="time-icon" />
            </div>
          </motion.div>

        </motion.div>

        {/* Botones de acción */}
        <div className="action-buttons">
          <motion.button
            type="submit"
            className="primary-button"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin /> Agendando...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faCheckCircle} /> Agendar Cita
              </>
            )}
          </motion.button>

          <motion.button
            type="button"
            className="secondary-button"
            onClick={() => navigate('/veterinario/citas')}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <FontAwesomeIcon icon={faTimes} /> Cancelar y Volver
          </motion.button>
        </div>
      </form>

      {/* MENSAJES DE ERROR/ÉXITO - FUERA DEL FORMULARIO PERO DENTRO DEL CONTENEDOR PRINCIPAL */}
      <AnimatePresence>
          {error && (
            <motion.div
              className="message error-message"
              variants={messageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <FontAwesomeIcon icon={faExclamationCircle} /> {error}
              <motion.button
                type="button"
                onClick={() => setError(null)}
                className="close-message-button"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <FontAwesomeIcon icon={faTimes} />
              </motion.button>
            </motion.div>
          )}
          {successMessage && (
            <motion.div
              className="message success-message"
              variants={messageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <FontAwesomeIcon icon={faCheckCircle} /> {successMessage}
              <motion.button
                type="button"
                onClick={() => setSuccessMessage(null)}
                className="close-message-button"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <FontAwesomeIcon icon={faTimes} />
              </motion.button>
            </motion.div>
          )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CrearCitaVeterinario;
