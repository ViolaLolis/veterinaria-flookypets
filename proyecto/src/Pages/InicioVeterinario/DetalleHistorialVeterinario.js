import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './Style/DetalleHistorialVeterinarioStyles.module.css';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faFileMedicalAlt,
  faPaw,
  faCalendarDay,
  faDiagnoses,
  faNotesMedical,
  faFilePdf,
  faFileImage,
  faFilePrescription,
  faPrint
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

const DetalleHistorialVeterinario = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [historial, setHistorial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setTimeout(() => {
      try {
        const historialData = {
          id: parseInt(id),
          mascota: 'Max (Labrador)',
          fecha: '01/04/2024',
          diagnostico: 'Chequeo general de rutina',
          notas: 'El paciente se encuentra en buen estado general. Peso: 28 kg. Temperatura: 38.2°C. Se recomienda continuar con la misma dieta y ejercicio regular.',
          documentos: [
            { tipo: 'pdf', nombre: 'Reporte_completo.pdf' },
            { tipo: 'imagen', nombre: 'Radiografia_torax.jpg' },
            { tipo: 'receta', nombre: 'Receta_medicamentos.pdf' }
          ],
          veterinario: 'Dra. Sofia Vargas',
          proximaCita: '01/07/2024'
        };
        if (historialData.id === parseInt(id)) {
          setHistorial(historialData);
          setLoading(false);
        } else {
          throw new Error('Historial médico no encontrado');
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

  const getDocumentoIcon = (tipo) => {
    switch(tipo) {
      case 'pdf': return faFilePdf;
      case 'imagen': return faFileImage;
      case 'receta': return faFilePrescription;
      default: return faFileMedicalAlt;
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Cargando detalles del historial médico...</p>
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

  if (!historial) {
    return (
      <div className={styles.errorContainer}>
        <p>Historial médico no encontrado.</p>
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
        <h2><FontAwesomeIcon icon={faFileMedicalAlt} /> Detalle del Historial Médico</h2>
      </div>
      
      <div className={styles.detalleInfo}>
        <motion.div 
          className={styles.infoCard}
          variants={cardVariants}
          whileHover="hover"
        >
          <h3><FontAwesomeIcon icon={faPaw} /> Mascota</h3>
          <p>{historial.mascota}</p>
        </motion.div>
        
        <motion.div 
          className={styles.infoCard}
          variants={cardVariants}
          whileHover="hover"
        >
          <h3><FontAwesomeIcon icon={faCalendarDay} /> Fecha de Consulta</h3>
          <p>{historial.fecha}</p>
          {historial.proximaCita && (
            <p><strong>Próxima cita:</strong> {historial.proximaCita}</p>
          )}
        </motion.div>
        
        <motion.div 
          className={styles.infoCard}
          variants={cardVariants}
          whileHover="hover"
        >
          <h3><FontAwesomeIcon icon={faDiagnoses} /> Diagnóstico</h3>
          <p>{historial.diagnostico}</p>
          {historial.veterinario && (
            <p><strong>Atendió:</strong> {historial.veterinario}</p>
          )}
        </motion.div>
        
        <motion.div 
          className={styles.notasCard}
          variants={cardVariants}
          whileHover="hover"
        >
          <h3><FontAwesomeIcon icon={faNotesMedical} /> Notas Médicas</h3>
          <p>{historial.notas}</p>
        </motion.div>
        
        {historial.documentos && historial.documentos.length > 0 && (
          <motion.div 
            className={styles.documentosSection}
            variants={cardVariants}
          >
            <h3><FontAwesomeIcon icon={faFileMedicalAlt} /> Documentos Adjuntos</h3>
            <div className={styles.documentosGrid}>
              {historial.documentos.map((doc, index) => (
                <motion.div
                  key={index}
                  className={styles.documentoCard}
                  whileHover={{ y: -5, boxShadow: '0 5px 15px rgba(0, 172, 193, 0.2)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FontAwesomeIcon 
                    icon={getDocumentoIcon(doc.tipo)} 
                    size="2x" 
                    color="#00acc1" 
                    style={{ marginBottom: '0.5rem' }} 
                  />
                  <p>{doc.nombre}</p>
                  <button className={styles.documentoBtn}>
                    <FontAwesomeIcon icon={faPrint} /> Imprimir
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default DetalleHistorialVeterinario;