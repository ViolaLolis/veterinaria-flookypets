import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Style/EditarPerfilVeterinarioStyles.module.css';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faUserCog, faSave } from '@fortawesome/free-solid-svg-icons';

const containerVariants = {
  hidden: { opacity: 0, x: '-100vw' },
  visible: { 
    opacity: 1, 
    x: 0, 
    transition: { 
      type: 'spring', 
      delay: 0.2, 
      damping: 20, 
      stiffness: 100 
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

const buttonVariants = {
  hover: { 
    scale: 1.05,
    boxShadow: "0 5px 15px rgba(0, 172, 193, 0.4)"
  },
  tap: { 
    scale: 0.95,
    boxShadow: "0 2px 5px rgba(0, 172, 193, 0.2)"
  },
};

const inputVariants = {
  focus: {
    scale: 1.02,
    boxShadow: "0 0 0 3px rgba(0, 172, 193, 0.2)"
  }
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Simulación de llamada a la API
    setTimeout(() => {
      const veterinarioData = {
        nombre: 'Dra. Sofia Vargas',
        especialidad: 'Medicina General Veterinaria',
        email: 'sofia.vargas@example.com',
        telefono: '3001234567',
        direccion: 'Carrera 10 # 20-30',
      };
      setNombre(veterinarioData.nombre);
      setEspecialidad(veterinarioData.especialidad);
      setEmail(veterinarioData.email);
      setTelefono(veterinarioData.telefono);
      setDireccion(veterinarioData.direccion);
      setLoading(false);
    }, 800);
  }, []);

  const handleVolver = () => {
    navigate(-1);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    
    // Simulación de envío a la API
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Datos actualizados:', { nombre, especialidad, email, telefono, direccion });
      navigate('/veterinario/perfil');
    } catch (err) {
      setError('Error al guardar los cambios');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Cargando datos del perfil...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h3>Error</h3>
        <p>{error}</p>
        <motion.button 
          onClick={() => navigate('/veterinario/perfil')} 
          className={styles.volverBtn}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Volver al perfil
        </motion.button>
      </div>
    );
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
        <motion.button 
          onClick={handleVolver} 
          className={styles.volverBtn}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Volver
        </motion.button>
        <h2><FontAwesomeIcon icon={faUserCog} /> Editar Perfil</h2>
      </div>
      
      <form onSubmit={handleSubmit} className={styles.formulario}>
        <motion.div className={styles.formGroup}>
          <label htmlFor="nombre">Nombre:</label>
          <motion.input
            type="text"
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            whileFocus="focus"
            variants={inputVariants}
          />
        </motion.div>
        
        <motion.div className={styles.formGroup}>
          <label htmlFor="especialidad">Especialidad:</label>
          <motion.input
            type="text"
            id="especialidad"
            value={especialidad}
            onChange={(e) => setEspecialidad(e.target.value)}
            whileFocus="focus"
            variants={inputVariants}
          />
        </motion.div>
        
        <motion.div className={styles.formGroup}>
          <label htmlFor="email">Email:</label>
          <motion.input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            whileFocus="focus"
            variants={inputVariants}
          />
        </motion.div>
        
        <motion.div className={styles.formGroup}>
          <label htmlFor="telefono">Teléfono:</label>
          <motion.input
            type="tel"
            id="telefono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            whileFocus="focus"
            variants={inputVariants}
          />
        </motion.div>
        
        <motion.div className={styles.formGroup}>
          <label htmlFor="direccion">Dirección:</label>
          <motion.input
            type="text"
            id="direccion"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            whileFocus="focus"
            variants={inputVariants}
          />
        </motion.div>
        
        <motion.button
          type="submit"
          className={styles.guardarBtn}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            'Guardando...'
          ) : (
            <>
              <FontAwesomeIcon icon={faSave} /> Guardar Cambios
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default EditarPerfilVeterinario;