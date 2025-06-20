import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
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

// Importa el archivo CSS correctamente
import './Style/CrearCitaVeterinario.css';

// Variantes de Framer Motion
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

  // Estados del formulario
  const [clientes, setClientes] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [veterinarios, setVeterinarios] = useState([]);
  const [mascotasCliente, setMascotasCliente] = useState([]);

  const [selectedCliente, setSelectedCliente] = useState('');
  const [selectedMascota, setSelectedMascota] = useState('');
  const [selectedServicio, setSelectedServicio] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(null);

  // Estados para el filtro de clientes
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [filteredClientes, setFilteredClientes] = useState([]);

  // ID del veterinario logeado (mantengo tu simulación)
  const loggedInVeterinarioId = 2; // Simula el ID del veterinario logeado

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
        const [clientesData, serviciosData, veterinariosData] = await Promise.all([
          // Datos de clientes (simulados)
          new Promise(resolve => setTimeout(() => {
            resolve([
                { id_cliente: 1, nombre: 'Juan Pérez', telefono: '1234567890', mascotas: [
                    { id_mascota: 1, nombre: 'Max', especie: 'Perro', raza: 'Labrador' },
                    { id_mascota: 2, nombre: 'Luna', especie: 'Gato', raza: 'Siamés' },
                ]},
                { id_cliente: 2, nombre: 'María Gómez', telefono: '0987654321', mascotas: [
                    { id_mascota: 3, nombre: 'Rocky', especie: 'Perro', raza: 'Bulldog Francés' },
                ]},
                { id_cliente: 3, nombre: 'Carlos López', telefono: '1122334455', mascotas: [
                    { id_mascota: 4, nombre: 'Milo', especie: 'Gato', raza: 'Mestizo' },
                ]},
                { id_cliente: 4, nombre: 'Ana Martínez', telefono: '3101112233', mascotas: [
                    { id_mascota: 5, nombre: 'Bella', especie: 'Perro', raza: 'Golden Retriever' },
                ]},
                { id_cliente: 5, nombre: 'Luis Rodríguez', telefono: '3152223344', mascotas: [
                    { id_mascota: 6, nombre: 'Simba', especie: 'Gato', raza: 'Persa' },
                ]},
                { id_cliente: 6, nombre: 'Sofía García', telefono: '3203334455', mascotas: [
                    { id_mascota: 7, nombre: 'Coco', especie: 'Perro', raza: 'Chihuahua' },
                ]},
                { id_cliente: 7, nombre: 'David Sánchez', telefono: '3001234567', mascotas: [
                    { id_mascota: 8, nombre: 'Duque', especie: 'Perro', raza: 'Pastor Alemán' },
                ]},
                { id_cliente: 8, nombre: 'Elena Vega', telefono: '3019876543', mascotas: [
                    { id_mascota: 9, nombre: 'Mittens', especie: 'Gato', raza: 'Ragdoll' },
                ]},
                { id_cliente: 9, nombre: 'Fernando Ruiz', telefono: '3023456789', mascotas: [
                    { id_mascota: 10, nombre: 'Goldie', especie: 'Pez', raza: 'Pez de Colores' },
                ]},
                { id_cliente: 10, nombre: 'Gabriela Díaz', telefono: '3038765432', mascotas: [
                    { id_mascota: 11, nombre: 'Pip', especie: 'Hamster', raza: 'Roborovski' },
                ]},
                { id_cliente: 11, nombre: 'Héctor Vargas', telefono: '3047654321', mascotas: [
                    { id_mascota: 12, nombre: 'Snowball', especie: 'Conejo', raza: 'Mini Lop' },
                ]},
                { id_cliente: 12, nombre: 'Isabel Castro', telefono: '3056543210', mascotas: [
                    { id_mascota: 13, nombre: 'Hedwig', especie: 'Búho', raza: 'Nival' },
                ]},
            ]);
          }, 500)),

          // Datos de servicios (simulados)
          new Promise(resolve => setTimeout(() => {
            resolve([
              { id_servicio: 1, nombre: 'Consulta General', descripcion: 'Revisión médica básica para tu mascota.', precio: '$50.000' },
              { id_servicio: 2, nombre: 'Vacunación', descripcion: 'Programas de vacunación personalizados para proteger a tu compañero.', precio: '$30.000' },
              { id_servicio: 3, nombre: 'Estética Canina y Felina', descripcion: 'Baño, corte de pelo y otros tratamientos de belleza.', precio: '$40.000' },
              { id_servicio: 4, nombre: 'Cirugía', descripcion: 'Procedimientos quirúrgicos con equipo moderno y veterinarios especializados.', precio: 'Consultar' },
              { id_servicio: 5, nombre: 'Diagnóstico por Imagen', descripcion: 'Rayos X, ecografías y otros métodos de diagnóstico avanzado.', precio: 'Consultar' },
              { id_servicio: 6, nombre: 'Laboratorio Clínico', descripcion: 'Análisis de sangre, orina y otros fluidos corporales.', precio: '$25.000' },
            ]);
          }, 500)),

          // Datos de veterinarios (simulados)
          new Promise(resolve => setTimeout(() => {
            resolve([
              { id: 1, nombre: 'Dr.', apellido: 'López' },
              { id: 2, nombre: 'Carlos', apellido: 'Veterinario' },
              { id: 4, nombre: 'Laura', apellido: 'Gómez' },
              { id: 5, nombre: 'Mario', apellido: 'Hernández' },
              { id: 6, nombre: 'Sandra', apellido: 'Pérez' },
            ]);
          }, 500))
        ]);

        setClientes(clientesData);
        setFilteredClientes(clientesData);
        setServicios(serviciosData);
        setVeterinarios(veterinariosData);

        // Procesar parámetros de URL
        const serviceFromUrl = searchParams.get('servicio');
        if (serviceFromUrl) {
          const foundService = serviciosData.find(s => s.nombre === serviceFromUrl);
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
                    setSelectedDate(new Date()); // Si la fecha de la URL es inválida, usa la fecha actual
                }
            } catch (e) {
                console.error("Error al parsear la fecha de la URL:", e);
                setSelectedDate(new Date()); // En caso de error, usa la fecha actual
            }
        } else {
            setSelectedDate(new Date()); // Si no hay fecha en la URL, usa la fecha actual
        }

      } catch (err) {
        setError('Error al cargar datos iniciales. Por favor, intente de nuevo.');
        console.error("Error fetching initial data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchParams]);

  useEffect(() => {
    if (selectedCliente) {
      const cliente = clientes.find(c => c.id_cliente.toString() === selectedCliente);
      if (cliente && cliente.mascotas) {
        setMascotasCliente(cliente.mascotas);
        setSelectedMascota(''); // Resetea la mascota seleccionada al cambiar de cliente
      } else {
        setMascotasCliente([]);
      }
    } else {
      setMascotasCliente([]);
      setSelectedMascota('');
    }
  }, [selectedCliente, clientes]);

  useEffect(() => {
    const query = clientSearchQuery.toLowerCase();
    setFilteredClientes(
      query
        ? clientes.filter(cliente =>
            cliente.nombre.toLowerCase().includes(query) ||
            cliente.telefono.includes(query)
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
      fecha: fullDateTime.toISOString().slice(0, 19).replace('T', ' '), // Formato YYYY-MM-DD HH:MM:SS
      estado: 'pendiente' // Estado inicial
    };

    console.log("Intentando agendar cita:", newCita);

    try {
      // Simulación de una llamada API
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simula un retraso de red
      
      setSuccessMessage('¡Cita agendada exitosamente!');
      
      // Limpiar formulario después de éxito
      setSelectedCliente('');
      setSelectedMascota('');
      setSelectedServicio('');
      setSelectedTime(null);
      setClientSearchQuery(''); // Limpiar la búsqueda del cliente

    } catch (err) {
      setError(err.message || 'Hubo un problema al agendar la cita. Por favor, intente de nuevo.');
      console.error("Error submitting cita:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Renderizado condicional para el estado de carga
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

  // Renderizado condicional para errores iniciales que impiden cargar el formulario
  if (!loading && error && !successMessage) { // Si hay un error y no hay un mensaje de éxito previo
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
                  className="secondary-button" // Usamos la clase del botón secundario para volver
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
        {loggedInVeterinarioId && (
          <p className="help-text">
              Asignado a: <strong>{veterinarios.find(v => v.id === loggedInVeterinarioId)?.nombre || 'Veterinario actual'}</strong>
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
                    <option key={cliente.id_cliente} value={cliente.id_cliente}>
                      {cliente.nombre} (Tel: {cliente.telefono})
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
                required // Añadir required para asegurar que se seleccione la hora
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