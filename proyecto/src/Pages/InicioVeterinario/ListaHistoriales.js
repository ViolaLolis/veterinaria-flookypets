import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './Style/ListaHistorialesStyles.module.css';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEye, faPlus, faNotesMedical, faSearch, 
  faSync, faDog, faCat, faCalendarAlt,
  faUser, faStethoscope
} from '@fortawesome/free-solid-svg-icons';

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

  useEffect(() => {
    fetchHistoriales();
  }, []);

  const fetchHistoriales = async () => {
    setLoading(true);
    setRefreshing(true);
    try {
      // Simulación de datos
      await new Promise(resolve => setTimeout(resolve, 800));
      const data = [
        { 
          id: 1, 
          mascota: 'Max', 
          especie: 'Perro', 
          raza: 'Labrador Retriever',
          propietario: 'Juan Pérez',
          fecha: '2024-05-15',
          diagnostico: 'Chequeo general y vacunación anual',
          tratamiento: 'Vacuna múltiple, desparasitación',
          notas: 'Mascota en buen estado de salud. Peso ideal.',
          foto: 'https://images.unsplash.com/photo-1586671267731-da2cf3ceeb80?w=200'
        },
        { 
          id: 2, 
          mascota: 'Luna', 
          especie: 'Gato', 
          raza: 'Siamés',
          propietario: 'María García',
          fecha: '2024-05-10',
          diagnostico: 'Control de peso y dieta',
          tratamiento: 'Cambio de dieta a alimento light',
          notas: 'Necesita bajar 0.5kg. Seguimiento en 1 mes.',
          foto: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200'
        },
        { 
          id: 3, 
          mascota: 'Rocky', 
          especie: 'Perro', 
          raza: 'Bulldog Francés',
          propietario: 'Carlos López',
          fecha: '2024-04-28',
          diagnostico: 'Problemas respiratorios',
          tratamiento: 'Medicación broncodilatadora',
          notas: 'Evitar ejercicio intenso en días calurosos.',
          foto: 'https://images.unsplash.com/photo-1544568100-847a948585b9?w=200'
        },
        { 
          id: 4, 
          mascota: 'Bella', 
          especie: 'Perro', 
          raza: 'Golden Retriever',
          propietario: 'Ana Martínez',
          fecha: '2024-05-18',
          diagnostico: 'Desparasitación rutinaria',
          tratamiento: 'Aplicación de antiparasitario',
          notas: 'Excelente condición física. Dueña muy comprometida.',
          foto: 'https://images.unsplash.com/photo-1588943211346-0908a1fb0b01?w=200'
        }
      ];
      
      setHistoriales(data);
      setFilteredHistoriales(data);
      
      // Calcular estadísticas
      setStats({
        totalHistoriales: data.length,
        perros: data.filter(h => h.especie === 'Perro').length,
        gatos: data.filter(h => h.especie === 'Gato').length,
        otros: 0,
        ultimoMes: data.filter(h => new Date(h.fecha) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length
      });
      
    } catch (err) {
      setError("Error al cargar los historiales médicos");
      console.error("Error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredHistoriales(historiales);
    } else {
      const filtered = historiales.filter(historial => {
        const searchLower = searchTerm.toLowerCase();
        return (
          historial.mascota.toLowerCase().includes(searchLower) ||
          historial.especie.toLowerCase().includes(searchLower) ||
          historial.diagnostico.toLowerCase().includes(searchLower) ||
          historial.propietario.toLowerCase().includes(searchLower) ||
          historial.tratamiento?.toLowerCase().includes(searchLower)
        );
      });
      setFilteredHistoriales(filtered);
    }
  }, [searchTerm, historiales]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchHistoriales();
  };

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
          <FontAwesomeIcon icon={faNotesMedical} size="2x" color="#FFD700" />
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
              <FontAwesomeIcon icon={faSync} spin /> Cargando...
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
              trend: "up"
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
                {stat.trend === "up" && (
                  <motion.span 
                    className={styles.vetTrendUp}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    ↑ 12%
                  </motion.span>
                )}
                {stat.trend === "steady" && (
                  <span className={styles.vetTrendSteady}>→ 0%</span>
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
                  key={historial.id}
                  className={styles.vetHistorialCard}
                  variants={cardVariants}
                  whileHover="hover"
                  layout
                >
                  <div className={styles.vetHistorialHeader}>
                    <div className={styles.vetHistorialImage}>
                      <img src={historial.foto} alt={historial.mascota} />
                    </div>
                    <div className={styles.vetHistorialTitle}>
                      <h3>{historial.mascota}</h3>
                      <p>{historial.especie} - {historial.raza}</p>
                    </div>
                  </div>

                  <div className={styles.vetHistorialContent}>
                    <div className={styles.vetHistorialDetails}>
                      <div className={styles.vetDetailItem}>
                        <FontAwesomeIcon icon={faUser} />
                        <span>{historial.propietario}</span>
                      </div>
                      <div className={styles.vetDetailItem}>
                        <FontAwesomeIcon icon={faCalendarAlt} />
                        <span>{new Date(historial.fecha).toLocaleDateString()}</span>
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
                    </div>
                  </div>

                  <div className={styles.vetHistorialFooter}>
                    <motion.button
                      className={styles.vetActionButton}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link to={`/veterinario/historiales/${historial.id}`}>
                        <FontAwesomeIcon icon={faEye} />
                        <span>Ver Detalles</span>
                      </Link>
                    </motion.button>
                    
                    <motion.button
                      className={`${styles.vetActionButton} ${styles.vetEditButton}`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link to={`/veterinario/historiales/editar/${historial.id}`}>
                        <FontAwesomeIcon icon={faPlus} />
                        <span>Agregar Notas</span>
                      </Link>
                    </motion.button>
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
                <Link to="/veterinario/nuevo-historial" className={styles.vetAddButtonLink}>
                  <FontAwesomeIcon icon={faPlus} />
                  <span>Crear nuevo historial</span>
                </Link>
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ListaHistoriales;