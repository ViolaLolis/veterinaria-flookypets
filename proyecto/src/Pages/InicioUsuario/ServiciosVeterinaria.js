import React, { useState, useEffect, useCallback } from 'react';
import TarjetaServicio from './TarjetaServicio';
import styles from './Styles/ServiciosVeterinaria.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBriefcaseMedical, faSpinner, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { authFetch } from './api'; // Asegúrate de que la ruta sea correcta

const ServiciosVeterinaria = () => {
  const navigate = useNavigate();
  const [servicios, setServicios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchServices = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await authFetch('/servicios');
      if (response.success) {
        setServicios(response.data);
      } else {
        setError(response.message || 'Error al cargar los servicios.');
      }
    } catch (err) {
      console.error("Error fetching services:", err);
      setError('Error de conexión al servidor.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleAgendar = (servicioId, servicioNombre, servicioPrecio) => {
    navigate('/usuario/citas/agendar', {
      state: { servicioId, servicioNombre, servicioPrecio } // Pasamos el ID, nombre y precio del servicio como estado
    });
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <FontAwesomeIcon icon={faSpinner} spin className={styles.spinnerIcon} />
        <p>Cargando servicios...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorMessage}>
        <FontAwesomeIcon icon={faInfoCircle} className={styles.infoIcon} />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <FontAwesomeIcon icon={faBriefcaseMedical} className={styles.icon} />
        <h3>Nuestros Servicios</h3>
        <p className={styles.subtitle}>Cuidamos la salud y el bienestar de tus mascotas.</p>
      </div>
      <div className={styles.listaServicios}>
        {servicios.length > 0 ? (
          servicios.map(servicio => (
            <div key={servicio.id_servicio} className={styles.servicioItem}>
              <TarjetaServicio
                servicio={servicio}
                onAgendar={() => handleAgendar(servicio.id_servicio, servicio.nombre, servicio.precio)}
              />
            </div>
          ))
        ) : (
          <div className={styles.noResults}>
            <FontAwesomeIcon icon={faInfoCircle} className={styles.infoIcon} />
            <p>No hay servicios disponibles en este momento.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiciosVeterinaria;
