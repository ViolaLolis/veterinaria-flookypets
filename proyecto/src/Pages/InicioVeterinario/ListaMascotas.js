import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './Style/ListaMascotasStyles.module.css';
import { motion} from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEye, faEdit, faPlus, faBan, 
  faPaw, faSearch, faSync, faDog, 
  faCat, faVenusMars, faBirthdayCake,
  faWeight, faNotesMedical
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
    boxShadow: "0 10px 25px rgba(0, 188, 212, 0.2)",
    transition: { duration: 0.3 }
  }
};

const statCardVariants = {
  hover: {
    y: -5,
    boxShadow: "0 10px 20px rgba(0, 188, 212, 0.2)",
    transition: { duration: 0.2 }
  }
};

const ListaMascotasVeterinario = () => {
  const [mascotas, setMascotas] = useState([]);
  const [filteredMascotas, setFilteredMascotas] = useState([]);
  const [stats, setStats] = useState({
    totalMascotas: 0,
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
    fetchMascotas();
  }, []);

  const fetchMascotas = async () => {
    setLoading(true);
    setRefreshing(true);
    try {
      // Simulación de datos
      await new Promise(resolve => setTimeout(resolve, 800));
      const data = [
        { 
          id: 1, 
          nombre: 'Max', 
          especie: 'Perro', 
          raza: 'Labrador Retriever', 
          edad: '3 años',
          peso: '28 kg',
          sexo: 'Macho',
          propietario: 'Juan Pérez',
          telefono: '3001234567',
          ultimaVisita: '2024-05-15',
          foto: 'https://images.unsplash.com/photo-1586671267731-da2cf3ceeb80?w=200',
          historial: 'Vacunación al día. Control anual pendiente.'
        },
        { 
          id: 2, 
          nombre: 'Luna', 
          especie: 'Gato', 
          raza: 'Siamés', 
          edad: '2 años',
          peso: '4.5 kg',
          sexo: 'Hembra',
          propietario: 'María García',
          telefono: '3109876543',
          ultimaVisita: '2024-05-10',
          foto: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200',
          historial: 'Vacuna antirrábica pendiente. Dieta especial.'
        },
        { 
          id: 3, 
          nombre: 'Rocky', 
          especie: 'Perro', 
          raza: 'Bulldog Francés', 
          edad: '4 años',
          peso: '12 kg',
          sexo: 'Macho',
          propietario: 'Carlos López',
          telefono: '3201122334',
          ultimaVisita: '2024-04-28',
          foto: 'https://images.unsplash.com/photo-1544568100-847a948585b9?w=200',
          historial: 'Control de peso mensual. Problemas respiratorios.'
        },
        { 
          id: 4, 
          nombre: 'Bella', 
          especie: 'Perro', 
          raza: 'Golden Retriever', 
          edad: '5 años',
          peso: '30 kg',
          sexo: 'Hembra',
          propietario: 'Ana Martínez',
          telefono: '3055678901',
          ultimaVisita: '2024-05-18',
          foto: 'https://images.unsplash.com/photo-1588943211346-0908a1fb0b01?w=200',
          historial: 'Desparasitación reciente. Excelente condición física.'
        }
      ];
      
      setMascotas(data);
      setFilteredMascotas(data);
      
      // Calcular estadísticas
      setStats({
        totalMascotas: data.length,
        perros: data.filter(m => m.especie === 'Perro').length,
        gatos: data.filter(m => m.especie === 'Gato').length,
        otros: 0,
        ultimoMes: data.filter(m => new Date(m.ultimaVisita) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length
      });
      
    } catch (err) {
      setError("Error al cargar las mascotas");
      console.error("Error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

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
          mascota.propietario.toLowerCase().includes(searchLower) ||
          mascota.telefono.includes(searchTerm)
        );
      });
      setFilteredMascotas(filtered);
    }
  }, [searchTerm, mascotas]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMascotas();
  };

  const handleDisable = (id) => {
    if (window.confirm('¿Estás seguro de que deseas deshabilitar esta mascota?')) {
      setRefreshing(true);
      setTimeout(() => {
        setMascotas(prev => prev.filter(m => m.id !== id));
        setFilteredMascotas(prev => prev.filter(m => m.id !== id));
        setRefreshing(false);
      }, 500);
    }
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
          <FontAwesomeIcon icon={faPaw} size="3x" color="#00bcd4" />
        </motion.div>
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className={styles.vetLoadingText}
        >
          Cargando mascotas...
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
          <FontAwesomeIcon icon={faPaw} size="2x" color="#00bcd4" />
        </motion.div>
        <p className={styles.vetErrorMessage}>Error: {error}</p>
        <motion.button 
          onClick={fetchMascotas}
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
            placeholder="Buscar mascotas por nombre, especie, raza o dueño..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            whileFocus={{ 
              boxShadow: "0 0 0 2px rgba(0, 188, 212, 0.3)",
              borderColor: "#00bcd4"
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
              icon: faPaw, 
              value: stats.totalMascotas, 
              label: "Mascotas totales",
              color: "#00bcd4",
              bgColor: "rgba(0, 188, 212, 0.1)",
              trend: "up"
            },
            { 
              icon: faDog, 
              value: stats.perros, 
              label: "Perros registrados",
              color: "#4CAF50",
              bgColor: "rgba(76, 175, 80, 0.1)",
              trend: "up"
            },
            { 
              icon: faCat, 
              value: stats.gatos, 
              label: "Gatos registrados",
              color: "#FF9800",
              bgColor: "rgba(255, 152, 0, 0.1)",
              trend: "steady"
            },
            { 
              icon: faNotesMedical, 
              value: stats.ultimoMes, 
              label: "Visitas este mes",
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

        {/* Lista de mascotas */}
        <div className={styles.vetMascotasSection}>
          <div className={styles.vetSectionHeader}>
            <div className={styles.vetSectionTitle}>
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
              >
                <FontAwesomeIcon icon={faPaw} className={styles.vetSectionIcon} />
              </motion.div>
              <h2>Lista de Mascotas</h2>
            </div>
          </div>

          {filteredMascotas.length > 0 ? (
            <motion.div 
              className={styles.vetMascotasGrid}
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
              {filteredMascotas.map((mascota) => (
                <motion.div
                  key={mascota.id}
                  className={styles.vetMascotaCard}
                  variants={cardVariants}
                  whileHover="hover"
                  layout
                >
                  <div className={styles.vetMascotaHeader}>
                    <div className={styles.vetMascotaImage}>
                      <img src={mascota.foto} alt={mascota.nombre} />
                    </div>
                    <div className={styles.vetMascotaTitle}>
                      <h3>{mascota.nombre}</h3>
                      <p>{mascota.especie} - {mascota.raza}</p>
                    </div>
                  </div>

                  <div className={styles.vetMascotaContent}>
                    <div className={styles.vetMascotaDetails}>
                      <div className={styles.vetDetailItem}>
                        <FontAwesomeIcon icon={faVenusMars} />
                        <span>{mascota.sexo}</span>
                      </div>
                      <div className={styles.vetDetailItem}>
                        <FontAwesomeIcon icon={faBirthdayCake} />
                        <span>{mascota.edad}</span>
                      </div>
                      <div className={styles.vetDetailItem}>
                        <FontAwesomeIcon icon={faWeight} />
                        <span>{mascota.peso}</span>
                      </div>
                      <div className={styles.vetDetailItem}>
                        
                        <span>{mascota.propietario}</span>
                      </div>
                      {mascota.historial && (
                        <div className={styles.vetDetailItem}>
                          <FontAwesomeIcon icon={faNotesMedical} />
                          <span className={styles.vetNotes}>{mascota.historial}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={styles.vetMascotaFooter}>
                    <motion.button
                      className={styles.vetActionButton}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link to={`/veterinario/mascotas/${mascota.id}`}>
                        <FontAwesomeIcon icon={faEye} />
                        <span>Ver Detalles</span>
                      </Link>
                    </motion.button>
                    
                    <motion.button
                      className={`${styles.vetActionButton} ${styles.vetEditButton}`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link to={`/veterinario/mascotas/editar/${mascota.id}`}>
                        <FontAwesomeIcon icon={faEdit} />
                        <span>Editar</span>
                      </Link>
                    </motion.button>
                    
                    <motion.button
                      className={`${styles.vetActionButton} ${styles.vetDisableButton}`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDisable(mascota.id)}
                    >
                      <FontAwesomeIcon icon={faBan} />
                      <span>Deshabilitar</span>
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              className={styles.vetNoMascotas}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring" }}
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
              >
                <FontAwesomeIcon icon={faPaw} size="3x" className={styles.vetNoMascotasIcon} />
              </motion.div>
              <h3>No se encontraron mascotas</h3>
              <p>
                {searchTerm ? 
                'No hay resultados que coincidan con tu búsqueda.' : 
                'No hay mascotas registradas en el sistema.'}
              </p>
              <motion.button 
                className={styles.vetAddButton}
                
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FontAwesomeIcon icon={faPlus} />
                <span>Registrar nueva mascota</span>
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ListaMascotasVeterinario;