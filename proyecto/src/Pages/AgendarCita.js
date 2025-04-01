import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import '../Styles/AgendarCita.css';

function AgendarCita() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const navigate = useNavigate();

  const onSubmit = (data) => {
    console.log("Cita agendada:", data);
    reset();
    navigate('/veterinario');
  };

  return (
    <div className="cita-container">
      <div className="cita-box">
        <h2>Agendar Cita</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="cita-form">

          <label>Cédula del Propietario:</label>
          <input
            type="text"
            {...register('cedula', {
              required: 'Este campo es obligatorio',
              pattern: {
                value: /^[0-9]+$/,
                message: 'Solo se permiten números'
              },
              minLength: {
                value: 7,
                message: 'Debe tener al menos 7 dígitos'
              },
              maxLength: {
                value: 10,
                message: 'No puede tener más de 10 dígitos'
              }
            })}
            placeholder="Ej: 12345678"
          />
          {errors.cedula && <p className="error">{errors.cedula.message}</p>}

          <label>Fecha de la Cita:</label>
          <input
            type="date"
            {...register('fecha', {
              required: 'La fecha es obligatoria',
              validate: (value) => {
                const hoy = new Date();
                const fechaSeleccionada = new Date(value);
                hoy.setHours(0, 0, 0, 0);
                if (fechaSeleccionada < hoy) {
                  return 'La fecha no puede ser anterior a hoy';
                }
                return true;
              }
            })}
          />
          {errors.fecha && <p className="error">{errors.fecha.message}</p>}

          <label>Hora de la Cita:</label>
          <input
            type="time"
            {...register('hora', {
              required: 'La hora es obligatoria',
              validate: (value) => {
                const [hora] = value.split(':');
                const horaNum = parseInt(hora, 10);
                if (horaNum < 8 || horaNum > 18) {
                  return 'El horario permitido es de 8:00 AM a 6:00 PM';
                }
                return true;
              }
            })}
          />
          {errors.hora && <p className="error">{errors.hora.message}</p>}

          <label>Nombre de la Mascota:</label>
          <input
            type="text"
            {...register('mascota', {
              required: 'Este campo es obligatorio',
              pattern: {
                value: /^[A-Za-z\s]+$/,
                message: 'Solo se permiten letras'
              },
              minLength: {
                value: 2,
                message: 'Debe tener al menos 2 caracteres'
              },
              maxLength: {
                value: 20,
                message: 'No puede tener más de 20 caracteres'
              }
            })}
            placeholder="Ej: Max"
          />
          {errors.mascota && <p className="error">{errors.mascota.message}</p>}

          <label>Motivo de la Cita:</label>
          <textarea
            {...register('motivo', {
              required: 'El motivo es obligatorio',
              minLength: {
                value: 10,
                message: 'Debe tener al menos 10 caracteres'
              },
              maxLength: {
                value: 200,
                message: 'No puede tener más de 200 caracteres'
              }
            })}
            placeholder="Ej: Vacunación, chequeo general, etc."
          />
          {errors.motivo && <p className="error">{errors.motivo.message}</p>}

          <button type="submit" className="cita-button">Agendar Cita</button>
        </form>

        <Link to="/admin" className="volver-button">Volver al Panel</Link>
      </div>
    </div>
  );
}

export default AgendarCita;
