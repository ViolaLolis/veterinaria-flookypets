import React from 'react';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate
import styles from './Styles/TarjetaMascota.module.css'; // Create this CSS module
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faEye } from '@fortawesome/free-solid-svg-icons'; // Importa los iconos necesarios

const TarjetaMascota = ({ mascota }) => {
  const navigate = useNavigate();
  // Default image if imagen_url is not provided or is invalid
  const defaultPetImage = 'https://placehold.co/150x150/EEEEEE/888888?text=No+Image';

  const handleViewProfile = () => {
    navigate(`/usuario/mascota/${mascota.id_mascota}`);
  };

  const handleEdit = () => {
    navigate(`/usuario/mascota/editar/${mascota.id_mascota}`);
  };

  return (
    <div className={styles.tarjetaMascota}>
      <img
        src={mascota.imagen_url || defaultPetImage}
        alt={`Foto de ${mascota.nombre}`}
        className={styles.mascotaImagen}
        onError={(e) => { e.target.src = defaultPetImage; }} // Fallback on error
      />
      <div className={styles.mascotaInfo}>
        <h3>{mascota.nombre}</h3>
        <p><strong>Especie:</strong> {mascota.especie}</p>
        <p><strong>Raza:</strong> {mascota.raza || 'N/A'}</p>
        <p><strong>Edad:</strong> {mascota.edad ? `${mascota.edad} años` : 'N/A'}</p>
        {/* Puedes añadir más detalles aquí si los necesitas */}
      </div>
      <div className={styles.mascotaActions}>
        <button className={styles.viewButton} onClick={handleViewProfile}>
          <FontAwesomeIcon icon={faEye} /> Ver Perfil
        </button>
        <button className={styles.editButton} onClick={handleEdit}>
          <FontAwesomeIcon icon={faEdit} /> Editar
        </button>
      </div>
    </div>
  );
};

export default TarjetaMascota;
