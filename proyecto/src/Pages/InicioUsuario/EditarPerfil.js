import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Styles/EditarPerfil.css'; // Importa el CSS

const EditarPerfil = () => {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');

  useEffect(() => {
    // Aquí iría la lógica para obtener los datos del perfil del usuario para editar
    // Simulando la obtención de datos
    const usuario = { nombre: 'Usuario Ejemplo', email: 'usuario@ejemplo.com', telefono: '3101234567', direccion: 'Calle Falsa 123' };
    setNombre(usuario.nombre);
    setEmail(usuario.email);
    setTelefono(usuario.telefono);
    setDireccion(usuario.direccion);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí iría la lógica para enviar los datos actualizados del perfil al backend
    console.log('Perfil actualizado:', { nombre, email, telefono, direccion });
    navigate('/usuario/perfil'); // Redirigir al perfil después de editar
  };

  return (
    <div className="editar-perfil-container">
      <h2 className="editar-perfil-title">Editar Perfil</h2>
      <form onSubmit={handleSubmit} className="editar-perfil-form">
        <div className="form-group">
          <label htmlFor="nombre">Nombre:</label>
          <input
            type="text"
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value.toUpperCase())}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="telefono">Teléfono:</label>
          <input
            type="tel"
            id="telefono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value.toUpperCase())}
          />
        </div>
        <div className="form-group">
          <label htmlFor="direccion">Dirección:</label>
          <input
            type="text"
            id="direccion"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value.toUpperCase())}
          />
        </div>
        <button type="submit" className="editar-perfil-button">Guardar Cambios</button>
        <Link to="/usuario/perfil" className="editar-perfil-cancel">Cancelar</Link>
      </form>
    </div>
  );
};

export default EditarPerfil;