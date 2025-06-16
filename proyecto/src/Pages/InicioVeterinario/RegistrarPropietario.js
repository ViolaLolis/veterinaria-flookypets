import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './Style/RegistrarPropietarioStyles.module.css'; // Asegúrate de que esta ruta sea correcta
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faUserPlus } from '@fortawesome/free-solid-svg-icons';

const containerVariants = {
  hidden: { opacity: 0, x: '-100vw' },
  visible: { opacity: 1, x: 0, transition: { type: 'spring', delay: 0.2, damping: 20, stiffness: 100 } },
  exit: { x: '100vw', transition: { ease: 'easeInOut' } },
};

const buttonVariants = {
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
};

const RegistrarPropietario = () => {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [direccion, setDireccion] = useState('');

  const handleVolver = () => {
    navigate(-1);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Simulación de envío de datos a la API
    console.log('Datos del propietario a registrar:', { nombre, telefono, email, direccion });
    // Aquí iría la lógica real para enviar los datos, por ejemplo:
    // try {
    //   await api.post('/propietarios', { nombre, telefono, email, direccion });
    //   navigate('/veterinario/propietarios'); // Redirigir después del registro exitoso
    // } catch (error) {
    //   console.error('Error al registrar propietario:', error);
    //   // Mostrar un mensaje de error al usuario
    // }
    navigate('/veterinario/propietarios'); // Redirigir después del registro (simulado)
  };

  return (
    <motion.div
      className={styles.veteRegistrarContainer} // Clase actualizada
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className={styles.veteHeader}> {/* Clase actualizada */}
        <button onClick={handleVolver} className={styles.veteVolverBtn}> {/* Clase actualizada */}
          <FontAwesomeIcon icon={faArrowLeft} /> Volver
        </button>
        <h2><FontAwesomeIcon icon={faUserPlus} /> Registrar Propietario</h2>
      </div>
      <form onSubmit={handleSubmit} className={styles.veteFormulario}> {/* Clase actualizada */}
        <div className={styles.veteFormGroup}> {/* Clase actualizada */}
          <label htmlFor="nombre">Nombre Completo:</label>
          <input
            type="text"
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>
        <div className={styles.veteFormGroup}> {/* Clase actualizada */}
          <label htmlFor="telefono">Teléfono:</label>
          <input
            type="tel" // Tipo 'tel' para mejor semántica y teclados móviles
            id="telefono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
          />
        </div>
        <div className={styles.veteFormGroup}> {/* Clase actualizada */}
          <label htmlFor="email">Email:</label>
          <input
            type="email" // Tipo 'email' para validación básica de formato
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className={styles.veteFormGroup}> {/* Clase actualizada */}
          <label htmlFor="direccion">Dirección:</label>
          <input
            type="text"
            id="direccion"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
          />
        </div>
        <motion.button
          type="submit"
          className={styles.veteRegistrarBtn} // Clase actualizada
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          Registrar Propietario
        </motion.button>
        <Link to="/veterinario/propietarios" className={styles.veteCancelarBtn}> {/* Clase actualizada */}
          Cancelar
        </Link>
      </form>
    </motion.div>
  );
};

export default RegistrarPropietario;