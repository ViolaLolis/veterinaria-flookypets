import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './Style/ListaMascotasStyles.module.css';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEdit, faPlus, faBan, faSearch } from '@fortawesome/free-solid-svg-icons';

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      staggerChildren: 0.1,
      when: "beforeChildren"
    } 
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  },
  hover: { 
    scale: 1.02, 
    boxShadow: "0 8px 15px rgba(0, 188, 212, 0.1)",
    transition: { 
      duration: 0.2 
    } 
  },
  tap: { scale: 0.98 },
};

const ListaMascotas = () => {
  const [mascotas, setMascotas] = useState([]);
  const [filteredMascotas, setFilteredMascotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Simulación de carga de datos
    setTimeout(() => {
      const data = [
        { id: 1, nombre: 'Max', especie: 'Perro', raza: 'Labrador', propietario: 'Ana Pérez' },
        { id: 2, nombre: 'Luna', especie: 'Gato', raza: 'Siames', propietario: 'Carlos López' },
        { id: 3, nombre: 'Rocky', especie: 'Perro', raza: 'Bulldog', propietario: 'María García' },
        { id: 4, nombre: 'Milo', especie: 'Gato', raza: 'Persa', propietario: 'Juan Martínez' },
        { id: 5, nombre: 'Bella', especie: 'Perro', raza: 'Golden Retriever', propietario: 'Ana Pérez' },
        { id: 6, nombre: 'Simba', especie: 'Gato', raza: 'Maine Coon', propietario: 'Laura Sánchez' },
      ];
      setMascotas(data);
      setFilteredMascotas(data);
      setLoading(false);
    }, 1000);
  }, []);

  // Efecto para filtrar mascotas
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredMascotas(mascotas);
    } else {
      const filtered = mascotas.filter(mascota => {
        const searchLower = searchTerm.toLowerCase();
        return (
          mascota.nombre.toLowerCase().includes(searchLower) ||
          mascota.especie.toLowerCase().includes(searchLower) ||
          mascota.raza.toLowerCase().includes(searchLower) ||
          mascota.propietario.toLowerCase().includes(searchLower)
        );
      });
      setFilteredMascotas(filtered);
    }
  }, [searchTerm, mascotas]);

  if (loading) {
    return (
      <div className={styles.loadingMessage}>
        <div className={styles.loadingSpinner}></div>
        <p>Cargando mascotas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorMessage}>
        Error al cargar las mascotas: {error}
      </div>
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
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <h2>Lista de Mascotas</h2>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link to="/veterinario/mascotas/registrar" className={styles.addButton}>
            <FontAwesomeIcon icon={faPlus} /> Registrar Mascota
          </Link>
        </motion.div>
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
          placeholder="Buscar mascotas por nombre, especie, raza o propietario..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </motion.div>

      {filteredMascotas.length > 0 ? (
        <ul className={styles.lista}>
          {filteredMascotas.map((mascota) => (
            <motion.li 
              key={mascota.id} 
              className={styles.listItem} 
              variants={itemVariants}
              whileHover="hover"
              whileTap="tap"
              layout
            >
              <span className={styles.nombre}>{mascota.nombre}</span>
              <span className={styles.especie}>{mascota.especie} ({mascota.raza})</span>
              <span className={styles.propietario}>Propietario: {mascota.propietario}</span>
              <div className={styles.acciones}>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Link to={`/veterinario/mascotas/${mascota.id}`} className={styles.verButton} title="Ver detalles">
                    <FontAwesomeIcon icon={faEye} />
                  </Link>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Link to={`/veterinario/mascotas/editar/${mascota.id}`} className={styles.editarButton} title="Editar mascota">
                    <FontAwesomeIcon icon={faEdit} />
                  </Link>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <button className={styles.deshabilitarButton} title="Deshabilitar mascota">
                    <FontAwesomeIcon icon={faBan} />
                  </button>
                </motion.div>
              </div>
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
          <p>No se encontraron mascotas que coincidan con "{searchTerm}"</p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/veterinario/mascotas/registrar" className={styles.addButton}>
              <FontAwesomeIcon icon={faPlus} /> Registrar nueva mascota
            </Link>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ListaMascotas;