// src/Pages/InicioVeterinario/EditarHistorialMedico.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faSave, faSpinner, faTimesCircle, faCalendarAlt, faDiagnoses, faNotesMedical, faWeight, faThermometerHalf, faCalendarCheck } from '@fortawesome/free-solid-svg-icons';
import { authFetch } from './api'; // Asegúrate de que la ruta sea correcta
import styles from './Style/FormHistorialMedicoStyles.module.css'; // Reutilizar el mismo CSS

const EditarHistorialMedico = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // id_historial
  // Acceso defensivo al contexto del Outlet
  const { user, showNotification } = useOutletContext() || {}; 

  const [formData, setFormData] = useState({
    fecha_consulta: '',
    diagnostico: '',
    tratamiento: '',
    observaciones: '',
    peso_actual: '',
    temperatura: '',
    proxima_cita: ''
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [historialOriginal, setHistorialOriginal] = useState(null); // Para guardar el historial original

  // Fetch historial médico existente
  const fetchHistorial = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await authFetch(`/historial_medico/${id}`);
      if (response.success && response.data) {
        const data = response.data;
        setHistorialOriginal(data); // Guardar el original

        // Formatear fechas para los inputs de tipo datetime-local y date
        const formattedFechaConsulta = data.fecha_consulta ? new Date(data.fecha_consulta).toISOString().slice(0, 16) : '';
        const formattedProximaCita = data.proxima_cita ? new Date(data.proxima_cita).toISOString().slice(0, 10) : '';

        setFormData({
          fecha_consulta: formattedFechaConsulta,
          diagnostico: data.diagnostico || '',
          tratamiento: data.tratamiento || '',
          observaciones: data.observaciones || '',
          peso_actual: data.peso_actual !== null ? data.peso_actual.toString() : '',
          temperatura: data.temperatura !== null ? data.temperatura.toString() : '',
          proxima_cita: formattedProximaCita
        });
      } else {
        setError(response.message || 'Historial médico no encontrado.');
        if (showNotification) showNotification(response.message || 'Historial médico no encontrado.', 'error');
      }
    } catch (err) {
      console.error("Error fetching medical record:", err);
      setError(err.message || 'Error de conexión al servidor.');
      if (showNotification) showNotification(err.message || 'Error de conexión al servidor.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [id, showNotification]);

  useEffect(() => {
    fetchHistorial();
  }, [fetchHistorial]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const dataToSend = {
      ...formData,
      // Asegurarse de que los valores numéricos sean números o null
      peso_actual: formData.peso_actual === '' ? null : parseFloat(formData.peso_actual),
      temperatura: formData.temperatura === '' ? null : parseFloat(formData.temperatura),
      proxima_cita: formData.proxima_cita === '' ? null : formData.proxima_cita,
    };

    try {
      const response = await authFetch(`/historial_medico/${id}`, {
        method: 'PUT',
        body: JSON.stringify(dataToSend),
      });

      if (response.success) {
        if (showNotification) showNotification('Historial médico actualizado exitosamente.', 'success');
        navigate(`/veterinario/historiales/${id}`); // Volver al detalle
      } else {
        setError(response.message || 'Error al actualizar historial médico.');
        if (showNotification) showNotification(response.message || 'Error al actualizar historial médico.', 'error');
      }
    } catch (err) {
      console.error("Error updating medical record:", err);
      setError(err.message || 'Error de conexión al servidor.');
      if (showNotification) showNotification(err.message || 'Error de conexión al servidor.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <FontAwesomeIcon icon={faSpinner} spin size="3x" color="#FFD700" />
        <p>Cargando historial médico...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorMessage}>
        <FontAwesomeIcon icon={faTimesCircle} /> {error}
        <motion.button
          onClick={() => navigate(-1)}
          className={styles.backButton}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Volver
        </motion.button>
      </div>
    );
  }

  return (
    <motion.div
      className={styles.formContainer}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.3 }}
    >
      <div className={styles.header}>
        <motion.button
          onClick={() => navigate(-1)}
          className={styles.backButton}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Volver
        </motion.button>
        <h2>Editar Historial Médico</h2>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.infoBlock}>
          <p><strong>Mascota:</strong> {historialOriginal?.mascota_nombre} ({historialOriginal?.especie})</p>
          <p><strong>Propietario:</strong> {historialOriginal?.propietario_nombre}</p>
          <p><strong>Veterinario (Registro):</strong> {historialOriginal?.veterinario_nombre}</p>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="fecha_consulta"><FontAwesomeIcon icon={faCalendarAlt} /> Fecha de Consulta:</label>
          <input
            type="datetime-local"
            id="fecha_consulta"
            name="fecha_consulta"
            value={formData.fecha_consulta}
            onChange={handleChange}
            className={styles.inputField}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="diagnostico"><FontAwesomeIcon icon={faDiagnoses} /> Diagnóstico:</label>
          <textarea
            id="diagnostico"
            name="diagnostico"
            value={formData.diagnostico}
            onChange={handleChange}
            className={styles.textareaField}
            rows="3"
            required
            disabled={isSubmitting}
          ></textarea>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="tratamiento"><FontAwesomeIcon icon={faNotesMedical} /> Tratamiento:</label>
          <textarea
            id="tratamiento"
            name="tratamiento"
            value={formData.tratamiento}
            onChange={handleChange}
            className={styles.textareaField}
            rows="3"
            required
            disabled={isSubmitting}
          ></textarea>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="observaciones">Observaciones:</label>
          <textarea
            id="observaciones"
            name="observaciones"
            value={formData.observaciones}
            onChange={handleChange}
            className={styles.textareaField}
            rows="3"
            disabled={isSubmitting}
          ></textarea>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="peso_actual"><FontAwesomeIcon icon={faWeight} /> Peso Actual (kg):</label>
            <input
              type="number"
              id="peso_actual"
              name="peso_actual"
              value={formData.peso_actual}
              onChange={handleChange}
              className={styles.inputField}
              step="0.01"
              disabled={isSubmitting}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="temperatura"><FontAwesomeIcon icon={faThermometerHalf} /> Temperatura (°C):</label>
            <input
              type="number"
              id="temperatura"
              name="temperatura"
              value={formData.temperatura}
              onChange={handleChange}
              className={styles.inputField}
              step="0.1"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="proxima_cita"><FontAwesomeIcon icon={faCalendarCheck} /> Próxima Cita (Opcional):</label>
          <input
            type="date"
            id="proxima_cita"
            name="proxima_cita"
            value={formData.proxima_cita}
            onChange={handleChange}
            className={styles.inputField}
            disabled={isSubmitting}
          />
        </div>

        <motion.button
          type="submit"
          className={styles.submitButton}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <FontAwesomeIcon icon={faSpinner} spin /> Guardando...
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faSave} /> Guardar Cambios
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default EditarHistorialMedico;
