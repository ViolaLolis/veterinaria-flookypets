import React, { useState, useEffect } from 'react';
import styles from './Style/ConfiguracionVeterinarioStyles.module.css';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faBell, faSave, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeInOut' } },
};

const buttonVariants = {
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
};

const ConfiguracionVeterinario = () => {
  const [notificacionesActivas, setNotificacionesActivas] = useState(true);
  const [sonidoNotificacion, setSonidoNotificacion] = useState('default');
  const [temaVisual, setTemaVisual] = useState('light');
  const [idiomaApp, setIdiomaApp] = useState('es');
  const [recordatoriosCita, setRecordatoriosCita] = useState(true);
  const [intervaloRecordatorio, setIntervaloRecordatorio] = useState('30 minutos');
  const [guardando, setGuardando] = useState(false);
  const [mensajeGuardado, setMensajeGuardado] = useState('');
  const [errorGuardado, setErrorGuardado] = useState('');

  useEffect(() => {
    // Simulación de carga de la configuración guardada al montar el componente
    setTimeout(() => {
      setNotificacionesActivas(localStorage.getItem('notificacionesActivas') === 'true' || true);
      setSonidoNotificacion(localStorage.getItem('sonidoNotificacion') || 'default');
      setTemaVisual(localStorage.getItem('temaVisual') || 'light');
      setIdiomaApp(localStorage.getItem('idiomaApp') || 'es');
      setRecordatoriosCita(localStorage.getItem('recordatoriosCita') === 'true' || true);
      setIntervaloRecordatorio(localStorage.getItem('intervaloRecordatorio') || '30 minutos');
    }, 300);
  }, []);

  const handleGuardarConfiguracion = () => {
    setGuardando(true);
    setMensajeGuardado('');
    setErrorGuardado('');

    // Simulación de guardado en la base de datos o localStorage
    setTimeout(() => {
      localStorage.setItem('notificacionesActivas', notificacionesActivas);
      localStorage.setItem('sonidoNotificacion', sonidoNotificacion);
      localStorage.setItem('temaVisual', temaVisual);
      localStorage.setItem('idiomaApp', idiomaApp);
      localStorage.setItem('recordatoriosCita', recordatoriosCita);
      localStorage.setItem('intervaloRecordatorio', intervaloRecordatorio);
      setGuardando(false);
      setMensajeGuardado('Configuración guardada exitosamente.');
      setTimeout(() => setMensajeGuardado(''), 3000);
    }, 1500);
  };

  const handleCancelar = () => {
    // Simulación de recarga de la configuración guardada
    setNotificacionesActivas(localStorage.getItem('notificacionesActivas') === 'true' || true);
    setSonidoNotificacion(localStorage.getItem('sonidoNotificacion') || 'default');
    setTemaVisual(localStorage.getItem('temaVisual') || 'light');
    setIdiomaApp(localStorage.getItem('idiomaApp') || 'es');
    setRecordatoriosCita(localStorage.getItem('recordatoriosCita') === 'true' || true);
    setIntervaloRecordatorio(localStorage.getItem('intervaloRecordatorio') || '30 minutos');
    setErrorGuardado('Cambios descartados.');
    setTimeout(() => setErrorGuardado(''), 3000);
  };

  return (
    <motion.div
      className={styles.configuracionContainer}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className={styles.header}>
        <h2><FontAwesomeIcon icon={faCog} /> Configuración</h2>
      </div>
      <form className={styles.configForm}>
        <div className={styles.formGroup}>
          <label htmlFor="notificaciones">
            <FontAwesomeIcon icon={faBell} /> Notificaciones Activas
          </label>
          <input
            type="checkbox"
            id="notificaciones"
            checked={notificacionesActivas}
            onChange={(e) => setNotificacionesActivas(e.target.checked)}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="sonido">Sonido de Notificación</label>
          <select id="sonido" value={sonidoNotificacion} onChange={(e) => setSonidoNotificacion(e.target.value)}>
            <option value="default">Default</option>
            <option value="sonido1">Sonido 1</option>
            <option value="sonido2">Sonido 2</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="tema">Tema Visual</label>
          <select id="tema" value={temaVisual} onChange={(e) => setTemaVisual(e.target.value)}>
            <option value="light">Claro</option>
            <option value="dark">Oscuro</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="idioma">Idioma de la Aplicación</label>
          <select id="idioma" value={idiomaApp} onChange={(e) => setIdiomaApp(e.target.value)}>
            <option value="es">Español</option>
            <option value="en">Inglés</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="recordatorios">Recordatorios de Cita</label>
          <input
            type="checkbox"
            id="recordatorios"
            checked={recordatoriosCita}
            onChange={(e) => setRecordatoriosCita(e.target.checked)}
          />
        </div>

        {recordatoriosCita && (
          <div className={styles.formGroup}>
            <label htmlFor="intervalo">Intervalo de Recordatorio</label>
            <select
              id="intervalo"
              value={intervaloRecordatorio}
              onChange={(e) => setIntervaloRecordatorio(e.target.value)}
            >
              <option value="15 minutos">15 minutos antes</option>
              <option value="30 minutos">30 minutos antes</option>
              <option value="1 hora">1 hora antes</option>
            </select>
          </div>
        )}

        <div className={styles.buttonGroup}>
          <motion.button
            type="button"
            className={styles.guardarBtn}
            onClick={handleGuardarConfiguracion}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            disabled={guardando}
          >
            <FontAwesomeIcon icon={faSave} /> {guardando ? 'Guardando...' : 'Guardar Cambios'}
          </motion.button>
          <motion.button
            type="button"
            className={styles.cancelarBtn}
            onClick={handleCancelar}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <FontAwesomeIcon icon={faTimesCircle} /> Cancelar
          </motion.button>
        </div>

        {mensajeGuardado && <div className={styles.mensajeExito}>{mensajeGuardado}</div>}
        {errorGuardado && <div className={styles.mensajeError}>{errorGuardado}</div>}
      </form>
    </motion.div>
  );
};

export default ConfiguracionVeterinario;