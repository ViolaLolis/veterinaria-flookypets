import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Styles/CitasUsuario.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarAlt, faPlusCircle, faClock, faMapMarkerAlt, faUserCog, faPaw, faShoppingCart, faInfoCircle, faTimesCircle, faCheckCircle
} from '@fortawesome/free-solid-svg-icons'; // Estos son de Font Awesome
import { FaSpinner } from 'react-icons/fa'; // FaSpinner de react-icons/fa

import { authFetch } from './api';

const CitasUsuario = () => {
  const { user, showNotification } = useOutletContext();
  const navigate = useNavigate();
  const [userAppointments, setUserAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isManagingAppointment, setIsManagingAppointment] = useState(false);

  const [showConfirmAcceptModal, setShowConfirmAcceptModal] = useState(false);
  const [showConfirmRejectModal, setShowConfirmRejectModal] = useState(false);
  const [showConfirmCancelModal, setShowConfirmCancelModal] = useState(false);
  const [appointmentToConfirm, setAppointmentToConfirm] = useState(null);


  const fetchUserAppointments = useCallback(async () => {
    if (!user || !user.id) {
      setError('No se pudo obtener la información del usuario. Por favor, inicia sesión.');
      setIsLoading(false);
      return;
    }
    try {
      const response = await authFetch(`/citas?id_cliente=${user.id}`);
      if (response.success) {
        const sortedAppointments = response.data.sort((a, b) => {
          const dateA = new Date(a.fecha);
          const dateB = new Date(b.fecha);
          const now = new Date();

          const isFutureA = dateA > now;
          const isFutureB = dateB > now;

          if (isFutureA && !isFutureB) return -1;
          if (!isFutureA && isFutureB) return 1;

          return dateA - dateB;
        });
        setUserAppointments(sortedAppointments);
      } else {
        setError(response.message || 'Error al obtener citas.');
      }
    } catch (err) {
      console.error("Error en authFetch para /citas:", err);
      setError('Error de conexión al servidor.');
    } finally {
      setIsLoading(false);
    }
  }, [user, authFetch]);

  useEffect(() => {
    fetchUserAppointments();
  }, [fetchUserAppointments]);

  const openConfirmAcceptModal = (appointment) => {
    setAppointmentToConfirm(appointment);
    setShowConfirmAcceptModal(true);
  };

  const openConfirmRejectModal = (appointment) => {
    setAppointmentToConfirm(appointment);
    setShowConfirmRejectModal(true);
  };

  const openConfirmCancelModal = (appointment) => {
    setAppointmentToConfirm(appointment);
    setShowConfirmCancelModal(true);
  };

  const handleAcceptAppointment = async () => {
    setIsManagingAppointment(true);
    try {
      const response = await authFetch(`/citas/${appointmentToConfirm.id_cita}`, {
        method: 'PUT',
        body: JSON.stringify({ estado: 'aceptada' }),
      });
      if (response.success) {
        showNotification('Cita aceptada correctamente.', 'success');
        fetchUserAppointments();
      } else {
        showNotification(response.message || 'Error al aceptar la cita.', 'error');
      }
    } catch (err) {
      console.error("Error accepting appointment:", err);
      showNotification('Error de conexión al servidor al aceptar la cita.', 'error');
    } finally {
      setIsManagingAppointment(false);
      setShowConfirmAcceptModal(false);
      setAppointmentToConfirm(null);
    }
  };

  const handleRejectAppointment = async () => {
    setIsManagingAppointment(true);
    try {
      const response = await authFetch(`/citas/${appointmentToConfirm.id_cita}`, {
        method: 'PUT',
        body: JSON.stringify({ estado: 'rechazada' }),
      });
      if (response.success) {
        showNotification('Cita rechazada correctamente.', 'success');
        fetchUserAppointments();
      } else {
        showNotification(response.message || 'Error al rechazar la cita.', 'error');
      }
    } catch (err) {
      console.error("Error rejecting appointment:", err);
      showNotification('Error de conexión al servidor al rechazar la cita.', 'error');
    } finally {
      setIsManagingAppointment(false);
      setShowConfirmRejectModal(false);
      setAppointmentToConfirm(null);
    }
  };

  const handleCancelAppointment = async () => {
    setIsManagingAppointment(true);
    try {
      const response = await authFetch(`/citas/${appointmentToConfirm.id_cita}`, {
        method: 'PUT',
        body: JSON.stringify({ estado: 'cancelada' }),
      });
      if (response.success) {
        showNotification('Cita cancelada correctamente.', 'success');
        fetchUserAppointments();
      } else {
        showNotification(response.message || 'Error al cancelar la cita.', 'error');
      }
    } catch (err) {
      console.error("Error canceling appointment:", err);
      showNotification('Error de conexión al servidor al cancelar la cita.', 'error');
    } finally {
      setIsManagingAppointment(false);
      setShowConfirmCancelModal(false);
      setAppointmentToConfirm(null);
    }
  };


  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <FaSpinner className={styles.spinnerIcon} /> {/* FaSpinner de react-icons/fa */}
        <p>Cargando tus citas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorMessage}>
        <FontAwesomeIcon icon={faInfoCircle} className={styles.errorIcon} /> {/* faInfoCircle de Font Awesome */}
        <p>{error}</p>
      </div>
    );
  }

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className={styles.header}>
        <FontAwesomeIcon icon={faCalendarAlt} className={styles.icon} />
        <h3>Mis Citas</h3>
      </div>

      <div className={styles.actionsTop}>
        <Link to="/usuario/citas/agendar" className={styles.agendarCitaButton}>
          <FontAwesomeIcon icon={faPlusCircle} /> Agendar Nueva Cita
        </Link>
      </div>

      {userAppointments.length > 0 ? (
        <ul className={styles.listaCitas}>
          {userAppointments.map(cita => (
            <motion.li
              key={cita.id_cita}
              className={styles.citaItem}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.02, boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)' }}
            >
              <div className={styles.citaInfo}>
                <div className={styles.citaFecha}>
                  <FontAwesomeIcon icon={faCalendarAlt} className={styles.citaIcon} />
                  <span>{cita.fecha.split(' ')[0]}</span>
                </div>
                <div className={styles.citaHora}>
                  <FontAwesomeIcon icon={faClock} className={styles.citaIcon} />
                  <span>{cita.fecha.split(' ')[1].substring(0, 5)}</span>
                </div>
                <div className={styles.citaServicio}>
                  <FontAwesomeIcon icon={faShoppingCart} className={styles.citaIcon} />
                  <span>{cita.servicio_nombre}</span>
                </div>
                <div className={styles.citaMascota}>
                  <FontAwesomeIcon icon={faPaw} className={styles.citaIcon} />
                  <span>{cita.mascota_nombre} ({cita.mascota_especie})</span>
                </div>
                <div className={styles.citaVeterinario}>
                  <FontAwesomeIcon icon={faUserCog} className={styles.citaIcon} />
                  <span>{cita.veterinario_nombre || 'No asignado'}</span>
                </div>
                <div className={`${styles.statusBadge} ${styles[cita.estado]}`}>
                  {cita.estado}
                </div>
              </div>
              <div className={styles.citaActions}>
                <motion.button
                  className={styles.accionBtn}
                  onClick={() => navigate(`/usuario/citas/${cita.id_cita}`)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Ver Detalles
                </motion.button>

                {(cita.estado === 'pendiente' || cita.estado === 'aceptada') && (
                  <>
                    {cita.estado === 'pendiente' && (
                      <>
                        <motion.button
                          className={styles.accionBtnPrimary}
                          onClick={() => openConfirmAcceptModal(cita)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          disabled={isManagingAppointment}
                        >
                          {isManagingAppointment ? <FaSpinner className={styles.spinnerIconSmall} /> : <FontAwesomeIcon icon={faCheckCircle} />} Aceptar
                        </motion.button>
                        <motion.button
                          className={styles.accionBtnDanger}
                          onClick={() => openConfirmRejectModal(cita)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          disabled={isManagingAppointment}
                        >
                          {isManagingAppointment ? <FaSpinner className={styles.spinnerIconSmall} /> : <FontAwesomeIcon icon={faTimesCircle} />} Rechazar
                        </motion.button>
                      </>
                    )}
                    <motion.button
                      className={styles.accionBtn}
                      onClick={() => openConfirmCancelModal(cita)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={isManagingAppointment}
                    >
                      {isManagingAppointment ? <FaSpinner className={styles.spinnerIconSmall} /> : null} Cancelar
                    </motion.button>
                  </>
                )}
              </div>
            </motion.li>
          ))}
        </ul>
      ) : (
        <div className={styles.noCitas}>
          <FontAwesomeIcon icon={faCalendarAlt} className={styles.noCitasIcon} />
          <p>No tienes citas programadas. ¡Programa una ahora!</p>
        </div>
      )}

      {/* Modales de confirmación */}
      <AnimatePresence>
        {showConfirmAcceptModal && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowConfirmAcceptModal(false)}
          >
            <motion.div
              className={styles.modalContent}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>Confirmar Cita</h3>
              <p>¿Estás seguro de que quieres ACEPTAR la cita para el {appointmentToConfirm?.fecha.split(' ')[0]} a las {appointmentToConfirm?.fecha.split(' ')[1].substring(0, 5)}?</p>
              <div className={styles.modalActions}>
                <motion.button
                  className={styles.modalPrimaryButton}
                  onClick={handleAcceptAppointment}
                  disabled={isManagingAppointment}
                >
                  {isManagingAppointment ? <><FaSpinner className={styles.spinnerIconSmall} /> Confirmando...</> : 'Sí, Aceptar'}
                </motion.button>
                <motion.button
                  className={styles.modalSecondaryButton}
                  onClick={() => setShowConfirmAcceptModal(false)}
                  disabled={isManagingAppointment}
                >
                  Cancelar
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showConfirmRejectModal && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowConfirmRejectModal(false)}
          >
            <motion.div
              className={styles.modalContent}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>Rechazar Cita</h3>
              <p>¿Estás seguro de que quieres RECHAZAR la cita para el {appointmentToConfirm?.fecha.split(' ')[0]} a las {appointmentToConfirm?.fecha.split(' ')[1].substring(0, 5)}?</p>
              <div className={styles.modalActions}>
                <motion.button
                  className={styles.modalPrimaryButton}
                  onClick={handleRejectAppointment}
                  disabled={isManagingAppointment}
                >
                  {isManagingAppointment ? <><FaSpinner className={styles.spinnerIconSmall} /> Rechazando...</> : 'Sí, Rechazar'}
                </motion.button>
                <motion.button
                  className={styles.modalSecondaryButton}
                  onClick={() => setShowConfirmRejectModal(false)}
                  disabled={isManagingAppointment}
                >
                  Cancelar
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showConfirmCancelModal && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowConfirmCancelModal(false)}
          >
            <motion.div
              className={styles.modalContent}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>Cancelar Cita</h3>
              <p>¿Estás seguro de que quieres CANCELAR la cita para el {appointmentToConfirm?.fecha.split(' ')[0]} a las {appointmentToConfirm?.fecha.split(' ')[1].substring(0, 5)}?</p>
              <div className={styles.modalActions}>
                <motion.button
                  className={styles.modalPrimaryButton}
                  onClick={handleCancelAppointment}
                  disabled={isManagingAppointment}
                >
                  {isManagingAppointment ? <><FaSpinner className={styles.spinnerIconSmall} /> Cancelando...</> : 'Sí, Cancelar'}
                </motion.button>
                <motion.button
                  className={styles.modalSecondaryButton}
                  onClick={() => setShowConfirmCancelModal(false)}
                  disabled={isManagingAppointment}
                >
                  No, Mantener
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CitasUsuario;
