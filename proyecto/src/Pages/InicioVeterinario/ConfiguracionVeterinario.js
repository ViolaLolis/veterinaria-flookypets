import React, { useState, useEffect } from 'react';
import styles from './Style/ConfiguracionVeterinarioStyles.module.css';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCog, faBell, faSave, faTimesCircle, 
  faPalette, faLanguage, faClock, faCheckCircle,
  faExclamationTriangle, faSpinner, faInfoCircle
} from '@fortawesome/free-solid-svg-icons';

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.7, 
      ease: 'easeInOut',
      when: "beforeChildren",
      staggerChildren: 0.1
    } 
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
};

const buttonVariants = {
  hover: { 
    scale: 1.05,
    boxShadow: "0 4px 12px rgba(0, 188, 212, 0.2)"
  },
  tap: { scale: 0.95 },
};

const ConfiguracionVeterinario = () => {
  const [config, setConfig] = useState({
    notificacionesActivas: true,
    sonidoNotificacion: 'default',
    temaVisual: 'light',
    idiomaApp: 'es',
    recordatoriosCita: true,
    intervaloRecordatorio: '30 minutos'
  });
  
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [originalConfig, setOriginalConfig] = useState(null);

  useEffect(() => {
    const loadConfig = () => {
      const savedConfig = {
        notificacionesActivas: localStorage.getItem('notificacionesActivas') === 'true' || true,
        sonidoNotificacion: localStorage.getItem('sonidoNotificacion') || 'default',
        temaVisual: localStorage.getItem('temaVisual') || 'light',
        idiomaApp: localStorage.getItem('idiomaApp') || 'es',
        recordatoriosCita: localStorage.getItem('recordatoriosCita') === 'true' || true,
        intervaloRecordatorio: localStorage.getItem('intervaloRecordatorio') || '30 minutos'
      };
      
      setConfig(savedConfig);
      setOriginalConfig(savedConfig);
    };
    
    const timer = setTimeout(loadConfig, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleGuardarConfiguracion = async () => {
    setGuardando(true);
    setMensaje({ texto: '', tipo: '' });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      Object.entries(config).forEach(([key, value]) => {
        localStorage.setItem(key, typeof value === 'boolean' ? value.toString() : value);
      });
      
      setOriginalConfig(config);
      setMensaje({ 
        texto: 'Configuración guardada exitosamente', 
        tipo: 'exito' 
      });
    } catch (error) {
      setMensaje({ 
        texto: 'Error al guardar la configuración', 
        tipo: 'error' 
      });
    } finally {
      setGuardando(false);
      setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000);
    }
  };

  const handleCancelar = () => {
    if (originalConfig) {
      setConfig(originalConfig);
    }
    setMensaje({ 
      texto: 'Cambios descartados', 
      tipo: 'info' 
    });
    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000);
  };

  const hasChanges = originalConfig && 
    JSON.stringify(config) !== JSON.stringify(originalConfig);

  return (
    <motion.div
      className={styles.configuracionContainer}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        className={styles.header}
        variants={itemVariants}
      >
        <h2>
          <FontAwesomeIcon icon={faCog} className={styles.headerIcon} /> 
          Configuración del Veterinario
        </h2>
        <p className={styles.subtitle}>Personaliza tu experiencia en la aplicación</p>
      </motion.div>

      <motion.form 
        className={styles.configForm}
        variants={itemVariants}
      >
        {/* Grupo de Notificaciones */}
        <motion.div 
          className={styles.configSection}
          variants={itemVariants}
        >
          <h3 className={styles.sectionTitle}>
            <FontAwesomeIcon icon={faBell} /> Notificaciones
          </h3>
          
          <div className={styles.formGroup}>
            <label className={styles.switchLabel}>
              <input
                type="checkbox"
                name="notificacionesActivas"
                checked={config.notificacionesActivas}
                onChange={handleChange}
                className={styles.switchInput}
              />
              <span className={styles.slider}></span>
              <span className={styles.labelText}>Notificaciones activas</span>
            </label>
          </div>

          {config.notificacionesActivas && (
            <>
              <div className={styles.formGroup}>
                <label htmlFor="sonidoNotificacion" className={styles.selectLabel}>
                  Sonido de notificación
                </label>
                <select
                  id="sonidoNotificacion"
                  name="sonidoNotificacion"
                  value={config.sonidoNotificacion}
                  onChange={handleChange}
                  className={styles.selectInput}
                >
                  <option value="default">Default</option>
                  <option value="sonido1">Sonido 1</option>
                  <option value="sonido2">Sonido 2</option>
                  <option value="sonido3">Sonido 3</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.switchLabel}>
                  <input
                    type="checkbox"
                    name="recordatoriosCita"
                    checked={config.recordatoriosCita}
                    onChange={handleChange}
                    className={styles.switchInput}
                  />
                  <span className={styles.slider}></span>
                  <span className={styles.labelText}>Recordatorios de cita</span>
                </label>
              </div>

              {config.recordatoriosCita && (
                <div className={styles.formGroup}>
                  <label htmlFor="intervaloRecordatorio" className={styles.selectLabel}>
                    <FontAwesomeIcon icon={faClock} /> Intervalo de recordatorio
                  </label>
                  <select
                    id="intervaloRecordatorio"
                    name="intervaloRecordatorio"
                    value={config.intervaloRecordatorio}
                    onChange={handleChange}
                    className={styles.selectInput}
                  >
                    <option value="15 minutos">15 minutos antes</option>
                    <option value="30 minutos">30 minutos antes</option>
                    <option value="1 hora">1 hora antes</option>
                    <option value="1 día">1 día antes</option>
                  </select>
                </div>
              )}
            </>
          )}
        </motion.div>

        {/* Grupo de Apariencia */}
        <motion.div 
          className={styles.configSection}
          variants={itemVariants}
        >
          <h3 className={styles.sectionTitle}>
            <FontAwesomeIcon icon={faPalette} /> Apariencia
          </h3>
          
          <div className={styles.formGroup}>
            <label htmlFor="temaVisual" className={styles.selectLabel}>
              Tema visual
            </label>
            <select
              id="temaVisual"
              name="temaVisual"
              value={config.temaVisual}
              onChange={handleChange}
              className={styles.selectInput}
            >
              <option value="light">Claro</option>
              <option value="dark">Oscuro</option>
              <option value="blue">Azul (personalizado)</option>
            </select>
          </div>
        </motion.div>

        {/* Grupo de Idioma */}
        <motion.div 
          className={styles.configSection}
          variants={itemVariants}
        >
          <h3 className={styles.sectionTitle}>
            <FontAwesomeIcon icon={faLanguage} /> Idioma
          </h3>
          
          <div className={styles.formGroup}>
            <label htmlFor="idiomaApp" className={styles.selectLabel}>
              Idioma de la aplicación
            </label>
            <select
              id="idiomaApp"
              name="idiomaApp"
              value={config.idiomaApp}
              onChange={handleChange}
              className={styles.selectInput}
            >
              <option value="es">Español</option>
              <option value="en">Inglés</option>
              <option value="pt">Portugués</option>
            </select>
          </div>
        </motion.div>

        {/* Botones de acción */}
        <motion.div 
          className={styles.buttonGroup}
          variants={itemVariants}
        >
          <motion.button
            type="button"
            className={`${styles.actionButton} ${styles.saveButton}`}
            onClick={handleGuardarConfiguracion}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            disabled={guardando || !hasChanges}
          >
            {guardando ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin /> Guardando...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faSave} /> Guardar cambios
              </>
            )}
          </motion.button>

          <motion.button
            type="button"
            className={`${styles.actionButton} ${styles.cancelButton}`}
            onClick={handleCancelar}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            disabled={!hasChanges || guardando}
          >
            <FontAwesomeIcon icon={faTimesCircle} /> Cancelar
          </motion.button>
        </motion.div>

        {/* Mensajes de estado */}
        {mensaje.texto && (
          <motion.div
            className={`${styles.message} ${
              mensaje.tipo === 'exito' ? styles.successMessage :
              mensaje.tipo === 'error' ? styles.errorMessage :
              styles.infoMessage
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <FontAwesomeIcon 
              icon={
                mensaje.tipo === 'exito' ? faCheckCircle :
                mensaje.tipo === 'error' ? faExclamationTriangle : faInfoCircle
              } 
            />
            <span>{mensaje.texto}</span>
          </motion.div>
        )}
      </motion.form>
    </motion.div>
  );
};

export default ConfiguracionVeterinario;
