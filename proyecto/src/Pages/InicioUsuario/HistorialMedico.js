import React, { useState } from 'react';
import { motion } from 'framer-motion';
import styles from './Styles/HistorialMedico.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStethoscope, faFileMedicalAlt, faPrint, faDownload, faSearch, faChevronDown, faChevronUp, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';

const HistorialMedico = () => {
  const [expandedRow, setExpandedRow] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const historial = [
    { 
      id: 1, 
      fecha: '2024-03-10', 
      diagnostico: 'Chequeo general', 
      tratamiento: 'Sin tratamiento', 
      notas: 'Mascota con buen estado de salud general. Peso: 4.2kg. Temperatura normal. Pelaje en buen estado.', 
      veterinario: 'Dr. Rodríguez' 
    },
    { 
      id: 2, 
      fecha: '2024-05-01', 
      diagnostico: 'Vacunación triple felina', 
      tratamiento: 'Vacuna aplicada (lote #XYZ123)', 
      notas: 'Se administró la vacuna sin complicaciones. La mascota mostró buen comportamiento durante el procedimiento.', 
      veterinario: 'Dra. Martínez' 
    },
    { 
      id: 3, 
      fecha: '2024-07-15', 
      diagnostico: 'Infección de oído leve', 
      tratamiento: 'Gotas óticas (dosis: 5 gotas en cada oído, 2 veces al día por 7 días).', 
      notas: 'Se recomienda seguimiento en una semana. Dueño instruido en la aplicación del medicamento. Posible alergia a monitorear.', 
      veterinario: 'Dr. López' 
    },
  ];

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const filteredHistorial = historial.filter(item =>
    item.diagnostico.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.tratamiento.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.notas.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div 
      className={styles.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <FontAwesomeIcon icon={faFileMedicalAlt} className={styles.mainIcon} />
          <h2>Historial Clínico</h2>
          <p>Registro completo de atenciones médicas</p>
        </div>
        
        <div className={styles.controls}>
          <div className={styles.searchContainer}>
            <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar en historial..."
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className={styles.actionButtons}>
            <motion.button 
              className={styles.actionButton}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FontAwesomeIcon icon={faPrint} /> Imprimir
            </motion.button>
            <motion.button 
              className={styles.actionButton}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FontAwesomeIcon icon={faDownload} /> Exportar
            </motion.button>
          </div>
        </div>
      </div>

      {filteredHistorial.length > 0 ? (
        <div className={styles.historialContainer}>
          {filteredHistorial.map(item => (
            <motion.div 
              key={item.id}
              className={styles.historialCard}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div 
                className={styles.cardHeader}
                onClick={() => toggleRow(item.id)}
              >
                <div className={styles.cardDate}>
                  <FontAwesomeIcon icon={faCalendarAlt} />
                  <span>{item.fecha}</span>
                </div>
                <h3 className={styles.cardDiagnosis}>{item.diagnostico}</h3>
                <div className={styles.cardVet}>
                  <span>Atendió: {item.veterinario}</span>
                </div>
                <div className={styles.cardToggle}>
                  <FontAwesomeIcon icon={expandedRow === item.id ? faChevronUp : faChevronDown} />
                </div>
              </div>
              
              {expandedRow === item.id && (
                <motion.div 
                  className={styles.cardContent}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={styles.detailRow}>
                    <h4>Tratamiento:</h4>
                    <p>{item.tratamiento}</p>
                  </div>
                  <div className={styles.detailRow}>
                    <h4>Observaciones:</h4>
                    <p>{item.notas}</p>
                  </div>
                  <div className={styles.cardActions}>
                    <button className={styles.smallActionButton}>
                      Ver receta
                    </button>
                    <button className={styles.smallActionButton}>
                      Ver imágenes
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div 
          className={styles.noHistorial}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <FontAwesomeIcon icon={faStethoscope} className={styles.noHistorialIcon} />
          <h3>No se encontraron registros médicos</h3>
          <p>{searchTerm ? 'Intenta con otro término de búsqueda' : 'Esta mascota no tiene historial médico registrado'}</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default HistorialMedico;