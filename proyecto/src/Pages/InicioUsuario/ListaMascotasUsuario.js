import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { FaPaw, FaChevronLeft, FaChevronRight, FaPlus, FaInfoCircle, FaSearch } from 'react-icons/fa';
import TarjetaMascota from './TarjetaMascota';
import styles from './Styles/MisMascotas.module.css';

const ListaMascotasUsuario = () => {
  const { user } = useOutletContext(); // Puedes mantener user si quieres
  const navigate = useNavigate();
  const [allUserPets, setAllUserPets] = useState([]);
  const [currentPetIndex, setCurrentPetIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  // Mascotas locales hardcodeadas simulando datos
  const mascotasSimuladas = [
    {
      id_mascota: '001',
      nombre: 'Luna',
      especie: 'Gato',
      raza: 'Siames',
      edad: 2,
      peso: 4,
      sexo: 'Hembra',
      estado_salud: 'Saludable',
      imagen: 'https://cdn.pixabay.com/photo/2017/11/09/21/41/cat-2934720_1280.jpg',
      proxima_cita: '2025-08-10T09:00:00',
    },
    {
      id_mascota: '002',
      nombre: 'Max',
      especie: 'Perro',
      raza: 'Bulldog',
      edad: 5,
      peso: 20,
      sexo: 'Macho',
      estado_salud: 'Vacunado',
      imagen: 'https://cdn.pixabay.com/photo/2015/03/26/09/54/bulldog-690563_1280.jpg',
      proxima_cita: '2025-07-20T11:30:00',
    },
    {
      id_mascota: '003',
      nombre: 'Nina',
      especie: 'Perro',
      raza: 'Golden Retriever',
      edad: 4,
      peso: 30,
      sexo: 'Hembra',
      estado_salud: 'En tratamiento',
      imagen: 'https://cdn.pixabay.com/photo/2015/03/26/09/41/golden-retriever-690566_1280.jpg',
      proxima_cita: null,
    },
  ];

  // Simulamos cargar los datos locales en lugar de llamar a la API
  useEffect(() => {
    setAllUserPets(mascotasSimuladas);
    setCurrentPetIndex(0);
  }, []);

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

      {allUserPets.length > 0 && (
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
      )}

      {filteredPets.length > 0 ? (
        <div className={styles.petCarouselContainer}>
          <div className={styles.petCarousel}>
            <button
              onClick={showPreviousPet}
              className={styles.carouselButton}
              disabled={filteredPets.length <= 1}
            >
              <FaChevronLeft />
            </button>
            <div className={styles.carouselContentWrapper}>
              <div className={styles.staticCardWrapper}>
                <TarjetaMascota mascota={currentPet} />
              </div>
            </div>
            <button
              onClick={showNextPet}
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
                onClick={() => setCurrentPetIndex(index)}
              />
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
