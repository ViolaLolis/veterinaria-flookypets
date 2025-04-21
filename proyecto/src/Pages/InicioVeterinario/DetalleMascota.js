import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './Style/DetalleMascotaStyles.module.css';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPaw } from '@fortawesome/free-solid-svg-icons';

const containerVariants = {
  hidden: { opacity: 0, x: '-100vw' },
  visible: { opacity: 1, x: 0, transition: { type: 'spring', delay: 0.2, damping: 20, stiffness: 100 } },
  exit: { x: '100vw', transition: { ease: 'easeInOut' } },
};

const DetalleMascota = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [mascota, setMascota] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setTimeout(() => {
      const mascotaData = {
        id: parseInt(id),
        nombre: 'Max',
        especie: 'Perro',
        raza: 'Labrador',
        sexo: 'Macho',
        fechaNacimiento: '2020-05-10',
        propietario: 'Ana Pérez',
      };
      if (mascotaData.id === parseInt(id)) {
        setMascota(mascotaData);
        setLoading(false);
      } else {
        setError('Mascota no encontrada');
        setLoading(false);
      }
    }, 500);
  }, [id]);

  const handleVolver = () => {
    navigate(-1);
  };

  if (loading) {
    return <div>Cargando detalles de la mascota...</div>;
  }

  if (error) {
    return <div>Error al cargar los detalles de la mascota: {error}</div>;
  }

  if (!mascota) {
    return <div>Mascota no encontrada.</div>;
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
        <h2><FontAwesomeIcon icon={faPaw} /> Detalle de la Mascota</h2>
      </div>
      <div className={styles.detalleInfo}>
        <p><strong>Nombre:</strong> {mascota.nombre}</p>
        <p><strong>Especie:</strong> {mascota.especie}</p>
        <p><strong>Raza:</strong> {mascota.raza}</p>
        <p><strong>Sexo:</strong> {mascota.sexo}</p>
        <p><strong>Fecha de Nacimiento:</strong> {mascota.fechaNacimiento}</p>
        <p><strong>Propietario:</strong> {mascota.propietario}</p>
        {/* Posibles acciones adicionales como editar o ver historial médico */}
      </div>
    </motion.div>
  );
};

export default DetalleMascota;