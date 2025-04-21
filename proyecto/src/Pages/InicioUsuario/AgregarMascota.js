import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Styles/AgregarMascota.css'; // Importa el CSS

const AgregarMascota = () => {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [raza, setRaza] = useState('');
  const [edad, setEdad] = useState('');
  const [peso, setPeso] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí iría la lógica para enviar los datos de la nueva mascota al backend
    console.log('Mascota agregada:', { nombre, raza, edad, peso });
    navigate('/usuario/mascotas'); // Redirigir a la lista de mascotas después de agregar
  };

  return (
    <div className="agregar-mascota-container">
      <h2 className="agregar-mascota-title">Agregar Nueva Mascota</h2>
      <form onSubmit={handleSubmit} className="agregar-mascota-form">
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
        <button type="submit" className="agregar-mascota-button">Agregar Mascota</button>
        <Link to="/usuario/mascotas" className="agregar-mascota-cancel">Cancelar</Link>
      </form>
    </div>
  );
};

export default AgregarMascota;