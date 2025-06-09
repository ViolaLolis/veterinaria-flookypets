import React from 'react';
import TarjetaServicio from './TarjetaServicio';
import styles from './Styles/ServiciosVeterinaria.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBriefcaseMedical } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

const ServiciosVeterinaria = () => {
  const navigate = useNavigate();

  const servicios = [
    { id: 1, nombre: 'Consulta General', descripcion: 'Revisión médica básica para tu mascota.', precio: '$50.000' },
    { id: 2, nombre: 'Vacunación', descripcion: 'Programas de vacunación personalizados para proteger a tu compañero.', precio: '$30.000' },
    { id: 3, nombre: 'Estética Canina y Felina', descripcion: 'Baño, corte de pelo y otros tratamientos de belleza.', precio: '$40.000' },
    { id: 4, nombre: 'Cirugía', descripcion: 'Procedimientos quirúrgicos con equipo moderno y veterinarios especializados.', precio: 'Consultar' },
    { id: 5, nombre: 'Diagnóstico por Imagen', descripcion: 'Rayos X, ecografías y otros métodos de diagnóstico avanzado.', precio: 'Consultar' },
    { id: 6, nombre: 'Laboratorio Clínico', descripcion: 'Análisis de sangre, orina y otros fluidos corporales.', precio: '25.000' },
  ];

  const handleAgendar = (servicioId) => {
    navigate('/usuario/citas/agendar', { 
      state: { servicioId } // Pasamos el ID del servicio como estado
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <FontAwesomeIcon icon={faBriefcaseMedical} className={styles.icon} />
        <h3>Nuestros Servicios</h3>
        <p className={styles.subtitle}>Cuidamos la salud y el bienestar de tus mascotas.</p>
      </div>
      <div className={styles.listaServicios}>
        {servicios.map(servicio => (
          <div key={servicio.id} className={styles.servicioItem}>
            <TarjetaServicio 
              servicio={servicio} 
              onAgendar={handleAgendar} // Pasamos la función de agendar
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiciosVeterinaria;