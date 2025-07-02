import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './Styles/DetalleHistorial.css';

// Función para obtener todos los historiales guardados en localStorage
const getHistoriales = () => {
  const stored = localStorage.getItem('historiales');
  return stored ? JSON.parse(stored) : [];
};

const DetalleHistorial = () => {
  const { mascotaId, historialId } = useParams();
  const navigate = useNavigate();

  const [historial, setHistorial] = useState(null);

  useEffect(() => {
    const historiales = getHistoriales();
    const foundHistorial = historiales.find(h => h.id === historialId && h.mascotaId === mascotaId);
    if (foundHistorial) {
      setHistorial(foundHistorial);
    } else {
      setHistorial(null); // No encontrado
    }
  }, [mascotaId, historialId]);

  const handleEliminar = () => {
    if (!historial) return;
    if (window.confirm('¿Estás seguro que deseas eliminar esta entrada del historial?')) {
      const historiales = getHistoriales();
      const filtrados = historiales.filter(h => h.id !== historialId);
      localStorage.setItem('historiales', JSON.stringify(filtrados));
      navigate(`/usuario/historial/${mascotaId}`);
    }
  };

  if (!historial) {
    return (
      <div className="detalle-historial-container">
        <p>Historial no encontrado.</p>
        <Link to={`/usuario/historial/${mascotaId}`} className="detalle-historial-back">Volver al Historial</Link>
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
        <Link to={`/usuario/historial/${mascotaId}/editar/${historialId}`} className="detalle-historial-button editar">Editar Entrada</Link>
        <button onClick={handleEliminar} className="detalle-historial-button eliminar">Eliminar Entrada</button>
        <Link to={`/usuario/historial/${mascotaId}`} className="detalle-historial-back">Volver al Historial</Link>
      </div>
    </div>
  );
};

export default DetalleHistorial;
