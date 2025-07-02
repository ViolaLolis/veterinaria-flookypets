import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Styles/CitasUsuario.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarAlt, faPlusCircle, faShoppingCart,
  faPaw, faUserCog
} from '@fortawesome/free-solid-svg-icons';
import { FaSpinner } from 'react-icons/fa';

const CitasUsuario = () => {
  const navigate = useNavigate();

  const [userAppointments, setUserAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isManagingAppointment, setIsManagingAppointment] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [appointmentToManage, setAppointmentToManage] = useState(null);

  // Simulación local de usuario logueado
  const user = {
    id: 'user123',
    role: 'usuario'
  };

  // Simulación local de datos de citas
  const localAppointments = [
    {
      id_cita: '1',
      fecha: '2025-07-10 10:00:00',
      servicio_nombre: 'Consulta General',
      mascota_nombre: 'Firulais',
      mascota_especie: 'Perro',
      veterinario_nombre: 'Dr. López',
      estado: 'pendiente'
    },
    {
      id_cita: '2',
      fecha: '2025-07-15 14:00:00',
      servicio_nombre: 'Vacunación',
      mascota_nombre: 'Mishi',
      mascota_especie: 'Gato',
      veterinario_nombre: 'Dra. García',
      estado: 'aceptada'
    },
    {
      id_cita: '3',
      fecha: '2025-07-05 09:00:00',
      servicio_nombre: 'Urgencia',
      mascota_nombre: 'Rocky',
      mascota_especie: 'Perro',
      veterinario_nombre: 'Dr. Smith',
      estado: 'completa'
    }
  ];

  useEffect(() => {
    setTimeout(() => {
      // Solo mostrar citas del usuario (en simulación, todas)
      setUserAppointments(localAppointments);
      setIsLoading(false);
    }, 1000);
  }, []);

  const openConfirmModal = (action, appointment) => {
    setModalAction(action);
    setAppointmentToManage(appointment);
    setShowConfirmModal(true);
  };

  const closeModal = () => {
    setShowConfirmModal(false);
    setModalAction(null);
    setAppointmentToManage(null);
  };

  const handleAppointmentAction = () => {
    setIsManagingAppointment(true);

    setTimeout(() => {
      if (appointmentToManage) {
        setUserAppointments(prev =>
          prev.map(cita =>
            cita.id_cita === appointmentToManage.id_cita
              ? { ...cita, estado: modalAction === 'accept' ? 'aceptada' : modalAction === 'reject' ? 'rechazada' : 'cancelada' }
              : cita
          )
        );
      }
      setIsManagingAppointment(false);
      closeModal();
    }, 800);
  };

  const formatDateTime = (dateTimeString) => {
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <FaSpinner className={styles.spinnerIcon} />
        <p>Cargando tus citas...</p>
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
              whileHover={{ scale: 1.02 }}
            >
              <div className={styles.citaInfo}>
                <div><FontAwesomeIcon icon={faCalendarAlt} /> {formatDateTime(cita.fecha)}</div>
                <div><FontAwesomeIcon icon={faShoppingCart} /> {cita.servicio_nombre}</div>
                <div><FontAwesomeIcon icon={faPaw} /> {cita.mascota_nombre} ({cita.mascota_especie})</div>
                <div><FontAwesomeIcon icon={faUserCog} /> {cita.veterinario_nombre}</div>
                <div className={`${styles.statusBadge} ${styles[cita.estado]}`}>{cita.estado}</div>
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

                {cita.estado === 'pendiente' && (
                  <>
                    <motion.button
                      className={styles.accionBtnPrimary}
                      onClick={() => openConfirmModal('accept', cita)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={isManagingAppointment}
                    >
                      Aceptar
                    </motion.button>
                    <motion.button
                      className={styles.accionBtnDanger}
                      onClick={() => openConfirmModal('reject', cita)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={isManagingAppointment}
                    >
                      Rechazar
                    </motion.button>
                  </>
                )}
                {(cita.estado === 'pendiente' || cita.estado === 'aceptada') && (
                  <motion.button
                    className={styles.accionBtnSecondary}
                    onClick={() => openConfirmModal('cancel', cita)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={isManagingAppointment}
                  >
                    Cancelar
                  </motion.button>
                )}
              </div>
            </motion.li>
          ))}
        </ul>
      ) : (
        <div className={styles.noCitas}>
          <FontAwesomeIcon icon={faCalendarAlt} />
          <p>No tienes citas programadas. ¡Programa una ahora!</p>
          <Link to="/usuario/citas/agendar" className={styles.agendarCitaButton}>
            <FontAwesomeIcon icon={faPlusCircle} /> Agendar Nueva Cita
          </Link>
        </div>
      )}

      <AnimatePresence>
        {showConfirmModal && appointmentToManage && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className={styles.modalContent}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>Confirmar {modalAction}</h3>
              <p>¿Seguro que quieres {modalAction} la cita para {appointmentToManage.mascota_nombre} el {formatDateTime(appointmentToManage.fecha)}?</p>
              <div className={styles.modalActions}>
                <motion.button
                  onClick={handleAppointmentAction}
                  disabled={isManagingAppointment}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isManagingAppointment ? <FaSpinner /> : `Sí, ${modalAction}`}
                </motion.button>
                <motion.button
                  onClick={closeModal}
                  disabled={isManagingAppointment}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  No, volver
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
