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
  const [previousPasswords, setPreviousPasswords] = useState([]);
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    getValues, 
    watch,
    reset
  } = useForm();
  
  const navigate = useNavigate();

  // Temporizador mejorado
  useEffect(() => {
    if (!codigoEnviado || tiempoRestante <= 0 || codigoVerificado) {
      return;
    }

    const timer = setInterval(() => {
      setTiempoRestante(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [codigoEnviado, tiempoRestante, codigoVerificado]);

  const generarCodigo = () => {
    const nuevoCodigo = Math.floor(100000 + Math.random() * 900000).toString();
    setCodigoGenerado(nuevoCodigo);
    return nuevoCodigo;
  };

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

  const handleEnviarCodigo = async () => {
    setError('');
    setSuccessMessage('');
    setIsSubmitting(true);
    
    try {
      const email = getValues('correo');
      
      if (!email) {
        throw new Error('El correo es obligatorio');
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Correo electrónico inválido');
      }

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

      if (data.previousPasswords) {
        setPreviousPasswords(data.previousPasswords);
      }

      const codigo = data.resetToken || generarCodigo();
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

  const handleVerificarCodigo = async () => {
    const codigoIngresado = getValues('codigoVerificacion')?.replace(/\D/g,'');
    const email = getValues('correo')?.trim();
    
    if (!codigoIngresado || codigoIngresado.length !== 6) {
      setError('Ingresa un código de 6 dígitos');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
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
        reset({
          correo: getValues('correo'),
          codigoVerificacion: '',
          nuevaContraseña: '',
          confirmarContraseña: ''
        });
      }, 1500);
    
    } catch (error) {
      setError(error.message || 'Error al verificar el código');
    } finally {
      setIsSubmitting(false);
    }
  };

  const validatePassword = (value) => {
    const nuevaContraseña = value;
    
    if (previousPasswords.includes(nuevaContraseña)) {
      return 'No puedes usar una contraseña anterior';
    }
    
    if (nuevaContraseña.length < 8) {
      return 'Mínimo 8 caracteres';
    }
    
    if (!/[A-Z]/.test(nuevaContraseña)) {
      return 'Debe incluir al menos una mayúscula';
    }
    
    if (!/[a-z]/.test(nuevaContraseña)) {
      return 'Debe incluir al menos una minúscula';
    }
    
    if (!/\d/.test(nuevaContraseña)) {
      return 'Debe incluir al menos un número';
    }
    
    if (!/[@$!%*?&]/.test(nuevaContraseña)) {
      return 'Debe incluir al menos un carácter especial (@$!%*?&)';
    }
    
    return true;
  };

  const handleCambiarContraseña = async () => {
    const { nuevaContraseña, confirmarContraseña } = getValues();
    const email = getValues('correo');
    
    if (nuevaContraseña !== confirmarContraseña) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    if (previousPasswords.includes(nuevaContraseña)) {
      setError('No puedes usar una contraseña anterior');
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

      reset();
      setSuccessMessage('¡Contraseña cambiada con éxito!');
      setTimeout(() => navigate('/login'), 2000);
      
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

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
      setError('Error al reenviar el código');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVolver = () => {
    setStep(1);
    setCodigoEnviado(false);
    setCodigoVerificado(false);
    setTiempoRestante(60);
    setError('');
    setSuccessMessage('');
    reset({
      correo: getValues('correo'),
      codigoVerificacion: ''
    });
  };

  return (
    <div className="olv-reset-container">
      <div className="olv-reset-wrapper">
        <div className="olv-reset-box">
          <div className="olv-reset-info-section">
            <h1 style={{textAlign: 'center', marginBottom: '1rem'}}>Flooky Pets</h1>
            <h2 style={{textAlign: 'center', marginBottom: '1rem'}}>Recupera tu contraseña</h2>
            <p style={{textAlign: 'center'}}>Ingresa tu correo electrónico y sigue las instrucciones para restablecer tu contraseña.</p>
          </div>
          
          <div className="olv-reset-form-section">
            <h2 className="olv-title">Recuperar Contraseña</h2>
            
            {/* Barra de progreso mejorada */}
            <div className="olv-progress-container">
              <div className={`olv-progress-step ${step >= 1 ? 'active' : ''}`}>
                <div className="olv-step-number">1</div>
                <div className="olv-step-label">Verificar Email</div>
              </div>
              <div className={`olv-progress-line ${step >= 2 ? 'active' : ''}`}></div>
              <div className={`olv-progress-step ${step >= 2 ? 'active' : ''}`}>
                <div className="olv-step-number">2</div>
                <div className="olv-step-label">Nueva Contraseña</div>
              </div>
            </div>

            {error && <div className="olv-error-message">{error}</div>}
            {successMessage && <div className="olv-success-message">{successMessage}</div>}

            {step === 1 && (
              <form onSubmit={handleSubmit(codigoEnviado ? handleVerificarCodigo : handleEnviarCodigo)}>
                <div className="olv-input-group">
                  <label className="olv-input-label">Correo Electrónico</label>
                  <input
                    type="email"
                    className={`olv-input-field ${errors.correo ? 'olv-input-error' : ''}`}
                    placeholder="ejemplo@correo.com"
                    {...register('correo', {
                      required: 'El correo es obligatorio',
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Correo electrónico inválido'
                      }
                    })}
                    disabled={codigoEnviado}
                  />
                  {errors.correo && <span className="olv-error-text">{errors.correo.message}</span>}
                </div>

                {codigoEnviado && (
                  <>
                    <div className="olv-input-group">
                      <label className="olv-input-label">Código de Verificación</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        className={`olv-input-field ${errors.codigoVerificacion ? 'olv-input-error' : ''}`}
                        placeholder="Ingresa el código de 6 dígitos"
                        {...register('codigoVerificacion', {
                          required: 'El código es obligatorio',
                          minLength: { value: 6, message: 'El código debe tener 6 dígitos' },
                          maxLength: { value: 6, message: 'El código debe tener 6 dígitos' },
                          pattern: { value: /^[0-9]{6}$/, message: 'Solo se permiten números' }
                        })}
                        disabled={codigoVerificado}
                      />
                      {errors.codigoVerificacion && (
                        <span className="olv-error-text">{errors.codigoVerificacion.message}</span>
                      )}
                    </div>

                    <div className="olv-timer">
                      {tiempoRestante > 0 ? (
                        <p className="olv-timer-text">
                          Puedes reenviar el código en {tiempoRestante} segundos
                        </p>
                      ) : (
                        <button
                          type="button"
                          onClick={handleReenviarCodigo}
                          className="olv-link-btn"
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
                  className={`olv-primary-btn ${isSubmitting ? 'is-submitting' : ''}`}
                  disabled={isSubmitting || (codigoEnviado && !!errors.codigoVerificacion)}
                >
                  {isSubmitting ? 'Procesando...' : 
                  codigoEnviado ? 'Verificar Código' : 'Enviar Código de Verificación'}
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleSubmit(handleCambiarContraseña)}>
                <div className="olv-input-group">
                  <label className="olv-input-label">Nueva Contraseña</label>
                  <input
                    type="password"
                    className={`olv-input-field ${errors.nuevaContraseña ? 'olv-input-error' : ''}`}
                    placeholder="Ingresa tu nueva contraseña"
                    {...register('nuevaContraseña', {
                      required: 'La contraseña es obligatoria',
                      validate: validatePassword
                    })}
                  />
                  {errors.nuevaContraseña && (
                    <span className="olv-error-text">{errors.nuevaContraseña.message}</span>
                  )}
                  <div className="olv-hint-text">
                    <p>Requisitos de contraseña:</p>
                    <ul>
                      <li>Mínimo 8 caracteres</li>
                      <li>Al menos una mayúscula y una minúscula</li>
                      <li>Al menos un número</li>
                      <li>Al menos un carácter especial (@$!%*?&)</li>
                      <li>No puede ser una contraseña anterior</li>
                    </ul>
                  </div>
                </div>

                <div className="olv-input-group">
                  <label className="olv-input-label">Confirmar Contraseña</label>
                  <input
                    type="password"
                    className={`olv-input-field ${errors.confirmarContraseña ? 'olv-input-error' : ''}`}
                    placeholder="Confirma tu nueva contraseña"
                    {...register('confirmarContraseña', {
                      required: 'Debes confirmar la contraseña',
                      validate: value => 
                        value === watch('nuevaContraseña') || 'Las contraseñas no coinciden'
                    })}
                  />
                  {errors.confirmarContraseña && (
                    <span className="olv-error-text">{errors.confirmarContraseña.message}</span>
                  )}
                </div>

                <div className="olv-form-navigation">
                  <button
                    type="button"
                    onClick={handleVolver}
                    className="olv-secondary-btn"
                  >
                    Volver
                  </button>
                  <button
                    type="submit"
                    className={`olv-primary-btn ${isSubmitting ? 'is-submitting' : ''}`}
                    disabled={isSubmitting || !!errors.nuevaContraseña || !!errors.confirmarContraseña}
                  >
                    {isSubmitting ? 'Cambiando...' : 'Cambiar Contraseña'}
                  </button>
                </div>
              </form>
            )}

            <div className="olv-footer-links">
              <Link to="/login" className="olv-footer-link">
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