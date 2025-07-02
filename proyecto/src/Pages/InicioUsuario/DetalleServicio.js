import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaSpinner, FaInfoCircle, FaCalendarCheck } from 'react-icons/fa';
import './Styles/DetalleServicio.css';

// Datos locales simulando la "base de datos"
const serviciosLocales = [
  {
    id_servicio: '1',
    nombre: 'Corte de pelo',
    precio: '$30',
    descripcion: 'Corte de pelo profesional para tu mascota con productos especializados.'
  },
  {
    id_servicio: '2',
    nombre: 'Vacunación',
    precio: '$50',
    descripcion: 'Vacunación completa para mantener a tu mascota saludable.'
  },
  {
    id_servicio: '3',
    nombre: 'Consulta general',
    precio: '$40',
    descripcion: 'Consulta veterinaria general para revisión y diagnóstico.'
  }
];

const DetalleServicio = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [servicio, setServicio] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setIsLoading(true);
    setError('');
    // Simular búsqueda local
    const servicioEncontrado = serviciosLocales.find(s => s.id_servicio === id);
    if (servicioEncontrado) {
      setServicio(servicioEncontrado);
    } else {
      setError('No se encontró el servicio.');
    }
    setIsLoading(false);
  }, [id]);

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
