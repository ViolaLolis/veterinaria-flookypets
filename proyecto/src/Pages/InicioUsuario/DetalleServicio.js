import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaSpinner, FaInfoCircle, FaCalendarCheck } from 'react-icons/fa'; // Importar iconos
import { authFetch } from './api'; // Asegúrate de que la ruta sea correcta
import './Styles/DetalleServicio.css'; // Importa el CSS

const DetalleServicio = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [servicio, setServicio] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchServiceDetail = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await authFetch(`/servicios/${id}`);
      if (response.success) {
        setServicio(response.data);
      } else {
        setError(response.message || 'Error al cargar el detalle del servicio.');
      }
    } catch (err) {
      console.error("Error fetching service detail:", err);
      setError('Error de conexión al servidor.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchServiceDetail();
  }, [fetchServiceDetail]);

  const handleAgendar = () => {
    if (servicio) {
      navigate('/usuario/citas/agendar', {
        state: { servicioId: servicio.id_servicio, servicioNombre: servicio.nombre, servicioPrecio: servicio.precio }
      });
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <FaSpinner className="spinner-icon" />
        <p>Cargando servicio...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        <FaInfoCircle className="info-icon" />
        <p>{error}</p>
        <Link to="/usuario/servicios" className="detalle-servicio-back">Volver a Servicios</Link>
      </div>
    );
  }

  if (!servicio) {
    return (
      <div className="no-data-message">
        <FaInfoCircle className="info-icon" />
        <p>No se encontró el servicio.</p>
        <Link to="/usuario/servicios" className="detalle-servicio-back">Volver a Servicios</Link>
      </div>
    );
  }

  return (
    <div className="detalle-servicio-container">
      <h2 className="detalle-servicio-title">{servicio.nombre}</h2>
      <div className="detalle-servicio-content">
        {/* Usar un placeholder de imagen si no hay URL real en la DB */}
        <img
          src={`https://placehold.co/400x250/cccccc/ffffff?text=${servicio.nombre.replace(/\s/g, '+')}`}
          alt={servicio.nombre}
          className="detalle-servicio-image"
          onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x250/cccccc/ffffff?text=Imagen+No+Disponible'; }}
        />
        <div className="detalle-servicio-info">
          <p className="detalle-servicio-precio">Precio: <strong>{servicio.precio}</strong></p>
          <p className="detalle-servicio-descripcion-larga">{servicio.descripcion}</p>
          <div className="detalle-servicio-actions">
            <Link to="/usuario/servicios" className="detalle-servicio-back">Volver a Servicios</Link>
            <motion.button
              className="detalle-servicio-agendar"
              onClick={handleAgendar}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaCalendarCheck /> Agendar Cita
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalleServicio;
