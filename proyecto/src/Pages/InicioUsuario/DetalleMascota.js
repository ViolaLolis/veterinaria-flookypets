import React from 'react';
import { useParams, Link } from 'react-router-dom';
import './Styles/DetalleMascota.css'; // Importa el CSS

const DetalleMascota = () => {
  const { id } = useParams();
  // Aquí iría la lógica para obtener los detalles de la mascota con el ID proporcionado
  const mascota = {
    id: id,
    nombre: 'Pelusa',
    raza: 'Persa',
    edad: '5 años',
    peso: '3.5 kg',
    historial: [
      { id: 1, fecha: '2024-01-15', motivo: 'Vacunación anual' },
      { id: 2, fecha: '2024-05-20', motivo: 'Consulta por alergia' },
    ],
  };

  return (
    <div className="detalle-mascota-container">
      <h2 className="detalle-mascota-title">Detalles de {mascota.nombre}</h2>
      <div className="detalle-mascota-info">
        <p><strong>Nombre:</strong> {mascota.nombre}</p>
        <p><strong>Raza:</strong> {mascota.raza}</p>
        <p><strong>Edad:</strong> {mascota.edad}</p>
        <p><strong>Peso:</strong> {mascota.peso}</p>
      </div>
      <div className="detalle-mascota-historial">
        <h3>Historial Médico</h3>
        {mascota.historial.length > 0 ? (
          <ul>
            {mascota.historial.map(item => (
              <li key={item.id}>
                {item.fecha} - {item.motivo} <Link to={`/usuario/mascota/${id}/historial/${item.id}`}>Ver detalle</Link>
              </li>
            ))}
          </ul>
        ) : (
          <p>No hay historial médico registrado.</p>
        )}
        <Link to={`/usuario/mascota/${id}/historial/agregar`} className="detalle-mascota-button">Agregar entrada al historial</Link>
      </div>
      <Link to="/usuario/mascotas" className="detalle-mascota-back">Volver a Mis Mascotas</Link>
    </div>
  );
};

export default DetalleMascota;