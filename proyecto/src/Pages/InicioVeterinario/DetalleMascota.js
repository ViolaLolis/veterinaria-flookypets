import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import veteStyles from './Style/DetalleMascotaStyles.module.css';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faPaw,
  faDog,
  faCat,
  faVenusMars,
  faCalendarAlt,
  faUser,
  faFileMedical,
  faPills,
  faNotesMedical // Added for loading state
} from '@fortawesome/free-solid-svg-icons';

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

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  hover: {
    y: -5,
    boxShadow: '0 10px 20px rgba(0, 172, 193, 0.2)' // Enhanced shadow with teal
  }
};

const DetalleMascota = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [mascota, setMascota] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simulate API call to fetch pet details
    setTimeout(() => {
      try {
        const mascotaData = {
          id: parseInt(id),
          nombre: 'Max',
          especie: 'Perro',
          raza: 'Labrador Retriever',
          sexo: 'Macho',
          fechaNacimiento: '10/05/2020',
          edad: '4 años', // Updated age based on current date (June 2025)
          propietario: 'Ana Pérez',
          telefonoPropietario: '3101234567',
          ultimaVisita: '01/04/2024', // Updated last visit
          alergias: 'Ninguna conocida',
          peso: '28 kg',
          condicionMedica: 'Saludable',
          medicamentosActuales: 'Ninguno'
        };
        if (mascotaData.id === parseInt(id)) {
          setMascota(mascotaData);
          setLoading(false);
        } else {
          throw new Error('Mascota no encontrada');
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

  const getEspecieIcon = () => {
    return mascota.especie.toLowerCase() === 'perro' ? faDog : faCat;
  };

  if (loading) {
    return (
      <div className={veteStyles.veteLoadingContainer}> {/* Corrected class */}
        <div className={veteStyles.veteLoadingSpinner}></div> {/* Corrected class */}
        <p>Cargando detalles de la mascota...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={veteStyles.veteErrorContainer}> {/* Corrected class */}
        <h3>Error</h3>
        <p>{error}</p>
        <motion.button
          onClick={handleVolver}
          className={veteStyles.veteVolverBtn} /* Reusing primary button style */
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Volver
        </motion.button>
      </div>
    );
  }

  if (!mascota) {
    return (
      <div className={veteStyles.veteErrorContainer}>
        <p>Mascota no encontrada.</p>
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

  return (
    <motion.div
      className={veteStyles.veteDetalleContainer} /* Corrected class */
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className={veteStyles.veteHeader}> 
        <motion.button
          onClick={handleVolver}
          className={veteStyles.veteVolverBtn} /* Corrected class */
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Volver
        </motion.button>
        <h2><FontAwesomeIcon icon={faPaw} /> Detalle de la Mascota</h2>
      </div>

      <div className={veteStyles.veteDetalleInfo}> {/* Corrected class */}
        <div className={veteStyles.veteInfoGrid}> 
          <motion.div
            className={veteStyles.veteInfoCard} /* Corrected class */
            variants={cardVariants}
            whileHover="hover"
          >
            <h3><FontAwesomeIcon icon={faPaw} /> Nombre</h3>
            <p>{mascota.nombre}</p>
          </motion.div>

          <motion.div
            className={veteStyles.veteInfoCard} /* Corrected class */
            variants={cardVariants}
            whileHover="hover"
          >
            <h3><FontAwesomeIcon icon={getEspecieIcon()} /> Especie</h3>
            <p>{mascota.especie}</p>
          </motion.div>

          <motion.div
            className={veteStyles.veteInfoCard} /* Corrected class */
            variants={cardVariants}
            whileHover="hover"
          >
            <h3><FontAwesomeIcon icon={faPaw} /> Raza</h3>
            <p>{mascota.raza}</p>
          </motion.div>

          <motion.div
            className={veteStyles.veteInfoCard} /* Corrected class */
            variants={cardVariants}
            whileHover="hover"
          >
            <h3><FontAwesomeIcon icon={faVenusMars} /> Sexo</h3>
            <p>{mascota.sexo}</p>
          </motion.div>

          <motion.div
            className={veteStyles.veteInfoCard} /* Corrected class */
            variants={cardVariants}
            whileHover="hover"
          >
            <h3><FontAwesomeIcon icon={faCalendarAlt} /> Fecha Nacimiento</h3>
            <p>{mascota.fechaNacimiento} ({mascota.edad})</p>
          </motion.div>

          <motion.div
            className={veteStyles.veteInfoCard} /* Corrected class */
            variants={cardVariants}
            whileHover="hover"
          >
            <h3><FontAwesomeIcon icon={faUser} /> Propietario</h3>
            <p>{mascota.propietario}<br />({mascota.telefonoPropietario})</p>
          </motion.div>

          {/* New Cards for additional info */}
          <motion.div
            className={veteStyles.veteInfoCard}
            variants={cardVariants}
            whileHover="hover"
          >
            <h3><FontAwesomeIcon icon={faCalendarAlt} /> Última Visita</h3>
            <p>{mascota.ultimaVisita}</p>
          </motion.div>

          <motion.div
            className={veteStyles.veteInfoCard}
            variants={cardVariants}
            whileHover="hover"
          >
            <h3><FontAwesomeIcon icon={faNotesMedical} /> Alergias</h3>
            <p>{mascota.alergias}</p>
          </motion.div>

          <motion.div
            className={veteStyles.veteInfoCard}
            variants={cardVariants}
            whileHover="hover"
          >
            <h3><FontAwesomeIcon icon={faPaw} /> Peso</h3>
            <p>{mascota.peso}</p>
          </motion.div>

          <motion.div
            className={veteStyles.veteInfoCard}
            variants={cardVariants}
            whileHover="hover"
          >
            <h3><FontAwesomeIcon icon={faFileMedical} /> Condición Médica</h3>
            <p>{mascota.condicionMedica}</p>
          </motion.div>

          <motion.div
            className={veteStyles.veteInfoCard}
            variants={cardVariants}
            whileHover="hover"
          >
            <h3><FontAwesomeIcon icon={faPills} /> Medicamentos Actuales</h3>
            <p>{mascota.medicamentosActuales}</p>
          </motion.div>

        </div>

        
      </div>
    </motion.div>
  );
};

export default DetalleMascota;