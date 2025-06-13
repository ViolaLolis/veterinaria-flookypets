import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import veteStyles  from './Style/EditarMascotaStyles.module.css';// Updated import
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPaw } from '@fortawesome/free-solid-svg-icons'; // Added faSpinner for loading

const containerVariants = {
  hidden: { opacity: 0, x: '-100vw' },
  visible: { opacity: 1, x: 0, transition: { type: 'spring', delay: 0.2, damping: 20, stiffness: 100 } },
  exit: { x: '100vw', transition: { ease: 'easeInOut' } },
};

const buttonVariants = {
  hover: { scale: 1.05, boxShadow: '0 5px 15px rgba(0, 172, 193, 0.2)' }, // Enhanced hover
  tap: { scale: 0.95 },
};

const EditarMascota = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [nombre, setNombre] = useState('');
  const [especie, setEspecie] = useState('');
  const [raza, setRaza] = useState('');
  const [propietarioId, setPropietarioId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simulate fetching existing pet data from an API
    setTimeout(() => {
      try {
        const mascotaData = { id: parseInt(id), nombre: 'Max (Labrador)', especie: 'Perro', raza: 'Labrador Retriever', propietarioId: '1' };
        if (mascotaData.id === parseInt(id)) {
          setNombre(mascotaData.nombre);
          setEspecie(mascotaData.especie);
          setRaza(mascotaData.raza);
          setPropietarioId(mascotaData.propietarioId);
          setLoading(false);
        } else {
          throw new Error('Mascota no encontrada');
        }
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }, 800); // Increased timeout for a more noticeable loading state
  }, [id]);

  const handleVolver = () => {
    navigate(-1);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // In a real application, you'd send this data to your backend API
    console.log('Datos de la mascota actualizados:', { id, nombre, especie, raza, propietarioId });
    // Simulate successful update and navigate back to the pet's detail page or list
    navigate(`/mascotas/${id}`); // Example: navigate to the detailed view of the edited pet
    // Or navigate('/veterinario/mascotas'); if you want to go back to the list
  };

  if (loading) {
    return (
      <div className={veteStyles.veteLoadingContainer}> {/* Using veteStyles */}
        <div className={veteStyles.veteLoadingSpinner}></div> {/* Using veteStyles */}
        <p>Cargando datos de la mascota...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={veteStyles.veteErrorContainer}> {/* Using veteStyles */}
        <h3>Error</h3>
        <p>{error}</p>
        <motion.button
          onClick={handleVolver}
          className={veteStyles.veteVolverBtn} /* Using veteStyles */
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Volver
        </motion.button>
      </div>
    );
  }

  return (
    <motion.div
      className={veteStyles.veteEditarContainer} /* Using veteStyles */
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className={veteStyles.veteHeader}> {/* Using veteStyles */}
        <motion.button
          onClick={handleVolver}
          className={veteStyles.veteVolverBtn} /* Using veteStyles */
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Volver
        </motion.button>
        <h2><FontAwesomeIcon icon={faPaw} /> Editar Mascota</h2>
      </div>
      <form onSubmit={handleSubmit} className={veteStyles.veteFormulario}> {/* Using veteStyles */}
        <div className={veteStyles.veteFormGroup}> {/* Using veteStyles */}
          <label htmlFor="nombre">Nombre:</label>
          <input type="text" id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        </div>
        <div className={veteStyles.veteFormGroup}> {/* Using veteStyles */}
          <label htmlFor="especie">Especie:</label>
          <input type="text" id="especie" value={especie} onChange={(e) => setEspecie(e.target.value)} required />
        </div>
        <div className={veteStyles.veteFormGroup}> {/* Using veteStyles */}
          <label htmlFor="raza">Raza:</label>
          <input type="text" id="raza" value={raza} onChange={(e) => setRaza(e.target.value)} />
        </div>
        <div className={veteStyles.veteFormGroup}> {/* Using veteStyles */}
          <label htmlFor="propietarioId">ID del Propietario:</label>
          <input type="text" id="propietarioId" value={propietarioId} onChange={(e) => setPropietarioId(e.target.value)} required />
          {/* En la realidad, esto sería un selector de propietarios con búsqueda o un dropdown */}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '20px' }}>
          <motion.button type="submit" className={veteStyles.veteGuardarBtn} variants={buttonVariants} whileHover="hover" whileTap="tap"> {/* Using veteStyles */}
            Guardar Cambios
          </motion.button>
          <Link to={`/mascotas/${id}`} className={veteStyles.veteCancelarBtn} variants={buttonVariants} whileHover="hover" whileTap="tap"> {/* Using veteStyles */}
            Cancelar
          </Link>
        </div>
      </form>
    </motion.div>
  );
};

export default EditarMascota;