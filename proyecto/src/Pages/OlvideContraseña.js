import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import '../Styles/OlvideContraseña';

function OlvideContraseña() {
  const [step, setStep] = useState(1);
  const [emailVerified, setEmailVerified] = useState(false);
  const { register, handleSubmit, formState: { errors }, getValues, watch } = useForm();
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

  const verifyEmail = () => {
    // Aquí iría la lógica para verificar el correo (envío de código, etc.)
    // Por ahora simulamos la verificación exitosa
    setEmailVerified(true);
    setStep(2);
  };

  return (
    <div className="registro-container">
      <div className="registro-box">
        <h2>Recuperar Contraseña</h2>
        
        {/* Indicador de pasos */}
        <div className="progress-container">
          <span className={`progress-circle ${step === 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            {step > 1 ? '✓' : '1'}
          </span>
          <span className="progress-line"></span>
          <span className={`progress-circle ${step === 2 ? 'active' : ''}`}>
            2
          </span>
        </div>

        {step === 1 && (
          <form onSubmit={handleSubmit(verifyEmail)}>
            <div className="input-group">
              <label>Correo Electrónico:</label>
              <input 
                type="email" 
                placeholder="Ingrese su correo electrónico" 
                {...register('correo', {
                  required: 'El correo es obligatorio',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Formato de correo inválido',
                  },
                })}
              />
              {errors.correo && <p className="error-message">{errors.correo.message}</p>}
            </div>

            <button type="submit" className="btn-submit">
              Verificar Correo
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="input-group">
              <label>Nueva Contraseña:</label>
              <input 
                type="password" 
                placeholder="Ingrese su nueva contraseña"
                {...register('nuevaContraseña', {
                  required: 'La contraseña es obligatoria',
                  minLength: { value: 8, message: 'Mínimo 8 caracteres' },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                    message: 'Debe contener mayúscula, minúscula, número y caracter especial',
                  },
                })}
              />
              {errors.nuevaContraseña && (
                <p className="error-message">{errors.nuevaContraseña.message}</p>
              )}
            </div>

            <div className="input-group">
              <label>Confirmar Contraseña:</label>
              <input 
                type="password" 
                placeholder="Confirme su nueva contraseña"
                {...register('confirmarContraseña', {
                  required: 'La confirmación es obligatoria',
                  validate: value => 
                    value === watch('nuevaContraseña') || 'Las contraseñas no coinciden',
                })}
              />
              {errors.confirmarContraseña && (
                <p className="error-message">{errors.confirmarContraseña.message}</p>
              )}
            </div>

            <div className="form-navigation">
              <button 
                type="button" 
                className="btn-prev"
                onClick={() => setStep(1)}
              >
                Anterior
              </button>
              <button type="submit" className="btn-submit">
                Cambiar Contraseña
              </button>
            </div>
          </form>
        )}

        <div className="login-links">
          <Link to="/login" className="volver-inicio">
            Volver a Iniciar Sesión
          </Link>
        </div>
      </div>
    </div>
  );
}

export default OlvideContraseña;