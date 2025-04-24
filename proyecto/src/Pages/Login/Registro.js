import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import '../Styles/Registro.css';
import { send } from '@emailjs/browser';

// Configuración de EmailJS con tus credenciales
const serviceId = 'Flooky Pets';
const templateId = 'template_z3izl33';
const publicKey = 'Glz70TavlG0ANcvrb';

function Registro() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        telefono: '',
        telefonoFijo: '',
        direccion: '',
        tipoDocumento: '',
        numeroDocumento: '',
        fechaNacimiento: '',
        correo: '',
        contrasena: '',
        verificarContrasena: '',
        codigoIngresado: '',
    });
    const [fieldErrors, setFieldErrors] = useState({
        nombre: '',
        apellido: '',
        telefono: '',
        telefonoFijo: '',
        direccion: '',
        tipoDocumento: '',
        numeroDocumento: '',
        fechaNacimiento: '',
        correo: '',
        contrasena: '',
        verificarContrasena: '',
        codigoIngresado: '',
    });
    const [codigoGenerado, setCodigoGenerado] = useState('');
    const [tiempoRestante, setTiempoRestante] = useState(60);
    const [codigoEnviado, setCodigoEnviado] = useState(false);
    const [codigoVerificado, setCodigoVerificado] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [registroExitoso, setRegistroExitoso] = useState(false);

    // Temporizador para el código de verificación
    useEffect(() => {
        let timer;
        if (codigoEnviado && tiempoRestante > 0 && !codigoVerificado) {
            timer = setInterval(() => {
                setTiempoRestante(prevTime => prevTime - 1);
            }, 1000);
        } else if (!codigoEnviado || tiempoRestante === 0 || codigoVerificado) {
            clearInterval(timer);
        }
        return () => clearInterval(timer);
    }, [codigoEnviado, tiempoRestante, codigoVerificado]);

    // Generar código aleatorio
    const generarCodigo = async () => {
        const nuevoCodigo = Math.random().toString(36).substring(2, 8).toUpperCase();
        setCodigoGenerado(nuevoCodigo);
        console.log("Código de verificación generado:", nuevoCodigo);
        try {
            await enviarCodigoPorCorreo(nuevoCodigo);
            setCodigoEnviado(true);
            setTiempoRestante(60);
            setError('');
        } catch (error) {
            console.error("Error al enviar el correo electrónico:", error);
            setError('Error al enviar el código de verificación. Por favor, inténtelo de nuevo.');
            setCodigoEnviado(false);
        }
    };

    // Función mejorada para enviar el correo
    const enviarCodigoPorCorreo = async (codigo) => {
        const verificationLink = `https://tudominio.com/verificar?codigo=${codigo}&email=${encodeURIComponent(formData.correo)}`;
        
        const templateParams = {
            to_email: formData.correo,
            from_name: 'Flooky Pets',
            reply_to: 'soporte@flookypets.com',
            verification_code: codigo,
            verification_link: verificationLink,
            user_name: `${formData.nombre} ${formData.apellido}`
        };

        console.log("Enviando EmailJS con params:", templateParams);
        
        try {
            const response = await send(serviceId, templateId, templateParams, publicKey);
            console.log('Correo electrónico enviado exitosamente:', response);
            setError('Se ha enviado un código de verificación a tu correo electrónico.');
            return response;
        } catch (error) {
            console.error('Error al enviar el correo electrónico:', error);
            
            let errorMessage = 'Error al enviar el código de verificación. Por favor, inténtelo de nuevo.';
            
            if (error.text && error.text.includes("recipient's address is corrupted")) {
                errorMessage = 'El formato del correo electrónico no es válido. Por favor, verifícalo.';
            } else if (error.status === 400) {
                errorMessage = 'Error de configuración: Verifica que el Service ID "Flooky Pets" y Template ID "template_z3izl33" sean correctos en tu cuenta EmailJS.';
            } else if (error.status === 422) {
                errorMessage = 'El servicio de correo no pudo procesar tu dirección de email. Verifica que sea correcta.';
            } else if (error.status === 429) {
                errorMessage = 'Has excedido el límite de envíos. Por favor, espera unos minutos.';
            }
            
            setError(errorMessage);
            setCodigoEnviado(false);
            setTiempoRestante(0);
            throw error;
        }
    };

    // Validar un campo individual en tiempo real
    const validateField = (name, value) => {
        let error = '';
        
        switch (name) {
            case 'nombre':
            case 'apellido':
                if (!value.trim()) {
                    error = 'Este campo es obligatorio';
                } else if (!/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/.test(value)) {
                    error = 'Solo se permiten letras y espacios';
                } else if (value.length > 50) {
                    error = 'Máximo 50 caracteres';
                }
                break;
                
            case 'telefono':
                if (!value.trim()) {
                    error = 'Este campo es obligatorio';
                } else if (!/^\d{10}$/.test(value)) {
                    error = 'Debe tener 10 dígitos numéricos';
                }
                break;
                
            case 'telefonoFijo':
                if (value && !/^\d{7,10}$/.test(value)) {
                    error = 'Debe tener entre 7 y 10 dígitos';
                }
                break;
                
            case 'direccion':
                if (!value.trim()) {
                    error = 'Este campo es obligatorio';
                } else if (value.length > 100) {
                    error = 'Máximo 100 caracteres';
                }
                break;
                
            case 'tipoDocumento':
                if (!value) {
                    error = 'Seleccione un tipo de documento';
                }
                break;
                
            case 'numeroDocumento':
                if (!value.trim()) {
                    error = 'Este campo es obligatorio';
                } else if (!/^\d{9,11}$/.test(value)) {
                    error = 'Debe tener 10 digitos';
                }
                break;
                
            case 'fechaNacimiento':
                if (!value) {
                    error = 'Este campo es obligatorio';
                } else {
                    const fechaNac = new Date(value);
                    const hoy = new Date();
                    let edad = hoy.getFullYear() - fechaNac.getFullYear();
                    const m = hoy.getMonth() - fechaNac.getMonth();
                    if (m < 0 || (m === 0 && hoy.getDate() < fechaNac.getDate())) {
                        edad--;
                    }
                    if (edad < 18) {
                        error = 'Debes tener al menos 18 años';
                    } else if (edad > 120) {
                        error = 'Fecha de nacimiento no válida';
                    }
                }
                break;
                
            case 'correo':
                if (!value.trim()) {
                    error = 'Este campo es obligatorio';
                } else {
                    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                    if (!emailRegex.test(value)) {
                        error = 'Correo electrónico no válido';
                    } else if (value.length > 100) {
                        error = 'Máximo 100 caracteres';
                    }
                }
                break;
                
            case 'contrasena':
                if (!value.trim()) {
                    error = 'Este campo es obligatorio';
                } else if (value.length < 8) {
                    error = 'Mínimo 8 caracteres';
                } else if (!/(?=.*[a-z])/.test(value)) {
                    error = 'Debe contener al menos una minúscula';
                } else if (!/(?=.*[A-Z])/.test(value)) {
                    error = 'Debe contener al menos una mayúscula';
                } else if (!/(?=.*\d)/.test(value)) {
                    error = 'Debe contener al menos un número';
                } else if (!/(?=.*[@$!%*?&])/.test(value)) {
                    error = 'Debe contener al menos un carácter especial (@$!%*?&)';
                } else if (value.length > 30) {
                    error = 'Máximo 30 caracteres';
                }
                break;
                
            case 'verificarContrasena':
                if (!value.trim()) {
                    error = 'Este campo es obligatorio';
                } else if (value !== formData.contrasena) {
                    error = 'Las contraseñas no coinciden';
                }
                break;
                
            case 'codigoIngresado':
                if (!value.trim()) {
                    error = 'Ingrese el código de verificación';
                } else if (value.length !== 6) {
                    error = 'El código debe tener 6 caracteres';
                }
                break;
                
            default:
                break;
        }
        
        return error;
    };

    // Manejar cambios en los inputs con validación en tiempo real
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        // Validación en tiempo real
        const error = validateField(name, value);
        
        setFieldErrors(prevErrors => ({
            ...prevErrors,
            [name]: error
        }));
        
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    // Validar todos los campos del paso actual
    const validateCurrentStep = () => {
        let isValid = true;
        const newErrors = {...fieldErrors};
        
        if (step === 1) {
            const fieldsToValidate = ['nombre', 'apellido', 'telefono', 'direccion', 'tipoDocumento', 'numeroDocumento', 'fechaNacimiento'];
            fieldsToValidate.forEach(field => {
                const error = validateField(field, formData[field]);
                newErrors[field] = error;
                if (error) isValid = false;
            });
        } else if (step === 2) {
            const fieldsToValidate = ['correo', 'contrasena', 'verificarContrasena'];
            fieldsToValidate.forEach(field => {
                const error = validateField(field, formData[field]);
                newErrors[field] = error;
                if (error) isValid = false;
            });
        } else if (step === 3) {
            if (!codigoEnviado) {
                const error = validateField('correo', formData.correo);
                newErrors.correo = error;
                if (error) isValid = false;
            } else {
                const error = validateField('codigoIngresado', formData.codigoIngresado);
                newErrors.codigoIngresado = error;
                if (error) isValid = false;
            }
        }
        
        setFieldErrors(newErrors);
        return isValid;
    };

    // Avanzar al siguiente paso
    const nextStep = async () => {
        setError('');
        if (validateCurrentStep()) {
            if (step === 2) {
                await generarCodigo();
            }
            setStep(prevStep => prevStep + 1);
        } else {
            setError('Por favor, corrige los errores en el formulario antes de continuar.');
        }
    };

    // Retroceder al paso anterior
    const prevStep = () => {
        setStep(prevStep => prevStep - 1);
        setError('');
    };

    // Verificar el código ingresado
    const verificarCodigo = () => {
        setError('');
        if (fieldErrors.codigoIngresado) {
            return;
        }
        
        if (formData.codigoIngresado.toUpperCase() === codigoGenerado) {
            setCodigoVerificado(true);
            setError('Código verificado correctamente.');
        } else {
            setError('El código ingresado no coincide.');
        }
    };

    // Enviar el formulario completo
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Verificar que el código esté verificado
        if (!codigoVerificado) {
          setError('Por favor, verifique el código antes de enviar.');
          return;
        }
      
        // Preparar datos para enviar
        const userData = {
          nombre: formData.nombre,
          apellido: formData.apellido,
          email: formData.correo,  // Asegúrate que coincida con el backend
          password: formData.contrasena,
          telefono: formData.telefono,
          direccion: formData.direccion,
          tipoDocumento: formData.tipoDocumento,
          numeroDocumento: formData.numeroDocumento,
          fechaNacimiento: formData.fechaNacimiento
        };
      
        console.log("Enviando datos al backend:", userData);
      
        try {
          const response = await fetch('http://localhost:5000/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
          });
      
          const data = await response.json();
      
          if (!response.ok) {
            throw new Error(data.message || 'Error en el registro');
          }
      
          console.log("Registro exitoso:", data);
          setRegistroExitoso(true);
          
        } catch (error) {
          console.error("Error en el registro:", error);
          setError(error.message || 'Hubo un error al registrar. Por favor, inténtalo de nuevo.');
        }
      };
  // Función para enviar correo de bienvenida (opcional)
  const enviarCorreoBienvenida = async (email, nombre) => {
    const templateParams = {
      to_email: email,
      user_name: nombre,
      from_name: 'Flooky Pets'
    };
  
    try {
      await send(serviceId, 'template_bienvenida', templateParams, publicKey);
    } catch (emailError) {
      console.error("Error enviando correo de bienvenida:", emailError);
    }
  };

    // Redirigir después de registro exitoso
    useEffect(() => {
        if (registroExitoso) {
            const timer = setTimeout(() => {
                navigate('/login');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [registroExitoso, navigate]);

    // Renderizar el paso actual del formulario
    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="step-container">
                        <h2>Información Básica</h2>
                        <div className="input-group">
                            <label>Nombre:</label>
                            <input 
                                type="text" 
                                name="nombre" 
                                
                                value={formData.nombre} 
                                onChange={handleInputChange} 
                                maxLength="50"
                                className={fieldErrors.nombre ? 'input-error' : ''}
                                required 
                            />
                            {fieldErrors.nombre && <span className="error-text">{fieldErrors.nombre}</span>}
                        </div>
                        <div className="input-group">
                            <label>Apellido:</label>
                            <input 
                                type="text" 
                                name="apellido" 
                                
                                value={formData.apellido} 
                                onChange={handleInputChange} 
                                maxLength="50"
                                className={fieldErrors.apellido ? 'input-error' : ''}
                                required 
                            />
                            {fieldErrors.apellido && <span className="error-text">{fieldErrors.apellido}</span>}
                        </div>
                        <div className="input-group">
                            <label>Teléfono:</label>
                            <input 
                                type="tel" 
                                name="telefono" 
                                
                                value={formData.telefono} 
                                onChange={handleInputChange} 
                                maxLength="10"
                                className={fieldErrors.telefono ? 'input-error' : ''}
                                required 
                            />
                            {fieldErrors.telefono && <span className="error-text">{fieldErrors.telefono}</span>}
                        </div>
                        <div className="input-group">
                            <label>Teléfono Fijo (Opcional):</label>
                            <input 
                                type="tel" 
                                name="telefonoFijo" 
                                
                                value={formData.telefonoFijo} 
                                onChange={handleInputChange} 
                                maxLength="10"
                                className={fieldErrors.telefonoFijo ? 'input-error' : ''}
                            />
                            {fieldErrors.telefonoFijo && <span className="error-text">{fieldErrors.telefonoFijo}</span>}
                        </div>
                        <div className="input-group">
                            <label>Dirección:</label>
                            <input 
                                type="text" 
                                name="direccion" 
                                 
                                value={formData.direccion} 
                                onChange={handleInputChange} 
                                maxLength="100"
                                className={fieldErrors.direccion ? 'input-error' : ''}
                                required 
                            />
                            {fieldErrors.direccion && <span className="error-text">{fieldErrors.direccion}</span>}
                        </div>
                        <div className="input-group">
                            <label>Tipo de Documento:</label>
                            <select 
                                name="tipoDocumento" 
                                value={formData.tipoDocumento} 
                                onChange={handleInputChange} 
                                className={fieldErrors.tipoDocumento ? 'input-error' : ''}
                                required
                            >
                                <option value="">Seleccione un tipo</option>
                                <option value="CC">Cédula de Ciudadanía</option>
                                <option value="Pasaporte">Pasaporte</option>
                            </select>
                            {fieldErrors.tipoDocumento && <span className="error-text">{fieldErrors.tipoDocumento}</span>}
                        </div>
                        <div className="input-group">
                            <label>Número de Documento:</label>
                            <input 
                                type="text" 
                                name="numeroDocumento" 
                                
                                value={formData.numeroDocumento} 
                                onChange={handleInputChange} 
                                maxLength="12"
                                className={fieldErrors.numeroDocumento ? 'input-error' : ''}
                                required 
                            />
                            {fieldErrors.numeroDocumento && <span className="error-text">{fieldErrors.numeroDocumento}</span>}
                        </div>
                        <div className="input-group">
                            <label>Fecha de Nacimiento:</label>
                            <input 
                                type="date" 
                                name="fechaNacimiento" 
                                
                                value={formData.fechaNacimiento} 
                                onChange={handleInputChange} 
                                className={fieldErrors.fechaNacimiento ? 'input-error' : ''}
                                required 
                                max={new Date().toISOString().split('T')[0]}
                            />
                            {fieldErrors.fechaNacimiento && <span className="error-text">{fieldErrors.fechaNacimiento}</span>}
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="step-container">
                        <h2>Información de Cuenta</h2>
                        <div className="input-group">
                            <label>Correo Electrónico:</label>
                            <input 
                                type="email" 
                                name="correo" 
                                
                                value={formData.correo} 
                                onChange={handleInputChange} 
                                maxLength="100"
                                className={fieldErrors.correo ? 'input-error' : ''}
                                required 
                            />
                            {fieldErrors.correo && <span className="error-text">{fieldErrors.correo}</span>}
                        </div>
                        <div className="input-group">
                            <label>Contraseña:</label>
                            <input 
                                type="password" 
                                name="contrasena" 
                                placeholder="Contraseña" 
                                value={formData.contrasena} 
                                onChange={handleInputChange} 
                                maxLength="30"
                                className={fieldErrors.contrasena ? 'input-error' : ''}
                                required 
                            />
                            {fieldErrors.contrasena ? (
                                <span className="error-text">{fieldErrors.contrasena}</span>
                            ) : (
                                <small>Debe contener al menos: 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial (@$!%*?&)</small>
                            )}
                        </div>
                        <div className="input-group">
                            <label>Verificar Contraseña:</label>
                            <input 
                                type="password" 
                                name="verificarContrasena" 
                                
                                value={formData.verificarContrasena} 
                                onChange={handleInputChange} 
                                maxLength="30"
                                className={fieldErrors.verificarContrasena ? 'input-error' : ''}
                                required 
                            />
                            {fieldErrors.verificarContrasena && <span className="error-text">{fieldErrors.verificarContrasena}</span>}
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="step-container">
                        <h2>Verificación de Código</h2>
                        {!codigoEnviado && (
                            <div className="input-group">
                                <label>Correo Electrónico:</label>
                                <input 
                                    type="email" 
                                    name="correo" 
                                     
                                    value={formData.correo} 
                                    onChange={handleInputChange} 
                                    maxLength="100"
                                    className={fieldErrors.correo ? 'input-error' : ''}
                                    required 
                                />
                                {fieldErrors.correo && <span className="error-text">{fieldErrors.correo}</span>}
                                <button 
                                    type="button" 
                                    onClick={nextStep} 
                                    className="btn-generar-codigo"
                                    disabled={!!fieldErrors.correo}
                                >
                                    Generar y Enviar Código de Verificación
                                </button>
                            </div>
                        )}
                        {codigoEnviado && (
                            <div id="verification-section">
                                <p>Se ha enviado un código de verificación a <strong>{formData.correo}</strong></p>
                                <div className="input-group">
                                    <label>Ingresa el código de verificación:</label>
                                    <input
                                        type="text"
                                        name="codigoIngresado"
                                        placeholder="Ingresa el código de verificación"
                                        value={formData.codigoIngresado}
                                        onChange={handleInputChange}
                                        maxLength="6"
                                        className={fieldErrors.codigoIngresado ? 'input-error' : ''}
                                        required
                                    />
                                    {fieldErrors.codigoIngresado && <span className="error-text">{fieldErrors.codigoIngresado}</span>}
                                </div>
                                <button 
                                    type="button" 
                                    onClick={verificarCodigo} 
                                    disabled={codigoVerificado || !!fieldErrors.codigoIngresado}
                                    className={codigoVerificado ? 'btn-verified' : 'btn-verify'}
                                >
                                    {codigoVerificado ? '✓ Código Verificado' : 'Verificar Código'}
                                </button>
                                {tiempoRestante > 0 && !codigoVerificado && (
                                    <p className="timer-text">Tiempo restante para un nuevo código: {tiempoRestante} segundos</p>
                                )}
                                {tiempoRestante === 0 && (
                                    <button 
                                        type="button" 
                                        onClick={generarCodigo}
                                        className="btn-resend"
                                    >
                                        Reenviar Código
                                    </button>
                                )}
                                {codigoVerificado && (
                                    <p className="success-message">✓ Puedes continuar.</p>
                                )}
                            </div>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    // Renderizar círculos de progreso
    const renderProgressCircles = () => {
        const circles = [1, 2, 3];
        return (
            <div className="progress-container">
                {circles.map(circle => (
                    <React.Fragment key={circle}>
                        <span
                            className={`progress-circle ${step === circle ? 'active' : ''} ${step > circle ? 'completed' : ''}`}
                        >
                            {step > circle ? '✓' : circle}
                        </span>
                        {circle < 3 && <span className="progress-line"></span>}
                    </React.Fragment>
                ))}
            </div>
        );
    };

    return (
        <div className="registro-container">
            <div className="registro-box">
                <h1>Registro de Usuario</h1>
                {renderProgressCircles()}
                {error && <p className="error-message">{error}</p>}
                {registroExitoso && (
                    <div className="success-message">
                        <p>✓ Registro exitoso. Redirigiendo...</p>
                    </div>
                )}

                {!registroExitoso && (
                    <form onSubmit={handleSubmit} className="registro-form">
                        {renderStep()}

                        <div className="form-navigation">
                            {step > 1 && (
                                <button 
                                    type="button" 
                                    onClick={prevStep}
                                    className="btn-prev"
                                >
                                    Anterior
                                </button>
                            )}
                            {step < 3 && (
                                <button 
                                    type="button" 
                                    onClick={nextStep}
                                    className="btn-next"
                                    disabled={Object.values(fieldErrors).some(error => error)}
                                >
                                    Siguiente
                                </button>
                            )}
                            {step === 3 && codigoVerificado && (
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="btn-submit"
                                >
                                    {isSubmitting ? 'Registrando...' : 'Finalizar Registro'}
                                </button>
                            )}
                        </div>
                    </form>
                )}

            <div className="login-links">
              <Link to="/login" className="link">¿Ya tienes una cuenta?</Link>
            </div>

            </div>
        </div>
    );
}

export default Registro;