import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faInfoCircle, faTimesCircle, faClock, faClipboardList, faUserMd, faPaw } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import styles from './Styles/TarjetaCita.css'; // Importar el CSS sin .module

const TarjetaCita = ({ cita, onVerDetalles, onCancelar }) => {
  const navigate = useNavigate();

  // Función para formatear la fecha y hora
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'Fecha/Hora no disponible';
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true // Para formato AM/PM
      });
    } catch (e) {
      console.error("Error al formatear fecha/hora de cita:", e);
      return 'Fecha/Hora inválida';
    }
  };

  return (
    <motion.div
      className="tarjeta"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      whileHover={{ scale: 1.02, boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)' }}
    >
      <div className="header">
        <FontAwesomeIcon icon={faCalendarAlt} className="header-icon" />
        <p className="fecha">{formatDateTime(cita.fecha)}</p>
      </div>

      <div className="body">
        <div className="detail-item">
          <FontAwesomeIcon icon={faClipboardList} className="detail-icon" />
          <span className="detail-label">Servicio:</span>
          <span className="detail-value">{cita.servicio_nombre || 'N/A'}</span>
        </div>
        <div className="detail-item">
          <FontAwesomeIcon icon={faClock} className="detail-icon" />
          <span className="detail-label">Estado:</span>
          <span className={`badge ${cita.estado?.toLowerCase()}`}>
            {cita.estado || 'Desconocido'}
          </span>
        </div>
        <div className="detail-item">
          <FontAwesomeIcon icon={faUserMd} className="detail-icon" />
          <span className="detail-label">Veterinario:</span>
          <span className="detail-value">{cita.veterinario_nombre || 'N/A'}</span>
        </div>
        <div className="detail-item">
          <FontAwesomeIcon icon={faPaw} className="detail-icon" />
          <span className="detail-label">Mascota:</span>
          <span className="detail-value">{cita.mascota_nombre || 'N/A'}</span>
        </div>
      </div>

      <div className="opciones-cita">
        <motion.button
          className="ver-detalles-btn"
          title="Ver detalles de la cita"
          onClick={() => onVerDetalles(cita)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FontAwesomeIcon icon={faInfoCircle} /> Detalles
        </motion.button>
        {cita.estado && cita.estado.toLowerCase() !== 'cancelada' && cita.estado.toLowerCase() !== 'completa' && (
          <motion.button
            className="cancelar-btn"
            title="Cancelar cita"
            onClick={() => onCancelar(cita.id_cita)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FontAwesomeIcon icon={faTimesCircle} /> Cancelar
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default TarjetaCita;
