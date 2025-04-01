import React from 'react';
import { useForm } from 'react-hook-form';
import Header from '../Estructura/Header';
import "../Styles/Registro.css";

function RegistroVeterinario() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onSubmit = (data) => {
    console.log("Datos del formulario:", data);
    reset();
  };

  const validarEdad = (fecha) => {
    const hoy = new Date();
    const fechaNacimiento = new Date(fecha);
    let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    const mes = hoy.getMonth() - fechaNacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
      edad--;
    }
    return edad >= 18 || "Debes ser mayor de edad para registrarte como veterinario";
  };

  return (
    <div className="login-container">
      <Header/>
      <div className="registro-box">
        <h2>Registro de Veterinario</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="registro-form">
          <div className="input-group">
            <label>Nombre:</label>
            <input type="text" {...register('nombre', {
              required: 'El nombre es obligatorio',
              maxLength: { value: 60, message: 'Máximo 60 caracteres' },
              pattern: { value: /^[A-Za-zÁÉÍÓÚáéíóúñÑ ]+$/, message: 'Solo letras permitidas' }
            })} placeholder="Ingrese su nombre" />
            {errors.nombre && <p className="error-message">{errors.nombre.message}</p>}
          </div>
          
          <div className="input-group">
            <label>Apellido:</label>
            <input type="text" {...register('apellido', {
              required: 'El apellido es obligatorio',
              maxLength: { value: 60, message: 'Máximo 60 caracteres' },
              pattern: { value: /^[A-Za-zÁÉÍÓÚáéíóúñÑ ]+$/, message: 'Solo letras permitidas' }
            })} placeholder="Ingrese su apellido" />
            {errors.apellido && <p className="error-message">{errors.apellido.message}</p>}
          </div>
          
          <div className="input-group">
            <label>Fecha de Nacimiento:</label>
            <input type="date" {...register('fechaNacimiento', {
              required: 'La fecha de nacimiento es obligatoria',
              validate: validarEdad
            })} />
            {errors.fechaNacimiento && <p className="error-message">{errors.fechaNacimiento.message}</p>}
          </div>
          
          <div className="input-group">
            <label>Número de Licencia Profesional:</label>
            <input type="text" {...register('licencia', {
              required: 'El número de licencia es obligatorio',
              pattern: { value: /^[0-9]+$/, message: 'Solo números permitidos' },
              maxLength: { value: 20, message: 'Máximo 20 caracteres' }
            })} placeholder="Ingrese su número de licencia" />
            {errors.licencia && <p className="error-message">{errors.licencia.message}</p>}
          </div>
          
          <div className="input-group">
            <label>Especialidad:</label>
            <input type="text" {...register('especialidad', {
              required: 'La especialidad es obligatoria',
              maxLength: { value: 50, message: 'Máximo 50 caracteres' },
              pattern: { value: /^[A-Za-zÁÉÍÓÚáéíóúñÑ ]+$/, message: 'Solo letras permitidas' }
            })} placeholder="Ingrese su especialidad" />
            {errors.especialidad && <p className="error-message">{errors.especialidad.message}</p>}
          </div>
          
          <button type="submit" className="btn-submit">Registrarse</button>
        </form>
      </div>
    </div>
  );
}

export default RegistroVeterinario;