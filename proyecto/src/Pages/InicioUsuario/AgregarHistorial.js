import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './Styles/AgregarHistorial.css'; // Importa el CSS

const AgregarHistorial = () => {
  const { mascotaId } = useParams();
  const navigate = useNavigate();
  const [fecha, setFecha] = useState('');
  const [veterinario, setVeterinario] = useState('');
  const [diagnostico, setDiagnostico] = useState('');
  const [tratamiento, setTratamiento] = useState('');
  const [notas, setNotas] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí iría la lógica para enviar los datos de la nueva entrada del historial al backend
    console.log('Entrada de historial agregada:', { mascotaId, fecha, veterinario, diagnostico, tratamiento, notas });
    navigate(`/usuario/mascota/${mascotaId}/historial`);
  };

  return (
    <div className="agregar-historial-container">
      <h2 className="agregar-historial-title">Agregar Entrada al Historial</h2>
      <form onSubmit={handleSubmit} className="agregar-historial-form">
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
        <button type="submit" className="agregar-historial-button">Agregar Entrada</button>
        <Link to={`/usuario/mascota/${mascotaId}/historial`} className="agregar-historial-cancel">Cancelar</Link>
      </form>
    </div>
  );
};

export default AgregarHistorial;