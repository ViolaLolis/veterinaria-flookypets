import React from 'react';
import { useParams, Link } from 'react-router-dom';
import './Styles/DetalleHistorial.css'; // Importa el CSS

const DetalleHistorial = () => {
  const { mascotaId, historialId } = useParams();
  // Aquí iría la lógica para obtener los detalles de la entrada del historial
  const historial = {
    id: historialId,
    mascotaId: mascotaId,
    fecha: '2025-03-10',
    veterinario: 'Dra. Ana Pérez',
    diagnostico: 'Gastroenteritis leve',
    tratamiento: 'Dieta blanda y probióticos',
    notas: 'Se recomienda seguimiento en 3 días si los síntomas persisten.',
  };

  return (
    <div className="detalle-historial-container">
      <h2 className="detalle-historial-title">Detalle del Historial Médico</h2>
      <div className="detalle-historial-info">
        <p><strong>Fecha:</strong> {historial.fecha}</p>
        <p><strong>Veterinario:</strong> {historial.veterinario}</p>
        <p><strong>Diagnóstico:</strong> {historial.diagnostico}</p>
        <p><strong>Tratamiento:</strong> {historial.tratamiento}</p>
        {historial.notas && <p><strong>Notas:</strong> {historial.notas}</p>}
      </div>
      <div className="detalle-historial-actions">
        <Link to={`/usuario/mascota/${mascotaId}/historial/editar/${historialId}`} className="detalle-historial-button editar">Editar Entrada</Link>
        {/* Implementar lógica de eliminación */}
        <button className="detalle-historial-button eliminar">Eliminar Entrada</button>
        <Link to={`/usuario/mascota/${mascotaId}/historial`} className="detalle-historial-back">Volver al Historial</Link>
      </div>
    </div>
  );
};

export default DetalleHistorial;