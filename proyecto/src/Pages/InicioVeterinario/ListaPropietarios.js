import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './Style/ListaPropietariosStyles.module.css';
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

const ListaPropietarios = () => {
  const [propietarios, setPropietarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simulación de llamada a la API
    setTimeout(() => {
      const data = [
        { id: 1, nombre: 'Ana Pérez', telefono: '310...', email: 'ana@...' },
        { id: 2, nombre: 'Carlos López', telefono: '315...', email: 'carlos@...' },
        // ... más propietarios
      ];
      setPropietarios(data);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return <div>Cargando propietarios...</div>;
  }

  if (error) {
    return <div>Error al cargar los propietarios: {error}</div>;
  }

  return (
    <motion.div
      className={styles.listaContainer}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className={styles.header}>
        <h2>Lista de Propietarios</h2>
        <Link to="/veterinario/propietarios/registrar" className={styles.addButton}>
          <FontAwesomeIcon icon={faPlus} /> Registrar Propietario
        </Link>
      </div>
      {propietarios.length > 0 ? (
        <ul className={styles.lista}>
          {propietarios.map((propietario) => (
            <motion.li key={propietario.id} className={styles.listItem} variants={itemVariants} whileHover="hover" whileTap="tap">
              <span className={styles.nombre}>{propietario.nombre}</span>
              <div className={styles.acciones}>
                <Link to={`/veterinario/propietarios/${propietario.id}`} className={styles.verButton} title="Ver detalles">
                  <FontAwesomeIcon icon={faEye} />
                </Link>
                <Link to={`/veterinario/propietarios/editar/${propietario.id}`} className={styles.editarButton} title="Editar propietario">
                  <FontAwesomeIcon icon={faEdit} />
                </Link>
                <button className={styles.deshabilitarButton} title="Deshabilitar propietario (simulado)">
                  <FontAwesomeIcon icon={faBan} />
                </button>
              </div>
            </motion.li>
          ))}
        </ul>
      ) : (
        <div className={styles.emptyMessage}>No hay propietarios registrados.</div>
      )}
    </motion.div>
  );
};

export default ListaPropietarios;