import React from 'react';
import { useForm } from 'react-hook-form';
import "../Styles/EliminarUsuario.css";

function EliminarUsuario() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onSubmit = (data) => {
    console.log("Usuario eliminado:", data);
    reset();
  };

  return (
    <div>
      <h2>Eliminar Usuario</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="form-eliminar-usuario">
        
        <label>Nombre:</label>
        <input
          type="text"
          {...register('nombre', {
            required: 'Este campo es obligatorio',
            pattern: {
              value: /^[A-Za-z\s]+$/,
              message: 'El nombre solo debe contener letras'
            },
            minLength: {
              value: 2,
              message: 'El nombre debe tener al menos 2 caracteres'
            }
          })}
          placeholder="Ej: Juan"
        />
        {errors.nombre && <p className="error">{errors.nombre.message}</p>}

        <label>Apellido:</label>
        <input
          type="text"
          {...register('apellido', {
            required: 'Este campo es obligatorio',
            pattern: {
              value: /^[A-Za-z\s]+$/,
              message: 'El apellido solo debe contener letras'
            },
            minLength: {
              value: 2,
              message: 'El apellido debe tener al menos 2 caracteres'
            }
          })}
          placeholder="Ej: Bocanegra"
        />
        {errors.apellido && <p className="error">{errors.apellido.message}</p>}

        <label>Cédula:</label>
        <input
          type="text"
          {...register('cedula', {
            required: 'Este campo es obligatorio',
            pattern: {
              value: /^[0-9]+$/,
              message: 'La cédula solo debe contener números'
            },
            minLength: {
              value: 7,
              message: 'La cédula debe tener al menos 7 dígitos'
            },
            maxLength: {
              value: 10,
              message: 'La cédula no puede tener más de 10 dígitos'
            }
          })}
          placeholder="Ej: 12345678"
        />
        {errors.cedula && <p className="error">{errors.cedula.message}</p>}

        <label>Correo Electrónico:</label>
        <input
          type="email"
          {...register('correo', {
            required: 'Este campo es obligatorio',
            maxLength: {
              value: 64,
              message: 'El correo no puede tener más de 64 caracteres'
            },
            pattern: {
              value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
              message: 'Correo no válido'
            }
          })}
          placeholder="Ej: juan@example.com"
        />
        {errors.correo && <p className="error">{errors.correo.message}</p>}

        <label>Fecha de Nacimiento:</label>
        <input
          type="date"
          {...register('fechaNacimiento', {
            required: 'Este campo es obligatorio'
          })}
        />
        {errors.fechaNacimiento && <p className="error">{errors.fechaNacimiento.message}</p>}

        <label>Nombre de Usuario:</label>
        <input
          type="text"
          {...register('usuario', {
            required: 'Este campo es obligatorio',
            minLength: {
              value: 3,
              message: 'El nombre de usuario debe tener al menos 3 caracteres'
            },
            maxLength: {
              value: 20,
              message: 'El nombre de usuario no puede tener más de 20 caracteres'
            }
          })}
          placeholder="Ej: juan123"
        />
        {errors.usuario && <p className="error">{errors.usuario.message}</p>}

        <input type="submit" value="Eliminar Usuario" />
      </form>
    </div>
  );
}

export default EliminarUsuario;
