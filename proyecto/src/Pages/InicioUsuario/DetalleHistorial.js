import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './Styles/DetalleHistorial.css';

// Datos locales de ejemplo
const historialEjemplo = {
  id: '1',
  mascotaId: 'perro123',
  fecha: '2025-06-15',
  veterinario: 'Dra. Martínez',
  diagnostico: 'Otitis',
  tratamiento: 'Gotas óticas por 7 días',
  notas: 'Volver en una semana para control'
};

const DetalleHistorial = () => {
  const { mascotaId, historialId } = useParams();
  const navigate = useNavigate();
  const [historial, setHistorial] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('historiales');
    const historiales = stored ? JSON.parse(stored) : [];

    const foundHistorial = historiales.find(
      h =>
        String(h.id).toLowerCase() === String(historialId).toLowerCase() &&
        String(h.mascotaId).toLowerCase() === String(mascotaId).toLowerCase()
    );

    setHistorial(foundHistorial || historialEjemplo);
  }, [mascotaId, historialId]);

  if (!historial) {
    return (
      <div className="detalle-historial-container">
        <p>Cargando historial...</p>
        <Link to={`/usuario/historial/${mascotaId}`} className="detalle-historial-back">
          Volver al Historial
        </Link>
      </div>
    );
  }

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
        <Link to={`/usuario/historial/${mascotaId}`} className="detalle-historial-back">
          Volver al Historial
        </Link>
      </div>
    </div>
  );
};

export default DetalleHistorial;
