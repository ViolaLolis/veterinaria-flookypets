import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import veteStyles from './Style/DetallePropietarioStyles.module.css'; // Asegúrate de que este CSS exista
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { motion } from 'framer-motion';
import {
  faArrowLeft, faUser, faPhone, faEnvelope, faMapMarkerAlt, faPaw,
  faSpinner, faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { authFetch } from './api'; // Asegúrate de que la ruta sea correcta a tu archivo api.js

const containerVariants = {
  hidden: { opacity: 0, x: '-100vw' },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring',
      delay: 0.2,
      damping: 20,
      stiffness: 100,
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  },
  exit: {
    x: '100vw',
    transition: {
      ease: 'easeInOut',
      duration: 0.3
    }
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
};

const mascotaVariants = {
  hover: {
    y: -5,
    backgroundColor: '#00acc1', // Usar el color primario directamente
    color: 'white',
    boxShadow: '0 5px 15px rgba(0, 172, 193, 0.3)'
  },
  tap: { scale: 0.95 }
};

const DetallePropietario = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Obtener el ID del propietario de la URL
  const { showNotification } = useOutletContext(); // Para mostrar notificaciones

  const [propietario, setPropietario] = useState(null);
  const [mascotas, setMascotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPropietarioDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Obtener detalles del propietario
      const propietarioResponse = await authFetch(`/usuarios/${id}`);
      if (propietarioResponse.success) {
        setPropietario(propietarioResponse.data);

        // Obtener mascotas del propietario
        const mascotasResponse = await authFetch(`/mascotas?id_propietario=${id}`);
        if (mascotasResponse.success) {
          setMascotas(mascotasResponse.data);
        } else {
          console.warn("No se pudieron cargar las mascotas para este propietario:", mascotasResponse.message);
          setMascotas([]); // Asegurarse de que el estado de mascotas esté vacío si hay un error
          showNotification(mascotasResponse.message || "Error al cargar mascotas del propietario.", 'warning');
        }
      } else {
        setError(propietarioResponse.message || 'Propietario no encontrado.');
        showNotification(propietarioResponse.message || 'Propietario no encontrado.', 'error');
      }
    } catch (err) {
      console.error("Error fetching propietario details or pets:", err);
      setError('Error de conexión al servidor al cargar los detalles del propietario.');
      showNotification('Error de conexión al servidor al cargar los detalles del propietario.', 'error');
    } finally {
      setLoading(false);
    }
  }, [id, showNotification]);

  useEffect(() => {
    fetchPropietarioDetails();
  }, [fetchPropietarioDetails]);

  const handleVolver = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className={veteStyles.veteLoadingContainer}>
        <FontAwesomeIcon icon={faSpinner} spin size="3x" className={veteStyles.veteLoadingSpinner} />
        <p>Cargando detalles del propietario...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={veteStyles.veteErrorContainer}>
        <h3><FontAwesomeIcon icon={faExclamationTriangle} /> Error</h3>
        <p>{error}</p>
        <motion.button
          onClick={handleVolver}
          className={veteStyles.veteVolverBtn}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Volver
        </motion.button>
      </div>
    );
  }

  if (!propietario) {
    return (
      <div className={veteStyles.veteErrorContainer}>
        <p>Propietario no encontrado.</p>
        <motion.button
          onClick={handleVolver}
          className={veteStyles.veteVolverBtn}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Volver
        </motion.button>
      </div>
    );
  }

  // Fallback para la imagen de perfil si no hay URL o si falla la carga
  const profileImageUrl = propietario.imagen_url || `https://placehold.co/150x150/00acc1/ffffff?text=${propietario.nombre?.charAt(0) || 'P'}`;

  return (
    <motion.div
      className={veteStyles.veteDetalleContainer}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className={veteStyles.veteHeader}>
        <motion.button
          onClick={handleVolver}
          className={veteStyles.veteVolverBtn}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Volver
        </motion.button>
        <h2><FontAwesomeIcon icon={faUser} /> Detalle del Propietario</h2>
      </div>

      <div className={veteStyles.veteProfileImageSection}>
        <img
          src={profileImageUrl}
          alt="Imagen de Perfil"
          className={veteStyles.veteProfileImage}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://placehold.co/150x150/00acc1/ffffff?text=${propietario.nombre?.charAt(0) || 'P'}`;
          }}
        />
      </div>

      <div className={veteStyles.veteDetalleInfo}>
        <motion.p variants={itemVariants}>
          <strong><FontAwesomeIcon icon={faUser} /> Nombre:</strong> {propietario.nombre} {propietario.apellido}
        </motion.p>

        <motion.p variants={itemVariants}>
          <strong><FontAwesomeIcon icon={faPhone} /> Teléfono:</strong> <a href={`tel:${propietario.telefono}`}>{propietario.telefono}</a>
        </motion.p>

        <motion.p variants={itemVariants}>
          <strong><FontAwesomeIcon icon={faEnvelope} /> Email:</strong> <a href={`mailto:${propietario.email}`}>{propietario.email}</a>
        </motion.p>

        <motion.p variants={itemVariants}>
          <strong><FontAwesomeIcon icon={faMapMarkerAlt} /> Dirección:</strong> {propietario.direccion}
        </motion.p>

        <motion.p variants={itemVariants}>
          <strong>Tipo Documento:</strong> {propietario.tipo_documento || 'N/A'}
        </motion.p>
        <motion.p variants={itemVariants}>
          <strong>Número Documento:</strong> {propietario.numero_documento || 'N/A'}
        </motion.p>
        <motion.p variants={itemVariants}>
          <strong>Fecha Nacimiento:</strong> {propietario.fecha_nacimiento ? new Date(propietario.fecha_nacimiento).toLocaleDateString() : 'N/A'}
        </motion.p>

        {mascotas.length > 0 && (
          <motion.div
            className={veteStyles.veteMascotasSection}
            variants={itemVariants}
          >
            <h3><FontAwesomeIcon icon={faPaw} /> Mascotas:</h3>
            <div className={veteStyles.veteMascotasList}>
              {mascotas.map((mascota) => (
                <motion.span
                  key={mascota.id_mascota}
                  className={veteStyles.veteMascotaItem}
                  variants={mascotaVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  {mascota.nombre} ({mascota.especie})
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}
        {mascotas.length === 0 && (
          <motion.div className={veteStyles.veteMascotasSection} variants={itemVariants}>
            <p className={veteStyles.noMascotasMessage}>Este propietario aún no tiene mascotas registradas.</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default DetallePropietario;
