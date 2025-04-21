import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './Style/ListaHistorialesStyles.module.css';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faPlus } from '@fortawesome/free-solid-svg-icons';

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

const ListaHistoriales = () => {
  const [historiales, setHistoriales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setTimeout(() => {
      const data = [
        { id: 1, mascota: 'Max', fecha: '2024-04-01', diagnostico: 'Chequeo general' },
        { id: 2, mascota: 'Luna', fecha: '2024-03-15', diagnostico: 'Vacunación' },
        // ... más historiales
      ];
      setHistoriales(data);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return <div>Cargando historiales médicos...</div>;
  }

  if (error) {
    return <div>Error al cargar los historiales médicos: {error}</div>;
  }

  return (
    <motion.div
      className={styles.listaContainer}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className={styles.header}>
        <h2>Historiales Médicos</h2>
        {/* Posiblemente no necesites botón de "registrar" aquí, ya que lo haría el usuario */}
      </div>
      {historiales.length > 0 ? (
        <ul className={styles.lista}>
          {historiales.map((historial) => (
            <motion.li key={historial.id} className={styles.listItem} variants={itemVariants} whileHover="hover" whileTap="tap">
              <span className={styles.mascota}>{historial.mascota}</span>
              <span className={styles.fecha}>{historial.fecha}</span>
              <span className={styles.diagnostico}>{historial.diagnostico}</span>
              <Link to={`/veterinario/historiales/${historial.id}`} className={styles.verButton} title="Ver detalles del historial">
                <FontAwesomeIcon icon={faEye} />
              </Link>
            </motion.li>
          ))}
        </ul>
      ) : (
        <div className={styles.emptyMessage}>No hay historiales médicos registrados.</div>
      )}
    </motion.div>
  );
};

export default ListaHistoriales;