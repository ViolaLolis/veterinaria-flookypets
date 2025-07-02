import React, { useState, useEffect, useCallback } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import styles from './Style/ListaMascotasStyles.module.css';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEye, faEdit, faPlus, faBan, faUser,
  faPaw, faSearch, faSync, faDog,
  faCat, faVenusMars, faBirthdayCake,
  faWeight, faNotesMedical, faSpinner, faExclamationTriangle
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
  const { showNotification } = useOutletContext(); // Obtener la función de notificación
  const [mascotas, setMascotas] = useState([]);
  const [filteredMascotas, setFilteredMascotas] = useState([]);
  const [stats, setStats] = useState({
    totalMascotas: 0,
    perros: 0,
    gatos: 0,
    otros: 0,
    ultimoMes: 0 // Esto podría ser el número de mascotas registradas el último mes
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchMascotas = useCallback(async () => {
    setLoading(true);
    setRefreshing(true);
    setError(null);
    try {
      const response = await authFetch('/mascotas'); // Endpoint para obtener todas las mascotas
      if (response.success) {
        const fetchedMascotas = response.data.map(mascota => ({
          ...mascota,
          // Asegúrate de que 'edad' y 'ultimaVisita' se manejen correctamente si vienen de la BD
          // Si la BD devuelve 'fecha_nacimiento', calcula la edad aquí
          edad: mascota.edad ? `${mascota.edad} años` : 'N/A', // Asumiendo que 'edad' viene como número de años
          ultimaVisita: mascota.ultima_visita ? new Date(mascota.ultima_visita).toLocaleDateString('es-ES') : 'N/A',
          foto: mascota.imagen_url || `https://placehold.co/100x100/00acc1/ffffff?text=${mascota.nombre.charAt(0)}`,
          historial: mascota.caracteristicas_especiales || 'Sin historial resumido', // Usar caracteristicas_especiales como historial
          propietario: mascota.propietario_nombre // Asegúrate de que el backend devuelva este campo
        }));
        setMascotas(fetchedMascotas);
        setFilteredMascotas(fetchedMascotas);

        // Calcular estadísticas
        const total = fetchedMascotas.length;
        const perros = fetchedMascotas.filter(m => m.especie?.toLowerCase() === 'perro').length;
        const gatos = fetchedMascotas.filter(m => m.especie?.toLowerCase() === 'gato').length;
        const otros = total - perros - gatos;

        // Para 'ultimoMes', necesitarías una columna 'fecha_registro' en la tabla de mascotas
        // o un endpoint específico en el backend. Por ahora, se simulará o se dejará en 0.
        const unMesAtras = new Date();
        unMesAtras.setMonth(unMesAtras.getMonth() - 1);
        const mascotasUltimoMes = fetchedMascotas.filter(m => new Date(m.created_at) > unMesAtras).length; // Asumiendo 'created_at' en mascotas

        setStats({
          totalMascotas: total,
          perros: perros,
          gatos: gatos,
          otros: otros,
          ultimoMes: mascotasUltimoMes
        });

      } else {
        setError(response.message || "Error al cargar las mascotas.");
        showNotification(response.message || "Error al cargar las mascotas.", 'error');
      }
    } catch (err) {
      console.error("Error fetching mascotas:", err);
      setError("Error de conexión al servidor al cargar mascotas.");
      showNotification("Error de conexión al servidor al cargar mascotas.", 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchMascotas();
  }, [fetchMascotas]);

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
          (mascota.propietario && mascota.propietario.toLowerCase().includes(searchLower)) ||
          (mascota.telefono && mascota.telefono.includes(searchTerm)) // Asumiendo que mascota.telefono existe
        );
      });
      setFilteredMascotas(filtered);
    }
  }, [searchTerm, mascotas]);

  const handleRefresh = () => {
    fetchMascotas();
  };

  const handleDisable = async (id_mascota) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta mascota? Esto eliminará también sus historiales médicos y citas asociadas.')) {
      setRefreshing(true);
      try {
        const response = await authFetch(`/mascotas/${id_mascota}`, {
          method: 'DELETE',
        });
        if (response.success) {
          showNotification('Mascota eliminada exitosamente.', 'success');
          fetchMascotas(); // Recargar la lista de mascotas
        } else {
          showNotification(response.message || 'Error al eliminar la mascota.', 'error');
        }
      } catch (err) {
        console.error("Error deleting mascota:", err);
        showNotification('Error de conexión al servidor al eliminar mascota.', 'error');
      } finally {
        setRefreshing(false);
      }
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
          <FontAwesomeIcon icon={faExclamationTriangle} size="2x" color="#dc3545" /> {/* Icono de error */}
        </motion.div>
        <p className={styles.vetErrorMessage}>Error: {error}</p>
        <motion.button
          onClick={handleRefresh}
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
          <Link to="/veterinario/mascotas/registrar" className={styles.vetAddButton}>
            <FontAwesomeIcon icon={faPlus} />
            <span>Registrar Nueva Mascota</span>
          </Link>
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
              label: "Registradas este mes", // Cambiado de "Visitas este mes"
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
                    {/* Icono de tendencia arriba, si lo deseas */}
                  </motion.span>
                )}
                {stat.trend === "steady" && (
                  <span className={styles.vetTrendSteady}></span>
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
                  key={mascota.id_mascota} // Usa id_mascota de la BD
                  className={styles.vetMascotaCard}
                  variants={cardVariants}
                  whileHover="hover"
                  layout
                >
                  <div className={styles.vetMascotaHeader}>
                    <div className={styles.vetMascotaImage}>
                      <img
                        src={mascota.foto}
                        alt={mascota.nombre}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://placehold.co/100x100/00acc1/ffffff?text=${mascota.nombre.charAt(0)}`;
                        }}
                      />
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
                        <span>{mascota.peso} kg</span> {/* Añadir 'kg' */}
                      </div>
                      <div className={styles.vetDetailItem}>
                        <FontAwesomeIcon icon={faUser} /> {/* Icono para propietario */}
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
                      <Link to={`/veterinario/mascotas/${mascota.id_mascota}`}> {/* Usar id_mascota */}
                        <FontAwesomeIcon icon={faEye} />
                        <span>Ver Detalles</span>
                      </Link>
                    </motion.button>

                    <motion.button
                      className={`${styles.vetActionButton} ${styles.vetEditButton}`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link to={`/veterinario/mascotas/editar/${mascota.id_mascota}`}> {/* Usar id_mascota */}
                        <FontAwesomeIcon icon={faEdit} />
                        <span>Editar</span>
                      </Link>
                    </motion.button>

                    <motion.button
                      className={`${styles.vetActionButton} ${styles.vetDisableButton}`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDisable(mascota.id_mascota)}
                    >
                      <FontAwesomeIcon icon={faBan} />
                      <span>Eliminar</span> {/* Cambiado a "Eliminar" */}
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
              <Link to="/veterinario/mascotas/registrar" className={styles.vetAddButton}>
                <FontAwesomeIcon icon={faPlus} />
                <span>Registrar nueva mascota</span>
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ListaMascotasVeterinario;
