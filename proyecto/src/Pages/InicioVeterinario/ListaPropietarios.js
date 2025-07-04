import React, { useState, useEffect, useCallback } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import veteStyles from './Style/ListaPropietariosStyles.module.css'; // Asegúrate de que este CSS exista
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEye, faEdit, faPlus, faTrashAlt, faUser, faSync, faSearch, faSpinner, faTimesCircle, faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { authFetch } from './api'; // Asegúrate de que la ruta sea correcta a tu archivo api.js

// Variantes de Framer Motion
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.08
    }
  }
};

const itemVariants = {
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
    scale: 1.02,
    boxShadow: "0 8px 20px rgba(0, 172, 193, 0.25)",
    transition: { duration: 0.2 }
  },
  tap: { scale: 0.98 }
};

const buttonVariants = {
  hover: { scale: 1.05, boxShadow: '0 5px 15px rgba(0, 172, 193, 0.2)' },
  tap: { scale: 0.95 },
};

const ListaPropietarios = () => {
  const { showNotification } = useOutletContext(); // Para mostrar notificaciones
  const [propietarios, setPropietarios] = useState([]);
  const [filteredPropietarios, setFilteredPropietarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [propietarioToDelete, setPropietarioToDelete] = useState(null);

  const fetchPropietarios = useCallback(async () => {
    setLoading(true);
    setError(null);
    setRefreshing(true);
    try {
      // Usamos la ruta /usuarios que ya filtra por rol 'usuario' en el backend
      const response = await authFetch('/usuarios');
      if (response.success) {
        // Asegúrate de que el backend envía 'num_mascotas' o similar, si no, puedes calcularlo aquí
        const ownersWithPetCount = response.data.map(owner => ({
          ...owner,
          num_mascotas: owner.mascotas ? owner.mascotas.length : 0 // Asumiendo que el campo es 'mascotas' y es un array
        }));
        setPropietarios(ownersWithPetCount);
        setFilteredPropietarios(ownersWithPetCount); // Inicialmente, los filtrados son todos
      } else {
        setError(response.message || "Error al cargar los propietarios.");
        if (showNotification) showNotification(response.message || "Error al cargar los propietarios.", 'error');
      }
    } catch (err) {
      console.error("Error fetching propietarios:", err);
      setError("Error de conexión al servidor al cargar los propietarios.");
      if (showNotification) showNotification("Error de conexión al servidor al cargar los propietarios.", 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchPropietarios();
  }, [fetchPropietarios]);

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
          (propietario.telefono && propietario.telefono.includes(searchTerm)) ||
          (propietario.numero_documento && propietario.numero_documento.includes(searchTerm))
        );
      });
      setFilteredPropietarios(filtered);
    }
  }, [searchTerm, propietarios]);

  const handleRefresh = () => {
    fetchPropietarios();
  };

  const handleDeleteClick = (propietario) => {
    setPropietarioToDelete(propietario);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    setShowConfirmModal(false);
    if (!propietarioToDelete) return;

    setRefreshing(true); // Usamos refreshing para indicar que estamos en una operación
    try {
      const response = await authFetch(`/usuarios/${propietarioToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.success) {
        showNotification('Propietario eliminado exitosamente.', 'success');
        // Actualizar la lista de propietarios en el UI
        setPropietarios(prevPropietarios =>
          prevPropietarios.filter(prop => prop.id !== propietarioToDelete.id)
        );
      } else {
        setError(response.message || 'Error al eliminar el propietario.');
        if (showNotification) showNotification(response.message || 'Error al eliminar el propietario.', 'error');
      }
    } catch (err) {
      console.error("Error deleting propietario:", err);
      setError('Error de conexión al servidor al eliminar el propietario.');
      if (showNotification) showNotification('Error de conexión al servidor al eliminar el propietario.', 'error');
    } finally {
      setRefreshing(false);
      setPropietarioToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmModal(false);
    setPropietarioToDelete(null);
  };

  if (loading) {
    return (
      <div className={veteStyles.veteLoadingContainer}>
        <FontAwesomeIcon icon={faSpinner} spin size="3x" className={veteStyles.veteSpinner} />
        <p>Cargando propietarios...</p>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        className={veteStyles.veteErrorContainer}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className={veteStyles.veteErrorMessage}>
          <FontAwesomeIcon icon={faExclamationTriangle} size="2x" className={veteStyles.veteErrorIcon} />
          <p>Error al cargar los propietarios: {error}</p>
        </div>
        <motion.button
          className={veteStyles.veteRetryButton}
          onClick={handleRefresh}
          disabled={refreshing}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          {refreshing ? (
            <>
              <FontAwesomeIcon icon={faSync} spin /> Cargando...
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faSync} /> Reintentar
            </>
          )}
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={veteStyles.veteContainer}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className={veteStyles.veteHeader}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <h1>
          <FontAwesomeIcon icon={faUser} className={veteStyles.veteTitleIcon} />
          Lista de Propietarios
        </h1>

        <div className={veteStyles.veteHeaderActions}>
          <motion.button
            onClick={handleRefresh}
            className={veteStyles.veteRefreshButton}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            disabled={refreshing}
          >
            <FontAwesomeIcon icon={faSync} spin={refreshing} />
            {refreshing ? ' Actualizando...' : ' Actualizar'}
          </motion.button>

          <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
            <Link to="/veterinario/propietarios/registrar" className={veteStyles.veteAddButton}>
              <FontAwesomeIcon icon={faPlus} /> Nuevo Propietario
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Barra de búsqueda */}
      <motion.div
        className={veteStyles.veteSearchContainer}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <FontAwesomeIcon icon={faSearch} className={veteStyles.veteSearchIcon} />
        <input
          type="text"
          className={veteStyles.veteSearchInput}
          placeholder="Buscar propietarios por nombre, email o documento..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </motion.div>

      <AnimatePresence mode='wait'> {/* 'wait' mode para transiciones de salida */}
        {filteredPropietarios.length > 0 ? (
          <ul className={veteStyles.vetePropietariosList}>
            {filteredPropietarios.map((propietario) => (
              <motion.li
                key={propietario.id}
                className={veteStyles.vetePropietarioCard}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="hidden" // Para que desaparezcan suavemente
                whileHover="hover"
                whileTap="tap"
                layout // Para animar los cambios de posición al filtrar
              >
                <div className={veteStyles.vetePropietarioInfo}>
                  <div className={veteStyles.veteAvatar}>
                    {/* Mostrar imagen de perfil o inicial */}
                    {propietario.imagen_url ? (
                      <img
                        src={propietario.imagen_url}
                        alt="Avatar"
                        className={veteStyles.veteProfileImage}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://placehold.co/50x50/00acc1/ffffff?text=${propietario.nombre?.charAt(0) || 'P'}`;
                        }}
                      />
                    ) : (
                      propietario.nombre?.charAt(0) || 'P'
                    )}
                  </div>
                  <div className={veteStyles.veteDetails}>
                    <h3>{propietario.nombre} {propietario.apellido}</h3>
                    <p><strong>Teléfono:</strong> {propietario.telefono || 'N/A'}</p>
                    <p><strong>Email:</strong> {propietario.email || 'N/A'}</p>
                    <p><strong>Documento:</strong> {propietario.tipo_documento || 'N/A'} {propietario.numero_documento || 'N/A'}</p>
                    <p><strong>Mascotas:</strong> {propietario.num_mascotas !== undefined ? propietario.num_mascotas : 'Cargando...'}</p>
                  </div>
                </div>

                <div className={veteStyles.veteActions}>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Link
                      to={`/veterinario/propietarios/${propietario.id}`}
                      className={veteStyles.veteActionButton}
                      title="Ver detalles"
                    >
                      <FontAwesomeIcon icon={faEye} />
                    </Link>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Link
                      to={`/veterinario/propietarios/editar/${propietario.id}`}
                      className={`${veteStyles.veteActionButton} ${veteStyles.veteEditButton}`}
                      title="Editar"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </Link>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <button
                      className={`${veteStyles.veteActionButton} ${veteStyles.veteDeleteButton}`}
                      title="Eliminar"
                      onClick={() => handleDeleteClick(propietario)}
                      disabled={refreshing} // Deshabilita el botón mientras se elimina
                    >
                      <FontAwesomeIcon icon={faTrashAlt} />
                    </button>
                  </motion.div>
                </div>
              </motion.li>
            ))}
          </ul>
        ) : (
          <motion.div
            className={veteStyles.veteEmptyState}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            exit={{ opacity: 0 }}
          >
            <div className={veteStyles.veteEmptyIllustration}>
              <FontAwesomeIcon icon={faUser} size="3x" />
            </div>
            <h3>No se encontraron propietarios</h3>
            {searchTerm && <p>No hay resultados que coincidan con "{searchTerm}"</p>}
            <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
              <Link to="/veterinario/propietarios/registrar" className={veteStyles.veteAddButton}>
                <FontAwesomeIcon icon={faPlus} /> Registrar nuevo propietario
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Confirmación de Eliminación */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            className={veteStyles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCancelDelete} // Cierra el modal al hacer clic fuera
          >
            <motion.div
              className={veteStyles.modalContent}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()} // Evita que el clic se propague al overlay
            >
              <h3>Confirmar Eliminación</h3>
              <p>
                ¿Estás seguro de que deseas eliminar a{' '}
                <strong>{propietarioToDelete?.nombre} {propietarioToDelete?.apellido}</strong>?
                Esta acción es irreversible y eliminará también sus mascotas y historiales médicos asociados.
              </p>
              <div className={veteStyles.modalActions}>
                <motion.button
                  className={veteStyles.cancelButton}
                  onClick={handleCancelDelete}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <FontAwesomeIcon icon={faTimesCircle} /> Cancelar
                </motion.button>
                <motion.button
                  className={veteStyles.confirmDeleteButton}
                  onClick={handleConfirmDelete}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  disabled={refreshing} // Deshabilita el botón mientras se elimina
                >
                  {refreshing ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin /> Eliminando...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faTrashAlt} /> Eliminar
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ListaPropietarios;