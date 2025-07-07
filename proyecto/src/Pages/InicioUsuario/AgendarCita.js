import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import styles from './Styles/AgendarCita.module.css'; // <-- ¡Importación Correcta!
import { useNavigate, useLocation, Link, useOutletContext } from 'react-router-dom';
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
  faTimesCircle
} from '@fortawesome/free-solid-svg-icons';
import { authFetch } from '../../utils/api';
import { validateField } from '../../utils/validation';

const AgendarCita = () => {
  const { user, showNotification } = useOutletContext();
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
    '09:00', '10:00', '11:00', '12:00', '13:00',
    '14:00', '15:00', '16:00', '17:00'
  ];

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    setErrorSeleccion(null);

    if (!user?.id) {
      setErrorSeleccion('No se pudo obtener la información del usuario. Por favor, inicia sesión.');
      setLoading(false);
      return;
    }

    try {
      const servicioId = location.state?.servicioId;

      let fetchedServicio = null;
      if (servicioId) {
        try {
          const serviceResponse = await authFetch(`/servicios/${servicioId}`);
          if (serviceResponse.success) {
            fetchedServicio = serviceResponse.data;
          } else {
            showNotification(serviceResponse.message || 'Error al cargar el servicio.', 'error');
            setErrorSeleccion('Error al cargar el servicio.');
          }
        } catch (err) {
          console.error("Error fetching service:", err);
          showNotification('Error de conexión al cargar el servicio.', 'error');
          setErrorSeleccion('Error de conexión al cargar el servicio.');
        }
      } else {
        setErrorSeleccion('No se ha seleccionado un servicio para agendar.');
        setLoading(false);
        return;
      }

      const mascotasResponse = await authFetch(`/mascotas?id_propietario=${user.id}`);
      let fetchedMascotas = [];
      if (mascotasResponse.success) {
        fetchedMascotas = mascotasResponse.data;
      } else {
        showNotification(mascotasResponse.message || 'Error al cargar tus mascotas.', 'error');
      }

      const veterinariosResponse = await authFetch('/usuarios/veterinarios');
      let fetchedVeterinarios = [];
      if (veterinariosResponse.success) {
        fetchedVeterinarios = veterinariosResponse.data.filter(vet => vet.active);
      } else {
        showNotification(veterinariosResponse.message || 'Error al cargar los veterinarios.', 'error');
      }

      setServicio(fetchedServicio);
      setMascotas(fetchedMascotas);
      setVeterinarios(fetchedVeterinarios);
      setLoading(false);

    } catch (err) {
      console.error("Error fetching initial data:", err);
      setErrorSeleccion('Error al cargar los datos iniciales.');
      setLoading(false);
    }
  }, [location.state, user, showNotification]);

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
    // Ajusta la validación del campo de fecha para usar 'fecha' en lugar de 'fecha_cita'
    const mascotaError = validateField('id_mascota_cita', selectedMascota);
    const servicioError = validateField('id_servicio_cita', servicio?.id_servicio);
    const fechaHoraError = validateField('fecha', date && selectedTime ? `${date.toISOString().split('T')[0]} ${selectedTime}` : '');

    if (mascotaError || servicioError || fechaHoraError) {
      setErrorSeleccion(mascotaError || servicioError || fechaHoraError);
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

      // Objeto de la cita a enviar al backend
      const nuevaCita = {
        id_cliente: user.id,
        id_servicio: servicio.id_servicio, // Asegúrate de que este ID sea correcto
        id_veterinario: selectedVeterinario ? parseInt(selectedVeterinario) : null, // Puede ser null si es opcional
        id_mascota: parseInt(selectedMascota),
        fecha: fechaHora.toISOString().slice(0, 19).replace('T', ' '), // Formato DATETIME esperado por la BD y el backend
        motivo: servicio.nombre, // Se mantiene como 'motivo' para el frontend, el backend lo mapeará a 'servicios'
        estado: 'pendiente' // Estado inicial de la cita
      };

      const response = await authFetch('/citas', {
        method: 'POST',
        body: nuevaCita,
      });

      if (response.success) {
        setCitaAgendada(true);
        showNotification('¡Cita agendada con éxito y pendiente de confirmación!', 'success');
        setTimeout(() => {
          navigate('/usuario/citas');
        }, 3000);
      } else {
        showNotification(response.message || 'Error al agendar la cita.', 'error');
        setErrorSeleccion(response.message || 'Error al agendar la cita.');
      }
    } catch (err) {
      console.error("Error al crear cita:", err);
      showNotification('Error de conexión al procesar la cita.', 'error');
      setErrorSeleccion('Error de conexión al procesar la cita.');
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

  if (errorSeleccion && !citaAgendada && !loading) return (
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
      <motion.div className={styles.header} initial={{ y: -20 }} animate={{ y: 0 }} transition={{ type: 'spring', stiffness: 120 }}>
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
              <span>${typeof servicio.precio === 'number' ? servicio.precio.toLocaleString('es-CO') : servicio.precio}</span>
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
              {veterinarios.map(vet => (
                <option key={vet.id} value={vet.id}>
                  Dr. {vet.nombre} {vet.apellido}
                </option>
              ))}
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
        {errorSeleccion && !citaAgendada && (
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