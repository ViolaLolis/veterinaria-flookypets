import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { FaPaw, FaPlus, FaInfoCircle, FaSearch } from 'react-icons/fa';
import TarjetaMascota from './TarjetaMascota';
import styles from './Styles/MisMascotas.module.css'; // Mantener la importación de CSS con .module.css
import { authFetch } from '../../utils/api'; // Importar la función authFetch

const ListaMascotasUsuario = () => {
  const { user, showNotification } = useOutletContext();
  const navigate = useNavigate();
  const [allUserPets, setAllUserPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Función para obtener las mascotas del usuario desde la API
  useEffect(() => {
    const fetchMascotas = async () => {
      setLoading(true);
      setError(null);

      // Verificar si el usuario está disponible antes de intentar la llamada a la API
      if (!user?.id) {
        showNotification('No se pudo cargar la información del usuario. Por favor, inicia sesión.', 'error');
        setLoading(false);
        return;
      }

      try {
        // Realiza la llamada a la API para obtener las mascotas del propietario actual
        // Se asume que el endpoint /mascotas acepta un parámetro id_propietario
        const response = await authFetch(`/mascotas?id_propietario=${user.id}`);
        
        if (response.success) {
          setAllUserPets(response.data || []); // Asegurarse de que sea un array, incluso si está vacío
        } else {
          // Mostrar mensaje de error si la API responde con éxito: false
          showNotification(response.message || 'Error al cargar tus mascotas.', 'error');
          setError(response.message || 'Error al cargar tus mascotas.');
          setAllUserPets([]); // Limpiar mascotas si hay un error
        }
      } catch (err) {
        // Capturar errores de red o de la función authFetch
        console.error("Error fetching user pets:", err);
        showNotification('Error de conexión al servidor.', 'error');
        setError('Error de conexión al servidor.');
      } finally {
        setLoading(false);
      }
    };

    fetchMascotas();
  }, [user, showNotification]); // Depende del objeto user para recargar cuando esté disponible

  // Filtra las mascotas basándose en el término de búsqueda
  const filteredPets = allUserPets.filter(pet =>
    pet.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pet.especie.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (pet.raza && pet.raza.toLowerCase().includes(searchTerm.toLowerCase()))
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
          <button className={styles.primaryButton} onClick={() => window.location.reload()}>
            Reintentar
          </button>
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
