import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './Style/ListaPropietariosStyles.module.css';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEdit, faPlus, faBan, faUser } from '@fortawesome/free-solid-svg-icons';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.4
    }
  },
  hover: {
    scale: 1.02,
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    transition: { duration: 0.2 }
  },
  tap: { scale: 0.98 }
};

const ListaPropietarios = () => {
  const [propietarios, setPropietarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simulación de llamada a la API
    setTimeout(() => {
      const data = [
        { id: 1, nombre: 'Ana Pérez', telefono: '3101234567', email: 'ana@ejemplo.com', mascotas: 2 },
        { id: 2, nombre: 'Carlos López', telefono: '3157654321', email: 'carlos@ejemplo.com', mascotas: 1 },
        { id: 3, nombre: 'María Gómez', telefono: '3209876543', email: 'maria@ejemplo.com', mascotas: 3 },
      ];
      setPropietarios(data);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Cargando propietarios...</p>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div 
        className={styles.errorContainer}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className={styles.errorMessage}>
          Error al cargar los propietarios: {error}
        </div>
        <button 
          className={styles.retryButton}
          onClick={() => window.location.reload()}
        >
          Reintentar
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={styles.container}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        className={styles.header}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <h1>
          <FontAwesomeIcon icon={faUser} className={styles.titleIcon} />
          Lista de Propietarios
        </h1>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link to="/veterinario/propietarios/registrar" className={styles.addButton}>
            <FontAwesomeIcon icon={faPlus} /> Nuevo Propietario
          </Link>
        </motion.div>
      </motion.div>

      {propietarios.length > 0 ? (
        <ul className={styles.propietariosList}>
          {propietarios.map((propietario) => (
            <motion.li 
              key={propietario.id}
              className={styles.propietarioCard}
              variants={itemVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <div className={styles.propietarioInfo}>
                <div className={styles.avatar}>
                  {propietario.nombre.charAt(0)}
                </div>
                <div className={styles.details}>
                  <h3>{propietario.nombre}</h3>
                  <p><strong>Teléfono:</strong> {propietario.telefono}</p>
                  <p><strong>Email:</strong> {propietario.email}</p>
                  <p><strong>Mascotas:</strong> {propietario.mascotas}</p>
                </div>
              </div>
              
              <div className={styles.actions}>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Link 
                    to={`/veterinario/propietarios/${propietario.id}`} 
                    className={styles.actionButton}
                    title="Ver detalles"
                  >
                    <FontAwesomeIcon icon={faEye} />
                  </Link>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Link 
                    to={`/veterinario/propietarios/editar/${propietario.id}`} 
                    className={`${styles.actionButton} ${styles.editButton}`}
                    title="Editar"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </Link>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <button 
                    className={`${styles.actionButton} ${styles.disableButton}`}
                    title="Deshabilitar"
                    onClick={() => console.log(`Deshabilitar propietario ${propietario.id}`)}
                  >
                    <FontAwesomeIcon icon={faBan} />
                  </button>
                </motion.div>
              </div>
            </motion.li>
          ))}
        </ul>
      ) : (
        <motion.div 
          className={styles.emptyState}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className={styles.emptyIllustration}>
            <FontAwesomeIcon icon={faUser} size="3x" />
          </div>
          <h3>No hay propietarios registrados</h3>
          <p>Parece que no hay propietarios en el sistema todavía.</p>
          <Link to="/veterinario/propietarios/registrar" className={styles.addButton}>
            <FontAwesomeIcon icon={faPlus} /> Registrar primer propietario
          </Link>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ListaPropietarios;