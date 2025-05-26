import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import styles from './Style/DetalleMascotaStyles.module.css';
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
  faSyringe,
  faNotesMedical
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
    boxShadow: '0 10px 20px rgba(0, 172, 193, 0.2)'
  }
};

const DetalleMascota = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [mascota, setMascota] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setTimeout(() => {
      try {
        const mascotaData = {
          id: parseInt(id),
          nombre: 'Max',
          especie: 'Perro',
          raza: 'Labrador Retriever',
          sexo: 'Macho',
          fechaNacimiento: '10/05/2020',
          edad: '3 años',
          propietario: 'Ana Pérez',
          telefonoPropietario: '3101234567',
          ultimaVisita: '15/06/2023',
          alergias: 'Ninguna conocida',
          peso: '28 kg'
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
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Cargando detalles de la mascota...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h3>Error</h3>
        <p>{error}</p>
        <motion.button
          onClick={handleVolver}
          className={styles.volverBtn}
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
      <div className={styles.errorContainer}>
        <p>Mascota no encontrada.</p>
        <motion.button
          onClick={handleVolver}
          className={styles.volverBtn}
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
      className={styles.detalleContainer}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className={styles.header}>
        <motion.button 
          onClick={handleVolver} 
          className={styles.volverBtn}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Volver
        </motion.button>
        <h2><FontAwesomeIcon icon={faPaw} /> Detalle de la Mascota</h2>
      </div>
      
      <div className={styles.detalleInfo}>
        <div className={styles.infoGrid}>
          <motion.div 
            className={styles.infoCard}
            variants={cardVariants}
            whileHover="hover"
          >
            <h3><FontAwesomeIcon icon={faPaw} /> Nombre</h3>
            <p>{mascota.nombre}</p>
          </motion.div>
          
          <motion.div 
            className={styles.infoCard}
            variants={cardVariants}
            whileHover="hover"
          >
            <h3><FontAwesomeIcon icon={getEspecieIcon()} /> Especie</h3>
            <p>{mascota.especie}</p>
          </motion.div>
          
          <motion.div 
            className={styles.infoCard}
            variants={cardVariants}
            whileHover="hover"
          >
            <h3><FontAwesomeIcon icon={faPaw} /> Raza</h3>
            <p>{mascota.raza}</p>
          </motion.div>
          
          <motion.div 
            className={styles.infoCard}
            variants={cardVariants}
            whileHover="hover"
          >
            <h3><FontAwesomeIcon icon={faVenusMars} /> Sexo</h3>
            <p>{mascota.sexo}</p>
          </motion.div>
          
          <motion.div 
            className={styles.infoCard}
            variants={cardVariants}
            whileHover="hover"
          >
            <h3><FontAwesomeIcon icon={faCalendarAlt} /> Fecha Nacimiento</h3>
            <p>{mascota.fechaNacimiento} ({mascota.edad})</p>
          </motion.div>
          
          <motion.div 
            className={styles.infoCard}
            variants={cardVariants}
            whileHover="hover"
          >
            <h3><FontAwesomeIcon icon={faUser} /> Propietario</h3>
            <p>{mascota.propietario}<br />({mascota.telefonoPropietario})</p>
          </motion.div>
        </div>
        
        <div className={styles.accionesSection}>
          <h3><FontAwesomeIcon icon={faFileMedical} /> Acciones</h3>
          <div className={styles.accionesGrid}>
            <Link to={`/mascotas/${id}/historial`} className={styles.accionBtn}>
              <FontAwesomeIcon icon={faNotesMedical} size="lg" />
              Historial Médico
            </Link>
            
            <Link to={`/mascotas/${id}/tratamientos`} className={styles.accionBtn}>
              <FontAwesomeIcon icon={faPills} size="lg" />
              Tratamientos
            </Link>
            
            <Link to={`/mascotas/${id}/vacunas`} className={styles.accionBtn}>
              <FontAwesomeIcon icon={faSyringe} size="lg" />
              Vacunas
            </Link>
            
            <Link to={`/mascotas/${id}/editar`} className={styles.accionBtn}>
              <FontAwesomeIcon icon={faPaw} size="lg" />
              Editar Datos
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DetalleMascota;