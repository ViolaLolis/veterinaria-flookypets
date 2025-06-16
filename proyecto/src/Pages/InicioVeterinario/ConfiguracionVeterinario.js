import React, { useState, useEffect } from 'react';
import veteStyles from './Style/ConfiguracionVeterinarioStyles.module.css';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCog, faBell, faSave, faTimesCircle, faArrowLeft,
  faClock, faCheckCircle, faExclamationTriangle, faSpinner, faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

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
    boxShadow: "0 4px 12px rgba(0, 172, 193, 0.2)"
  },
  tap: { scale: 0.95 },
};

const ConfiguracionVeterinario = () => {
  const [config, setConfig] = useState({
    notificacionesActivas: true,
    sonidoNotificacion: 'default',
    recordatoriosCita: true,
    intervaloRecordatorio: '30 minutos'
  });

  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [originalConfig, setOriginalConfig] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const loadConfigLocally = () => {
      setCargando(true);
      setMensaje({ texto: '', tipo: '' });

      try {
        const savedConfig = {
          notificacionesActivas: localStorage.getItem('veteNotificacionesActivas') === 'true' || true,
          sonidoNotificacion: localStorage.getItem('veteSonidoNotificacion') || 'default',
          recordatoriosCita: localStorage.getItem('veteRecordatoriosCita') === 'true' || true,
          intervaloRecordatorio: localStorage.getItem('veteIntervaloRecordatorio') || '30 minutos'
        };

        setConfig(savedConfig);
        setOriginalConfig(savedConfig);
        setMensaje({ texto: 'Configuración cargada.', tipo: 'info' });
      } catch (error) {
        console.error('Error al cargar la configuración de localStorage:', error);
        setMensaje({
          texto: 'Error al cargar la configuración local.',
          tipo: 'error'
        });
      } finally {
        setCargando(false);
        setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000);
      }
    };

    loadConfigLocally();
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
      await new Promise(resolve => setTimeout(resolve, 800));

      Object.entries(config).forEach(([key, value]) => {
        const localStorageKey = `vete${key.charAt(0).toUpperCase() + key.slice(1)}`;
        localStorage.setItem(localStorageKey, typeof value === 'boolean' ? value.toString() : value);
      });

      setOriginalConfig(config);
      setMensaje({
        texto: '¡Configuración guardada exitosamente!',
        tipo: 'exito'
      });
    } catch (error) {
      console.error('Error al guardar la configuración en localStorage:', error);
      setMensaje({
        texto: 'Error al guardar la configuración. Inténtalo de nuevo.',
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
      texto: 'Cambios descartados.',
      tipo: 'info'
    });
    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const hasChanges = originalConfig &&
    JSON.stringify(config) !== JSON.stringify(originalConfig);

  if (cargando) {
    return (
      <div className={veteStyles.veteLoadingContainer}>
        <FontAwesomeIcon icon={faSpinner} spin size="3x" className={veteStyles.veteLoadingSpinner} />
        <p>Cargando configuración...</p>
      </div>
    );
  }

  return (
    <motion.div
      className={veteStyles.veteConfiguracionContainer}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className={veteStyles.veteHeader}
        variants={itemVariants}
      >
        <h2>
          <FontAwesomeIcon icon={faCog} className={veteStyles.veteHeaderIcon} />
          Configuración del Veterinario
        </h2>
        <p className={veteStyles.veteSubtitle}>Personaliza tus preferencias de notificación</p>
      </motion.div>

      <motion.form
        className={veteStyles.veteConfigForm}
        variants={itemVariants}
      >
        {/* Grupo de Notificaciones */}
        <motion.div
          className={veteStyles.veteConfigSection}
          variants={itemVariants}
        >
          <h3 className={veteStyles.veteSectionTitle}>
            <FontAwesomeIcon icon={faBell} /> Notificaciones
          </h3>

          <div className={veteStyles.veteFormGroup}>
            <label className={veteStyles.veteSwitchLabel}>
              <input
                type="checkbox"
                name="notificacionesActivas"
                checked={config.notificacionesActivas}
                onChange={handleChange}
                className={veteStyles.veteSwitchInput}
              />
              <span className={veteStyles.veteSlider}></span>
              <span className={veteStyles.veteLabelText}>Notificaciones activas</span>
            </label>
          </div>

          {config.notificacionesActivas && (
            <>
              <div className={veteStyles.veteFormGroup}>
                <label htmlFor="sonidoNotificacion" className={veteStyles.veteSelectLabel}>
                  Sonido de notificación
                </label>
                <select
                  id="sonidoNotificacion"
                  name="sonidoNotificacion"
                  value={config.sonidoNotificacion}
                  onChange={handleChange}
                  className={veteStyles.veteSelectInput}
                >
                  <option value="default">Default</option>
                  <option value="sonido1">Sonido 1</option>
                  <option value="sonido2">Sonido 2</option>
                  <option value="sonido3">Sonido 3</option>
                </select>
              </div>

              <div className={veteStyles.veteFormGroup}>
                <label className={veteStyles.veteSwitchLabel}>
                  <input
                    type="checkbox"
                    name="recordatoriosCita"
                    checked={config.recordatoriosCita}
                    onChange={handleChange}
                    className={veteStyles.veteSwitchInput}
                  />
                  <span className={veteStyles.veteSlider}></span>
                  <span className={veteStyles.veteLabelText}>Recordatorios de cita</span>
                </label>
              </div>

              {config.recordatoriosCita && (
                <div className={veteStyles.veteFormGroup}>
                  <label htmlFor="intervaloRecordatorio" className={veteStyles.veteSelectLabel}>
                    <FontAwesomeIcon icon={faClock} /> Intervalo de recordatorio
                  </label>
                  <select
                    id="intervaloRecordatorio"
                    name="intervaloRecordatorio"
                    value={config.intervaloRecordatorio}
                    onChange={handleChange}
                    className={veteStyles.veteSelectInput}
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

        {/* Botones de acción */}
        <motion.div
          className={veteStyles.veteButtonGroup}
          variants={itemVariants}
        >
          <motion.button
            type="button"
            className={`${veteStyles.veteActionButton} ${veteStyles.veteBackButton}`}
            onClick={handleGoBack}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            disabled={guardando}
          >
            <FontAwesomeIcon icon={faArrowLeft} /> Volver
          </motion.button>

          <motion.button
            type="button"
            className={`${veteStyles.veteActionButton} ${veteStyles.veteSaveButton}`}
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
            className={`${veteStyles.veteActionButton} ${veteStyles.veteCancelButton}`}
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
            className={`${veteStyles.veteMessage} ${
              mensaje.tipo === 'exito' ? veteStyles.veteSuccessMessage :
              mensaje.tipo === 'error' ? veteStyles.veteErrorMessage :
              veteStyles.veteInfoMessage
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