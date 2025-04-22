import React from 'react';
import TarjetaServicio from './TarjetaServicio';
import styles from './Styles/ServiciosVeterinaria.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBriefcaseMedical, faEye, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom'; // Importa useNavigate

const ServiciosVeterinaria = () => {
  const navigate = useNavigate();

  const handleVolverInicio = () => {
    navigate('/usuario'); // Asume que '/usuario' es tu página principal
  };

  // Aquí iría la lógica para obtener los servicios de la veterinaria
  const servicios = [
    { id: 1, nombre: 'Consulta General', descripcion: 'Revisión médica básica para tu mascota.', precio: '$50.000' },
    { id: 2, nombre: 'Vacunación', descripcion: 'Programas de vacunación personalizados para proteger a tu compañero.', precio: '$30.000' },
    { id: 3, nombre: 'Estética Canina y Felina', descripcion: 'Baño, corte de pelo y otros tratamientos de belleza.', precio: '$40.000' },
    { id: 4, nombre: 'Cirugía', descripcion: 'Procedimientos quirúrgicos con equipo moderno y veterinarios especializados.', precio: 'Consultar' },
    { id: 5, nombre: 'Diagnóstico por Imagen', descripcion: 'Rayos X, ecografías y otros métodos de diagnóstico avanzado.', precio: 'Consultar' },
    { id: 6, nombre: 'Laboratorio Clínico', descripcion: 'Análisis de sangre, orina y otros fluidos corporales.', precio: '25.000' },
  ];

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
            <TarjetaServicio servicio={servicio} />
            <div className={styles.servicioActions}>
              <button className={styles.verDetallesBtn}>
                <FontAwesomeIcon icon={faEye} className={styles.actionIcon} /> Ver Detalles
              </button>
              <Link to="/usuario/citas/agendar" className={styles.agendarBtn}>
                Agendar Cita
              </Link>
            </div>
          </div>
        ))}
      </div>
      <div className={styles.verTodosContainer}>
        <button className={styles.verTodosBtn}>Ver Todos Los Servicios</button>
      </div>
    </div>
  );
};

export default ServiciosVeterinaria;