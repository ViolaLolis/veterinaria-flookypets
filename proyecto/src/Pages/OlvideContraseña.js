import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';

function OlvideContraseña() {
  const {register,handleSubmit,formState: { errors },getValues,} = useForm();
  const navigate = useNavigate();

  const onSubmit = () => {
    const { nuevaContraseña, confirmarContraseña } = getValues();

    if (nuevaContraseña !== confirmarContraseña) {
      alert('Las contraseñas no coinciden');
      return;
    }

    alert('¡Contraseña cambiada con éxito!');
    navigate('/login');
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Cambiar Contraseña</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="input-group">
            <label>Correo Electrónico:</label>
            <input type="email" placeholder="Ingrese su correo electrónico" {...register('correo', {
                required: 'El correo es obligatorio',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Formato de correo inválido',
                },
              })}
            />
            {errors.correo && <p className="error-message">{errors.correo.message}</p>}
          </div>

          <div className="input-group">
            <label>Nueva Contraseña:</label>
            <input type="password" placeholder="Ingrese su nueva contraseña"
              {...register('nuevaContraseña', {
                required: 'La contraseña es obligatoria',
                minLength: { value: 8, message: 'Mínimo 8 caracteres' },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                  message: 'Debe contener mayúscula, minúscula, número y caracter especial',},
              })}
            />
            {errors.nuevaContraseña && (
              <p className="error-message">{errors.nuevaContraseña.message}</p>
            )}
          </div>

          <div className="input-group">
            <label>Confirmar Contraseña:</label>
            <input type="password" placeholder="Confirme su nueva contraseña"
              {...register('confirmarContraseña', {
                required: 'La confirmación es obligatoria',
              })}
            />
            {errors.confirmarContraseña && (
              <p className="error-message">{errors.confirmarContraseña.message}</p>
            )}
          </div>

          <button type="submit" className="btn-login">
            Cambiar Contraseña
          </button>
        </form>

        <div className="login-links">
          <Link to="/login" className="link">
            Volver a Iniciar Sesión
          </Link>
        </div>
      </div>
    </div>
  );
}

export default OlvideContraseña;