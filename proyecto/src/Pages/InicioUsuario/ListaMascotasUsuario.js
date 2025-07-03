import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { FaPaw, FaPlus, FaInfoCircle, FaSearch } from 'react-icons/fa';
import TarjetaMascota from './TarjetaMascota';
import styles from './Styles/MisMascotas.module.css';

const ListaMascotasUsuario = () => {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const [allUserPets, setAllUserPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Mascotas locales hardcodeadas simulando datos de API
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
    {
      id_mascota: '004',
      nombre: 'Firulais',
      especie: 'Perro',
      raza: 'Criollo',
      edad: 7,
      peso: 15,
      sexo: 'Macho',
      estado_salud: 'Saludable',
      imagen: 'https://cdn.pixabay.com/photo/2016/02/18/18/37/puppy-1207810_1280.jpg',
      proxima_cita: '2025-09-01T15:00:00',
    },
    {
      id_mascota: '005',
      nombre: 'Coco',
      especie: 'Gato',
      raza: 'Común Europeo',
      edad: 1,
      peso: 3.5,
      sexo: 'Hembra',
      estado_salud: 'Vacunada',
      imagen: 'https://cdn.pixabay.com/photo/2017/02/20/18/03/cat-2083492_1280.jpg',
      proxima_cita: '2025-07-28T10:00:00',
    },
  ];

  // Simulamos cargar los datos con un pequeño retraso
  useEffect(() => {
    const fetchMascotas = async () => {
      try {
        setLoading(true);
        // Simula una llamada a API real
        await new Promise(resolve => setTimeout(resolve, 800)); // Simula retardo de red
        setAllUserPets(mascotasSimuladas);
      } catch (err) {
        setError('Error al cargar las mascotas. Por favor, inténtalo de nuevo más tarde.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMascotas();
  }, []);

  // Filtra las mascotas basándose en el término de búsqueda
  const filteredPets = allUserPets.filter(pet =>
    pet.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pet.especie.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pet.raza.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>
        <FaPaw className={styles.sectionIcon} /> Mis Mascotas
      </h2>

      <div className={styles.infoBox}>
        <FaInfoCircle className={styles.infoBoxIcon} />
        <p>
          <span className={styles.infoBoxTitle}>Consejo:</span> Aquí puedes ver la información detallada de tus mascotas. Utiliza la barra de búsqueda para encontrarlas rápidamente.
        </p>
      </div>

      {/* Contenedor de la barra de búsqueda (siempre visible si hay mascotas para buscar) */}
      {allUserPets.length > 0 && (
        <div className={styles.searchFilterContainer}>
          <div className={styles.searchInputWrapper}>
            <FaSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar mascota por nombre, especie o raza..."
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
        </div>
      )}

      {/* Manejo de estados: Cargando, Error, Sin contenido, o Mostrar mascotas */}
      {loading ? (
        <div className={styles.loadingContainer}>
          <FaPaw className={styles.spinnerIcon} />
          <p>Cargando tus mascotas...</p>
        </div>
      ) : error ? (
        <div className={styles.errorMessage}>
          <FaInfoCircle className={styles.errorIcon} />
          <p>{error}</p>
          {/* Opción para reintentar la carga si hay un error (opcional) */}
          {/* <button className={styles.primaryButton} onClick={() => window.location.reload()}>
            Reintentar
          </button> */}
        </div>
      ) : filteredPets.length === 0 ? (
        <div className={styles.noContent}>
          <FaInfoCircle className={styles.infoIcon} />
          <p>
            {/* Mensaje dinámico según si hay búsqueda o no */}
            {searchTerm
              ? `No se encontraron mascotas que coincidan con "${searchTerm}".`
              : 'No tienes mascotas registradas. ¡Añade una ahora!'}
          </p>
          {searchTerm && allUserPets.length > 0 && (
            // Botón para limpiar la búsqueda si hay resultados filtrados pero no se encuentran
            <button className={styles.primaryButton} onClick={() => setSearchTerm('')}>
              Ver todas las mascotas
            </button>
          )}
          {/* El botón "Registrar Mascota" solo se muestra cuando NO hay mascotas registradas y NO hay término de búsqueda */}
          {!searchTerm && allUserPets.length === 0 && (
            <button className={styles.primaryButton} onClick={() => navigate('/usuario/mascotas/agregar')}>
              <FaPlus /> Registrar Mascota
            </button>
          )}
        </div>
      ) : (
        // Contenedor de la cuadrícula de mascotas
        <div className={styles.petsGridContainer}>
          {filteredPets.map((mascota) => (
            <TarjetaMascota key={mascota.id_mascota} mascota={mascota} />
          ))}
        </div>
      )}

      {/* Se eliminó el botón "Añadir Nueva Mascota" que estaba al final de la sección.
          Ahora está integrado en el searchFilterContainer.
      */}

    </section>
  );
};

export default ListaMascotasUsuario;