import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSpinner, faCheckCircle, faTimesCircle, faArrowLeft
} from '@fortawesome/free-solid-svg-icons';
import { authFetch } from './api'; // Importa authFetch
import './Styles/EditarCita.css'; // Importa el CSS

const EditarCita = ({ user }) => { // Recibe el objeto 'user' como prop
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fecha: '',
    hora: '',
    id_servicio: '',
    id_mascota: '',
    id_veterinario: '',
    servicios: '', // Campo para notas adicionales en la cita
    estado: ''
  });
  const [mascotas, setMascotas] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [veterinarios, setVeterinarios] = useState([]);
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

  const fetchCitaDetails = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const citaRes = await authFetch(`/citas/${id}`);
      if (citaRes.success) {
        const citaData = citaRes.data;
        const [datePart, timePart] = citaData.fecha.split(' ');
        setFormData({
          fecha: datePart,
          hora: timePart.substring(0, 5), // HH:MM
          id_servicio: citaData.id_servicio,
          id_mascota: citaData.id_mascota,
          id_veterinario: citaData.id_veterinario || '', // Puede ser null
          servicios: citaData.servicios || '', // Notas adicionales
          estado: citaData.estado || ''
        });

        // Cargar datos para los dropdowns
        const userId = user?.id;
        if (!userId) {
          setError('No se pudo obtener la información del usuario.');
          setIsLoading(false);
          return;
        }

        const [mascotasRes, serviciosRes, veterinariosRes] = await Promise.all([
          authFetch(`/mascotas?id_propietario=${userId}`),
          authFetch('/servicios'),
          authFetch('/usuarios/veterinarios')
        ]);

        if (mascotasRes.success) setMascotas(mascotasRes.data);
        if (serviciosRes.success) setServicios(serviciosRes.data);
        if (veterinariosRes.success) setVeterinarios(veterinariosRes.data.filter(vet => vet.active));

      } else {
        setError(citaRes.message || 'Error al cargar los detalles de la cita.');
      }
    } catch (err) {
      console.error("Error fetching cita details:", err);
      setError('Error de conexión al servidor.');
    } finally {
      setIsLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    fetchCitaDetails();
  }, [fetchCitaDetails]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setNotification(null);

    if (!formData.fecha || !formData.hora || !formData.id_servicio || !formData.id_mascota) {
      showNotification('Por favor, completa todos los campos requeridos.', 'error');
      setIsSubmitting(false);
      return;
    }

    try {
      const fechaHora = new Date(`${formData.fecha}T${formData.hora}:00`);
      const formattedFecha = fechaHora.toISOString().slice(0, 19).replace('T', ' ');

      const updatedCita = {
        id_servicio: parseInt(formData.id_servicio),
        id_mascota: parseInt(formData.id_mascota),
        id_veterinario: formData.id_veterinario ? parseInt(formData.id_veterinario) : null,
        fecha: formattedFecha,
        servicios: formData.servicios, // Notas adicionales
        estado: formData.estado
      };

      const response = await authFetch(`/citas/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedCita),
      });

      if (response.success) {
        showNotification('¡Cita actualizada con éxito!', 'success');
        setTimeout(() => {
          navigate(`/usuario/citas/${id}`); // Redirigir al detalle de la cita
        }, 1500);
      } else {
        showNotification(response.message || 'Error al actualizar la cita.', 'error');
      }
    } catch (err) {
      console.error("Error updating appointment:", err);
      showNotification('Error de conexión al servidor al actualizar la cita.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <FontAwesomeIcon icon={faSpinner} spin className="spinner-icon" />
        <p>Cargando datos de la cita...</p>
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
      className="editar-cita-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="editar-cita-title">Editar Cita</h2>

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

      <form onSubmit={handleSubmit} className="editar-cita-form">
        <div className="form-group">
          <label htmlFor="fecha">Fecha:</label>
          <input
            type="date"
            id="fecha"
            value={formData.fecha}
            onChange={handleChange}
            required
            min={new Date().toISOString().split('T')[0]} // No permitir fechas pasadas
          />
        </div>
        <div className="form-group">
          <label htmlFor="hora">Hora:</label>
          <input
            type="time"
            id="hora"
            value={formData.hora}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="id_servicio">Servicio:</label>
          <select
            id="id_servicio"
            value={formData.id_servicio}
            onChange={handleChange}
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
          <label htmlFor="id_mascota">Mascota:</label>
          <select
            id="id_mascota"
            value={formData.id_mascota}
            onChange={handleChange}
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
        </div>
        <div className="form-group">
          <label htmlFor="id_veterinario">Veterinario (opcional):</label>
          <select
            id="id_veterinario"
            value={formData.id_veterinario}
            onChange={handleChange}
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
          <label htmlFor="servicios">Notas Adicionales:</label>
          <textarea
            id="servicios" // Coincide con el campo 'servicios' en la DB para notas
            value={formData.servicios}
            onChange={handleChange}
            rows="3"
            placeholder="Notas sobre la cita, síntomas, etc."
          ></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="estado">Estado de la Cita:</label>
          <select
            id="estado"
            value={formData.estado}
            onChange={handleChange}
            required
          >
            <option value="pendiente">Pendiente</option>
            <option value="aceptada">Aceptada</option>
            <option value="rechazada">Rechazada</option>
            <option value="completa">Completada</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>
        <motion.button
          type="submit"
          className="editar-cita-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <FontAwesomeIcon icon={faSpinner} spin />
              <span>Guardando...</span>
            </>
          ) : (
            'Guardar Cambios'
          )}
        </motion.button>
        <Link to={`/usuario/citas/${id}`} className="editar-cita-cancel">Cancelar</Link>
      </form>
    </motion.div>
  );
};

export default EditarCita;