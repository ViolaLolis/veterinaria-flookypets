import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faSave, faSpinner, faPlus, faTimesCircle, faUser, faPaw, faCalendarAlt, faDiagnoses, faNotesMedical, faWeight, faThermometerHalf, faCalendarCheck } from '@fortawesome/free-solid-svg-icons';
import { authFetch } from './api'; // Asegúrate de que la ruta sea correcta
import styles from './Style/FormHistorialMedicoStyles.module.css'; // Crear este archivo CSS

const RegistrarHistorialMedico = () => {
  // Acceso defensivo al contexto del Outlet
  const { user, showNotification } = useOutletContext() || {}; 
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [selectedClienteId, setSelectedClienteId] = useState('');
  const [mascotas, setMascotas] = useState([]);
  const [selectedMascotaId, setSelectedMascotaId] = useState('');
  
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

  /**
   * @function fetchClientes
   * @description Fetches the list of 'usuario' (client) type users from the backend.
   * This function is crucial for populating the client dropdown.
   * It uses the '/usuarios' endpoint, which is accessible by both 'veterinario' and 'admin' roles.
   */
  const fetchClientes = useCallback(async () => {
    setIsLoading(true);
    setError('');
    console.log("Intentando cargar clientes...");
    try {
      const response = await authFetch('/usuarios'); 
      console.log("Respuesta completa de /usuarios:", response); // Log completo de la respuesta

      if (response.success && Array.isArray(response.data)) { // Asegurarse de que response.data es un array
        const filteredClients = response.data.filter(u => {
          console.log(`Usuario ID: ${u.id}, Rol: '${u.role}'`); // <-- ¡NUEVO LOG DE DEPURACIÓN!
          return u.role === 'usuario';
        });
        setClientes(filteredClients);
        console.log("Clientes cargados (filtrados por rol 'usuario'):", filteredClients);
      } else {
        setError(response.message || 'Error al cargar clientes o formato de datos inesperado.');
        if (showNotification) showNotification(response.message || 'Error al cargar clientes.', 'error');
        console.error("Respuesta inesperada del servidor para clientes:", response);
      }
    } catch (err) {
      console.error("Error fetching clients:", err);
      setError('Error de conexión al servidor al cargar clientes. Revisa la consola para más detalles.');
      if (showNotification) showNotification('Error de conexión al servidor al cargar clientes.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showNotification]);

  /**
   * @function fetchMascotas
   * @description Fetches the pets associated with a specific client ID.
   * This function is called when a client is selected from the dropdown.
   * It uses the '/mascotas?id_propietario=' endpoint.
   * @param {string} clienteId - The ID of the selected client.
   */
  const fetchMascotas = useCallback(async (clienteId) => {
    if (!clienteId) {
      setMascotas([]);
      setSelectedMascotaId('');
      return;
    }
    setIsLoading(true);
    setError('');
    console.log(`Intentando cargar mascotas para el cliente ID: ${clienteId}...`);
    try {
      const response = await authFetch(`/mascotas?id_propietario=${clienteId}`);
      console.log(`Respuesta completa de /mascotas?id_propietario=${clienteId}:`, response); // Log completo de la respuesta
      if (response.success && Array.isArray(response.data)) { // Asegurarse de que response.data es un array
        setMascotas(response.data);
        if (response.data.length > 0) {
          setSelectedMascotaId(response.data[0].id_mascota); // Seleccionar la primera mascota por defecto
          console.log("Mascotas cargadas:", response.data);
        } else {
          setSelectedMascotaId('');
          console.log("No se encontraron mascotas para este cliente.");
        }
      } else {
        setError(response.message || 'Error al cargar mascotas del cliente o formato de datos inesperado.');
        if (showNotification) showNotification(response.message || 'Error al cargar mascotas del cliente.', 'error');
        console.error("Respuesta inesperada del servidor para mascotas:", response);
      }
    } catch (err) {
      console.error("Error fetching pets:", err);
      setError('Error de conexión al servidor al cargar mascotas. Revisa la consola para más detalles.');
      if (showNotification) showNotification('Error de conexión al servidor al cargar mascotas.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showNotification]);

  // useEffect to fetch clients when the component mounts
  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  // useEffect to fetch pets whenever the selected client changes
  useEffect(() => {
    if (selectedClienteId) {
      fetchMascotas(selectedClienteId);
    }
  }, [selectedClienteId, fetchMascotas]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleClienteChange = (e) => {
    setSelectedClienteId(e.target.value);
  };

  const handleMascotaChange = (e) => {
    setSelectedMascotaId(e.target.value);
  };

  /**
   * @function handleSubmit
   * @description Handles the submission of the medical record form.
   * It sends the form data to the '/historial_medico' endpoint via a POST request.
   * It automatically assigns the logged-in veterinarian's ID.
   * @param {Event} e - The form submission event.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (!selectedMascotaId) {
      setError('Por favor, selecciona una mascota.');
      if (showNotification) showNotification('Por favor, selecciona una mascota.', 'error');
      setIsSubmitting(false);
      return;
    }

    // Asegurarse de que user y user.id estén definidos
    if (!user || !user.id) {
      setError('No se pudo obtener la información del veterinario logueado. Intenta recargar la página o volver a iniciar sesión.');
      if (showNotification) showNotification('Error de autenticación del veterinario.', 'error');
      setIsSubmitting(false);
      return;
    }

    const dataToSend = {
      ...formData,
      id_mascota: parseInt(selectedMascotaId),
      veterinario: user.id, // Asigna el ID del veterinario logueado
    };

    console.log("Datos a enviar para registrar historial:", dataToSend);

    try {
      const response = await authFetch('/historial_medico', {
        method: 'POST',
        body: JSON.stringify(dataToSend),
      });

      console.log("Respuesta del registro de historial:", response);

      if (response.success) {
        if (showNotification) showNotification('Historial médico registrado exitosamente.', 'success');
        navigate(`/veterinario/historiales/${response.data.id_historial}`); // Navegar al detalle del historial
      } else {
        setError(response.message || 'Error al registrar historial médico.');
        if (showNotification) showNotification(response.message || 'Error al registrar historial médico.', 'error');
      }
    } catch (err) {
      console.error("Error submitting medical record:", err);
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
        <p>Cargando datos...</p>
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
        <h2><FontAwesomeIcon icon={faPlus} /> Registrar Historial Médico</h2>
      </div>

      {error && (
        <motion.div
          className={styles.errorMessage}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <FontAwesomeIcon icon={faTimesCircle} /> {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="cliente"><FontAwesomeIcon icon={faUser} /> Cliente:</label>
          <select
            id="cliente"
            name="cliente"
            value={selectedClienteId}
            onChange={handleClienteChange}
            className={styles.selectInput}
            required
            disabled={isSubmitting}
          >
            <option value="">Selecciona un cliente</option>
            {clientes.map(cliente => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nombre} {cliente.apellido} ({cliente.email})
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="mascota"><FontAwesomeIcon icon={faPaw} /> Mascota:</label>
          <select
            id="mascota"
            name="mascota"
            value={selectedMascotaId}
            onChange={handleMascotaChange}
            className={styles.selectInput}
            required
            disabled={isSubmitting || !selectedClienteId}
          >
            <option value="">Selecciona una mascota</option>
            {mascotas.map(mascota => (
              <option key={mascota.id_mascota} value={mascota.id_mascota}>
                {mascota.nombre} ({mascota.especie})
              </option>
            ))}
          </select>
          {selectedClienteId && mascotas.length === 0 && (
            <p className={styles.infoMessage}>Este cliente no tiene mascotas registradas.</p>
          )}
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
          disabled={isSubmitting || !selectedMascotaId}
        >
          {isSubmitting ? (
            <>
              <FontAwesomeIcon icon={faSpinner} spin /> Registrando...
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faSave} /> Registrar Historial
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default RegistrarHistorialMedico;
