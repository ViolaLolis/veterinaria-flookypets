// TarjetaMascota.jsx
import React from 'react';
import styles from './Styles/TarjetaMascota.module.css'; // Create this CSS module

const TarjetaMascota = ({ mascota }) => {
  // Default image if imagen_url is not provided or is invalid
  const defaultPetImage = 'https://via.placeholder.com/150/EEEEEE/888888?text=No+Image';

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
        <p><strong>Raza:</strong> {mascota.raza}</p>
        <p><strong>Edad:</strong> {mascota.edad} años</p>
        {/* Add more pet details as needed */}
      </div>
      {/* Add buttons for edit, view profile etc. */}
      <div className={styles.mascotaActions}>
        <button className={styles.viewButton}>Ver Perfil</button>
        <button className={styles.editButton}>Editar</button>
      </div>
    </div>
  );
};

export default TarjetaMascota;