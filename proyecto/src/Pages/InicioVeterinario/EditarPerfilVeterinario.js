import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Style/EditarPerfilVeterinarioStyles.module.css';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faUserCog } from '@fortawesome/free-solid-svg-icons';

const containerVariants = {
  hidden: { opacity: 0, x: '-100vw' },
  visible: { opacity: 1, x: 0, transition: { type: 'spring', delay: 0.2, damping: 20, stiffness: 100 } },
  exit: { x: '100vw', transition: { ease: 'easeInOut' } },
};

const buttonVariants = {
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
};

const EditarPerfilVeterinario = () => {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [especialidad, setEspecialidad] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simulación de llamada a la API para obtener los datos del perfil a editar
    setTimeout(() => {
      const veterinarioData = {
        nombre: 'Dra. Sofia Vargas',
        especialidad: 'Medicina General Veterinaria',
        email: 'sofia.vargas@example.com',
        telefono: '300...',
        direccion: 'Carrera 10 # 20-30',
      };
      setNombre(veterinarioData.nombre);
      setEspecialidad(veterinarioData.especialidad);
      setEmail(veterinarioData.email);
      setTelefono(veterinarioData.telefono);
      setDireccion(veterinarioData.direccion);
      setLoading(false);
    }, 500);
  }, []);

  const handleVolver = () => {
    navigate(-1);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Simulación de envío de los datos actualizados del perfil a la API
    console.log('Datos del perfil actualizados:', { nombre, especialidad, email, telefono, direccion });
    navigate('/veterinario/perfil');
  };

  if (loading) {
    return <div>Cargando datos del perfil...</div>;
  }

  if (error) {
    return <div>Error al cargar los datos del perfil: {error}</div>;
  }

  return (
    <motion.div
      className={styles.editarPerfilContainer}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className={styles.header}>
        <button onClick={handleVolver} className={styles.volverBtn}>
          <FontAwesomeIcon icon={faArrowLeft} /> Volver
        </button>
        <h2><FontAwesomeIcon icon={faUserCog} /> Editar Perfil</h2>
      </div>
      <form onSubmit={handleSubmit} className={styles.formulario}>
        <div className={styles.formGroup}>
          <label htmlFor="nombre">Nombre:</label>
          <input type="text" id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="especialidad">Especialidad:</label>
          <input type="text" id="especialidad" value={especialidad} onChange={(e) => setEspecialidad(e.target.value)} />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="email">Email:</label>
          <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="telefono">Teléfono:</label>
          <input type="tel" id="telefono" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="direccion">Dirección:</label>
          <input type="text" id="direccion" value={direccion} onChange={(e) => setDireccion(e.target.value)} />
        </div>
        <motion.button type="submit" className={styles.guardarBtn} variants={buttonVariants} whileHover="hover" whileTap="tap">
          Guardar Cambios
        </motion.button>
      </form>
    </motion.div>
  );
};

export default EditarPerfilVeterinario;