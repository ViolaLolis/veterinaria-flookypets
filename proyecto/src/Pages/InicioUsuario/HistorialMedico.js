import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Styles/HistorialMedico.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStethoscope, faFileMedicalAlt, faPrint, faDownload, faSearch, faChevronDown, faChevronUp, faCalendarAlt, faSpinner, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { authFetch } from './api';

const HistorialMedico = ({ user }) => {
  const { mascotaId } = useParams();
  const [historial, setHistorial] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHistorial = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await authFetch(`/historial_medico?id_mascota=${mascotaId}`);
      if (response.success) {
        setHistorial(response.data);
      } else {
        setError(response.message || 'Error al cargar el historial médico.');
      }
    } catch (err) {
      console.error("Error fetching historial:", err);
      setError('Error de conexión al servidor.');
    } finally {
      setIsLoading(false);
    }
  }, [mascotaId]);

  useEffect(() => {
    fetchHistorial();
  }, [fetchHistorial]);

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const filteredHistorial = historial.filter(item =>
    item.diagnostico.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.tratamiento.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.observaciones.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.veterinario_nombre && item.veterinario_nombre.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <FontAwesomeIcon icon={faSpinner} spin className={styles.spinnerIcon} />
        <p>Cargando historial médico...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorMessage}>
        <FontAwesomeIcon icon={faInfoCircle} className={styles.infoIcon} />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <FontAwesomeIcon icon={faFileMedicalAlt} className={styles.mainIcon} />
          <h2>Historial Clínico</h2>
          <p>Registro completo de atenciones médicas</p>
        </div>

        <div className={styles.controls}>
          <div className={styles.searchContainer}>
            <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar en historial..."
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className={styles.actionButtons}>
            <motion.button
              className={styles.actionButton}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FontAwesomeIcon icon={faPrint} /> Imprimir
            </motion.button>
            <motion.button
              className={styles.actionButton}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FontAwesomeIcon icon={faDownload} /> Exportar
            </motion.button>
          </div>
        </div>
      </div>

      {filteredHistorial.length > 0 ? (
        <div className={styles.historialContainer}>
          {filteredHistorial.map(item => (
            <motion.div
              key={item.id_historial}
              className={styles.historialCard}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div
                className={styles.cardHeader}
                onClick={() => toggleRow(item.id_historial)}
              >
                <div className={styles.cardDate}>
                  <FontAwesomeIcon icon={faCalendarAlt} />
                  <span>{item.fecha_consulta}</span>
                </div>
                <h3 className={styles.cardDiagnosis}>{item.diagnostico}</h3>
                <div className={styles.cardVet}>
                  <span>Atendió: {item.veterinario_nombre || 'N/A'}</span>
                </div>
                <div className={styles.cardToggle}>
                  <FontAwesomeIcon icon={expandedRow === item.id_historial ? faChevronUp : faChevronDown} />
                </div>
              </div>

              <AnimatePresence>
                {expandedRow === item.id_historial && (
                  <motion.div
                    className={styles.cardContent}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className={styles.detailRow}>
                      <h4>Tratamiento:</h4>
                      <p>{item.tratamiento}</p>
                    </div>
                    {item.observaciones && (
                      <div className={styles.detailRow}>
                        <h4>Observaciones:</h4>
                        <p>{item.observaciones}</p>
                      </div>
                    )}
                    {item.peso_actual && (
                      <div className={styles.detailRow}>
                        <h4>Peso Actual:</h4>
                        <p>{item.peso_actual} kg</p>
                      </div>
                    )}
                    {item.temperatura && (
                      <div className={styles.detailRow}>
                        <h4>Temperatura:</h4>
                        <p>{item.temperatura} °C</p>
                      </div>
                    )}
                    {item.proxima_cita && (
                      <div className={styles.detailRow}>
                        <h4>Próxima Cita:</h4>
                        <p>{item.proxima_cita}</p>
                      </div>
                    )}
                    <div className={styles.cardActions}>
                      <Link to={`/usuario/historial/${mascotaId}/${item.id_historial}`} className={styles.smallActionButton}> {/* CORREGIDO */}
                        Ver Detalles
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          className={styles.noHistorial}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <FontAwesomeIcon icon={faStethoscope} className={styles.noHistorialIcon} />
          <h3>No se encontraron registros médicos</h3>
          <p>{searchTerm ? 'Intenta con otro término de búsqueda' : 'Esta mascota no tiene historial médico registrado'}</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default HistorialMedico;
