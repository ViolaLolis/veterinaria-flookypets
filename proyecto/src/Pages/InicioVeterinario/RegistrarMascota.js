import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './Style/RegistrarMascotaStyles.module.css';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPaw } from '@fortawesome/free-solid-svg-icons';

const containerVariants = {
  hidden: { opacity: 0, x: '-100vw' },
  visible: { opacity: 1, x: 0, transition: { type: 'spring', delay: 0.2, damping: 20, stiffness: 100 } },
  exit: { x: '100vw', transition: { ease: 'easeInOut' } },
};

const buttonVariants = {
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
};

const RegistrarMascota = () => {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [especie, setEspecie] = useState('');
  const [raza, setRaza] = useState('');
  const [propietarioId, setPropietarioId] = useState(''); // Simulación de ID de propietario

  const handleVolver = () => {
    navigate(-1);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('Datos de la mascota a registrar:', { nombre, especie, raza, propietarioId });
    navigate('/veterinario/mascotas');
  };

  return (
    <motion.div
      className={styles.registrarContainer}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className={styles.header}>
        <button onClick={handleVolver} className={styles.volverBtn}>
          <FontAwesomeIcon icon={faArrowLeft} /> Volver
        </button>
        <h2><FontAwesomeIcon icon={faPaw} /> Registrar Nueva Mascota</h2>
      </div>
      <form onSubmit={handleSubmit} className={styles.formulario}>
        <div className={styles.formGroup}>
          <label htmlFor="nombre">Nombre:</label>
          <input type="text" id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="especie">Especie:</label>
          <input type="text" id="especie" value={especie} onChange={(e) => setEspecie(e.target.value)} required />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="raza">Raza:</label>
          <input type="text" id="raza" value={raza} onChange={(e) => setRaza(e.target.value)} />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="propietarioId">ID del Propietario:</label>
          <input type="text" id="propietarioId" value={propietarioId} onChange={(e) => setPropietarioId(e.target.value)} required />
          {/* En la realidad, esto sería un selector de propietarios */}
        </div>
        <motion.button type="submit" className={styles.registrarBtn} variants={buttonVariants} whileHover="hover" whileTap="tap">
          Registrar Mascota
        </motion.button>
        <Link to="/veterinario/mascotas" className={styles.cancelarBtn}>
          Cancelar
        </Link>
      </form>
    </motion.div>
  );
};

export default RegistrarMascota;