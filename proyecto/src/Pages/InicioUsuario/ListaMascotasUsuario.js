import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { FaPaw, FaChevronLeft, FaChevronRight, FaPlus, FaInfoCircle, FaSpinner, FaChevronDown } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import TarjetaMascota from './TarjetaMascota';
import styles from './Styles/InicioUsuario.module.css'; // Reutilizamos algunos estilos del layout
import { authFetch } from './api';

const ListaMascotasUsuario = () => {
  const { user, showNotification } = useOutletContext(); // Obtiene user y showNotification del contexto del Outlet
  const navigate = useNavigate();
  const [userPets, setUserPets] = useState([]);
  const [currentPetIndex, setCurrentPetIndex] = useState(0);
  const [showPetsDropdown, setShowPetsDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

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
          imagen: pet.imagen_url || `https://placehold.co/300x200/cccccc/ffffff?text=${pet.nombre.charAt(0) || 'P'}`
        }));
        setUserPets(petsWithImages);
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
  }, [user, authFetch]);

  useEffect(() => {
    fetchUserPets();
  }, [fetchUserPets]);

  const showNextPet = () => {
    setCurrentPetIndex((prevIndex) => (prevIndex + 1) % userPets.length);
  };

  const showPreviousPet = () => {
    setCurrentPetIndex((prevIndex) => (prevIndex - 1 + userPets.length) % userPets.length);
  };

  const togglePetsDropdown = () => {
    setShowPetsDropdown(!showPetsDropdown);
  };

  const handleSelectPet = (index) => {
    setCurrentPetIndex(index);
    setShowPetsDropdown(false);
  };

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

  const currentPet = userPets[currentPetIndex];

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>
        <FaPaw className={styles.sectionIcon} /> Mis Mascotas
      </h2>
      {userPets.length > 0 ? (
        <div className={styles.petCarousel}>
          <button onClick={showPreviousPet} className={styles.carouselButton}>
            <FaChevronLeft />
          </button>
          <TarjetaMascota mascota={currentPet} />
          <button onClick={showNextPet} className={styles.carouselButton}>
            <FaChevronRight />
          </button>
          <div className={styles.petDropdownContainer}>
            <button onClick={togglePetsDropdown} className={styles.petDropdownToggle}>
              Ver todas las mascotas <FaChevronDown />
            </button>
            {showPetsDropdown && (
              <div className={styles.petDropdownMenu}>
                {userPets.map((pet, index) => (
                  <button key={pet.id_mascota} onClick={() => handleSelectPet(index)}>
                    {pet.nombre} ({pet.especie})
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className={styles.noContent}>
          <FaInfoCircle className={styles.infoIcon} />
          <p>No tienes mascotas registradas. ¡Añade una ahora!</p>
          <button className={styles.primaryButton} onClick={() => navigate('/usuario/mascotas/agregar')}>
            <FaPlus /> Registrar Mascota
          </button>
        </div>
      )}
    </section>
  );
};

export default ListaMascotasUsuario;
