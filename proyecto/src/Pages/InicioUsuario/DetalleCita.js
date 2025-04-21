import React from 'react';
import { useParams, Link } from 'react-router-dom';
import './Styles/DetalleCita.css'; // Importa el CSS

const DetalleCita = () => {
  const { id } = useParams();
  // Aquí iría la lógica para obtener los detalles de la cita con el ID proporcionado
  const cita = {
    id: id,
    fecha: '2025-04-25',
    hora: '10:00 AM',
    servicio: 'Consulta general',
    mascota: 'Pelusa (Persa)',
    estado: 'Confirmada',
    notas: 'Traer historial médico si lo tiene.',
  };

  return (
    <div className="detalle-cita-container">
      <h2 className="detalle-cita-title">Detalle de la Cita</h2>
      <div className="detalle-cita-info">
        <p><strong>Fecha:</strong> {cita.fecha}</p>
        <p><strong>Hora:</strong> {cita.hora}</p>
        <p><strong>Servicio:</strong> {cita.servicio}</p>
        <p><strong>Mascota:</strong> {cita.mascota}</p>
        <p><strong>Estado:</strong> <span className={`estado-${cita.estado.toLowerCase()}`}>{cita.estado}</span></p>
        {cita.notas && <p><strong>Notas:</strong> {cita.notas}</p>}
      </div>
      <div className="detalle-cita-actions">
        <Link to={`/usuario/citas/editar/${id}`} className="detalle-cita-button editar">Editar Cita</Link>
        <button className="detalle-cita-button cancelar">Cancelar Cita</button> {/* Implementar lógica de cancelación */}
        <Link to="/usuario/citas" className="detalle-cita-back">Volver a Mis Citas</Link>
      </div>
    </div>
  );
};

export default DetalleCita;