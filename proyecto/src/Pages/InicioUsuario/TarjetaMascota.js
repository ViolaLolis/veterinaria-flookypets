import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDog, faCat, faPaw, faEdit, faClipboardList, faCalendarAlt, // Iconos generales
  faMars, faVenus, // Iconos de género (sexo)
  faWeight, faStethoscope, faEye // faEye para "Ver Perfil"
} from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import styles from './Styles/TarjetaMascota.module.css';

const TarjetaMascota = ({ mascota: propMascota }) => { // Cambiado el nombre de la prop para evitar conflicto
  const navigate = useNavigate();

  // --- INFO LOCAL: Mascota de ejemplo hardcodeada ---
  // Utiliza esta mascota de ejemplo si 'propMascota' no se proporciona o es nula.
  // IMPORTANTE: En una aplicación real, 'mascota' vendría de props o un estado global.
  const mascotaLocalDeEjemplo = {
    id_mascota: '12345',
    nombre: 'Lily',
    especie: 'Perro',
    raza: 'Labrador Retriever',
    edad: 3,
    peso: 25, // en kg
    sexo: 'Hembra',
    estado_salud: 'Saludable',
    // Puedes poner una URL de imagen local si tienes una en tu carpeta 'public' o 'src/assets'
    // Por ejemplo: imagen: '/images/lily_the_dog.jpg',
    // Si la pones en 'public', la URL sería '/nombre_de_tu_imagen.jpg'
    // Si la pones en 'src/assets', tendrías que importarla: import lilyImage from './assets/lily_the_dog.jpg';
    // imagen: lilyImage, // Y luego usarla aquí
    imagen: 'https://cdn.pixabay.com/photo/2016/12/13/05/15/puppy-1903313_1280.jpg', // URL de ejemplo de internet
    proxima_cita: '2025-07-15T10:30:00', // Ejemplo de fecha y hora
    // Puedes añadir más campos aquí para probar:
    // chip_id: 'XYZ789',
    // color: 'Dorado',
    // microchip: true,
  };

  // Si no se pasa una mascota por props, usamos la mascota local de ejemplo.
  // Esto es solo para depuración o demostración.
  const mascota = propMascota || mascotaLocalDeEjemplo;

  // Bloque para mostrar cuando no hay mascota disponible (si aún así, mascota es nula después de la asignación)
  if (!mascota) {
    console.log("TarjetaMascota: No hay objeto mascota o es nulo/undefined después de intentar asignar mascota local.");
    return (
      <motion.div
        className={styles.petCard}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className={styles.noPetContent}>
          <FontAwesomeIcon icon={faPaw} className={styles.noPetIcon} />
          <h3>No hay mascota seleccionada</h3>
          <p>Por favor, selecciona o registra una mascota.</p>
        </div>
      </motion.div>
    );
  }

  // --- DEBUGGING: Revisa estos logs en la consola del navegador ---
  console.log("TarjetaMascota - Mascota recibida/usada:", mascota);
  console.log("TarjetaMascota - URL de la imagen:", mascota.imagen);
  console.log("TarjetaMascota - Nombre de la mascota:", mascota.nombre);
  // -----------------------------------------------------------------

  // --- Funciones de navegación para los botones de acción ---
  const handleViewDetails = () => {
    navigate(`/usuario/mascotas/${mascota.id_mascota}`);
    console.log(`Navegando a detalles de ${mascota.nombre} (ID: ${mascota.id_mascota})`);
  };

  const handleEditPet = () => {
    navigate(`/usuario/mascotas/editar/${mascota.id_mascota}`);
    console.log(`Navegando a editar a ${mascota.nombre} (ID: ${mascota.id_mascota})`);
  };

  const handleViewMedicalHistory = () => {
    navigate(`/usuario/historial/${mascota.id_mascota}`);
    console.log(`Navegando a historial de ${mascota.nombre} (ID: ${mascota.id_mascota})`);
  };
  // --------------------------------------------------------

  // Helper para obtener el icono de especie
  const getEspecieIcon = (especie) => {
    switch (especie && especie.toLowerCase()) {
      case 'perro': return faDog;
      case 'gato': return faCat;
      default: return faPaw;
    }
  };

  // Helper para obtener el icono de sexo
  const getSexoIcon = (sexo) => {
    if (!sexo) return null;
    switch (sexo.toLowerCase()) {
      case 'macho': return faMars;
      case 'hembra': return faVenus;
      default: return null;
    }
  };

  // Helper para formatear la fecha de la próxima cita
  const formatNextAppointment = (dateString) => {
    if (!dateString) return 'No programada';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      console.error("Error al formatear fecha de cita:", e);
      return 'Fecha inválida';
    }
  };

  return (
    <motion.div
      className={styles.petCard}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02, boxShadow: '0 12px 30px rgba(0, 0, 0, 0.2)' }}
    >
      <div className={styles.petImageContainer}>
        <img
          src={mascota.imagen || `https://api.dicebear.com/7.x/initials/svg?seed=${(mascota.nombre && mascota.nombre.charAt(0)) || 'P'}&chars=1&backgroundColor=00acc1,007c91,4dd0e1&fontFamily=Poppins`}
          alt={`Foto de ${mascota.nombre || 'mascota'}`}
          className={styles.petImage}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${(mascota.nombre && mascota.nombre.charAt(0)) || 'P'}&chars=1&backgroundColor=00acc1,007c91,4dd0e1&fontFamily=Poppins`;
            console.warn(`Error al cargar la imagen de ${mascota.nombre}. Usando fallback de DiceBear.`);
          }}
        />
        {/* Insignias de especie y sexo */}
        <div className={styles.petSpeciesAndSexBadges}>
          <span className={`${styles.badge} ${styles.speciesBadge}`}>
            <FontAwesomeIcon icon={getEspecieIcon(mascota.especie)} /> {mascota.especie || 'Desconocido'}
          </span>
          {getSexoIcon(mascota.sexo) && (
            <span className={`${styles.badge} ${styles.sexBadge} ${(mascota.sexo && mascota.sexo.toLowerCase()) === 'macho' ? styles.male : styles.female}`}>
              <FontAwesomeIcon icon={getSexoIcon(mascota.sexo)} /> {mascota.sexo}
            </span>
          )}
        </div>
      </div>

      <div className={styles.petInfo}>
        <h3 className={styles.petName}>{mascota.nombre || 'Nombre Desconocido'}</h3>
        <div className={styles.petDetailGrid}>
          {/* Detalles de la mascota con iconos */}
          <p className={styles.petDetailItem}>
            <FontAwesomeIcon icon={faPaw} className={styles.detailIcon} />
            <strong>Raza:</strong> {mascota.raza || 'N/A'}
          </p>
          <p className={styles.petDetailItem}>
            <FontAwesomeIcon icon={faCalendarAlt} className={styles.detailIcon} />
            <strong>Edad:</strong> {mascota.edad ? `${mascota.edad} años` : 'N/A'}
          </p>
          <p className={styles.petDetailItem}>
            <FontAwesomeIcon icon={faWeight} className={styles.detailIcon} />
            <strong>Peso:</strong> {mascota.peso ? `${mascota.peso} kg` : 'N/A'}
          </p>
          <p className={styles.petDetailItem}>
            <FontAwesomeIcon icon={faStethoscope} className={styles.detailIcon} />
            <strong>Estado:</strong> {mascota.estado_salud || 'N/A'}
          </p>
          <p className={`${styles.petDetailItem} ${styles.nextAppointment}`}>
            <FontAwesomeIcon icon={faCalendarAlt} className={styles.detailIcon} />
            <strong>Próxima Cita:</strong> {formatNextAppointment(mascota.proxima_cita)}
          </p>
        </div>
      </div>

      <div className={styles.petActions}>
        {/* Botón "Ver Perfil" */}
        <motion.button
          onClick={handleViewDetails}
          className={styles.petCardButton}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >

          <FontAwesomeIcon icon={faEdit} /> Editar
        </motion.button>
        {/* Botón "Historial" */}
        <motion.button
          onClick={handleViewMedicalHistory}
          className={styles.petCardButton}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FontAwesomeIcon icon={faClipboardList} /> Historial
        </motion.button>
        {/* Botón opcional para agendar cita (descomentado si lo necesitas) */}
        {/* <motion.button
          onClick={() => navigate(`/usuario/citas/agendar`, { state: { mascotaId: mascota.id_mascota } })}
          className={styles.petCardButton}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FontAwesomeIcon icon={faCalendarAlt} /> Agendar Cita
        </motion.button> */}
      </div>
    </motion.div>
  );
};

export default TarjetaMascota;