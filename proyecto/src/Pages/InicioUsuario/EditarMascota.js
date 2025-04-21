import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './Styles/EditarMascota.css'; // Importa el CSS

const EditarMascota = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [raza, setRaza] = useState('');
  const [edad, setEdad] = useState('');
  const [peso, setPeso] = useState('');

  useEffect(() => {
    // Aquí iría la lógica para obtener los detalles de la mascota con el ID para editar
    // Simulando la obtención de datos
    const mascota = { id: id, nombre: 'Pelusa', raza: 'Persa', edad: '5', peso: '3.5' };
    setNombre(mascota.nombre);
    setRaza(mascota.raza);
    setEdad(mascota.edad);
    setPeso(mascota.peso);
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí iría la lógica para enviar los datos actualizados de la mascota al backend
    console.log('Mascota actualizada:', { id, nombre, raza, edad, peso });
    navigate('/usuario/mascotas'); // Redirigir a la lista de mascotas después de editar
  };

  return (
    <div className="editar-mascota-container">
      <h2 className="editar-mascota-title">Editar Mascota</h2>
      <form onSubmit={handleSubmit} className="editar-mascota-form">
        <div className="form-group">
          <label htmlFor="nombre">Nombre:</label>
          <input
            type="text"
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="raza">Raza:</label>
          <input
            type="text"
            id="raza"
            value={raza}
            onChange={(e) => setRaza(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="edad">Edad:</label>
          <input
            type="number"
            id="edad"
            value={edad}
            onChange={(e) => setEdad(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="peso">Peso (kg):</label>
          <input
            type="number"
            id="peso"
            value={peso}
            onChange={(e) => setPeso(e.target.value)}
          />
        </div>
        <button type="submit" className="editar-mascota-button">Guardar Cambios</button>
        <Link to={`/usuario/mascotas/${id}`} className="editar-mascota-cancel">Cancelar</Link>
      </form>
    </div>
  );
};

export default EditarMascota;