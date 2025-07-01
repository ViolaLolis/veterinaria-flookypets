import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarPlus,
  faSpinner, faCheckCircle, faTimesCircle, faArrowLeft
} from '@fortawesome/free-solid-svg-icons';
import { authFetch } from './api'; // Importa authFetch
import './Styles/CrearCita.css'; // Asegúrate de que este CSS exista

const CrearCita = ({ user }) => { // Recibe el objeto 'user' como prop
  const navigate = useNavigate();
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [selectedServicio, setSelectedServicio] = useState('');
  const [mascotas, setMascotas] = useState([]);
  const [selectedMascota, setSelectedMascota] = useState('');
  const [notas, setNotas] = useState('');
  const [servicios, setServicios] = useState([]);
  const [veterinarios, setVeterinarios] = useState([]);
  const [selectedVeterinario, setSelectedVeterinario] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  /**
   * Muestra una notificación temporal en la UI.
   * @param {string} message - El mensaje a mostrar.
   * @param {string} type - El tipo de notificación ('success' o 'error').
   */
  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    const timer = setTimeout(() => {
      setNotification(null);
    }, 3000); // La notificación desaparece después de 3 segundos
    return () => clearTimeout(timer);
  }, []);

  const fetchInitialData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const userId = user?.id;
      if (!userId) {
        setError('No se pudo obtener la información del usuario. Por favor, inicia sesión.');
        setIsLoading(false);
        return;
      }

      const [mascotasRes, serviciosRes, veterinariosRes] = await Promise.all([
        authFetch(`/mascotas?id_propietario=${userId}`),
        authFetch('/servicios'),
        authFetch('/usuarios/veterinarios') // Asumiendo que este endpoint es accesible
      ]);

      if (mascotasRes.success) {
        setMascotas(mascotasRes.data);
      } else {
        setError(mascotasRes.message || 'Error al cargar tus mascotas.');
        setIsLoading(false);
        return;
      }

      if (serviciosRes.success) {
        setServicios(serviciosRes.data);
      } else {
        setError(serviciosRes.message || 'Error al cargar los servicios.');
        setIsLoading(false);
        return;
      }

      if (veterinariosRes.success) {
        setVeterinarios(veterinariosRes.data.filter(vet => vet.active));
      } else {
        setError(veterinariosRes.message || 'Error al cargar los veterinarios.');
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching initial data for CrearCita:", err);
      setError('Error de conexión al servidor al cargar los datos iniciales.');
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setNotification(null);

    if (!fecha || !hora || !selectedServicio || !selectedMascota || !user?.id) {
      showNotification('Por favor, completa todos los campos requeridos.', 'error');
      setIsSubmitting(false);
      return;
    }

    try {
      const fechaHora = new Date(`${fecha}T${hora}:00`); // Combina fecha y hora
      const formattedFecha = fechaHora.toISOString().slice(0, 19).replace('T', ' '); // Formato 'YYYY-MM-DD HH:MM:SS'

      const nuevaCita = {
        id_cliente: user.id,
        id_servicio: parseInt(selectedServicio),
        id_veterinario: selectedVeterinario ? parseInt(selectedVeterinario) : null,
        fecha: formattedFecha,
        servicios: notas, // Usar el campo 'notas' para 'servicios' adicionales en la cita
        estado: 'pendiente' // Siempre pendiente cuando el usuario la crea
      };

      const response = await authFetch('/citas', {
        method: 'POST',
        body: JSON.stringify(nuevaCita),
      });

      if (response.success) {
        showNotification('¡Cita agendada con éxito!', 'success');
        setTimeout(() => {
          navigate('/usuario/citas');
        }, 1500);
      } else {
        showNotification(response.message || 'Error al agendar la cita.', 'error');
      }
    } catch (err) {
      console.error("Error submitting appointment:", err);
      showNotification('Error de conexión al servidor al agendar la cita.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <FontAwesomeIcon icon={faSpinner} spin className="spinner-icon" />
        <p>Cargando datos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        <FontAwesomeIcon icon={faTimesCircle} className="error-icon" />
        <p>{error}</p>
        <button onClick={() => navigate(-1)} className="back-button">
          <FontAwesomeIcon icon={faArrowLeft} /> Volver
        </button>
      </div>
    );
  }

  return (
    <motion.div
      className="crear-cita-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="crear-cita-title">
        <FontAwesomeIcon icon={faCalendarPlus} className="title-icon" />
        Agendar Nueva Cita
      </h2>

      <AnimatePresence>
        {notification && (
          <motion.div
            className={`notification ${notification.type}`}
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
          >
            <FontAwesomeIcon icon={notification.type === 'success' ? faCheckCircle : faTimesCircle} />
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="crear-cita-form">
        <div className="form-group">
          <label htmlFor="fecha">Fecha:</label>
          <input
            type="date"
            id="fecha"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            required
            min={new Date().toISOString().split('T')[0]} // No permitir fechas pasadas
          />
        </div>
        <div className="form-group">
          <label htmlFor="hora">Hora:</label>
          <input
            type="time"
            id="hora"
            value={hora}
            onChange={(e) => setHora(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="servicio">Servicio:</label>
          <select
            id="servicio"
            value={selectedServicio}
            onChange={(e) => setSelectedServicio(e.target.value)}
            required
          >
            <option value="">Seleccionar servicio</option>
            {servicios.map(s => (
              <option key={s.id_servicio} value={s.id_servicio}>
                {s.nombre} (${s.precio})
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="mascota">Mascota:</label>
          <select
            id="mascota"
            value={selectedMascota}
            onChange={(e) => setSelectedMascota(e.target.value)}
            required
          >
            <option value="">Seleccionar mascota</option>
            {mascotas.length > 0 ? (
              mascotas.map(m => (
                <option key={m.id_mascota} value={m.id_mascota}>
                  {m.nombre} ({m.especie})
                </option>
              ))
            ) : (
              <option value="" disabled>No tienes mascotas registradas.</option>
            )}
          </select>
          {mascotas.length === 0 && (
            <p className="form-hint">
              <Link to="/usuario/mascotas/agregar">Agrega una mascota</Link> para agendar una cita.
            </p>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="veterinario">Veterinario (opcional):</label>
          <select
            id="veterinario"
            value={selectedVeterinario}
            onChange={(e) => setSelectedVeterinario(e.target.value)}
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
        <div className="form-group">
          <label htmlFor="notas">Notas Adicionales:</label>
          <textarea
            id="notas"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            rows="3"
            placeholder="Ej: Comportamiento, síntomas, etc."
          ></textarea>
        </div>
        <motion.button
          type="submit"
          className="crear-cita-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <FontAwesomeIcon icon={faSpinner} spin />
              <span>Agendando...</span>
            </>
          ) : (
            'Agendar Cita'
          )}
        </motion.button>
        <Link to="/usuario/citas" className="crear-cita-cancel">
          Cancelar
        </Link>
      </form>
    </motion.div>
  );
};

export default CrearCita;
