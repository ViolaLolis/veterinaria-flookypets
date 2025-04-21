import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './Style/ListaMascotasStyles.module.css';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEdit, faPlus, faBan } from '@fortawesome/free-solid-svg-icons';

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
  hover: { scale: 1.02, transition: { duration: 0.2 } },
  tap: { scale: 0.98 },
};

const ListaMascotas = () => {
  const [mascotas, setMascotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setTimeout(() => {
      const data = [
        { id: 1, nombre: 'Max', especie: 'Perro', raza: 'Labrador', propietario: 'Ana Pérez' },
        { id: 2, nombre: 'Luna', especie: 'Gato', raza: 'Siames', propietario: 'Carlos López' },
        // ... más mascotas
      ];
      setMascotas(data);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return <div>Cargando mascotas...</div>;
  }

  if (error) {
    return <div>Error al cargar las mascotas: {error}</div>;
  }

  return (
    <motion.div
      className={styles.listaContainer}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className={styles.header}>
        <h2>Lista de Mascotas</h2>
        <Link to="/veterinario/mascotas/registrar" className={styles.addButton}>
          <FontAwesomeIcon icon={faPlus} /> Registrar Mascota
        </Link>
      </div>
      {mascotas.length > 0 ? (
        <ul className={styles.lista}>
          {mascotas.map((mascota) => (
            <motion.li key={mascota.id} className={styles.listItem} variants={itemVariants} whileHover="hover" whileTap="tap">
              <span className={styles.nombre}>{mascota.nombre}</span>
              <span className={styles.especie}>{mascota.especie} ({mascota.raza})</span>
              <span className={styles.propietario}>Propietario: {mascota.propietario}</span>
              <div className={styles.acciones}>
                <Link to={`/veterinario/mascotas/${mascota.id}`} className={styles.verButton} title="Ver detalles">
                  <FontAwesomeIcon icon={faEye} />
                </Link>
                <Link to={`/veterinario/mascotas/editar/${mascota.id}`} className={styles.editarButton} title="Editar mascota">
                  <FontAwesomeIcon icon={faEdit} />
                </Link>
                <button className={styles.deshabilitarButton} title="Deshabilitar mascota (simulado)">
                  <FontAwesomeIcon icon={faBan} />
                </button>
              </div>
            </motion.li>
          ))}
        </ul>
      ) : (
        <div className={styles.emptyMessage}>No hay mascotas registradas.</div>
      )}
    </motion.div>
  );
};

export default ListaMascotas;