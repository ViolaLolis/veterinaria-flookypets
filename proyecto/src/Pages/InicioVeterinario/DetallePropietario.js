import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './Style/DetallePropietarioStyles.module.css';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faUser } from '@fortawesome/free-solid-svg-icons';

const containerVariants = {
  hidden: { opacity: 0, x: '-100vw' },
  visible: { opacity: 1, x: 0, transition: { type: 'spring', delay: 0.2, damping: 20, stiffness: 100 } },
  exit: { x: '100vw', transition: { ease: 'easeInOut' } },
};

const DetallePropietario = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [propietario, setPropietario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setTimeout(() => {
      const propietarioData = {
        id: parseInt(id),
        nombre: 'Ana Pérez',
        telefono: '310...',
        email: 'ana@...',
        direccion: 'Calle Falsa 123',
        mascotas: ['Max', 'Lola'],
      };
      if (propietarioData.id === parseInt(id)) {
        setPropietario(propietarioData);
        setLoading(false);
      } else {
        setError('Propietario no encontrado');
        setLoading(false);
      }
    }, 500);
  }, [id]);

  const handleVolver = () => {
    navigate(-1);
  };

  if (loading) {
    return <div>Cargando detalles del propietario...</div>;
  }

  if (error) {
    return <div>Error al cargar los detalles del propietario: {error}</div>;
  }

  if (!propietario) {
    return <div>Propietario no encontrado.</div>;
  }

  return (
    <motion.div
      className={styles.detalleContainer}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className={styles.header}>
        <button onClick={handleVolver} className={styles.volverBtn}>
          <FontAwesomeIcon icon={faArrowLeft} /> Volver
        </button>
        <h2><FontAwesomeIcon icon={faUser} /> Detalle del Propietario</h2>
      </div>
      <div className={styles.detalleInfo}>
        <p><strong>Nombre:</strong> {propietario.nombre}</p>
        <p><strong>Teléfono:</strong> {propietario.telefono}</p>
        <p><strong>Email:</strong> {propietario.email}</p>
        <p><strong>Dirección:</strong> {propietario.direccion}</p>
        {propietario.mascotas && propietario.mascotas.length > 0 && (
          <div>
            <h3>Mascotas:</h3>
            <ul>
              {propietario.mascotas.map((mascota, index) => (
                <li key={index}>{mascota}</li>
              ))}
            </ul>
          </div>
        )}
        {/* Posibles acciones adicionales como editar o deshabilitar */}
      </div>
    </motion.div>
  );
};

export default DetallePropietario;