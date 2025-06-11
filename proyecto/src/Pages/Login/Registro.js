import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import '../Styles/Registro.css';
import { send } from '@emailjs/browser';

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
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);

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

    const generarCodigo = async () => {
        const nuevoCodigo = Math.random().toString(36).substring(2, 8).toUpperCase();
        setCodigoGenerado(nuevoCodigo);
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

        
        try {
            const response = await send(serviceId, templateId, templateParams, publicKey);
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
                } else if (!/^(3\d{9}|[1-9]\d{6,7})$/.test(value)) {
                    error = 'Formato de teléfono colombiano inválido';
                }
                break;
                
            case 'direccion':
                if (!value.trim()) {
                    error = 'Este campo es obligatorio';
                } else if (!/^(Calle|Cll|Cl|Carrera|Cra|Cr|Avenida|Av|Avda|Avd|Transversal|Trans|Circular|Cir)\s?\d+.*$/i.test(value)) {
                    error = 'La dirección debe comenzar con el tipo de vía (Ej: Calle, Carrera, Av.) seguido de número';
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
                } else if (!/^\d{8,11}$/.test(value)) {
                    error = 'Número de documento inválido (8-11 dígitos)';
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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
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

    const nextStep = async () => {
        setError('');
        if (validateCurrentStep()) {
            if (step === 2) {
                await generarCodigo();
                setIsSidebarVisible(false);
            }
            setStep(prevStep => prevStep + 1);
        } else {
            setError('Por favor, corrige los errores en el formulario antes de continuar.');
        }
    };

    const prevStep = () => {
        if (step === 3) {
            setIsSidebarVisible(true);
        }
        setStep(prevStep => prevStep - 1);
        setError('');
    };

    const verificarCodigo = () => {
        setError('');
        if (fieldErrors.codigoIngresado) {
            return;
        }
        
        if (formData.codigoIngresado.toUpperCase() === codigoGenerado) {
            setCodigoVerificado(true);
        } else {
            setError('El código ingresado no coincide.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!codigoVerificado) {
          setError('Por favor, verifique el código antes de enviar.');
          return;
        }

        if (!termsAccepted) {
            setError('Debes aceptar los términos y condiciones para continuar.');
            return;
        }
      
        const userData = {
          nombre: formData.nombre,
          apellido: formData.apellido,
          email: formData.correo,
          password: formData.contrasena,
          telefono: formData.telefono,
          direccion: formData.direccion,
          tipoDocumento: formData.tipoDocumento,
          numeroDocumento: formData.numeroDocumento,
          fechaNacimiento: formData.fechaNacimiento
        };
      
      
        try {
          setIsSubmitting(true);
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
      
          setRegistroExitoso(true);
          
        } catch (error) {
          console.error("Error en el registro:", error);
          setError(error.message || 'Hubo un error al registrar. Por favor, inténtalo de nuevo.');
        } finally {
          setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (registroExitoso) {
            const timer = setTimeout(() => {
                navigate('/login');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [registroExitoso, navigate]);

    const toggleTermsModal = () => {
        setShowTermsModal(!showTermsModal);
    };

    const acceptTerms = () => {
        setTermsAccepted(true);
        setShowTermsModal(false);
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="reg-step-container reg-two-columns">
                        <h2>Información Básica</h2>
                        <div className="reg-form-columns">
                            <div className="reg-form-column">
                                <div className="reg-input-group">
                                    <label>Nombre:</label>
                                    <input 
                                        type="text" 
                                        name="nombre" 
                                        value={formData.nombre} 
                                        onChange={handleInputChange} 
                                        maxLength="50"
                                        className={fieldErrors.nombre ? 'reg-input-error' : ''}
                                        required 
                                    />
                                    {fieldErrors.nombre && <span className="reg-error-text">{fieldErrors.nombre}</span>}
                                </div>
                                <div className="reg-input-group">
                                    <label>Apellido:</label>
                                    <input 
                                        type="text" 
                                        name="apellido" 
                                        value={formData.apellido} 
                                        onChange={handleInputChange} 
                                        maxLength="50"
                                        className={fieldErrors.apellido ? 'reg-input-error' : ''}
                                        required 
                                    />
                                    {fieldErrors.apellido && <span className="reg-error-text">{fieldErrors.apellido}</span>}
                                </div>
                                <div className="reg-input-group">
                                    <label>Teléfono:</label>
                                    <input 
                                        type="tel" 
                                        name="telefono" 
                                        value={formData.telefono} 
                                        onChange={handleInputChange} 
                                        maxLength="10"
                                        placeholder="Ej: 3001234567"
                                        className={fieldErrors.telefono ? 'reg-input-error' : ''}
                                        required 
                                    />
                                    {fieldErrors.telefono && <span className="reg-error-text">{fieldErrors.telefono}</span>}
                                </div>
                            </div>
                            <div className="reg-form-column">
                                <div className="reg-input-group">
                                    <label>Dirección:</label>
                                    <input 
                                        type="text" 
                                        name="direccion" 
                                        value={formData.direccion} 
                                        onChange={handleInputChange} 
                                        maxLength="100"
                                        placeholder="Ej: Calle 123 #45-67"
                                        className={fieldErrors.direccion ? 'reg-input-error' : ''}
                                        required 
                                    />
                                    {fieldErrors.direccion && <span className="reg-error-text">{fieldErrors.direccion}</span>}
                                </div>
                                <div className="reg-input-group">
                                    <label>Tipo de Documento:</label>
                                    <select 
                                        name="tipoDocumento" 
                                        value={formData.tipoDocumento} 
                                        onChange={handleInputChange} 
                                        className={fieldErrors.tipoDocumento ? 'reg-input-error' : ''}
                                        required
                                    >
                                        <option value="">Seleccione un tipo</option>
                                        <option value="CC">Cédula de Ciudadanía</option>
                                        <option value="Pasaporte">Pasaporte</option>
                                    </select>
                                    {fieldErrors.tipoDocumento && <span className="reg-error-text">{fieldErrors.tipoDocumento}</span>}
                                </div>
                                <div className="reg-input-group">
                                    <label>Número de Documento:</label>
                                    <input 
                                        type="text" 
                                        name="numeroDocumento" 
                                        value={formData.numeroDocumento} 
                                        onChange={handleInputChange} 
                                        maxLength="12"
                                        className={fieldErrors.numeroDocumento ? 'reg-input-error' : ''}
                                        required 
                                    />
                                    {fieldErrors.numeroDocumento && <span className="reg-error-text">{fieldErrors.numeroDocumento}</span>}
                                </div>
                                <div className="reg-input-group">
                                    <label>Fecha de Nacimiento:</label>
                                    <input 
                                        type="date" 
                                        name="fechaNacimiento" 
                                        value={formData.fechaNacimiento} 
                                        onChange={handleInputChange} 
                                        className={fieldErrors.fechaNacimiento ? 'reg-input-error' : ''}
                                        required 
                                        max={new Date().toISOString().split('T')[0]}
                                    />
                                    {fieldErrors.fechaNacimiento && <span className="reg-error-text">{fieldErrors.fechaNacimiento}</span>}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="reg-step-container">
                        <h2>Información de Cuenta</h2>
                        <div className="reg-form-columns">
                            <div className="reg-form-column">
                                <div className="reg-input-group">
                                    <label>Correo Electrónico:</label>
                                    <input 
                                        type="email" 
                                        name="correo" 
                                        value={formData.correo} 
                                        onChange={handleInputChange} 
                                        maxLength="100"
                                        className={fieldErrors.correo ? 'reg-input-error' : ''}
                                        required 
                                    />
                                    {fieldErrors.correo && <span className="reg-error-text">{fieldErrors.correo}</span>}
                                </div>
                            </div>
                            <div className="reg-form-column">
                                <div className="reg-input-group">
                                    <label>Contraseña:</label>
                                    <input 
                                        type="password" 
                                        name="contrasena" 
                                        placeholder="Contraseña" 
                                        value={formData.contrasena} 
                                        onChange={handleInputChange} 
                                        maxLength="30"
                                        className={fieldErrors.contrasena ? 'reg-input-error' : ''}
                                        required 
                                    />
                                    {fieldErrors.contrasena ? (
                                        <span className="reg-error-text">{fieldErrors.contrasena}</span>
                                    ) : (
                                        <small>Debe contener al menos: 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial (@$!%*?&)</small>
                                    )}
                                </div>
                                <div className="reg-input-group">
                                    <label>Verificar Contraseña:</label>
                                    <input 
                                        type="password" 
                                        name="verificarContrasena" 
                                        value={formData.verificarContrasena} 
                                        onChange={handleInputChange} 
                                        maxLength="30"
                                        className={fieldErrors.verificarContrasena ? 'reg-input-error' : ''}
                                        required 
                                    />
                                    {fieldErrors.verificarContrasena && <span className="reg-error-text">{fieldErrors.verificarContrasena}</span>}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="reg-step-container reg-verification-step">
                        <h2>Verificación de Código</h2>
                        {!codigoEnviado && (
                            <div className="reg-input-group">
                                <label>Correo Electrónico:</label>
                                <input 
                                    type="email" 
                                    name="correo" 
                                    value={formData.correo} 
                                    onChange={handleInputChange} 
                                    maxLength="100"
                                    className={fieldErrors.correo ? 'reg-input-error' : ''}
                                    required 
                                />
                                {fieldErrors.correo && <span className="reg-error-text">{fieldErrors.correo}</span>}
                                <button 
                                    type="button" 
                                    onClick={nextStep} 
                                    className="reg-btn-generate-code"
                                    disabled={!!fieldErrors.correo}
                                >
                                    Generar y Enviar Código de Verificación
                                </button>
                            </div>
                        )}
                        {codigoEnviado && (
                            <div id="reg-verification-section">
                                <p>Se ha enviado un código de verificación a <strong>{formData.correo}</strong></p>
                                <div className="reg-input-group">
                                    <label>Ingresa el código de verificación:</label>
                                    <input
                                        type="text"
                                        name="codigoIngresado"
                                        placeholder="Ingresa el código de verificación"
                                        value={formData.codigoIngresado}
                                        onChange={handleInputChange}
                                        maxLength="6"
                                        className={fieldErrors.codigoIngresado ? 'reg-input-error' : ''}
                                        required
                                    />
                                    {fieldErrors.codigoIngresado && <span className="reg-error-text">{fieldErrors.codigoIngresado}</span>}
                                </div>
                                <div className="reg-verification-actions">
                                    <button 
                                        type="button" 
                                        onClick={verificarCodigo} 
                                        disabled={codigoVerificado || !!fieldErrors.codigoIngresado}
                                        className={codigoVerificado ? 'reg-btn-verified' : 'reg-btn-verify'}
                                    >
                                        {codigoVerificado ? '' : 'Verificar Código'}
                                    </button>
                                    {tiempoRestante > 0 && !codigoVerificado && (
                                        <p className="reg-timer-text">Tiempo restante: {tiempoRestante}s</p>
                                    )}
                                    {tiempoRestante === 0 && (
                                        <button 
                                            type="button" 
                                            onClick={generarCodigo}
                                            className="reg-btn-resend"
                                        >
                                            Reenviar Código
                                        </button>
                                    )}
                                </div>
                                {codigoVerificado && (
                                    <div className="reg-success-message">
                                        <p>✓ Código verificado correctamente</p>
                                        <p>✓ Puedes continuar</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Términos y condiciones */}
                        <div className="reg-terms-checkbox">
                            <input 
                                type="checkbox" 
                                id="terms" 
                                name="terms" 
                                checked={termsAccepted}
                                onChange={() => setTermsAccepted(!termsAccepted)}
                            />
                            <label htmlFor="terms">
                                Acepto los <button type="button" className="reg-terms-link" onClick={toggleTermsModal}>Términos y Condiciones</button>
                            </label>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    

    
    const renderProgressCircles = () => {
        const circles = [1, 2, 3];
        return (
            <div className="reg-progress-container">
                {circles.map(circle => (
                    <React.Fragment key={circle}>
                        <span
                            className={`reg-progress-circle ${step === circle ? 'active' : ''} ${step > circle ? 'completed' : ''}`}
                        >
                            {step > circle ? '✓' : circle}
                        </span>
                        {circle < 3 && <span className="reg-progress-line"></span>}
                    </React.Fragment>
                ))}
            </div>
        );
    };

    return (
        <div className="reg-container">
            <div className={`reg-box ${!isSidebarVisible ? 'full-width' : ''}`}>
                {isSidebarVisible && (
                    <div className="reg-sidebar">
                        <div className="reg-sidebar-content">
                            <h1>Únete a Flooky Pets</h1>
                            <p>Regístrate para acceder a todos los beneficios de nuestra comunidad de mascotas.</p>
                            <ul className="reg-benefits-list">
                                <li>✓ Acceso a descuentos exclusivos</li>
                                <li>✓ Historial de compras</li>
                                <li>✓ Programación de citas</li>
                                <li>✓ Seguimiento de mascotas</li>
                            </ul>
                        </div>
                    </div>
                )}
                <div className="reg-content">
                    <h1 className="reg-mobile-title">Registro de Usuario</h1>
                    {renderProgressCircles()}
                    {error && <p className="reg-error-message">{error}</p>}
                    {registroExitoso && (
                        <div className="reg-success-message">
                            <p>✓ Registro exitoso. Redirigiendo...</p>
                        </div>
                    )}

                    {!registroExitoso && (
                        <form onSubmit={handleSubmit} className="reg-register-form">
                            {renderStep()}

                            <div className="reg-form-navigation">
                                {step > 1 && (
                                    <button 
                                        type="button" 
                                        onClick={prevStep}
                                        className="reg-btn-prev"
                                    >
                                        Anterior
                                    </button>
                                )}
                                {step < 3 && (
                                    <button 
                                        type="button" 
                                        onClick={nextStep}
                                        className="reg-btn-next"
                                        disabled={Object.values(fieldErrors).some(error => error)}
                                    >
                                        Siguiente
                                    </button>
                                )}
                                {step === 3 && codigoVerificado && (
                                    <button 
                                        type="submit" 
                                        disabled={isSubmitting || !termsAccepted}
                                        className="reg-btn-submit"
                                    >
                                        {isSubmitting ? 'Registrando...' : 'Finalizar Registro'}
                                    </button>
                                )}
                            </div>
                        </form>
                    )}

                    <div className="reg-login-links">
                        <Link to="/login" className="reg-link">¿Ya tienes una cuenta? Inicia sesión</Link>
                    </div>
                </div>
            </div>

            {/* Modal de Términos y Condiciones */}
            {showTermsModal && (
                <div className="reg-modal-overlay">
                    <div className="reg-terms-modal">
                        <div className="reg-modal-header">
                            <h2>Términos y Condiciones</h2>
                            <button className="reg-close-modal" onClick={toggleTermsModal}>&times;</button>
                        </div>
                        <div className="reg-modal-content">
                            <h3>1. Aceptación de los Términos</h3>
                            <p>Al registrarte en Flooky Pets, aceptas cumplir con estos términos y condiciones, así como con nuestra política de privacidad.</p>

                            <h3>2. Uso de la Plataforma</h3>
                            <p>La plataforma está destinada exclusivamente para el uso personal y no comercial relacionado con el cuidado de mascotas.</p>

                            <h3>3. Responsabilidades del Usuario</h3>
                            <p>Eres responsable de mantener la confidencialidad de tu cuenta y contraseña, así como de todas las actividades que ocurran bajo tu cuenta.</p>

                            <h3>4. Privacidad y Protección de Datos</h3>
                            <p>Tus datos personales serán tratados de acuerdo con nuestra Política de Privacidad y la legislación aplicable.</p>

                            <h3>5. Contenido Generado por Usuarios</h3>
                            <p>Eres responsable de cualquier contenido que publiques en la plataforma, incluyendo fotos, comentarios y reseñas.</p>

                            <h3>6. Limitación de Responsabilidad</h3>
                            <p>Flooky Pets no se hace responsable por daños directos o indirectos resultantes del uso de la plataforma.</p>

                            <h3>7. Modificaciones</h3>
                            <p>Nos reservamos el derecho de modificar estos términos en cualquier momento. Las modificaciones entrarán en vigor inmediatamente después de su publicación.</p>
                        </div>
                        <div className="reg-modal-actions">
                            <button className="reg-btn-cancel" onClick={toggleTermsModal}>Cancelar</button>
                            <button className="reg-btn-accept" onClick={acceptTerms}>Aceptar Términos</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Registro;