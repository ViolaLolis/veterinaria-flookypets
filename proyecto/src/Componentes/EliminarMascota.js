import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Styles/EliminarMascota.css'

const EliminarMascota = () => {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [numeroCedula, setNumeroCedula] = useState('');
  const [idMascota, setIdMascota] = useState('');
  const [nombreMascota, setNombreMascota] = useState('');
  
  const [errorNombre, setErrorNombre] = useState('');
  const [errorApellido, setErrorApellido] = useState('');
  const [errorCedula, setErrorCedula] = useState('');
  const [errorId, setErrorId] = useState('');
  const [errorNombreMascota, setErrorNombreMascota] = useState('');

  const navigate = useNavigate();

  const handleChangeNombre = (event) => {
    setNombre(event.target.value);
    setErrorNombre('');
  };

  const handleChangeApellido = (event) => {
    setApellido(event.target.value);
    setErrorApellido('');
  };

  const handleChangeCedula = (event) => {
    setNumeroCedula(event.target.value);
    setErrorCedula('');
  };

  const handleChangeIdMascota = (event) => {
    setIdMascota(event.target.value);
    setErrorId('');
  };

  const handleChangeNombreMascota = (event) => {
    setNombreMascota(event.target.value);
    setErrorNombreMascota('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!/^[A-Za-z]+$/.test(nombre)) {
      setErrorNombre('El nombre solo debe contener letras');
      return;
    }

    if (!/^[A-Za-z]+$/.test(apellido)) {
      setErrorApellido('El apellido solo debe contener letras');
      return;
    }

    if (!/^\d{6,10}$/.test(numeroCedula)) {
      setErrorCedula('La cédula debe ser un número de 6 a 10 dígitos');
      return;
    }

    if (!/^\d+$/.test(idMascota)) {
      setErrorId('El ID de la mascota debe ser un número');
      return;
    }

    if (nombreMascota.length < 3 || nombreMascota.length > 20) {
      setErrorNombreMascota('El nombre de la mascota debe tener entre 3 y 20 caracteres');
      return;
    }

    alert(`La mascota ${nombreMascota} con ID ${idMascota} ha sido eliminada correctamente.`);
    navigate('/verMascotas');
  };

  return (
    <div>
      <h2>Eliminar Mascota</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="nombre">Nombre:</label>
          <input
            type="text"
            id="nombre"
            value={nombre}
            onChange={handleChangeNombre}
            required
          />
          {errorNombre && <p style={{ color: 'red' }}>{errorNombre}</p>}
        </div>
        <div>
          <label htmlFor="apellido">Apellido:</label>
          <input
            type="text"
            id="apellido"
            value={apellido}
            onChange={handleChangeApellido}
            required
          />
          {errorApellido && <p style={{ color: 'red' }}>{errorApellido}</p>}
        </div>
        <div>
          <label htmlFor="numeroCedula">Número de Cédula:</label>
          <input
            type="text"
            id="numeroCedula"
            value={numeroCedula}
            onChange={handleChangeCedula}
            required
          />
          {errorCedula && <p style={{ color: 'red' }}>{errorCedula}</p>}
        </div>
        <div>
          <label htmlFor="idMascota">ID de la Mascota:</label>
          <input
            type="text"
            id="idMascota"
            value={idMascota}
            onChange={handleChangeIdMascota}
            required
          />
          {errorId && <p style={{ color: 'red' }}>{errorId}</p>}
        </div>
        <div>
          <label htmlFor="nombreMascota">Nombre de la Mascota:</label>
          <input
            type="text"
            id="nombreMascota"
            value={nombreMascota}
            onChange={handleChangeNombreMascota}
            required
          />
          {errorNombreMascota && <p style={{ color: 'red' }}>{errorNombreMascota}</p>}
        </div>
        <button type="submit">Eliminar Mascota</button>
      </form>
      <br />
      <button onClick={() => navigate('/verMascotas')}>Ver Mascotas</button>
    </div>
  );
};

export default EliminarMascota;
