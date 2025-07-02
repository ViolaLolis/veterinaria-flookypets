// src/Pages/InicioUsuario/ListaMascotasUsuario.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { FaPaw, FaChevronLeft, FaChevronRight, FaPlus, FaInfoCircle, FaSpinner, FaSearch } from 'react-icons/fa';
// import { motion, AnimatePresence } from 'framer-motion'; // ¡QUITAMOS ESTA IMPORTACIÓN!
import TarjetaMascota from './TarjetaMascota';
import styles from './Styles/MisMascotas.module.css';
import { authFetch } from './api';

const ListaMascotasUsuario = () => {
  const { user, showNotification } = useOutletContext();
  const navigate = useNavigate();
  const [allUserPets, setAllUserPets] = useState([]);
  const [currentPetIndex, setCurrentPetIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUserPets = useCallback(async () => {
    if (!user || !user.id) {
      setError('No se pudo obtener la información del usuario. Por favor, inicia sesión.');
      setIsLoading(false);
      return;
    }
    try {
      const response = await authFetch(`/mascotas?id_propietario=${user.id}`);
      if (response.success) {
        const petsWithImages = response.data.map(pet => ({
          ...pet,
          imagen: pet.imagen_url || `https://api.dicebear.com/7.x/initials/svg?seed=${pet.nombre.charAt(0) || 'P'}&chars=1&backgroundColor=00acc1,007c91,4dd0e1&fontFamily=Poppins`
        }));
        setAllUserPets(petsWithImages);
        if (petsWithImages.length > 0) {
          setCurrentPetIndex(0);
        }
      } else {
        setError(response.message || 'Error al obtener mascotas.');
      }
    } catch (err) {
      console.error("Error en authFetch para /mascotas:", err);
      setError('Error de conexión al servidor.');
    } finally {
      setIsLoading(false);
    }
  }, [user]); // Eliminamos authFetch del array de dependencias si es una función global y no cambia.

  useEffect(() => {
    fetchUserPets();
  }, [fetchUserPets]);

  const filteredPets = allUserPets.filter(pet =>
    pet.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (filteredPets.length > 0 && currentPetIndex >= filteredPets.length) {
      setCurrentPetIndex(0);
    } else if (filteredPets.length === 0) {
      setCurrentPetIndex(0);
    }
  }, [filteredPets, currentPetIndex]);

  const showNextPet = () => {
    setCurrentPetIndex((prevIndex) => (prevIndex + 1) % filteredPets.length);
  };

  const showPreviousPet = () => {
    setCurrentPetIndex((prevIndex) => (prevIndex - 1 + filteredPets.length) % filteredPets.length);
  };

  // ¡QUITAMOS cardVariants y paginate de aquí!
  // const cardVariants = {...};
  // const [direction, setDirection] = useState(0);
  // const paginate = (newDirection) => {...};


  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <FaSpinner className={styles.spinnerIcon} />
        <p>Cargando mascotas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorMessage}>
        <FaInfoCircle className={styles.errorIcon} />
        <p>{error}</p>
      </div>
    );
  }

  const currentPet = filteredPets[currentPetIndex];

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>
        <FaPaw className={styles.sectionIcon} /> Mis Mascotas
      </h2>

      <div className={styles.infoBox}>
        <FaInfoCircle className={styles.infoBoxIcon} />
        <p>
          <span className={styles.infoBoxTitle}>Consejo:</span> Para aprovechar al máximo tu experiencia,
          te recomendamos verificar y completar la información de tus compañeros peludos en la sección "Mis Mascotas".
        </p>
      </div>

      {allUserPets.length > 0 ? (
        <div className={styles.searchBarContainer}>
          <FaSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Buscar mascota por nombre..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      ) : null}

      {filteredPets.length > 0 ? (
        <div className={styles.petCarouselContainer}>
          <div className={styles.petCarousel}>
            <button
              onClick={showPreviousPet} // Llamamos directamente a showPreviousPet
              className={styles.carouselButton}
              disabled={filteredPets.length <= 1}
            >
              <FaChevronLeft />
            </button>
            <div className={styles.carouselContentWrapper}>
              {/* ¡QUITAMOS AnimatePresence y motion.div! */}
              {currentPet && (
                <div className={styles.staticCardWrapper}> {/* Nuevo div para envolver sin animación */}
                  <TarjetaMascota mascota={currentPet} />
                </div>
              )}
            </div>
            <button
              onClick={showNextPet} // Llamamos directamente a showNextPet
              className={styles.carouselButton}
              disabled={filteredPets.length <= 1}
            >
              <FaChevronRight />
            </button>
          </div>

          <div className={styles.carouselIndicators}>
            {filteredPets.map((_, index) => (
              <span
                key={index}
                className={`${styles.indicatorDot} ${index === currentPetIndex ? styles.activeDot : ''}`}
                // Puedes habilitar el click aquí si quieres un salto directo al índice
                onClick={() => setCurrentPetIndex(index)}
              ></span>
            ))}
          </div>
        </div>
      ) : (
        allUserPets.length > 0 ? (
            <div className={styles.noContent}>
                <FaInfoCircle className={styles.infoIcon} />
                <p>No se encontraron mascotas con ese nombre.</p>
                <button className={styles.primaryButton} onClick={() => setSearchTerm('')}>
                    Ver todas las mascotas
                </button>
            </div>
        ) : (
            <div className={styles.noContent}>
                <FaInfoCircle className={styles.infoIcon} />
                <p>No tienes mascotas registradas. ¡Añade una ahora!</p>
                <button className={styles.primaryButton} onClick={() => navigate('/usuario/mascotas/agregar')}>
                    <FaPlus /> Registrar Mascota
                </button>
            </div>
        )
      )}
    </section>
  );
};

export default ListaMascotasUsuario;