import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import styles from './Style/EditarPropietarioStyles.module.css';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faUserEdit } from '@fortawesome/free-solid-svg-icons';

const containerVariants = {
  hidden: { opacity: 0, x: '-100vw' },
  visible: { opacity: 1, x: 0, transition: { type: 'spring', delay: 0.2, damping: 20, stiffness: 100 } },
  exit: { x: '100vw', transition: { ease: 'easeInOut' } },
};

const buttonVariants = {
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
};

const EditarPropietario = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Obtiene el ID del propietario de la URL
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [direccion, setDireccion] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simulación de llamada a la API para obtener los datos del propietario a editar
    setTimeout(() => {
      const propietarioData = { id: parseInt(id), nombre: 'Ana Pérez (Editado)', telefono: '310...', email: 'ana.editado@...', direccion: 'Calle Falsa 123' };
      if (propietarioData.id === parseInt(id)) {
        setNombre(propietarioData.nombre);
        setTelefono(propietarioData.telefono);
        setEmail(propietarioData.email);
        setDireccion(propietarioData.direccion);
        setLoading(false);
      } else {
        setError('Propietario no encontrado');
        setLoading(false);
      }
    }, 500);
  }, [id]);

  const handleVolver = () => {
    navigate(-1);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Simulación de envío de los datos actualizados a la API
    console.log('Datos del propietario actualizados:', { id, nombre, telefono, email, direccion });
    // Aquí iría la lógica real para enviar los datos actualizados
    navigate('/veterinario/propietarios'); // Redirigir después de la edición
  };

  if (loading) {
    return <div>Cargando datos del propietario...</div>;
  }

  if (error) {
    return <div>Error al cargar los datos del propietario: {error}</div>;
  }

  return (
    <motion.div
      className={styles.editarContainer}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className={styles.header}>
        <button onClick={handleVolver} className={styles.volverBtn}>
          <FontAwesomeIcon icon={faArrowLeft} /> Volver
        </button>
        <h2><FontAwesomeIcon icon={faUserEdit} /> Editar Propietario</h2>
      </div>
      <form onSubmit={handleSubmit} className={styles.formulario}>
        <div className={styles.formGroup}>
          <label htmlFor="nombre">Nombre Completo:</label>
          <input
            type="text"
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="telefono">Teléfono:</label>
          <input
            type="tel"
            id="telefono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className={styles.formGroup}>
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
          className={styles.guardarBtn}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          Guardar Cambios
        </motion.button>
        <Link to="/veterinario/propietarios" className={styles.cancelarBtn}>
          Cancelar
        </Link>
      </form>
    </motion.div>
  );
};

export default EditarPropietario;