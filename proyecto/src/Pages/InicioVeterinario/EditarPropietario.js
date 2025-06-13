// No changes needed for ListaPropietarios.js - it's already set up for veteStyles
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import veteStyles from './Style/EditarPropietarioStyles.module.css'; // This path is correct
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEdit, faPlus, faBan, faUser, faSync, faSearch } from '@fortawesome/free-solid-svg-icons';

// Local data for testing/mocking
const localPropietariosData = [
  {
    id: 1,
    nombre: "Juan",
    apellido: "Pérez",
    email: "juan.perez@example.com",
    telefono: "3001234567",
    tipo_documento: "CC",
    numero_documento: "1012345678",
  },
  {
    id: 2,
    nombre: "María",
    apellido: "González",
    email: "maria.gonzalez@example.com",
    telefono: "3109876543",
    tipo_documento: "TI",
    numero_documento: "9876543210",
  },
  {
    id: 3,
    nombre: "Carlos",
    apellido: "Rodríguez",
    email: "carlos.r@example.com",
    telefono: "3201122334",
    tipo_documento: "CE",
    numero_documento: "5432109876",
  },
  {
    id: 4,
    nombre: "Ana",
    apellido: "Martínez",
    email: "ana.m@example.com",
    telefono: "3055678901",
    tipo_documento: "CC",
    numero_documento: "1122334455",
  },
];

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
    boxShadow: "0 8px 15px rgba(0, 172, 193, 0.2)", // Using the teal color for shadow
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

  // Modified fetchPropietarios to use local data
  const fetchPropietarios = async () => {
    setLoading(true); // Ensure loading state is true when fetching (even local)
    setError(null); // Clear previous errors
    // Simulate an API call delay
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate 0.5 second delay

    try {
      setPropietarios(localPropietariosData);
      setFilteredPropietarios(localPropietariosData);
    } catch (err) {
      // This catch might not be strictly necessary for local data, but good practice
      setError("Error al cargar los propietarios desde los datos locales.");
      console.error("Error loading local data:", err);
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
      const searchLower = searchTerm.toLowerCase();
      const filtered = propietarios.filter(propietario => {
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
    fetchPropietarios(); // Re-fetch (or re-load local data)
  };

  const handleDisable = (id) => {
    if (window.confirm('¿Estás seguro de que deseas deshabilitar este propietario? (Esta acción es solo de ejemplo para datos locales)')) {
      setRefreshing(true);
      // Simulate an API call for disabling
      setTimeout(() => {
        setPropietarios(prevPropietarios =>
          prevPropietarios.filter(prop => prop.id !== id)
        );
        // Also update filtered list
        setFilteredPropietarios(prevFiltered =>
          prevFiltered.filter(prop => prop.id !== id)
        );
        alert('Propietario deshabilitado (simulado) correctamente');
        setRefreshing(false);
      }, 500); // Simulate network delay for disabling
    }
  };

  if (loading) {
    return (
      <div className={veteStyles.veteLoadingContainer}> {/* Using veteStyles */}
        <div className={veteStyles.veteSpinner}></div> {/* Using veteStyles */}
        <p>Cargando propietarios...</p>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        className={veteStyles.veteErrorContainer} /* Using veteStyles */
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className={veteStyles.veteErrorMessage}> {/* Using veteStyles */}
          Error al cargar los propietarios: {error}
        </div>
        <button
          className={veteStyles.veteRetryButton} /* Using veteStyles */
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
      className={veteStyles.veteContainer} /* Using veteStyles */
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className={veteStyles.veteHeader} /* Using veteStyles */
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <h1>
          <FontAwesomeIcon icon={faUser} className={veteStyles.veteTitleIcon} /> {/* Using veteStyles */}
          Lista de Propietarios
        </h1>

        <div className={veteStyles.veteHeaderActions}> {/* Using veteStyles */}
          <motion.button
            onClick={handleRefresh}
            className={veteStyles.veteRefreshButton} /* Using veteStyles */
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={refreshing}
          >
            <FontAwesomeIcon icon={faSync} spin={refreshing} />
            {refreshing ? ' Actualizando...' : ' Actualizar'}
          </motion.button>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            {/* Note: The "Registrar" link will still navigate, but without a backend,
                the registration won't persist locally. */}
            <Link to="/veterinario/propietarios/registrar" className={veteStyles.veteAddButton}> {/* Using veteStyles */}
              <FontAwesomeIcon icon={faPlus} /> Nuevo Propietario
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Barra de búsqueda */}
      <motion.div
        className={veteStyles.veteSearchContainer} /* Using veteStyles */
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <FontAwesomeIcon icon={faSearch} className={veteStyles.veteSearchIcon} /> {/* Using veteStyles */}
        <input
          type="text"
          className={veteStyles.veteSearchInput} /* Using veteStyles */
          placeholder="Buscar propietarios por nombre, email o documento..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </motion.div>

      <AnimatePresence>
        {filteredPropietarios.length > 0 ? (
          <ul className={veteStyles.vetePropietariosList}> {/* Using veteStyles */}
            {filteredPropietarios.map((propietario) => (
              <motion.li
                key={propietario.id}
                className={veteStyles.vetePropietarioCard} /* Using veteStyles */
                variants={itemVariants}
                whileHover="hover"
                whileTap="tap"
                layout
              >
                <div className={veteStyles.vetePropietarioInfo}> {/* Using veteStyles */}
                  <div className={veteStyles.veteAvatar}> {/* Using veteStyles */}
                    {propietario.nombre.charAt(0)}
                  </div>
                  <div className={veteStyles.veteDetails}> {/* Using veteStyles */}
                    <h3>{propietario.nombre} {propietario.apellido}</h3>
                    <p><strong>Teléfono:</strong> {propietario.telefono}</p>
                    <p><strong>Email:</strong> {propietario.email}</p>
                    <p><strong>Documento:</strong> {propietario.tipo_documento} {propietario.numero_documento}</p>
                  </div>
                </div>

                <div className={veteStyles.veteActions}> {/* Using veteStyles */}
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    {/* These links will still navigate, but detail/edit pages
                        will need similar local data handling or mock data */}
                    <Link
                      to={`/veterinario/propietarios/${propietario.id}`}
                      className={veteStyles.veteActionButton} /* Using veteStyles */
                      title="Ver detalles"
                    >
                      <FontAwesomeIcon icon={faEye} />
                    </Link>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Link
                      to={`/veterinario/propietarios/editar/${propietario.id}`}
                      className={`${veteStyles.veteActionButton} ${veteStyles.veteEditButton}`} /* Using veteStyles */
                      title="Editar"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </Link>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <button
                      className={`${veteStyles.veteActionButton} ${veteStyles.veteDisableButton}`} /* Using veteStyles */
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
            className={veteStyles.veteEmptyState} /* Using veteStyles */
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            exit={{ opacity: 0 }}
          >
            <div className={veteStyles.veteEmptyIllustration}> {/* Using veteStyles */}
              <FontAwesomeIcon icon={faUser} size="3x" />
            </div>
            <h3>No se encontraron propietarios</h3>
            <p>No hay resultados que coincidan con "{searchTerm}"</p>
            <Link to="/veterinario/propietarios/registrar" className={veteStyles.veteAddButton}> {/* Using veteStyles */}
              <FontAwesomeIcon icon={faPlus} /> Registrar nuevo propietario
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ListaPropietarios;