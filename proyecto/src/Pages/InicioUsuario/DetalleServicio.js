import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaSpinner, FaInfoCircle, FaCalendarCheck } from 'react-icons/fa';
import styles from './Styles/DetalleServicio.css'; // Asegúrate de que el CSS sea un módulo
import { authFetch } from '../../utils/api'; // Importar la función authFetch

const DetalleServicio = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useOutletContext(); // Obtener showNotification del contexto

  const [servicio, setServicio] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchServiceDetails = async () => {
      setIsLoading(true);
      setError('');
      try {
        // Asumiendo una ruta para obtener un servicio específico por ID
        const response = await authFetch(`/servicios/${id}`);
        if (response.success) {
          setServicio(response.data);
        } else {
          showNotification(response.message || 'Error al cargar el servicio.', 'error');
          setError(response.message || 'No se encontró el servicio.');
          setServicio(null);
        }
      } catch (err) {
        console.error("Error fetching service details:", err);
        showNotification('Error de conexión al servidor.', 'error');
        setError('Error de conexión al servidor.');
        setServicio(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServiceDetails();
  }, [id, showNotification]);

  const handleAgendar = () => {
    if (servicio) {
      // Navegar a la página de agendar cita, pasando los detalles del servicio
      navigate('/usuario/citas/agendar', {
        state: {
          servicioId: servicio.id_servicio,
          servicioNombre: servicio.nombre,
          servicioPrecio: servicio.precio
        }
      });
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <FaSpinner className={styles.spinnerIcon} />
        <p>Cargando servicio...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorMessage}>
        <FaInfoCircle className={styles.infoIcon} />
        <p>{error}</p>
        <Link to="/usuario/servicios" className={styles.detalleServicioBack}>Volver a Servicios</Link>
      </div>
    );
  }

  if (!servicio) {
    return (
      <div className={styles.noDataMessage}>
        <FaInfoCircle className={styles.infoIcon} />
        <p>No se encontró el servicio.</p>
        <Link to="/usuario/servicios" className={styles.detalleServicioBack}>Volver a Servicios</Link>
      </div>
    );
  }

  return (
    <div className={styles.detalleServicioContainer}>
      <h2 className={styles.detalleServicioTitle}>{servicio.nombre}</h2>
      <div className={styles.detalleServicioContent}>
        <img
          src={servicio.imagen_url || `https://placehold.co/400x250/cccccc/ffffff?text=${servicio.nombre.replace(/\s/g, '+')}`}
          alt={servicio.nombre}
          className={styles.detalleServicioImage}
          onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x250/cccccc/ffffff?text=Imagen+No+Disponible'; }}
        />
        <div className={styles.detalleServicioInfo}>
          <p className={styles.detalleServicioPrecio}>Precio: <strong>${typeof servicio.precio === 'number' ? servicio.precio.toLocaleString('es-CO') : servicio.precio}</strong></p>
          <p className={styles.detalleServicioDescripcionLarga}>{servicio.descripcion}</p>
          <div className={styles.detalleServicioActions}>
            <Link to="/usuario/servicios" className={styles.detalleServicioBack}>Volver a Servicios</Link>
            <motion.button
              className={styles.detalleServicioAgendar}
              onClick={handleAgendar}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaCalendarCheck /> Agendar Cita
            </motion.button>
          </div>
        </div>
      </div>
    </div >
  );
};

export default DetalleServicio;
