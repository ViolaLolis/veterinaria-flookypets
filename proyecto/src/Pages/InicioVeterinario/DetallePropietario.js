import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import veteStyles from './Style/DetallePropietarioStyles.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { motion } from 'framer-motion';
import { faArrowLeft, faUser, faPhone, faEnvelope, faMapMarkerAlt, faPaw } from '@fortawesome/free-solid-svg-icons'; // Added faSpinner

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
    backgroundColor: '#00acc1', // Use the primary color directly
    color: 'white',
    boxShadow: '0 5px 15px rgba(0, 172, 193, 0.3)'
  },
  tap: { scale: 0.95 }
};

const DetallePropietario = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [propietario, setPropietario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simulate API call to fetch owner details
    setTimeout(() => {
      try {
        const propietarioData = {
          id: parseInt(id),
          nombre: 'Ana Pérez',
          telefono: '3101234567',
          email: 'ana.perez@example.com',
          direccion: 'Calle Falsa 123, Bogotá D.C.', // Updated address
          mascotas: ['Max (Labrador)', 'Lola (Siamesa)', 'Rocky (Pastor Alemán)'], // Added another pet
          registro: 'Registrado desde: 15/03/2020'
        };
        if (propietarioData.id === parseInt(id)) {
          setPropietario(propietarioData);
          setLoading(false);
        } else {
          throw new Error('Propietario no encontrado');
        }
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }, 800);
  }, [id]);

  const handleVolver = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className={veteStyles.veteLoadingContainer}> {/* Using veteStyles */}
        <div className={veteStyles.veteLoadingSpinner}></div> {/* Using veteStyles */}
        <p>Cargando detalles del propietario...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={veteStyles.veteErrorContainer}> {/* Using veteStyles */}
        <h3>Error</h3>
        <p>{error}</p>
        <motion.button
          onClick={handleVolver}
          className={veteStyles.veteVolverBtn} /* Using veteStyles */
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
      <div className={veteStyles.veteErrorContainer}> {/* Using veteStyles */}
        <p>Propietario no encontrado.</p>
        <motion.button
          onClick={handleVolver}
          className={veteStyles.veteVolverBtn} /* Using veteStyles */
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Volver
        </motion.button>
      </div>
    );
  }

  return (
    <motion.div
      className={veteStyles.veteDetalleContainer} /* Using veteStyles */
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className={veteStyles.veteHeader}> {/* Using veteStyles */}
        <motion.button
          onClick={handleVolver}
          className={veteStyles.veteVolverBtn} /* Using veteStyles */
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Volver
        </motion.button>
        <h2><FontAwesomeIcon icon={faUser} /> Detalle del Propietario</h2>
      </div>

      <div className={veteStyles.veteDetalleInfo}> {/* Using veteStyles */}
        <motion.p variants={itemVariants}>
          <strong><FontAwesomeIcon icon={faUser} /> Nombre:</strong> {propietario.nombre}
        </motion.p>

        <motion.p variants={itemVariants}>
          <strong><FontAwesomeIcon icon={faPhone} /> Teléfono:</strong> <a href={`tel:${propietario.telefono}`}>{propietario.telefono}</a> {/* Made clickable */}
        </motion.p>

        <motion.p variants={itemVariants}>
          <strong><FontAwesomeIcon icon={faEnvelope} /> Email:</strong> <a href={`mailto:${propietario.email}`}>{propietario.email}</a> {/* Made clickable */}
        </motion.p>

        <motion.p variants={itemVariants}>
          <strong><FontAwesomeIcon icon={faMapMarkerAlt} /> Dirección:</strong> {propietario.direccion}
        </motion.p>

        {propietario.registro && (
          <motion.p variants={itemVariants}>
            <strong>Registro:</strong> {propietario.registro}
          </motion.p>
        )}

        {propietario.mascotas && propietario.mascotas.length > 0 && (
          <motion.div
            className={veteStyles.veteMascotasSection} /* Using veteStyles */
            variants={itemVariants}
          >
            <h3><FontAwesomeIcon icon={faPaw} /> Mascotas:</h3>
            <div className={veteStyles.veteMascotasList}> {/* Using veteStyles */}
              {propietario.mascotas.map((mascota, index) => (
                <motion.span
                  key={index}
                  className={veteStyles.veteMascotaItem} /* Using veteStyles */
                  variants={mascotaVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  {mascota}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default DetallePropietario;