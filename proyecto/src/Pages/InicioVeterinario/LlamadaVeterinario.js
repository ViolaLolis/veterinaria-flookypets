import React, { useState, useEffect, useRef } from 'react';
import styles from './Style/LlamadaVeterinarioStyles.module.css';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faVideo, faMicrophone, faVideoSlash, faMicrophoneSlash, faVolumeUp, faVolumeMute } from '@fortawesome/free-solid-svg-icons';

const containerVariants = {
  hidden: { opacity: 0, x: '-20vw' },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: 'easeInOut' } },
};

const buttonVariants = {
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
};

const LlamadaVeterinario = () => {
  const [llamando, setLlamando] = useState(false);
  const [videoActivo, setVideoActivo] = useState(false);
  const [audioActivo, setAudioActivo] = useState(true);
  const [altavozActivo, setAltavozActivo] = useState(true);
  const [contacto, setContacto] = useState('');
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [errorLlamada, setErrorLlamada] = useState('');

  useEffect(() => {
    // Simulación de inicialización de la cámara local (solo en desarrollo real)
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia && localVideoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
          localVideoRef.current.srcObject = stream;
        })
        .catch(error => {
          console.error('Error al acceder a la cámara:', error);
        });
    }
  }, []);

  const iniciarLlamada = () => {
    if (contacto) {
      setLlamando(true);
      setErrorLlamada('');
      // Aquí iría la lógica real para iniciar la llamada (WebRTC, etc.)
      setTimeout(() => {
        // Simulación de conexión remota
        console.log(`Iniciando llamada con ${contacto}`);
        // Simulación de recepción de stream remoto
        if (remoteVideoRef.current) {
          // Simular un stream remoto aquí (en una app real, esto vendría de la conexión)
          remoteVideoRef.current.srcObject = new MediaStream();
        }
      }, 2000);
    } else {
      setErrorLlamada('Por favor, ingresa un contacto para iniciar la llamada.');
    }
  };

  const toggleVideo = () => {
    setVideoActivo(!videoActivo);
    // Aquí iría la lógica para activar/desactivar la transmisión de video
  };

  const toggleAudio = () => {
    setAudioActivo(!audioActivo);
    // Aquí iría la lógica para activar/desactivar el micrófono
  };

  const toggleAltavoz = () => {
    setAltavozActivo(!altavozActivo);
    // Aquí iría la lógica para cambiar entre altavoz y auricular
  };

  const finalizarLlamada = () => {
    setLlamando(false);
    // Aquí iría la lógica para finalizar la llamada y liberar recursos
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      localVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current && remoteVideoRef.current.srcObject) {
      remoteVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
      remoteVideoRef.current.srcObject = null;
    }
    console.log('Llamada finalizada.');
  };

  return (
    <motion.div
      className={styles.llamadaContainer}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className={styles.header}>
        <h2><FontAwesomeIcon icon={faPhone} /> Llamada o Videollamada</h2>
      </div>
      <div className={styles.llamadaPanel}>
        <div className={styles.localVideoContainer}>
          <video ref={localVideoRef} autoPlay muted className={styles.localVideo} />
        </div>
        <div className={styles.remoteVideoContainer}>
          <video ref={remoteVideoRef} autoPlay className={styles.remoteVideo} />
          {!llamando && (
            <div className={styles.inputContacto}>
              <input
                type="text"
                placeholder="Ingresar ID de contacto"
                value={contacto}
                onChange={(e) => setContacto(e.target.value)}
              />
              <motion.button
                onClick={iniciarLlamada}
                className={styles.iniciarLlamadaBtn}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <FontAwesomeIcon icon={faPhone} /> Iniciar Llamada
              </motion.button>
            </div>
          )}
          {errorLlamada && <div className={styles.error}>{errorLlamada}</div>}
        </div>

        {llamando && (
          <div className={styles.controlesLlamada}>
            <motion.button onClick={toggleVideo} className={styles.controlBtn} variants={buttonVariants} whileHover="hover" whileTap="tap">
              <FontAwesomeIcon icon={videoActivo ? faVideo : faVideoSlash} /> {videoActivo ? 'Desactivar Video' : 'Activar Video'}
            </motion.button>
            <motion.button onClick={toggleAudio} className={styles.controlBtn} variants={buttonVariants} whileHover="hover" whileTap="tap">
              <FontAwesomeIcon icon={audioActivo ? faMicrophone : faMicrophoneSlash} /> {audioActivo ? 'Desactivar Audio' : 'Activar Audio'}
            </motion.button>
            <motion.button onClick={toggleAltavoz} className={styles.controlBtn} variants={buttonVariants} whileHover="hover" whileTap="tap">
              <FontAwesomeIcon icon={altavozActivo ? faVolumeUp : faVolumeMute} /> {altavozActivo ? 'Desactivar Altavoz' : 'Activar Altavoz'}
            </motion.button>
            <motion.button onClick={finalizarLlamada} className={styles.finalizarLlamadaBtn} variants={buttonVariants} whileHover="hover" whileTap="tap">
              <FontAwesomeIcon icon={faPhone} /> Finalizar Llamada
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default LlamadaVeterinario;