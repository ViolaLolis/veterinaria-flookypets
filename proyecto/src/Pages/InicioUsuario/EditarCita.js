import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './Styles/EditarCita.css'; // Importa el CSS

const EditarCita = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [servicio, setServicio] = useState('');
  const [mascotaId, setMascotaId] = useState(''); // Deberías obtener las mascotas del usuario
  const [notas, setNotas] = useState('');

  useEffect(() => {
    // Aquí iría la lógica para obtener los detalles de la cita con el ID para editar
    // Simulando la obtención de datos
    const cita = {
      id: id,
      fecha: '2025-04-25',
      hora: '10:00',
      servicio: 'consulta',
      mascotaId: '1',
      notas: 'Traer historial médico.',
    };
    setFecha(cita.fecha);
    setHora(cita.hora);
    setServicio(cita.servicio);
    setMascotaId(cita.mascotaId);
    setNotas(cita.notas);
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí iría la lógica para enviar los datos actualizados de la cita al backend
    console.log('Cita actualizada:', { id, fecha, hora, servicio, mascotaId, notas });
    navigate('/usuario/citas'); // Redirigir a la lista de citas
  };

  return (
    <div className="editar-cita-container">
      <h2 className="editar-cita-title">Editar Cita</h2>
      <form onSubmit={handleSubmit} className="editar-cita-form">
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
        <button type="submit" className="editar-cita-button">Guardar Cambios</button>
        <Link to={`/usuario/citas/${id}`} className="editar-cita-cancel">Cancelar</Link>
      </form>
    </div>
  );
};

export default EditarCita;