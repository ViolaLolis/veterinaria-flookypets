import React from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import '../Styles/RegistroMascotas.css';

function RegistroMascota() {
  const { register, handleSubmit, reset } = useForm();
  
  const onSubmit = (data) => {
    console.log(data);
    reset();
  };

  return (
    <div className="registro-container">
      <div className="registro-box">
        <h2>Registro de Mascota</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="registro-form">
          <label>Nombre:
            <input type="text" {...register('nombre')} required />
          </label>

          <label>Especie:
            <input type="text" {...register('especie')} required />
          </label>

          <label>Raza:
            <input type="text" {...register('raza')} required />
          </label>

          <label>Edad:
            <input type="number" {...register('edad')} required />
          </label>

          <label>Peso (kg):
            <input type="number" step="0.1" {...register('peso')} required />
          </label>

          <label>Id de Usuario:
            <input type="text" {...register('cedulaDuenio')} required />
          </label>

          <button type="submit" className="registro-button">Registrar Mascota</button>
        </form>

        <Link to="/admin" className="volver-button">Volver al Panel</Link>
      </div>
    </div>
  );
}

export default RegistroMascota;

