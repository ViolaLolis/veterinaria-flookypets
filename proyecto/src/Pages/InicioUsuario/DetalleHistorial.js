import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaSpinner, FaInfoCircle } from 'react-icons/fa';
import styles from './Styles/DetalleHistorial.css'; // Asegúrate de que el CSS sea un módulo
import { authFetch } from '../../utils/api'; // Importar la función authFetch

const DetalleHistorial = () => {
  const { mascotaId, historialId } = useParams();
  const navigate = useNavigate();
  const { user, showNotification } = useOutletContext(); // Obtener user y showNotification del contexto

  const [historial, setHistorial] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistorialDetails = async () => {
      setIsLoading(true);
      setError(null);
      if (!user?.id) {
        showNotification('No se pudo cargar la información del usuario. Por favor, inicia sesión.', 'error');
        setIsLoading(false);
        return;
      }
      try {
        // Asumiendo una ruta para obtener un historial médico específico por ID
        // Y que el backend maneja los permisos (isOwnerOrAdmin)
        const response = await authFetch(`/historial_medico/${historialId}`);
        if (response.success) {
          const fetchedHistorial = response.data;
          // Verificar si el historial pertenece a la mascota correcta (si es necesario)
          if (String(fetchedHistorial.id_mascota) !== String(mascotaId)) {
            setError('El historial no pertenece a la mascota especificada.');
            setHistorial(null);
          } else {
            setHistorial(fetchedHistorial);
          }
        } else {
          showNotification(response.message || 'Error al cargar el historial médico.', 'error');
          setError(response.message || 'Error al cargar el historial médico.');
          setHistorial(null);
        }
      } catch (err) {
        console.error("Error fetching historial details:", err);
        showNotification('Error de conexión al servidor.', 'error');
        setError('Error de conexión al servidor.');
        setHistorial(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistorialDetails();
  }, [mascotaId, historialId, user, showNotification]);

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <FaSpinner className={styles.spinnerIcon} />
        <p>Cargando historial...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorMessage}>
        <FaInfoCircle className={styles.infoIcon} />
        <p>{error}</p>
        <button onClick={() => navigate(-1)} className={styles.backButton}>
          Volver
        </button>
      </div>
    );
  }

  if (!historial) {
    return (
      <div className={styles.noDataMessage}>
        <FaInfoCircle className={styles.infoIcon} />
        <p>No se encontró el historial médico.</p>
        <Link to={`/usuario/historial/${mascotaId}`} className={styles.backButton}>
          Volver al Historial
        </Link>
      </div>
    );
  }

  // Formatear la fecha de consulta
  const formattedFechaConsulta = new Date(historial.fecha_consulta).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Formatear la próxima cita si existe
  const formattedProximaCita = historial.proxima_cita
    ? new Date(historial.proxima_cita).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'N/A';

  return (
    <motion.div
      className={styles.detalleHistorialContainer}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className={styles.detalleHistorialTitle}>Detalle del Historial Médico</h2>
      <div className={styles.detalleHistorialInfo}>
        <p><strong>Fecha de Consulta:</strong> {formattedFechaConsulta}</p>
        <p><strong>Veterinario:</strong> {historial.veterinario_nombre || 'N/A'}</p>
        <p><strong>Diagnóstico:</strong> {historial.diagnostico}</p>
        <p><strong>Tratamiento:</strong> {historial.tratamiento}</p>
        {historial.observaciones && <p><strong>Observaciones:</strong> {historial.observaciones}</p>}
        {historial.peso_actual && <p><strong>Peso Actual:</strong> {historial.peso_actual} kg</p>}
        {historial.temperatura && <p><strong>Temperatura:</strong> {historial.temperatura} °C</p>}
        <p><strong>Próxima Cita:</strong> {formattedProximaCita}</p>
      </div>
      <div className={styles.detalleHistorialActions}>
        <Link to={`/usuario/historial/${mascotaId}`} className={styles.detalleHistorialBack}>
          Volver al Historial
        </Link>
      </div>
    </motion.div>
  );
};

export default DetalleHistorial;
