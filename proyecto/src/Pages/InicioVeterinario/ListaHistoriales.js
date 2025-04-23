import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './Style/ListaHistorialesStyles.module.css';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faPlus, faNotesMedical, faSearch } from '@fortawesome/free-solid-svg-icons';

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      staggerChildren: 0.1,
      duration: 0.5
    } 
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 100 }
  },
  hover: { 
    scale: 1.03, 
    boxShadow: "0 5px 15px rgba(255, 215, 0, 0.3)",
    transition: { duration: 0.3 } 
  },
  tap: { 
    scale: 0.98,
    boxShadow: "0 2px 5px rgba(255, 215, 0, 0.2)"
  },
};

const ListaHistoriales = () => {
  const [historiales, setHistoriales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setTimeout(() => {
      const data = [
        { id: 1, mascota: 'Max', fecha: '2024-04-01', diagnostico: 'Chequeo general', especie: 'Perro' },
        { id: 2, mascota: 'Luna', fecha: '2024-03-15', diagnostico: 'Vacunación anual', especie: 'Gato' },
        { id: 3, mascota: 'Rocky', fecha: '2024-03-10', diagnostico: 'Control de peso', especie: 'Perro' },
        { id: 4, mascota: 'Milo', fecha: '2024-02-28', diagnostico: 'Cirugía menor', especie: 'Conejo' },
        { id: 5, mascota: 'Bella', fecha: '2024-02-15', diagnostico: 'Desparasitación', especie: 'Gato' },
      ];
      setHistoriales(data);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredHistoriales = historiales.filter(historial =>
    historial.mascota.toLowerCase().includes(searchTerm.toLowerCase()) ||
    historial.diagnostico.toLowerCase().includes(searchTerm.toLowerCase()) ||
    historial.especie.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <motion.div 
        className={styles.loadingContainer}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div 
          className={styles.loadingSpinner}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        />
        <p>Cargando historiales médicos...</p>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        className={styles.errorContainer}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className={styles.errorIcon}>⚠️</div>
        <div>Error al cargar los historiales médicos: {error}</div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={styles.listaContainer}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        className={styles.header}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2>
          <FontAwesomeIcon icon={faNotesMedical} className={styles.titleIcon} />
          Historiales Médicos
        </h2>
        
        <motion.div 
          className={styles.searchContainer}
          whileHover={{ scale: 1.02 }}
        >
          <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Buscar mascota o diagnóstico..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </motion.div>
      </motion.div>

      {filteredHistoriales.length > 0 ? (
        <ul className={styles.lista}>
          {filteredHistoriales.map((historial) => (
            <motion.li 
              key={historial.id} 
              className={styles.listItem} 
              variants={itemVariants}
              whileHover="hover"
              whileTap="tap"
              initial="hidden"
              animate="visible"
            >
              <div className={styles.mascotaInfo}>
                <span className={styles.mascota}>{historial.mascota}</span>
                <span className={styles.especie}>{historial.especie}</span>
              </div>
              <span className={styles.fecha}>{new Date(historial.fecha).toLocaleDateString()}</span>
              <span className={styles.diagnostico}>{historial.diagnostico}</span>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Link 
                  to={`/veterinario/historiales/${historial.id}`} 
                  className={styles.verButton} 
                  title="Ver detalles del historial"
                >
                  <FontAwesomeIcon icon={faEye} />
                  <span className={styles.tooltip}>Ver detalles</span>
                </Link>
              </motion.div>
            </motion.li>
          ))}
        </ul>
      ) : (
        <motion.div 
          className={styles.emptyMessage}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {searchTerm ? 
            'No se encontraron historiales que coincidan con la búsqueda.' : 
            'No hay historiales médicos registrados.'}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/veterinario/nuevo-historial" className={styles.addButton}>
              <FontAwesomeIcon icon={faPlus} /> Crear nuevo historial
            </Link>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ListaHistoriales;