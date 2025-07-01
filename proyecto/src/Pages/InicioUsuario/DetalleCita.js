import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion'; // Importar AnimatePresence
import {
  FaSpinner, FaInfoCircle, FaCalendarAlt, FaUserMd,
  FaClipboardList, FaMoneyBillWave, FaTimesCircle, FaRegCheckCircle,
  FaEdit
} from 'react-icons/fa';
import { authFetch } from './api'; // Asegúrate de que la ruta sea correcta
import styles from './Styles/DetalleCita.css'; // Asegúrate de que este CSS exista

const DetalleCita = ({ user }) => {
  const { citaId } = useParams();
  const navigate = useNavigate();
  const [cita, setCita] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isManagingAppointment, setIsManagingAppointment] = useState(false); // Para spinners de acciones
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [newRescheduleDate, setNewRescheduleDate] = useState('');
  const [newRescheduleTime, setNewRescheduleTime] = useState('');
  const [notification, setNotification] = useState(null); // Para notificaciones temporales

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


  const fetchCitaDetail = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await authFetch(`/citas/${citaId}`);
      if (response.success) {
        setCita(response.data);
        // Inicializar la fecha y hora para reagendar si la cita no está completada/cancelada
        if (response.data && response.data.fecha && response.data.estado !== 'completa' && response.data.estado !== 'cancelada') {
          const [datePart, timePart] = response.data.fecha.split(' ');
          setNewRescheduleDate(datePart);
          setNewRescheduleTime(timePart.substring(0, 5)); // HH:MM
        }
      } else {
        setError(response.message || 'Error al cargar el detalle de la cita.');
      }
    } catch (err) {
      console.error("Error fetching cita detail:", err);
      setError('Error de conexión al servidor.');
    } finally {
      setIsLoading(false);
    }
  }, [citaId]);

  useEffect(() => {
    fetchCitaDetail();
  }, [fetchCitaDetail]);

  const handleCancelAppointment = async () => {
    if (!window.confirm('¿Estás seguro de que deseas cancelar esta cita?')) {
      return;
    }
    setIsManagingAppointment(true);
    setError('');
    try {
      const response = await authFetch(`/citas/${citaId}`, {
        method: 'PUT',
        body: JSON.stringify({ estado: 'cancelada' }),
      });
      if (response.success) {
        showNotification('Cita cancelada correctamente.', 'success');
        fetchCitaDetail(); // Recargar la cita para actualizar el estado
      } else {
        showNotification(response.message || 'Error al cancelar la cita.', 'error');
      }
    } catch (err) {
      console.error("Error canceling appointment:", err);
      showNotification('Error de conexión al servidor al cancelar la cita.', 'error');
    } finally {
      setIsManagingAppointment(false);
    }
  };

  const handleCompleteAppointment = async () => {
    if (!window.confirm('¿Estás seguro de que deseas marcar esta cita como completada?')) {
      return;
    }
    setIsManagingAppointment(true);
    setError('');
    try {
      const response = await authFetch(`/citas/${citaId}`, {
        method: 'PUT',
        body: JSON.stringify({ estado: 'completa' }),
      });
      if (response.success) {
        showNotification('Cita marcada como completada.', 'success');
        fetchCitaDetail(); // Recargar la cita para actualizar el estado
      } else {
        showNotification(response.message || 'Error al completar la cita.', 'error');
      }
    } catch (err) {
      console.error("Error completing appointment:", err);
      showNotification('Error de conexión al servidor al completar la cita.', 'error');
    } finally {
      setIsManagingAppointment(false);
    }
  };

  const handleRescheduleRequest = () => {
    setShowRescheduleModal(true);
  };

  const rescheduleAppointment = async () => {
    if (!newRescheduleDate || !newRescheduleTime) {
      showNotification('Por favor, selecciona una nueva fecha y hora.', 'error');
      return;
    }
    setIsManagingAppointment(true);
    setError('');
    try {
      const newDateTime = `${newRescheduleDate} ${newRescheduleTime}:00`;
      const response = await authFetch(`/citas/${citaId}`, {
        method: 'PUT',
        body: JSON.stringify({ fecha: newDateTime, estado: 'pendiente' }), // Vuelve a pendiente al reagendar
      });
      if (response.success) {
        showNotification('Solicitud de reagendamiento enviada. La cita está ahora en estado pendiente.', 'success');
        setShowRescheduleModal(false);
        fetchCitaDetail(); // Recargar la cita para actualizar el estado
      } else {
        showNotification(response.message || 'Error al reagendar la cita.', 'error');
      }
    } catch (err) {
      console.error("Error rescheduling appointment:", err);
      showNotification('Error de conexión al servidor al reagendar la cita.', 'error');
    } finally {
      setIsManagingAppointment(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <FaSpinner className={styles.spinnerIcon} />
        <p>Cargando detalles de la cita...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorMessage}>
        <FaInfoCircle className={styles.infoIcon} />
        <p>{error}</p>
        <button onClick={() => navigate(-1)} className={styles.backButton}>Volver</button>
      </div>
    );
  }

  if (!cita) {
    return (
      <div className={styles.noDataMessage}>
        <FaInfoCircle className={styles.infoIcon} />
        <p>No se encontró la cita.</p>
        <button onClick={() => navigate(-1)} className={styles.backButton}>Volver</button>
      </div>
    );
  }

  // Determinar si el usuario logueado es el cliente de la cita
  const isClientOfAppointment = user && user.id === cita.id_cliente;
  // Determinar si el usuario logueado es el veterinario de la cita
  const isVetOfAppointment = user && user.id === cita.id_veterinario;
  // Determinar si es admin
  const isAdminUser = user && user.role === 'admin';

  // Permisos para acciones
  const canCancel = (isClientOfAppointment || isVetOfAppointment || isAdminUser) && cita.estado !== 'cancelada' && cita.estado !== 'completa';
  const canReschedule = isClientOfAppointment && cita.estado !== 'cancelada' && cita.estado !== 'completa';
  const canComplete = (isVetOfAppointment || isAdminUser) && cita.estado === 'aceptada';
  const canEdit = isAdminUser; // Solo el admin puede editar todos los campos de la cita

  return (
    <div className={styles.detalleCitaContainer}>
      <h2 className={styles.detalleCitaTitle}>Detalle de la Cita</h2>

      {notification && (
        <motion.div
          className={`${styles.notification} ${styles[notification.type]}`}
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
        >
          {notification.message}
        </motion.div>
      )}

      <div className={styles.citaInfoCard}>
        <div className={styles.infoItem}>
          <FaCalendarAlt className={styles.infoIcon} />
          <span><strong>Fecha y Hora:</strong> {cita.fecha}</span>
        </div>
        <div className={styles.infoItem}>
          <FaClipboardList className={styles.infoIcon} />
          <span><strong>Servicio:</strong> {cita.servicio_nombre}</span>
        </div>
        <div className={styles.infoItem}>
          <FaMoneyBillWave className={styles.infoIcon} />
          <span><strong>Precio:</strong> ${cita.precio}</span>
        </div>
        <div className={styles.infoItem}>
          <FaInfoCircle className={styles.infoIcon} />
          <span>
            <strong>Estado:</strong>
            <span className={`${styles.statusBadge} ${styles[cita.estado]}`}>
              {cita.estado === 'pendiente' && 'Pendiente'}
              {cita.estado === 'aceptada' && 'Aceptada'}
              {cita.estado === 'rechazada' && 'Rechazada'}
              {cita.estado === 'completa' && 'Completada'}
              {cita.estado === 'cancelada' && 'Cancelada'}
            </span>
          </span>
        </div>
        <div className={styles.infoItem}>
          <FaUserMd className={styles.infoIcon} />
          <span><strong>Veterinario:</strong> {cita.veterinario_nombre || 'No Asignado'}</span>
        </div>
        <div className={styles.infoItem}>
          <FaUserMd className={styles.infoIcon} />
          <span><strong>Cliente:</strong> {cita.cliente_nombre}</span>
        </div>
        {cita.servicios && ( // Campo 'servicios' en la DB es un VARCHAR para detalles adicionales
          <div className={styles.infoItem}>
            <FaClipboardList className={styles.infoIcon} />
            <span><strong>Detalles Adicionales:</strong> {cita.servicios}</span>
          </div>
        )}
      </div>

      <div className={styles.citaActions}>
        {canReschedule && (
          <motion.button
            className={styles.actionButton}
            onClick={handleRescheduleRequest}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isManagingAppointment}
          >
            <FaEdit /> Reagendar Cita
          </motion.button>
        )}
        {canCancel && (
          <motion.button
            className={`${styles.actionButton} ${styles.cancelButton}`}
            onClick={handleCancelAppointment}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isManagingAppointment}
          >
            {isManagingAppointment ? <FaSpinner className={styles.spinnerIcon} /> : <FaTimesCircle />}
            {isManagingAppointment ? 'Cancelando...' : 'Cancelar Cita'}
          </motion.button>
        )}
        {canComplete && (
          <motion.button
            className={`${styles.actionButton} ${styles.completeButton}`}
            onClick={handleCompleteAppointment}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isManagingAppointment}
          >
            {isManagingAppointment ? <FaSpinner className={styles.spinnerIcon} /> : <FaRegCheckCircle />}
            {isManagingAppointment ? 'Completando...' : 'Marcar como Completada'}
          </motion.button>
        )}
        {canEdit && ( // Botón de edición para el admin
          <motion.button
            className={`${styles.actionButton} ${styles.editButton}`}
            onClick={() => navigate(`/admin/citas/editar/${citaId}`)} // Redirige a una página de edición de admin
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaEdit /> Editar Cita (Admin)
          </motion.button>
        )}
        <motion.button
          className={styles.backButton}
          onClick={() => navigate(-1)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Volver
        </motion.button>
      </div>

      {/* Modal de Reagendamiento */}
      <AnimatePresence>
        {showRescheduleModal && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowRescheduleModal(false)}
          >
            <motion.div
              className={styles.modalContent}
              initial={{ y: "-100vh", opacity: 0 }}
              animate={{ y: "0", opacity: 1 }}
              exit={{ y: "100vh", opacity: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>Reagendar Cita</h3>
              <p>Selecciona una nueva fecha y hora para tu cita.</p>
              <input
                type="date"
                className={styles.modalInput}
                value={newRescheduleDate}
                onChange={(e) => setNewRescheduleDate(e.target.value)}
                disabled={isManagingAppointment}
                min={new Date().toISOString().split('T')[0]} // No permitir fechas pasadas
              />
              <input
                type="time"
                className={styles.modalInput}
                value={newRescheduleTime}
                onChange={(e) => setNewRescheduleTime(e.target.value)}
                disabled={isManagingAppointment}
              />
              <div className={styles.modalActions}>
                <motion.button
                  className={styles.primaryButton}
                  onClick={rescheduleAppointment}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isManagingAppointment}
                >
                  {isManagingAppointment ? <><FaSpinner className={styles.spinnerIcon} /> Enviando...</> : 'Enviar Solicitud'}
                </motion.button>
                <motion.button
                  className={styles.secondaryButton}
                  onClick={() => setShowRescheduleModal(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isManagingAppointment}
                >
                  Cancelar
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DetalleCita;