import React from 'react';
import { useParams, Link } from 'react-router-dom';
import './Styles/DetalleServicio.css'; // Importa el CSS

const DetalleServicio = () => {
  const { id } = useParams();
  // Aquí iría la lógica para obtener los detalles del servicio con el ID proporcionado
  const servicio = {
    id: id,
    nombre: 'Consulta General',
    descripcionCorta: 'Evaluación básica de la salud de tu mascota.',
    descripcionLarga: 'Nuestra consulta general incluye un examen físico completo de tu mascota, evaluación de signos vitales, revisión de historial médico y recomendaciones preventivas. Es el primer paso para asegurar el bienestar de tu compañero.',
    precio: '$50.000',
    imagen: 'https://via.placeholder.com/400/cccccc/ffffff?Text=Consulta', // Reemplaza con la URL de la imagen
  };

  return (
    <div className="detalle-servicio-container">
      <h2 className="detalle-servicio-title">{servicio.nombre}</h2>
      <div className="detalle-servicio-content">
        <img src={servicio.imagen} alt={servicio.nombre} className="detalle-servicio-image" />
        <div className="detalle-servicio-info">
          <p className="detalle-servicio-precio">Precio: <strong>{servicio.precio}</strong></p>
          <p className="detalle-servicio-descripcion-larga">{servicio.descripcionLarga}</p>
          <Link to="/usuario/servicios" className="detalle-servicio-back">Volver a Servicios</Link>
          <button className="detalle-servicio-agendar">Agendar Cita</button> {/* Implementar lógica de agendar */}
        </div>
      </div>
    </div>
  );
};

export default DetalleServicio;