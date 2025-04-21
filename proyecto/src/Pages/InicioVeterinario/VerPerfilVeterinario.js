// src/Pages/InicioVeterinario/PerfilVeterinario/VerPerfilVeterinario.js
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './Style/VerPerfilVeterinarioStyles.module.css';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faEdit, faCog, faPhone, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeInOut' } },
};

const buttonVariants = {
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
};

// Recibe setUser como una prop
const VerPerfilVeterinario = ({ setUser }) => {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleCerrarSesion = () => {
    // Ahora puedes usar la función setUser que recibes como prop
    if (setUser) {
      setUser(null);
      navigate('/login');
    } else {
      console.warn("La función 'setUser' no se pasó como prop.");
      // Maneja el caso en que setUser no esté disponible
    }
  };

  useEffect(() => {
    // Simulación de llamada a la API para obtener el perfil del veterinario
    setTimeout(() => {
      const veterinarioData = {
        nombre: 'Dra. Sofia Vargas',
        especialidad: 'Medicina General Veterinaria',
        email: 'sofia.vargas@example.com',
        telefono: '300...',
        direccion: 'Carrera 10 # 20-30',
      };
      setPerfil(veterinarioData);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return <div>Cargando perfil...</div>;
  }

  if (error) {
    return <div>Error al cargar el perfil: {error}</div>;
  }

  if (!perfil) {
    return <div>No se encontró información del perfil.</div>;
  }

  return (
    <motion.div
      className={styles.perfilContainer}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className={styles.header}>
        <FontAwesomeIcon icon={faUserCircle} className={styles.userIcon} size="3x" />
        <h2>Mi Perfil</h2>
        <div>
          <Link to="/veterinario/configuracion" className={styles.headerButton} title="Configuración">
            <FontAwesomeIcon icon={faCog} />
          </Link>
          <Link to="/veterinario/llamada" className={styles.headerButton} title="Llamada">
            <FontAwesomeIcon icon={faPhone} />
          </Link>
          <Link to="/veterinario/perfil/editar" className={styles.editButton}>
            <FontAwesomeIcon icon={faEdit} /> Editar Perfil
          </Link>
          <motion.button
            onClick={handleCerrarSesion}
            className={styles.cerrarSesionBtn}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <FontAwesomeIcon icon={faSignOutAlt} /> Cerrar Sesión
          </motion.button>
        </div>
      </div>
      <div className={styles.infoSection}>
        <h3>Información Personal</h3>
        <p><strong>Nombre:</strong> {perfil.nombre}</p>
        <p><strong>Especialidad:</strong> {perfil.especialidad}</p>
        <p><strong>Email:</strong> {perfil.email}</p>
        <p><strong>Teléfono:</strong> {perfil.telefono}</p>
        <p><strong>Dirección:</strong> {perfil.direccion}</p>
        {/* Puedes mostrar más información del perfil aquí */}
      </div>
    </motion.div>
  );
};

export default VerPerfilVeterinario;