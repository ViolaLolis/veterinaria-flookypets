import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaSpinner, FaInfoCircle, FaCalendarAlt, FaUserMd,
  FaClipboardList, FaMoneyBillWave, FaTimesCircle, FaRegCheckCircle,
  FaEdit
} from 'react-icons/fa';
import styles from './Styles/DetalleCita.css'; // Asegúrate de que el CSS sea un módulo
import { authFetch } from '../../utils/api'; // Importar la función authFetch
import { validateField } from '../../utils/validation'; // Importar la función de validación

const DetalleCita = () => {
  const { citaId } = useParams();
  const navigate = useNavigate();
  const { user, showNotification } = useOutletContext(); // Obtener user y showNotification del contexto

  const [cita, setCita] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isManaging, setIsManaging] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [rescheduleErrors, setRescheduleErrors] = useState({}); // Estado para errores de reagendamiento

  useEffect(() => {
    const fetchCitaDetails = async () => {
      setIsLoading(true);
      if (!user?.id) {
        showNotification('No se pudo cargar la información del usuario. Por favor, inicia sesión.', 'error');
        setIsLoading(false);
        return;
      }
      try {
        // La ruta de la API debería ser /citas/:id
        const response = await authFetch(`/citas/${citaId}`);
        if (response.success) {
          const fetchedCita = response.data;
          setCita(fetchedCita);
          // Pre-llenar fecha y hora para reagendar si la cita no está completada/cancelada
          if (fetchedCita.estado !== 'completa' && fetchedCita.estado !== 'cancelada') {
            const datePart = fetchedCita.fecha.split(' ')[0];
            const timePart = fetchedCita.fecha.split(' ')[1].substring(0, 5);
            setNewDate(datePart);
            setNewTime(timePart);
          }
        } else {
          showNotification(response.message || 'Error al cargar los detalles de la cita.', 'error');
          setCita(null); // Asegurarse de que la cita sea nula si falla la carga
        }
      } catch (err) {
        console.error("Error fetching cita details:", err);
        showNotification('Error de conexión al servidor.', 'error');
        setCita(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCitaDetails();
  }, [citaId, user, showNotification]);

  const updateCitaStatus = async (newStatus) => {
    if (!cita || isManaging) return;

    setIsManaging(true);
    try {
      const response = await authFetch(`/citas/${cita.id_cita}`, {
        method: 'PUT',
        body: { estado: newStatus }
      });

      if (response.success) {
        setCita(prev => ({ ...prev, estado: newStatus }));
        showNotification(`Cita ${newStatus} correctamente.`, 'success');
      } else {
        showNotification(response.message || `Error al actualizar el estado de la cita a ${newStatus}.`, 'error');
      }
    } catch (err) {
      console.error(`Error updating cita status to ${newStatus}:`, err);
      showNotification('Error de conexión al servidor.', 'error');
    } finally {
      setIsManaging(false);
    }
  };

  const handleCancel = () => {
    updateCitaStatus('cancelada');
  };

  const handleComplete = () => {
    updateCitaStatus('completa');
  };

  const handleReschedule = async () => {
    // Validaciones de frontend para la nueva fecha y hora
    const dateTimeString = `${newDate} ${newTime}`;
    const dateError = validateField('fecha_cita', dateTimeString);

    if (dateError) {
      setRescheduleErrors({ newDate: dateError });
      showNotification(dateError, 'error');
      return;
    }
    setRescheduleErrors({}); // Limpiar errores si la validación pasa

    setIsManaging(true);
    try {
      const newFecha = `${newDate} ${newTime}:00`; // Formato DATETIME para MySQL
      const response = await authFetch(`/citas/${cita.id_cita}`, {
        method: 'PUT',
        body: { fecha: newFecha, estado: 'pendiente' } // Reagendar la cita como pendiente
      });

      if (response.success) {
        setCita(prev => ({ ...prev, fecha: newFecha, estado: 'pendiente' }));
        showNotification('Cita reagendada con éxito.', 'success');
        setShowRescheduleModal(false);
      } else {
        showNotification(response.message || 'Error al reagendar la cita.', 'error');
      }
    } catch (err) {
      console.error("Error rescheduling appointment:", err);
      showNotification('Error de conexión al servidor al reagendar la cita.', 'error');
    } finally {
      setIsManaging(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <FaSpinner className={styles.spinnerIcon} />
        <p>Cargando cita...</p>
      </div>
    );
  }

  if (!cita) {
    return (
      <div className={styles.noDataMessage}>
        <FaInfoCircle className={styles.infoIcon} />
        <p>No se encontró la cita o no tienes permisos para verla.</p>
        <button onClick={() => navigate(-1)} className={styles.backButton}>Volver</button>
      </div>
    );
  }

  // Lógica de permisos basada en el rol y el ID del usuario
  const isClient = user?.id === cita.id_cliente;
  const isVet = user?.id === cita.id_veterinario && user?.role === 'veterinario';
  const isAdmin = user?.role === 'admin';

  const canCancel = (isClient || isVet || isAdmin) && cita.estado !== 'cancelada' && cita.estado !== 'completa';
  const canComplete = (isVet || isAdmin) && cita.estado === 'aceptada';
  const canReschedule = isClient && cita.estado !== 'cancelada' && cita.estado !== 'completa';

  return (
    <div className={styles.detalleCitaContainer}>
      <h2>Detalle de la Cita</h2>

      <div className={styles.citaInfoCard}>
        <div><FaCalendarAlt /> <strong>Fecha:</strong> {new Date(cita.fecha).toLocaleString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
        <div><FaClipboardList /> <strong>Servicio:</strong> {cita.servicio_nombre}</div>
        <div><FaMoneyBillWave /> <strong>Precio:</strong> ${typeof cita.precio === 'number' ? cita.precio.toLocaleString('es-CO') : cita.precio}</div>
        <div><FaInfoCircle /> <strong>Estado:</strong> {cita.estado}</div>
        <div><FaUserMd /> <strong>Veterinario:</strong> {cita.veterinario_nombre || 'Sin asignar'}</div>
        <div><FaUserMd /> <strong>Cliente:</strong> {cita.cliente_nombre || 'Desconocido'}</div>
        {cita.mascota_nombre && <div><FaUserMd /> <strong>Mascota:</strong> {cita.mascota_nombre} ({cita.mascota_especie})</div>}
        {cita.servicios && <div><FaClipboardList /> <strong>Detalles:</strong> {cita.servicios}</div>}
      </div>

      <div className={styles.citaActions}>
        {canReschedule && (
          <motion.button onClick={() => setShowRescheduleModal(true)} disabled={isManaging}>
            <FaEdit /> Reagendar
          </motion.button>
        )}
        {canCancel && (
          <motion.button onClick={handleCancel} disabled={isManaging}>
            {isManaging ? <FaSpinner className={styles.buttonSpinner} /> : <FaTimesCircle />} Cancelar
          </motion.button>
        )}
        {canComplete && (
          <motion.button onClick={handleComplete} disabled={isManaging}>
            {isManaging ? <FaSpinner className={styles.buttonSpinner} /> : <FaRegCheckCircle />} Completar
          </motion.button>
        )}
        <motion.button onClick={() => navigate(-1)} disabled={isManaging}>Volver</motion.button>
      </div>

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
              onClick={e => e.stopPropagation()}
            >
              <h3>Reagendar Cita</h3>
              <input
                type="date"
                value={newDate}
                onChange={e => { setNewDate(e.target.value); setRescheduleErrors(prev => ({ ...prev, newDate: null })); }}
                min={new Date().toISOString().split('T')[0]}
              />
              {rescheduleErrors.newDate && <p className={styles.errorText}>{rescheduleErrors.newDate}</p>}
              <input
                type="time"
                value={newTime}
                onChange={e => { setNewTime(e.target.value); setRescheduleErrors(prev => ({ ...prev, newDate: null })); }}
              />
              <motion.button onClick={handleReschedule} disabled={isManaging} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                {isManaging ? <FaSpinner className={styles.buttonSpinner} /> : 'Guardar'}
              </motion.button>
              <motion.button onClick={() => setShowRescheduleModal(false)} disabled={isManaging} className={styles.cancelButton} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Cancelar</motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DetalleCita;
