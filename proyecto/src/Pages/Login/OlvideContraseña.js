import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { send } from '@emailjs/browser';
import '../Styles/OlvidarContraseña.css';

const serviceId = 'Flooky Pets';
const templateId = 'template_z3izl33';
const publicKey = 'Glz70TavlG0ANcvrb';

function OlvideContraseña() {
  const [step, setStep] = useState(1);
  const [codigoGenerado, setCodigoGenerado] = useState('');
  const [codigoEnviado, setCodigoEnviado] = useState(false);
  const [codigoVerificado, setCodigoVerificado] = useState(false);
  const [tiempoRestante, setTiempoRestante] = useState(60);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    getValues, 
    watch,
    reset
  } = useForm();
  
  const navigate = useNavigate();

  // Temporizador para el código de verificación
  useEffect(() => {
    let timer;
    if (codigoEnviado && tiempoRestante > 0 && !codigoVerificado) {
      timer = setInterval(() => {
        setTiempoRestante(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [codigoEnviado, tiempoRestante, codigoVerificado]);

  // Generar código aleatorio de 6 dígitos numéricos
  const generarCodigo = () => {
    const nuevoCodigo = Math.floor(100000 + Math.random() * 900000).toString();
    setCodigoGenerado(nuevoCodigo);
    return nuevoCodigo;
  };

  // Enviar código por correo electrónico
  const enviarCodigoPorCorreo = async (codigo, email) => {
    const templateParams = {
      to_email: email,
      from_name: 'Flooky Pets',
      reply_to: 'soporte@flookypets.com',
      verification_code: codigo,
      user_name: email.split('@')[0]
    };

    try {
      await send(serviceId, templateId, templateParams, publicKey);
      setCodigoEnviado(true);
      setTiempoRestante(60);
      setError('');
      setSuccessMessage('Código de verificación enviado a tu correo');
      return true;
    } catch (err) {
      console.error('Error al enviar correo:', err);
      let errorMsg = 'Error al enviar el código. Intenta nuevamente.';
      
      if (err.text?.includes("recipient's address is corrupted")) {
        errorMsg = 'Correo electrónico inválido';
      } else if (err.status === 429) {
        errorMsg = 'Has excedido el límite de envíos. Espera unos minutos.';
      }
      
      setError(errorMsg);
      return false;
    }
  };

  // Paso 1: Verificar correo y enviar código
  const handleEnviarCodigo = async () => {
    setError('');
    setSuccessMessage('');
    setIsSubmitting(true);
    
    try {
      const email = getValues('correo');
      
      // Verificar si el email existe en el backend
      const response = await fetch('http://localhost:5000/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al verificar el correo');
      }

      // Generar y enviar código
      const codigo = data.resetToken || generarCodigo();
      console.log('Código generado/enviado:', codigo);
      const emailEnviado = await enviarCodigoPorCorreo(codigo, email);
      
      if (emailEnviado) {
        setCodigoGenerado(codigo);
      }

    } catch (error) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Paso 2: Verificar código ingresado
  const handleVerificarCodigo = async () => {
    const codigoIngresado = getValues('codigoVerificacion')?.replace(/\D/g,''); // Solo números
    const email = getValues('correo')?.trim();
    
    if (!codigoIngresado || codigoIngresado.length !== 6) {
      setError('Ingresa un código de 6 dígitos');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      console.log('Verificando código:', { email, token: codigoIngresado });
      
      const response = await fetch('http://localhost:5000/verify-reset-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          token: codigoIngresado
        })
      });

      const data = await response.json();
    
      if (!response.ok) {
        throw new Error(data.message || 'Error al verificar el código');
      }
    
      setCodigoVerificado(true);
      setSuccessMessage(data.message || 'Código verificado correctamente');
      
      setTimeout(() => {
        setStep(2);
        setSuccessMessage('');
      }, 1500);
    
    } catch (error) {
      console.error('Error en verificación:', {
        error: error,
        message: error.message,
        stack: error.stack
      });
      setError(error.message || 'Error al verificar el código');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Paso 3: Cambiar contraseña
  const handleCambiarContraseña = async () => {
    const { nuevaContraseña, confirmarContraseña } = getValues();
    const email = getValues('correo');
    
    if (nuevaContraseña !== confirmarContraseña) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          token: codigoGenerado,
          newPassword: nuevaContraseña
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al cambiar la contraseña');
      }

      setSuccessMessage('¡Contraseña cambiada con éxito!');
      setTimeout(() => navigate('/login'), 2000);
      
    } catch (error) {
      setError(error.message);
      console.error('Error al cambiar contraseña:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reenviar código
  const handleReenviarCodigo = async () => {
    if (tiempoRestante > 0) return;
    
    setError('');
    setIsSubmitting(true);
    
    try {
      const email = getValues('correo');
      const codigo = generarCodigo();
      const emailEnviado = await enviarCodigoPorCorreo(codigo, email);
      
      if (emailEnviado) {
        setCodigoGenerado(codigo);
      }
    } catch (error) {
      console.error('Error al reenviar código:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="password-reset-container">
      <div className="password-reset-wrapper">
        <div className="password-reset-box">
          <div className="reset-info-section">
            <img src="/logo.png" alt="Flooky Pets" className="reset-illustration" />
            <h1>Recupera tu contraseña</h1>
            <p>Ingresa tu correo electrónico y sigue las instrucciones para restablecer tu contraseña.</p>
          </div>
          
          <div className="reset-form-section">
            <h2>Recuperar Contraseña</h2>
            
            {/* Barra de progreso */}
            <div className="reset-progress">
              <span className={`reset-progress-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
                {step > 1 ? '' : '1'}
              </span>
              <span className={`reset-progress-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
                {step > 2 ? '' : '2'}
              </span>
            </div>

            {error && <div className="reset-error-message">{error}</div>}
            {successMessage && <div className="reset-success-message">{successMessage}</div>}

            {/* Paso 1: Ingresar correo y verificar código */}
            {step === 1 && (
              <form onSubmit={handleSubmit(codigoEnviado ? handleVerificarCodigo : handleEnviarCodigo)}>
                <div className="reset-input-group">
                  <label>Correo Electrónico</label>
                  <input
                    type="email"
                    {...register('correo', {
                      required: 'El correo es obligatorio',
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Correo electrónico inválido'
                      }
                    })}
                    disabled={codigoEnviado}
                  />
                  {errors.correo && <span className="reset-error-text">{errors.correo.message}</span>}
                </div>

                {codigoEnviado && (
                  <>
                    <div className="reset-input-group">
                      <label>Código de Verificación</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="Ingresa el código de 6 dígitos"
                        {...register('codigoVerificacion', {
                          required: 'El código es obligatorio',
                          minLength: {
                            value: 6,
                            message: 'El código debe tener 6 dígitos'
                          },
                          maxLength: {
                            value: 6,
                            message: 'El código debe tener 6 dígitos'
                          },
                          pattern: {
                            value: /^[0-9]{6}$/,
                            message: 'Solo se permiten números'
                          }
                        })}
                        disabled={codigoVerificado}
                      />
                      {errors.codigoVerificacion && (
                        <span className="reset-error-text">{errors.codigoVerificacion.message}</span>
                      )}
                    </div>

                    <div className="reset-timer">
                      {tiempoRestante > 0 ? (
                        <p>Puedes reenviar el código en {tiempoRestante} segundos</p>
                      ) : (
                        <button
                          type="button"
                          onClick={handleReenviarCodigo}
                          className="reset-btn-link"
                          disabled={isSubmitting}
                        >
                          Reenviar Código
                        </button>
                      )}
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  className={`reset-btn ${isSubmitting ? 'is-submitting' : ''}`}
                  disabled={isSubmitting || (codigoEnviado && !!errors.codigoVerificacion)}
                >
                  {isSubmitting ? 'Procesando...' : 
                  codigoEnviado ? 'Verificar Código' : 'Enviar Código de Verificación'}
                </button>
              </form>
            )}

            {/* Paso 2: Cambiar contraseña */}
            {step === 2 && (
              <form onSubmit={handleSubmit(handleCambiarContraseña)}>
                <div className="reset-input-group">
                  <label>Nueva Contraseña</label>
                  <input
                    type="password"
                    placeholder="Ingresa tu nueva contraseña"
                    {...register('nuevaContraseña', {
                      required: 'La contraseña es obligatoria',
                      minLength: {
                        value: 8,
                        message: 'Mínimo 8 caracteres'
                      },
                      pattern: {
                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                        message: 'Debe incluir mayúscula, minúscula, número y carácter especial'
                      }
                    })}
                  />
                  {errors.nuevaContraseña && (
                    <span className="reset-error-text">{errors.nuevaContraseña.message}</span>
                  )}
                  <small className="reset-hint-text">
                    La contraseña debe contener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial (@$!%*?&)
                  </small>
                </div>

                <div className="reset-input-group">
                  <label>Confirmar Contraseña</label>
                  <input
                    type="password"
                    placeholder="Confirma tu nueva contraseña"
                    {...register('confirmarContraseña', {
                      required: 'Debes confirmar la contraseña',
                      validate: value => 
                        value === watch('nuevaContraseña') || 'Las contraseñas no coinciden'
                    })}
                  />
                  {errors.confirmarContraseña && (
                    <span className="reset-error-text">{errors.confirmarContraseña.message}</span>
                  )}
                </div>

                <div className="reset-form-navigation">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setError('');
                      setSuccessMessage('');
                    }}
                    className="reset-btn reset-btn-secondary"
                  >
                    Volver
                  </button>
                  <button
                    type="submit"
                    className={`reset-btn ${isSubmitting ? 'is-submitting' : ''}`}
                    disabled={isSubmitting || !!errors.nuevaContraseña || !!errors.confirmarContraseña}
                  >
                    {isSubmitting ? 'Cambiando...' : 'Cambiar Contraseña'}
                  </button>
                </div>
              </form>
            )}

            <div className="reset-links">
              <Link to="/login" className="reset-link">
                ¿Recordaste tu contraseña? Inicia sesión
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OlvideContraseña;