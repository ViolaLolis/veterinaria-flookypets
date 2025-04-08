import React from 'react';
import TarjetaMascota from './TarjetaMascota';
import styles from './Styles/MisMascotas.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaw, faPlusCircle, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const MisMascotas = () => {
  const navigate = useNavigate();

  const handleVolver = () => {
    navigate(-1);
  };

  // Aquí iría la lógica para obtener las mascotas del usuario
  const mascotas = [
    { id: 1, nombre: 'Max', raza: 'Pug', edad: '3 años', imagen: require('../Inicio/Imagenes/perro.png') },
    { id: 2, nombre: 'Luna', raza: 'Siames', edad: '2 años', imagen: require('../Inicio/Imagenes/gato.png') },
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { delayChildren: 0.1, staggerChildren: 0.05 } },
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const petListVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { delayChildren: 0.2, staggerChildren: 0.1 } },
  };

  const petCardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
    hover: { scale: 1.03, transition: { duration: 0.2 } },
    tap: { scale: 0.98 },
  };

  const addButtonVariants = {
    hover: { scale: 1.05, boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)' },
    tap: { scale: 0.95 },
  };

  return (
    <motion.div
      className={styles.container}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className={styles.header} variants={headerVariants}>
        <button onClick={handleVolver} className={styles.volverBtn}>
          <FontAwesomeIcon icon={faArrowLeft} className={styles.volverIcon} /> Volver
        </button>
        <FontAwesomeIcon icon={faPaw} className={styles.icon} />
        <h3>Mis Mascotas</h3>
      </motion.div>
      {mascotas.length > 0 ? (
        <motion.div className={styles.listaMascotas} variants={petListVariants}>
          {mascotas.map(mascota => (
            <motion.div key={mascota.id} variants={petCardVariants} whileHover="hover" whileTap="tap">
              <TarjetaMascota mascota={mascota} />
            </motion.div>
          ))}
          <motion.Link
            to="/usuario/mascotas/agregar"
            className={styles.agregarMascota}
            variants={addButtonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <FontAwesomeIcon icon={faPlusCircle} className={styles.plusIcon} />
            Añadir Mascota
          </motion.Link>
        </motion.div>
      ) : (
        <div className={styles.noMascotas}>
          <p>Aún no has registrado ninguna mascota.</p>
          <Link to="/usuario/mascotas/agregar" className={styles.agregarMascotaBtn}>
            <FontAwesomeIcon icon={faPlusCircle} className={styles.plusIcon} />
            Añadir Mascota
          </Link>
        </div>
      )}
    </motion.div>
  );
};

export default MisMascotas;