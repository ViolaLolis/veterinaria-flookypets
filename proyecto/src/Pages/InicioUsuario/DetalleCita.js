import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaSpinner, FaInfoCircle, FaCalendarAlt, FaUserMd,
  FaClipboardList, FaMoneyBillWave, FaTimesCircle, FaRegCheckCircle,
  FaEdit
} from 'react-icons/fa';
import styles from './Styles/DetalleCita.css';

const localAppointments = [
  {
    id: '1',
    fecha: '2025-07-15 10:00:00',
    servicio_nombre: 'Consulta General',
    precio: 50.00,
    estado: 'aceptada',
    veterinario_nombre: 'Dr. Smith',
    id_veterinario: 'vet123',
    cliente_nombre: 'Juan Pérez',
    id_cliente: 'user123',
    servicios: 'Chequeo de rutina, vacunación'
  },
  {
    id: '2',
    fecha: '2025-07-20 14:30:00',
    servicio_nombre: 'Peluquería Canina',
    precio: 30.00,
    estado: 'pendiente',
    veterinario_nombre: 'No Asignado',
    id_veterinario: null,
    cliente_nombre: 'María Gómez',
    id_cliente: 'user456',
    servicios: 'Corte de pelo, baño, cepillado'
  },
  {
    id: '3',
    fecha: '2025-07-10 09:00:00',
    servicio_nombre: 'Urgencia',
    precio: 100.00,
    estado: 'completa',
    veterinario_nombre: 'Dra. García',
    id_veterinario: 'vet456',
    cliente_nombre: 'Carlos Ruiz',
    id_cliente: 'user123',
    servicios: 'Atención por herida'
  },
  {
    id: '4',
    fecha: '2025-07-25 11:00:00',
    servicio_nombre: 'Vacunación',
    precio: 40.00,
    estado: 'cancelada',
    veterinario_nombre: 'Dr. López',
    id_veterinario: 'vet789',
    cliente_nombre: 'Ana Torres',
    id_cliente: 'user789',
    servicios: 'Vacuna anual'
  }
];

const DetalleCita = () => {
  const { citaId } = useParams();
  const navigate = useNavigate();

  const [cita, setCita] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [isManaging, setIsManaging] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  // Usuario local fijo (para simular roles)
  const user = {
    id: 'user123',
    role: 'usuario'
  };

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      const foundCita = localAppointments.find(c => c.id === citaId);
      if (foundCita) {
        setCita({ ...foundCita });
        if (foundCita.estado !== 'completa' && foundCita.estado !== 'cancelada') {
          setNewDate(foundCita.fecha.split(' ')[0]);
          setNewTime(foundCita.fecha.split(' ')[1].substring(0, 5));
        }
      }
      setIsLoading(false);
    }, 300);
  }, [citaId]);

  const showNotif = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCancel = () => {
    if (!cita || cita.estado === 'cancelada' || cita.estado === 'completa') return;
    setIsManaging(true);
    setTimeout(() => {
      setCita(prev => ({ ...prev, estado: 'cancelada' }));
      showNotif('Cita cancelada.');
      setIsManaging(false);
    }, 500);
  };

  const handleComplete = () => {
    if (!cita || cita.estado !== 'aceptada') return;
    setIsManaging(true);
    setTimeout(() => {
      setCita(prev => ({ ...prev, estado: 'completa' }));
      showNotif('Cita completada.');
      setIsManaging(false);
    }, 500);
  };

  const handleReschedule = () => {
    if (!newDate || !newTime) {
      showNotif('Selecciona nueva fecha y hora.', 'error');
      return;
    }
    setIsManaging(true);
    setTimeout(() => {
      const newFecha = `${newDate} ${newTime}:00`;
      setCita(prev => ({ ...prev, fecha: newFecha, estado: 'pendiente' }));
      showNotif('Cita reagendada.');
      setShowRescheduleModal(false);
      setIsManaging(false);
    }, 500);
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
        <p>No se encontró la cita.</p>
        <button onClick={() => navigate(-1)} className={styles.backButton}>Volver</button>
      </div>
    );
  }

  const isClient = user.id === cita.id_cliente;
  const isVet = user.id === cita.id_veterinario;
  const isAdmin = user.role === 'admin';

  const canCancel = (isClient || isVet || isAdmin) && cita.estado !== 'cancelada' && cita.estado !== 'completa';
  const canComplete = (isVet || isAdmin) && cita.estado === 'aceptada';
  const canReschedule = isClient && cita.estado !== 'cancelada' && cita.estado !== 'completa';

  return (
    <div className={styles.detalleCitaContainer}>
      <h2>Detalle de la Cita</h2>

      {notification && (
        <motion.div
          className={`${styles.notification} ${styles[notification.type]}`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {notification.msg}
        </motion.div>
      )}

      <div className={styles.citaInfoCard}>
        <div><FaCalendarAlt /> <strong>Fecha:</strong> {cita.fecha}</div>
        <div><FaClipboardList /> <strong>Servicio:</strong> {cita.servicio_nombre}</div>
        <div><FaMoneyBillWave /> <strong>Precio:</strong> ${cita.precio}</div>
        <div><FaInfoCircle /> <strong>Estado:</strong> {cita.estado}</div>
        <div><FaUserMd /> <strong>Veterinario:</strong> {cita.veterinario_nombre}</div>
        <div><FaUserMd /> <strong>Cliente:</strong> {cita.cliente_nombre}</div>
        {cita.servicios && <div><FaClipboardList /> <strong>Detalles:</strong> {cita.servicios}</div>}
      </div>

      <div className={styles.citaActions}>
        {canReschedule && (
          <motion.button onClick={() => setShowRescheduleModal(true)}>
            <FaEdit /> Reagendar
          </motion.button>
        )}
        {canCancel && (
          <motion.button onClick={handleCancel}>
            {isManaging ? <FaSpinner /> : <FaTimesCircle />} Cancelar
          </motion.button>
        )}
        {canComplete && (
          <motion.button onClick={handleComplete}>
            {isManaging ? <FaSpinner /> : <FaRegCheckCircle />} Completar
          </motion.button>
        )}
        <motion.button onClick={() => navigate(-1)}>Volver</motion.button>
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
                onChange={e => setNewDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
              <input
                type="time"
                value={newTime}
                onChange={e => setNewTime(e.target.value)}
              />
              <button onClick={handleReschedule}>Guardar</button>
              <button onClick={() => setShowRescheduleModal(false)}>Cancelar</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DetalleCita;
