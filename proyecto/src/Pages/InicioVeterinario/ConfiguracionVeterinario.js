import React, { useState, useEffect, useCallback } from 'react';
import veteStyles from './Style/ConfiguracionVeterinarioStyles.module.css';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCog, faBell, faSave, faTimesCircle, faArrowLeft,
  faClock, faCheckCircle, faExclamationTriangle, faSpinner, faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { authFetch } from './api'; // Asegúrate de que la ruta sea correcta a tu archivo api.js

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
  const { user, showNotification } = useOutletContext(); // Obtener user del contexto
  const navigate = useNavigate();

  const [config, setConfig] = useState({
    notificaciones_activas: true, // Coincide con el nombre de la columna en la BD
    sonido_notificacion: 'default', // Coincide con el nombre de la columna en la BD
    recordatorios_cita: true, // Coincide con el nombre de la columna en la BD
    intervalo_recordatorio: '30 minutos' // Coincide con el nombre de la columna en la BD
  });

  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [originalConfig, setOriginalConfig] = useState(null);
  const [error, setError] = useState('');

  const loadConfig = useCallback(async () => {
    setCargando(true);
    setMensaje({ texto: '', tipo: '' });
    setError(null); // Limpiar errores previos

    if (!user || !user.id) {
      setError('No se pudo cargar la configuración: ID de usuario no disponible.');
      setCargando(false);
      return;
    }

    try {
      const response = await authFetch(`/usuarios/${user.id}`);
      if (response.success) {
        const userData = response.data;
        const loadedConfig = {
          notificaciones_activas: !!userData.notificaciones_activas, // Convertir a booleano
          sonido_notificacion: userData.sonido_notificacion || 'default',
          recordatorios_cita: !!userData.recordatorios_cita, // Convertir a booleano
          intervalo_recordatorio: userData.intervalo_recordatorio || '30 minutos'
        };
        setConfig(loadedConfig);
        setOriginalConfig(loadedConfig);
        setMensaje({ texto: 'Configuración cargada.', tipo: 'info' });
      } else {
        setError(response.message || 'Error al cargar la configuración del servidor.');
        if (showNotification) showNotification(response.message || 'Error al cargar la configuración.', 'error');
      }
    } catch (error) {
      console.error('Error al cargar la configuración:', error);
      setError('Error de conexión al servidor al cargar la configuración.');
      if (showNotification) showNotification('Error de conexión al servidor al cargar la configuración.', 'error');
    } finally {
      setCargando(false);
      setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000);
    }
  }, [user, showNotification]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

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
    setError(null); // Limpiar errores previos

    if (!user || !user.id) {
      setError('No se pudo guardar la configuración: ID de usuario no disponible.');
      setGuardando(false);
      return;
    }

    try {
      const response = await authFetch(`/usuarios/${user.id}`, {
        method: 'PUT',
        body: JSON.stringify(config), // Enviar solo los campos de configuración
      });

      if (response.success) {
        // Actualizar el estado original con la configuración guardada
        setOriginalConfig(config);
        setMensaje({
          texto: '¡Configuración guardada exitosamente!',
          tipo: 'exito'
        });
        if (showNotification) showNotification('Configuración guardada exitosamente.', 'success');
      } else {
        setError(response.message || 'Error al guardar la configuración.');
        if (showNotification) showNotification(response.message || 'Error al guardar la configuración.', 'error');
      }
    } catch (error) {
      console.error('Error al guardar la configuración:', error);
      setError('Error de conexión al servidor al guardar la configuración. Inténtalo de nuevo.');
      if (showNotification) showNotification('Error de conexión al servidor al guardar la configuración.', 'error');
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

      {error && (
        <motion.div
          className={veteStyles.veteErrorMessage}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <FontAwesomeIcon icon={faExclamationTriangle} /> {error}
        </motion.div>
      )}

      <form className={veteStyles.veteConfigForm}> {/* No onSubmit aquí, los botones manejan la lógica */}
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
                name="notificaciones_activas" // Usar el nombre de la columna de la BD
                checked={config.notificaciones_activas}
                onChange={handleChange}
                className={veteStyles.veteSwitchInput}
              />
              <span className={veteStyles.veteSlider}></span>
              <span className={veteStyles.veteLabelText}>Notificaciones activas</span>
            </label>
          </div>

          {config.notificaciones_activas && (
            <>
              <div className={veteStyles.veteFormGroup}>
                <label htmlFor="sonido_notificacion" className={veteStyles.veteSelectLabel}>
                  Sonido de notificación
                </label>
                <select
                  id="sonido_notificacion"
                  name="sonido_notificacion" // Usar el nombre de la columna de la BD
                  value={config.sonido_notificacion}
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
                    name="recordatorios_cita" // Usar el nombre de la columna de la BD
                    checked={config.recordatorios_cita}
                    onChange={handleChange}
                    className={veteStyles.veteSwitchInput}
                  />
                  <span className={veteStyles.veteSlider}></span>
                  <span className={veteStyles.veteLabelText}>Recordatorios de cita</span>
                </label>
              </div>

              {config.recordatorios_cita && (
                <div className={veteStyles.veteFormGroup}>
                  <label htmlFor="intervalo_recordatorio" className={veteStyles.veteSelectLabel}>
                    <FontAwesomeIcon icon={faClock} /> Intervalo de recordatorio
                  </label>
                  <select
                    id="intervalo_recordatorio"
                    name="intervalo_recordatorio" // Usar el nombre de la columna de la BD
                    value={config.intervalo_recordatorio}
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
      </form>
    </motion.div>
  );
};

export default ConfiguracionVeterinario;
