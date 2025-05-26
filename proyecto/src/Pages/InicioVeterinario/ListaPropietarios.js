import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from '../InicioVeterinario/Style/ListaPropietariosStyles.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEdit, faPlus, faBan, faUser, faSync, faSearch } from '@fortawesome/free-solid-svg-icons';

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
    boxShadow: "0 8px 15px rgba(0, 188, 212, 0.2)",
    transition: { duration: 0.2 }
  },
  tap: { scale: 0.98 }
};

const ListaPropietarios = () => {
  const [propietarios, setPropietarios] = useState([]);
  const [filteredPropietarios, setFilteredPropietarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPropietarios = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/propietarios');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      setPropietarios(data);
      setFilteredPropietarios(data);
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

  // Efecto para filtrar propietarios
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredPropietarios(propietarios);
    } else {
      const filtered = propietarios.filter(propietario => {
        const searchLower = searchTerm.toLowerCase();
        return (
          propietario.nombre.toLowerCase().includes(searchLower) ||
          propietario.apellido.toLowerCase().includes(searchLower) ||
          propietario.email.toLowerCase().includes(searchLower) ||
          propietario.telefono.includes(searchTerm) ||
          propietario.numero_documento.includes(searchTerm)
        );
      });
      setFilteredPropietarios(filtered);
    }
  }, [searchTerm, propietarios]);

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
        
        alert(data.message || 'Propietario deshabilitado correctamente');
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

      {/* Barra de búsqueda */}
      <motion.div 
        className={styles.searchContainer}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Buscar propietarios por nombre, email o documento..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </motion.div>

      <AnimatePresence>
        {filteredPropietarios.length > 0 ? (
          <ul className={styles.propietariosList}>
            {filteredPropietarios.map((propietario) => (
              <motion.li 
                key={propietario.id}
                className={styles.propietarioCard}
                variants={itemVariants}
                whileHover="hover"
                whileTap="tap"
                layout
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
            exit={{ opacity: 0 }}
          >
            <div className={styles.emptyIllustration}>
              <FontAwesomeIcon icon={faUser} size="3x" />
            </div>
            <h3>No se encontraron propietarios</h3>
            <p>No hay resultados que coincidan con "{searchTerm}"</p>
            <Link to="/veterinario/propietarios/registrar" className={styles.addButton}>
              <FontAwesomeIcon icon={faPlus} /> Registrar nuevo propietario
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ListaPropietarios;