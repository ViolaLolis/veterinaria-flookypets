import React from 'react';
import { useParams, Link } from 'react-router-dom';
import './Styles/DetalleHistorial.css';

const DetalleHistorial = () => {
  const { mascotaId, historialId } = useParams();
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
        {/* NOTA: La ruta /usuario/historial/:mascotaId/editar/:historialId debe estar definida en App.js */}
        <Link to={`/usuario/historial/${mascotaId}/editar/${historialId}`} className="detalle-historial-button editar">Editar Entrada</Link> {/* CORREGIDO */}
        {/* Implementar lógica de eliminación */}
        <button className="detalle-historial-button eliminar">Eliminar Entrada</button>
        <Link to={`/usuario/historial/${mascotaId}`} className="detalle-historial-back">Volver al Historial</Link> {/* CORREGIDO */}
      </div>
    </div>
  );
};

export default DetalleHistorial;
