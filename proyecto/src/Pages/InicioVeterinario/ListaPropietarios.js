import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './Style/ListaPropietariosStyles.module.css';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEdit, faPlus, faBan, faUser, faSync } from '@fortawesome/free-solid-svg-icons';

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
  const [refreshing, setRefreshing] = useState(false);

  const fetchPropietarios = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/propietarios');
      
      if (!response.ok) {
        // Si la respuesta no es exitosa, lanzar error con el estado
        const errorData = await response.json();
        throw new Error(errorData.error || `Error HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      setPropietarios(data);
      setError(null);
    } catch (err) {
      console.error('Error en fetchPropietarios:', err);
      setError(err.message || 'Error al cargar los propietarios');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPropietarios();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPropietarios();
  };

  const handleDisable = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas deshabilitar este propietario?')) {
      try {
        setRefreshing(true);
        const response = await fetch(`http://localhost:5000/api/propietarios/${id}/disable`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Error al deshabilitar el propietario');
        }
        
        // Mostrar mensaje de éxito
        alert(data.message || 'Propietario deshabilitado correctamente');
        
        // Actualizar la lista
        fetchPropietarios();
      } catch (err) {
        console.error('Error en handleDisable:', err);
        setError(err.message || 'Error al deshabilitar el propietario');
      } finally {
        setRefreshing(false);
      }
    }
  };
  
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
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? (
            <>
              <FontAwesomeIcon icon={faSync} spin /> Cargando...
            </>
          ) : (
            'Reintentar'
          )}
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
        
        <div className={styles.headerActions}>
          <motion.button
            onClick={handleRefresh}
            className={styles.refreshButton}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={refreshing}
          >
            <FontAwesomeIcon icon={faSync} spin={refreshing} /> 
            {refreshing ? ' Actualizando...' : ' Actualizar'}
          </motion.button>
          
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/veterinario/propietarios/registrar" className={styles.addButton}>
              <FontAwesomeIcon icon={faPlus} /> Nuevo Propietario
            </Link>
          </motion.div>
        </div>
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
                  <h3>{propietario.nombre} {propietario.apellido}</h3>
                  <p><strong>Teléfono:</strong> {propietario.telefono}</p>
                  <p><strong>Email:</strong> {propietario.email}</p>
                  <p><strong>Documento:</strong> {propietario.tipo_documento} {propietario.numero_documento}</p>
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
                    onClick={() => handleDisable(propietario.id)}
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