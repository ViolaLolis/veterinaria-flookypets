// src/Pages/InicioVeterinario/DetalleHistorialVeterinario.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import styles from './Style/DetalleHistorialVeterinarioStyles.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // <--- ASEGÚRATE DE QUE ESTA LÍNEA ESTÉ PRESENTE Y SIN COMENTAR
import {
  faArrowLeft,
  faFileMedicalAlt,
  faPaw,
  faCalendarDay,
  faDiagnoses,
  faNotesMedical,
  faEdit,
  faTrash,
  faSpinner,
  faTimesCircle,
} from '@fortawesome/free-solid-svg-icons';
import { authFetch } from './api';

const containerVariants = {
  hidden: { opacity: 0, x: '-100vw' },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring',
      delay: 0.2,
      damping: 20,
      stiffness: 100,
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  },
  exit: {
    x: '100vw',
    transition: {
      ease: 'easeInOut',
      duration: 0.3
    }
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  hover: {
    y: -5,
    boxShadow: '0 10px 20px rgba(0, 172, 193, 0.2)'
  }
};

const DetalleHistorialVeterinario = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, showNotification } = useOutletContext() || {};

  const [historial, setHistorial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchHistorial = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authFetch(`/historial_medico/${id}`);
      if (response.success && response.data) {
        setHistorial(response.data);
      } else {
        setError(response.message || 'Historial médico no encontrado.');
        if (showNotification) showNotification(response.message || 'Historial médico no encontrado.', 'error');
      }
    } catch (err) {
      console.error("Error fetching medical record:", err);
      setError(err.message || 'Error de conexión al servidor.');
      if (showNotification) showNotification(err.message || 'Error de conexión al servidor.', 'error');
    } finally {
      setLoading(false);
    }
  }, [id, showNotification]);

  useEffect(() => {
    fetchHistorial();
  }, [fetchHistorial]);

  const handleVolver = () => {
    navigate(-1);
  };

  const handleEdit = () => {
    navigate(`/veterinario/historiales/editar/${id}`);
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const confirmDeleteHistorial = async () => {
    setIsDeleting(true);
    try {
      const response = await authFetch(`/historial_medico/${id}`, {
        method: 'DELETE',
      });
      if (response.success) {
        if (showNotification) showNotification('Historial médico eliminado exitosamente.', 'success');
        navigate('/veterinario/historiales');
      } else {
        setError(response.message || 'Error al eliminar historial médico.');
        if (showNotification) showNotification(response.message || 'Error al eliminar historial médico.', 'error');
      }
    } catch (err) {
      console.error("Error deleting medical record:", err);
      setError(err.message || 'Error de conexión al servidor.');
      if (showNotification) showNotification(err.message || 'Error de conexión al servidor.', 'error');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const canDelete = user && user.role === 'admin';

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <FontAwesomeIcon icon={faSpinner} spin size="3x" className={styles.loadingSpinner} />
        <p>Cargando detalles del historial médico...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <FontAwesomeIcon icon={faTimesCircle} size="2x" className={styles.errorIcon} />
        <h3>Error</h3>
        <p>{error}</p>
        <motion.button
          onClick={handleVolver}
          className={styles.volverBtn}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Volver
        </motion.button>
      </div>
    );
  }

  if (!historial) {
    return (
      <div className={styles.errorContainer}>
        <p>Historial médico no encontrado.</p>
        <motion.button
          onClick={handleVolver}
          className={styles.volverBtn}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Volver
        </motion.button>
      </div>
    );
  }

  const fechaConsultaFormatted = historial.fecha_consulta ? new Date(historial.fecha_consulta).toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'short' }) : 'N/A';
  const proximaCitaFormatted = historial.proxima_cita ? new Date(historial.proxima_cita).toLocaleDateString('es-ES', { dateStyle: 'full' }) : 'No programada';

  return (
    <motion.div
      className={styles.detalleContainer}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className={styles.header}>
        <motion.button
          onClick={handleVolver}
          className={styles.volverBtn}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Volver
        </motion.button>
        <h2><FontAwesomeIcon icon={faFileMedicalAlt} /> Detalle del Historial Médico</h2>
        <div className={styles.actionButtons}>
          <motion.button
            onClick={handleEdit}
            className={styles.editBtn}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FontAwesomeIcon icon={faEdit} /> Editar
          </motion.button>
          {canDelete && (
            <motion.button
              onClick={handleDeleteClick}
              className={styles.deleteBtn}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isDeleting}
            >
              {isDeleting ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faTrash} />} Eliminar
            </motion.button>
          )}
        </div>
      </div>

      <div className={styles.detalleInfo}>
        <motion.div
          className={styles.infoCard}
          variants={cardVariants}
          whileHover="hover"
        >
          <h3><FontAwesomeIcon icon={faPaw} /> Mascota</h3>
          <p>{historial.mascota_nombre} ({historial.especie}, {historial.raza})</p>
          <p><strong>Propietario:</strong> {historial.propietario_nombre}</p>
        </motion.div>

        <motion.div
          className={styles.infoCard}
          variants={cardVariants}
          whileHover="hover"
        >
          <h3><FontAwesomeIcon icon={faCalendarDay} /> Fecha de Consulta</h3>
          <p>{fechaConsultaFormatted}</p>
          <p><strong>Próxima cita:</strong> {proximaCitaFormatted}</p>
        </motion.div>

        <motion.div
          className={styles.infoCard}
          variants={cardVariants}
          whileHover="hover"
        >
          <h3><FontAwesomeIcon icon={faDiagnoses} /> Diagnóstico</h3>
          <p>{historial.diagnostico}</p>
          <p><strong>Atendió:</strong> {historial.veterinario_nombre}</p>
        </motion.div>

        <motion.div
          className={styles.notasCard}
          variants={cardVariants}
          whileHover="hover"
        >
          <h3><FontAwesomeIcon icon={faNotesMedical} /> Detalles Adicionales</h3>
          <p><strong>Tratamiento:</strong> {historial.tratamiento}</p>
          <p><strong>Observaciones:</strong> {historial.observaciones || 'N/A'}</p>
          <p><strong>Peso Actual:</strong> {historial.peso_actual !== null ? `${historial.peso_actual} kg` : 'N/A'}</p>
          <p><strong>Temperatura:</strong> {historial.temperatura !== null ? `${historial.temperatura} °C` : 'N/A'}</p>
        </motion.div>
      </div>

      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              className={styles.modalContent}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>Confirmar Eliminación</h3>
              <p>¿Estás seguro de que deseas eliminar este historial médico?</p>
              <p className={styles.warningText}>Esta acción es irreversible.</p>
              <div className={styles.modalActions}>
                <motion.button
                  className={styles.deleteBtn}
                  onClick={confirmDeleteHistorial}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isDeleting}
                >
                  {isDeleting ? <><FontAwesomeIcon icon={faSpinner} spin /> Eliminando...</> : 'Sí, Eliminar'}
                </motion.button>
                <motion.button
                  className={styles.cancelBtn}
                  onClick={() => setShowDeleteModal(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isDeleting}
                >
                  No, Cancelar
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DetalleHistorialVeterinario;