import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Styles/CrearCita.css'; // Importa el CSS

const CrearCita = () => {
  const navigate = useNavigate();
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [servicio, setServicio] = useState('');
  const [mascotaId, setMascotaId] = useState(''); // Deberías obtener las mascotas del usuario
  const [notas, setNotas] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí iría la lógica para enviar los datos de la nueva cita al backend
    console.log('Cita creada:', { fecha, hora, servicio, mascotaId, notas });
    navigate('/usuario/citas'); // Redirigir a la lista de citas
  };

  return (
    <div className="crear-cita-container">
      <h2 className="crear-cita-title">Agendar Nueva Cita</h2>
      <form onSubmit={handleSubmit} className="crear-cita-form">
        <div className="form-group">
          <label htmlFor="fecha">Fecha:</label>
          <input type="date" id="fecha" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
        </div>
        <div className="form-group">
          <label htmlFor="hora">Hora:</label>
          <input type="time" id="hora" value={hora} onChange={(e) => setHora(e.target.value)} required />
        </div>
        <div className="form-group">
          <label htmlFor="servicio">Servicio:</label>
          <select id="servicio" value={servicio} onChange={(e) => setServicio(e.target.value)} required>
            <option value="">Seleccionar servicio</option>
            <option value="consulta">Consulta General</option>
            <option value="vacunacion">Vacunación</option>
            {/* Agrega más opciones de servicios */}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="mascota">Mascota:</label>
          <select id="mascota" value={mascotaId} onChange={(e) => setMascotaId(e.target.value)} required>
            <option value="">Seleccionar mascota</option>
            <option value="1">Pelusa (Persa)</option> {/* Deberías obtener esto dinámicamente */}
            {/* Agrega más opciones de mascotas del usuario */}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="notas">Notas Adicionales:</label>
          <textarea id="notas" value={notas} onChange={(e) => setNotas(e.target.value)} rows="3"></textarea>
        </div>
        <button type="submit" className="crear-cita-button">Agendar Cita</button>
        <Link to="/usuario/citas" className="crear-cita-cancel">Cancelar</Link>
      </form>
    </div>
  );
};

export default CrearCita;