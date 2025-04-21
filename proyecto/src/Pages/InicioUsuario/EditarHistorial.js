import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './Styles/EditarHistorial.css'; // Importa el CSS

const EditarHistorial = () => {
  const { mascotaId, historialId } = useParams();
  const navigate = useNavigate();
  const [fecha, setFecha] = useState('');
  const [veterinario, setVeterinario] = useState('');
  const [diagnostico, setDiagnostico] = useState('');
  const [tratamiento, setTratamiento] = useState('');
  const [notas, setNotas] = useState('');

  useEffect(() => {
    // Aquí iría la lógica para obtener los detalles de la entrada del historial para editar
    // Simulando la obtención de datos
    const historial = {
      id: historialId,
      mascotaId: mascotaId,
      fecha: '2025-03-10',
      veterinario: 'Dra. Ana Pérez',
      diagnostico: 'Gastroenteritis leve',
      tratamiento: 'Dieta blanda y probióticos',
      notas: 'Se recomienda seguimiento.',
    };
    setFecha(historial.fecha);
    setVeterinario(historial.veterinario);
    setDiagnostico(historial.diagnostico);
    setTratamiento(historial.tratamiento);
    setNotas(historial.notas);
  }, [mascotaId, historialId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí iría la lógica para enviar los datos actualizados del historial al backend
    console.log('Entrada de historial actualizada:', { mascotaId, historialId, fecha, veterinario, diagnostico, tratamiento, notas });
    navigate(`/usuario/mascota/${mascotaId}/historial/${historialId}`);
  };

  return (
    <div className="editar-historial-container">
      <h2 className="editar-historial-title">Editar Entrada del Historial</h2>
      <form onSubmit={handleSubmit} className="editar-historial-form">
        <div className="form-group">
          <label htmlFor="fecha">Fecha:</label>
          <input type="date" id="fecha" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
        </div>
        <div className="form-group">
          <label htmlFor="veterinario">Veterinario:</label>
          <input type="text" id="veterinario" value={veterinario} onChange={(e) => setVeterinario(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="diagnostico">Diagnóstico:</label>
          <textarea id="diagnostico" value={diagnostico} onChange={(e) => setDiagnostico(e.target.value)} rows="3"></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="tratamiento">Tratamiento:</label>
          <textarea id="tratamiento" value={tratamiento} onChange={(e) => setTratamiento(e.target.value)} rows="3"></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="notas">Notas:</label>
          <textarea id="notas" value={notas} onChange={(e) => setNotas(e.target.value)} rows="3"></textarea>
        </div>
        <button type="submit" className="editar-historial-button">Guardar Cambios</button>
        <Link to={`/usuario/mascota/${mascotaId}/historial/${historialId}`} className="editar-historial-cancel">Cancelar</Link>
      </form>
    </div>
  );
};

export default EditarHistorial;