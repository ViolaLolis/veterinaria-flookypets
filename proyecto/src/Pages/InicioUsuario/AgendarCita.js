import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import styles from './Styles/AgendarCita.module.css';
import { useNavigate, useLocation, Link, useOutletContext } from 'react-router-dom'; // Importa useOutletContext
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faPaw,
  faUser,
  faInfoCircle,
  faCalendarAlt,
  faClock,
  faCheckCircle,
  faSpinner,
  faTimesCircle // Asegúrate de importar faTimesCircle para errores
} from '@fortawesome/free-solid-svg-icons';
import { authFetch } from './api';

const AgendarCita = () => {
  const { user, showNotification } = useOutletContext(); // Obtiene user y showNotification del contexto del Outlet
  const [date, setDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [citaAgendada, setCitaAgendada] = useState(false);
  const [errorSeleccion, setErrorSeleccion] = useState('');
  const [mascotas, setMascotas] = useState([]);
  const [selectedMascota, setSelectedMascota] = useState('');
  const [veterinarios, setVeterinarios] = useState([]);
  const [selectedVeterinario, setSelectedVeterinario] = useState('');
  const [servicio, setServicio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const horariosDisponibles = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    setErrorSeleccion(null); // Usamos errorSeleccion para errores de carga también
    try {
      const servicioId = location.state?.servicioId; // Obtener el ID del servicio del estado de la ubicación
      const userId = user?.id;

      if (!userId) {
        setErrorSeleccion('No se pudo obtener la información del usuario. Por favor, inicia sesión nuevamente.');
        setLoading(false);
        return;
      }

      let fetchedService = null;
      if (servicioId) {
        const serviceRes = await authFetch(`/servicios/${servicioId}`);
        if (serviceRes.success) {
          fetchedService = serviceRes.data;
          setServicio(fetchedService);
        } else {
          setErrorSeleccion(serviceRes.message || 'Error al cargar el servicio seleccionado.');
          setLoading(false);
          return;
        }
      } else {
        // Si no hay servicioId, se asume que el usuario llegó a esta página sin seleccionar un servicio
        // Podrías redirigirlo o mostrar un mensaje para que seleccione uno.
        // Por ahora, lo dejaré para que pueda seleccionar un servicio manualmente si lo deseas.
        // O podrías hacer que la página de agendar cita sea siempre iniciada desde un servicio.
      }

      const petsRes = await authFetch(`/mascotas?id_propietario=${userId}`);
      if (petsRes.success) {
        setMascotas(petsRes.data);
      } else {
        setErrorSeleccion(petsRes.message || 'Error al cargar tus mascotas.');
        setLoading(false);
        return;
      }

      const vetsRes = await authFetch('/usuarios/veterinarios');
      if (vetsRes.success) {
        setVeterinarios(vetsRes.data.filter(vet => vet.active));
      } else {
        setErrorSeleccion(vetsRes.message || 'Error al cargar los veterinarios.');
        setLoading(false);
        return;
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching initial data for AgendarCita:", err);
      setErrorSeleccion('Error de conexión al servidor al cargar los datos iniciales.');
      setLoading(false);
    }
  }, [location.state, user, authFetch]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const handleDateChange = (newDate) => {
    setDate(newDate);
    setSelectedTime('');
    setCitaAgendada(false);
    setErrorSeleccion('');
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    setErrorSeleccion('');
  };

  const handleSubmit = async () => {
    if (!selectedMascota || !selectedTime || !servicio || !user?.id) {
      setErrorSeleccion('Por favor, selecciona una mascota, un servicio, una fecha y una hora.');
      return;
    }

    setIsSubmitting(true);
    setErrorSeleccion('');
    try {
      const fechaHora = new Date(date);
      const [hours, minutes] = selectedTime.split(':');
      fechaHora.setHours(parseInt(hours, 10));
      fechaHora.setMinutes(parseInt(minutes, 10));
      fechaHora.setSeconds(0);

      const nuevaCita = {
        id_cliente: user.id,
        id_servicio: servicio.id_servicio,
        id_veterinario: selectedVeterinario || null,
        fecha: fechaHora.toISOString().slice(0, 19).replace('T', ' '),
        servicios: servicio.nombre,
        estado: 'pendiente'
      };

      const response = await authFetch('/citas', {
        method: 'POST',
        body: JSON.stringify(nuevaCita),
      });

      if (response.success) {
        setCitaAgendada(true);
        showNotification('¡Cita agendada con éxito!', 'success');
        setTimeout(() => {
          navigate('/usuario/citas');
        }, 3000);
      } else {
        showNotification(response.message || 'Error al agendar la cita. Por favor, intenta nuevamente.', 'error');
        setErrorSeleccion(response.message || 'Error al agendar la cita.');
      }
    } catch (err) {
      console.error("Error submitting appointment:", err);
      showNotification('Error de conexión al servidor al agendar la cita.', 'error');
      setErrorSeleccion('Error de conexión al servidor al agendar la cita.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVolver = () => {
    navigate(-1);
  };

  if (loading) return (
    <div className={styles.loadingContainer}>
      <FontAwesomeIcon icon={faSpinner} spin className={styles.spinner} />
      <p>Cargando información...</p>
    </div>
  );

  if (errorSeleccion && !citaAgendada) return (
    <div className={styles.errorContainer}>
      <FontAwesomeIcon icon={faTimesCircle} className={styles.errorIcon} />
      <p>{errorSeleccion}</p>
      <button onClick={handleVolver} className={styles.backButton}>
        <FontAwesomeIcon icon={faArrowLeft} /> Volver
      </button>
    </div>
  );

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className={styles.header}
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 120 }}
      >
        <div className={styles.headerContent}>
          <FontAwesomeIcon icon={faCalendarAlt} className={styles.headerIcon} />
          <h2>Agendar Nueva Cita</h2>
          <p>Programa una consulta para tu mascota</p>
        </div>
        <motion.button
          onClick={handleVolver}
          className={styles.backButton}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Volver
        </motion.button>
      </motion.div>

      {servicio && (
        <motion.div
          className={styles.serviceCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className={styles.serviceHeader}>
            <FontAwesomeIcon icon={faInfoCircle} className={styles.serviceIcon} />
            <h3>Servicio seleccionado</h3>
          </div>
          <div className={styles.serviceDetails}>
            <h4>{servicio.nombre}</h4>
            <p>{servicio.descripcion}</p>
            <div className={styles.servicePrice}>
              <span>${servicio.precio}</span>
            </div>
          </div>
        </motion.div>
      )}

      <div className={styles.formContainer}>
        <motion.div
          className={styles.formSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <FontAwesomeIcon icon={faPaw} className={styles.inputIcon} />
              Mascota
            </label>
            <select
              value={selectedMascota}
              onChange={(e) => setSelectedMascota(e.target.value)}
              className={styles.selectInput}
            >
              <option value="">Selecciona una mascota</option>
              {mascotas.length > 0 ? (
                mascotas.map(mascota => (
                  <option key={mascota.id_mascota} value={mascota.id_mascota}>
                    {mascota.nombre} ({mascota.especie})
                  </option>
                ))
              ) : (
                <option value="" disabled>No tienes mascotas registradas.</option>
              )}
            </select>
            {mascotas.length === 0 && (
              <p className={styles.formHint}>
                <Link to="/usuario/mascotas/agregar">Agrega una mascota</Link> para agendar una cita.
              </p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <FontAwesomeIcon icon={faUser} className={styles.inputIcon} />
              Veterinario (opcional)
            </label>
            <select
              value={selectedVeterinario}
              onChange={(e) => setSelectedVeterinario(e.target.value)}
              className={styles.selectInput}
            >
              <option value="">Sin preferencia</option>
              {veterinarios.length > 0 ? (
                veterinarios.map(vet => (
                  <option key={vet.id} value={vet.id}>
                    Dr. {vet.nombre} {vet.apellido}
                  </option>
                ))
              ) : (
                <option value="" disabled>No hay veterinarios disponibles.</option>
              )}
            </select>
          </div>
        </motion.div>

        <motion.div
          className={styles.scheduleSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className={styles.calendarContainer}>
            <div className={styles.sectionHeader}>
              <FontAwesomeIcon icon={faCalendarAlt} className={styles.sectionIcon} />
              <h3>Selecciona una fecha</h3>
            </div>
            <Calendar
              onChange={handleDateChange}
              value={date}
              minDate={new Date()}
              locale="es-ES"
              className={styles.calendar}
              tileClassName={styles.calendarTile}
            />
          </div>

          <div className={styles.timeContainer}>
            <div className={styles.sectionHeader}>
              <FontAwesomeIcon icon={faClock} className={styles.sectionIcon} />
              <h3>Horarios disponibles</h3>
            </div>
            <div className={styles.timeSlots}>
              {horariosDisponibles.map(time => (
                <motion.button
                  key={time}
                  className={`${styles.timeSlot} ${selectedTime === time ? styles.selectedTime : ''}`}
                  onClick={() => handleTimeSelect(time)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {time}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {errorSeleccion && !citaAgendada && ( // Mostrar error solo si no se ha agendado la cita
          <motion.div
            className={styles.errorMessage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {errorSeleccion}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {citaAgendada && (
          <motion.div
            className={styles.successMessage}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <FontAwesomeIcon icon={faCheckCircle} />
            <span>¡Cita agendada con éxito! Redirigiendo...</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className={styles.actions}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <motion.button
          onClick={handleSubmit}
          disabled={!selectedMascota || !selectedTime || !servicio || citaAgendada || isSubmitting}
          className={styles.submitButton}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          {isSubmitting ? (
            <>
              <FontAwesomeIcon icon={faSpinner} spin />
              <span>Procesando...</span>
            </>
          ) : (
            'Confirmar Cita'
          )}
        </motion.button>
      </motion.div>

      <div className={styles.additionalInfo}>
        <h3>¿Necesitas ayuda?</h3>
        <p>Si tienes problemas para agendar tu cita, contáctanos al:</p>
        <p className={styles.contactInfo}>
          <strong>Teléfono:</strong> 555-123-4567<br />
          <strong>Email:</strong> citas@veterinaria.com
        </p>
      </div>
    </motion.div>
  );
};

export default AgendarCita;
