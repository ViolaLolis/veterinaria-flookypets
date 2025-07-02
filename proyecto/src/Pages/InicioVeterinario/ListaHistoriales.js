// src/Pages/InicioVeterinario/ListaHistoriales.js
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import styles from './Style/ListaHistorialesStyles.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEye, faPlus, faNotesMedical, faSearch, 
  faSync, faDog, faCat, faCalendarAlt,
  faUser, faStethoscope, faEdit, faTrash, faSpinner, faTimesCircle
} from '@fortawesome/free-solid-svg-icons';
import { authFetch } from './api'; // Asegúrate de que la ruta sea correcta

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

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10
    }
  },
  hover: {
    scale: 1.03,
    boxShadow: "0 10px 25px rgba(255, 215, 0, 0.2)",
    transition: { duration: 0.3 }
  }
};

const statCardVariants = {
  hover: {
    y: -5,
    boxShadow: "0 10px 20px rgba(255, 215, 0, 0.2)",
    transition: { duration: 0.2 }
  }
};

const ListaHistoriales = () => {
  // Acceso defensivo al contexto del Outlet
  const { user, showNotification } = useOutletContext() || {}; 
  const [historiales, setHistoriales] = useState([]);
  const [filteredHistoriales, setFilteredHistoriales] = useState([]);
  const [stats, setStats] = useState({
    totalHistoriales: 0,
    perros: 0,
    gatos: 0,
    otros: 0,
    ultimoMes: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [historialToDelete, setHistorialToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchHistoriales = useCallback(async () => {
    setLoading(true);
    setRefreshing(true);
    setError(null);
    try {
      const response = await authFetch('/historial_medico'); // Endpoint para obtener todos los historiales
      if (response.success) {
        const data = response.data;
        setHistoriales(data);
        setFilteredHistoriales(data); // Inicialmente, los filtrados son todos

        // Calcular estadísticas con datos reales
        const now = new Date();
        const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

        const statsData = {
          totalHistoriales: data.length,
          perros: data.filter(h => h.especie?.toLowerCase() === 'perro').length,
          gatos: data.filter(h => h.especie?.toLowerCase() === 'gato').length,
          otros: data.filter(h => h.especie?.toLowerCase() !== 'perro' && h.especie?.toLowerCase() !== 'gato').length,
          ultimoMes: data.filter(h => new Date(h.fecha_consulta) > lastMonthDate).length
        };
        setStats(statsData);

      } else {
        setError(response.message || 'Error al cargar los historiales médicos.');
        if (showNotification) showNotification(response.message || 'Error al cargar los historiales médicos.', 'error');
      }
    } catch (err) {
      console.error("Error fetching historiales:", err);
      setError(err.message || "Error de conexión al servidor al cargar los historiales médicos.");
      if (showNotification) showNotification(err.message || 'Error de conexión al servidor.', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchHistoriales();
  }, [fetchHistoriales]);

  useEffect(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    if (lowercasedSearchTerm.trim() === '') {
      setFilteredHistoriales(historiales);
    } else {
      const filtered = historiales.filter(historial => {
        return (
          historial.mascota_nombre?.toLowerCase().includes(lowercasedSearchTerm) ||
          historial.especie?.toLowerCase().includes(lowercasedSearchTerm) ||
          historial.diagnostico?.toLowerCase().includes(lowercasedSearchTerm) ||
          historial.propietario_nombre?.toLowerCase().includes(lowercasedSearchTerm) ||
          historial.tratamiento?.toLowerCase().includes(lowercasedSearchTerm) ||
          historial.veterinario_nombre?.toLowerCase().includes(lowercasedSearchTerm)
        );
      });
      setFilteredHistoriales(filtered);
    }
  }, [searchTerm, historiales]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchHistoriales();
  };

  const handleDeleteClick = (historial) => {
    setHistorialToDelete(historial);
    setShowDeleteModal(true);
  };

  const confirmDeleteHistorial = async () => {
    if (!historialToDelete) return;

    setIsDeleting(true);
    try {
      const response = await authFetch(`/historial_medico/${historialToDelete.id_historial}`, {
        method: 'DELETE',
      });
      if (response.success) {
        if (showNotification) showNotification('Historial médico eliminado exitosamente.', 'success');
        fetchHistoriales(); // Recargar la lista
      } else {
        if (showNotification) showNotification(response.message || 'Error al eliminar historial médico.', 'error');
      }
    } catch (err) {
      console.error("Error deleting medical record:", err);
      if (showNotification) showNotification(err.message || 'Error de conexión al servidor.', 'error');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setHistorialToDelete(null);
    }
  };

  // Determinar si el usuario actual tiene rol de admin para mostrar el botón de eliminar
  const canDelete = user && user.role === 'admin';

  if (loading) {
    return (
      <motion.div 
        className={styles.vetLoadingContainer}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 1.5, 
            ease: "easeInOut" 
          }}
          className={styles.vetLoadingSpinner}
        >
          <FontAwesomeIcon icon={faNotesMedical} size="3x" color="#FFD700" />
        </motion.div>
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className={styles.vetLoadingText}
        >
          Cargando historiales médicos...
        </motion.p>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        className={styles.vetErrorContainer}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring" }}
      >
        <motion.div 
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <FontAwesomeIcon icon={faTimesCircle} size="2x" color="#FF0000" />
        </motion.div>
        <p className={styles.vetErrorMessage}>Error: {error}</p>
        <motion.button 
          onClick={fetchHistoriales}
          className={styles.vetRetryButton}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={refreshing}
        >
          {refreshing ? (
            <>
              <FontAwesomeIcon icon={faSpinner} spin /> Cargando...
            </>
          ) : (
            'Reintentar'
          )}
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={styles.vetMainContainer}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Barra superior */}
      <div className={styles.vetTopBar}>
        <div className={styles.vetSearchBar}>
          <FontAwesomeIcon icon={faSearch} className={styles.vetSearchIcon} />
          <motion.input 
            type="text" 
            placeholder="Buscar historiales por mascota, especie, diagnóstico o dueño..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            whileFocus={{ 
              boxShadow: "0 0 0 2px rgba(255, 215, 0, 0.3)",
              borderColor: "#FFD700"
            }}
            className={styles.vetSearchInput}
          />
        </div>
        <div className={styles.vetTopBarActions}>
          <motion.button 
            onClick={handleRefresh}
            className={styles.vetRefreshButton}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={refreshing}
          >
            <FontAwesomeIcon icon={faSync} spin={refreshing} />
            {refreshing ? ' Actualizando...' : ' Actualizar'}
          </motion.button>

          <motion.button 
            className={styles.vetAddButton}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/veterinario/historiales/registrar" className={styles.vetAddButtonLink}>
              <FontAwesomeIcon icon={faPlus} />
              <span>Crear nuevo historial</span>
            </Link>
          </motion.button>
        </div>
      </div>

      <div className={styles.vetContentWrapper}>
        {/* Estadísticas */}
        <motion.div 
          className={styles.vetStatsContainer}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {[
            { 
              icon: faNotesMedical, 
              value: stats.totalHistoriales, 
              label: "Historiales totales",
              color: "#FFD700",
              bgColor: "rgba(255, 215, 0, 0.1)",
              trend: "up" // Esto es un placeholder, la lógica de trend es más compleja
            },
            { 
              icon: faDog, 
              value: stats.perros, 
              label: "Historiales de perros",
              color: "#4CAF50",
              bgColor: "rgba(76, 175, 80, 0.1)",
              trend: "up"
            },
            { 
              icon: faCat, 
              value: stats.gatos, 
              label: "Historiales de gatos",
              color: "#FF9800",
              bgColor: "rgba(255, 152, 0, 0.1)",
              trend: "steady"
            },
            { 
              icon: faCalendarAlt, 
              value: stats.ultimoMes, 
              label: "Historiales este mes",
              color: "#9C27B0",
              bgColor: "rgba(156, 39, 176, 0.1)",
              trend: "up"
            }
          ].map((stat, index) => (
            <motion.div
              key={index}
              className={styles.vetStatCard}
              variants={statCardVariants}
              whileHover="hover"
            >
              <div 
                className={styles.vetStatIcon} 
                style={{ backgroundColor: stat.bgColor }}
              >
                <FontAwesomeIcon icon={stat.icon} style={{ color: stat.color }} />
              </div>
              <div className={styles.vetStatContent}>
                <h3>{stat.value}</h3>
                <p>{stat.label}</p>
                {/* Lógica de trend simple, puedes expandirla */}
                {stat.trend === "up" && (
                  <motion.span 
                    className={styles.vetTrendUp}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    ↑
                  </motion.span>
                )}
                {stat.trend === "steady" && (
                  <span className={styles.vetTrendSteady}>→</span>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Lista de historiales */}
        <div className={styles.vetHistorialesSection}>
          <div className={styles.vetSectionHeader}>
            <div className={styles.vetSectionTitle}>
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
              >
                <FontAwesomeIcon icon={faNotesMedical} className={styles.vetSectionIcon} />
              </motion.div>
              <h2>Historiales Médicos</h2>
            </div>
          </div>

          {filteredHistoriales.length > 0 ? (
            <motion.div 
              className={styles.vetHistorialesGrid}
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                    delayChildren: 0.3
                  }
                }
              }}
            >
              {filteredHistoriales.map((historial) => (
                <motion.div
                  key={historial.id_historial} // Usar id_historial de la DB
                  className={styles.vetHistorialCard}
                  variants={cardVariants}
                  whileHover="hover"
                  layout
                >
                  <div className={styles.vetHistorialHeader}>
                    <div className={styles.vetHistorialImage}>
                      {/* Aquí podrías usar historial.mascota_imagen_url si la tuvieras en la DB */}
                      <img 
                        src={`https://placehold.co/100x100/FFD700/FFFFFF?text=${historial.mascota_nombre?.charAt(0) || 'M'}`} 
                        alt={historial.mascota_nombre} 
                      />
                    </div>
                    <div className={styles.vetHistorialTitle}>
                      <h3>{historial.mascota_nombre}</h3>
                      <p>{historial.especie} - {historial.raza}</p>
                    </div>
                  </div>

                  <div className={styles.vetHistorialContent}>
                    <div className={styles.vetHistorialDetails}>
                      <div className={styles.vetDetailItem}>
                        <FontAwesomeIcon icon={faUser} />
                        <span>{historial.propietario_nombre}</span>
                      </div>
                      <div className={styles.vetDetailItem}>
                        <FontAwesomeIcon icon={faCalendarAlt} />
                        <span>{new Date(historial.fecha_consulta).toLocaleDateString()}</span>
                      </div>
                      <div className={styles.vetDetailItem}>
                        <FontAwesomeIcon icon={faStethoscope} />
                        <span className={styles.vetDiagnostico}>{historial.diagnostico}</span>
                      </div>
                      {historial.tratamiento && (
                        <div className={styles.vetDetailItem}>
                          <FontAwesomeIcon icon={faNotesMedical} />
                          <span className={styles.vetNotes}>{historial.tratamiento}</span>
                        </div>
                      )}
                      {historial.veterinario_nombre && (
                        <div className={styles.vetDetailItem}>
                          <FontAwesomeIcon icon={faUser} /> {/* O un icono de veterinario si lo tienes */}
                          <span>{historial.veterinario_nombre}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={styles.vetHistorialFooter}>
                    <motion.button
                      className={styles.vetActionButton}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link to={`/veterinario/historiales/${historial.id_historial}`}>
                        <FontAwesomeIcon icon={faEye} />
                        <span>Ver Detalles</span>
                      </Link>
                    </motion.button>
                    
                    <motion.button
                      className={`${styles.vetActionButton} ${styles.vetEditButton}`}
                      onClick={() => { /* Lógica para editar, navega al formulario de edición */ }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link to={`/veterinario/historiales/editar/${historial.id_historial}`}>
                        <FontAwesomeIcon icon={faEdit} />
                        <span>Editar</span>
                      </Link>
                    </motion.button>

                    {canDelete && ( // Mostrar botón de eliminar solo si es admin
                      <motion.button
                        className={`${styles.vetActionButton} ${styles.vetDeleteButton}`}
                        onClick={() => handleDeleteClick(historial)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={isDeleting}
                      >
                        {isDeleting && historialToDelete?.id_historial === historial.id_historial ? 
                          <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faTrash} />
                        }
                        <span>Eliminar</span>
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              className={styles.vetNoHistoriales}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring" }}
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
              >
                <FontAwesomeIcon icon={faNotesMedical} size="3x" className={styles.vetNoHistorialesIcon} />
              </motion.div>
              <h3>No se encontraron historiales</h3>
              <p>
                {searchTerm ? 
                'No hay resultados que coincidan con tu búsqueda.' : 
                'No hay historiales médicos registrados en el sistema.'}
              </p>
              <motion.button 
                className={styles.vetAddButton}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to="/veterinario/historiales/registrar" className={styles.vetAddButtonLink}>
                  <FontAwesomeIcon icon={faPlus} />
                  <span>Crear nuevo historial</span>
                </Link>
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Modal de Confirmación de Eliminación */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              className={styles.modalContent}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>Confirmar Eliminación</h3>
              <p>¿Estás seguro de que deseas eliminar el historial médico de <br/> <strong>{historialToDelete?.mascota_nombre}</strong> del <strong>{new Date(historialToDelete?.fecha_consulta).toLocaleDateString()}</strong>?</p>
              <p className={styles.warningText}>Esta acción es irreversible.</p>
              <div className={styles.modalActions}>
                <motion.button
                  className={styles.vetDeleteButton}
                  onClick={confirmDeleteHistorial}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isDeleting}
                >
                  {isDeleting ? <><FontAwesomeIcon icon={faSpinner} spin /> Eliminando...</> : 'Sí, Eliminar'}
                </motion.button>
                <motion.button
                  className={styles.vetCancelButton}
                  onClick={() => setShowDeleteModal(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isDeleting}
                >
                  No, Cancelar
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ListaHistoriales;
