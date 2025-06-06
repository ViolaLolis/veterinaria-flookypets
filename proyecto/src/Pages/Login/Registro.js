import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import '../Styles/Registro.css';
import { send } from '@emailjs/browser';

const serviceId = 'Flooky Pets';
const templateId = 'template_z3izl33';
const publicKey = 'Glz70TavlG0ANcvrb';

// Lista de prefijos telefónicos internacionales
const countryCodes = [
  { code: '+57', name: 'Colombia (+57)' },
  { code: '+1', name: 'Estados Unidos/Canadá (+1)' },
  { code: '+52', name: 'México (+52)' },
  { code: '+34', name: 'España (+34)' },
  { code: '+54', name: 'Argentina (+54)' },
  { code: '+55', name: 'Brasil (+55)' },
  { code: '+56', name: 'Chile (+56)' },
  { code: '+51', name: 'Perú (+51)' },
  { code: '+58', name: 'Venezuela (+58)' },
  { code: '+593', name: 'Ecuador (+593)' },
  { code: '+503', name: 'El Salvador (+503)' },
  { code: '+502', name: 'Guatemala (+502)' },
  { code: '+504', name: 'Honduras (+504)' },
  { code: '+505', name: 'Nicaragua (+505)' },
  { code: '+507', name: 'Panamá (+507)' },
  { code: '+506', name: 'Costa Rica (+506)' },
  { code: '+44', name: 'Reino Unido (+44)' },
  { code: '+33', name: 'Francia (+33)' },
  { code: '+49', name: 'Alemania (+49)' },
  { code: '+39', name: 'Italia (+39)' },
  { code: '+7', name: 'Rusia (+7)' },
  { code: '+81', name: 'Japón (+81)' },
  { code: '+86', name: 'China (+86)' },
  { code: '+91', name: 'India (+91)' },
  { code: '+61', name: 'Australia (+61)' },
  { code: '+64', name: 'Nueva Zelanda (+64)' },
  { code: '+27', name: 'Sudáfrica (+27)' },
  { code: '+20', name: 'Egipto (+20)' },
  { code: '+971', name: 'Emiratos Árabes (+971)' },
  { code: '+966', name: 'Arabia Saudita (+966)' }
];

// Prefijos de área para Colombia
const areaCodesColombia = [
  { code: '1', name: 'Bogotá (1)' },
  { code: '2', name: 'Cali (2)' },
  { code: '4', name: 'Medellín (4)' },
  { code: '5', name: 'Barranquilla (5)' },
  { code: '6', name: 'Pereira (6)' },
  { code: '7', name: 'Bucaramanga (7)' },
  { code: '8', name: 'Cúcuta (8)' },
  { code: '9', name: 'Manizales (9)' }
];

// Tipos de vía para dirección
const viaTypes = [
  { value: 'CL', label: 'Calle' },
  { value: 'CR', label: 'Carrera' },
  { value: 'AV', label: 'Avenida' },
  { value: 'DG', label: 'Diagonal' },
  { value: 'TV', label: 'Transversal' },
  { value: 'AC', label: 'Avenida Calle' },
  { value: 'AK', label: 'Avenida Carrera' },
  { value: 'CQ', label: 'Circunvalar' },
  { value: 'CV', label: 'Circular' },
  { value: 'CC', label: 'Centro Comercial' },
  { value: 'ED', label: 'Edificio' },
  { value: 'LT', label: 'Lote' },
  { value: 'MZ', label: 'Manzana' },
  { value: 'UR', label: 'Urbanización' }
];

// Cuadrantes
const cuadrantes = [
  { value: '', label: 'Ninguno' },
  { value: 'NORTE', label: 'Norte' },
  { value: 'SUR', label: 'Sur' },
  { value: 'ESTE', label: 'Este' },
  { value: 'OESTE', label: 'Oeste' },
  { value: 'NORESTE', label: 'Noreste' },
  { value: 'NOROESTE', label: 'Noroeste' },
  { value: 'SURESTE', label: 'Sureste' },
  { value: 'SUROESTE', label: 'Suroeste' }
];

function Registro() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        countryCode: '+57',
        telefono: '',
        areaCode: '1',
        telefonoFijo: '',
        // Campos de dirección estructurada
        tipoVia: 'CL',
        numeroVia: '',
        cuadrante: '',
        numeroViaGeneradora: '',
        placa: '',
        tipoComplemento: 'AP',
        numeroComplemento: '',
        codigoPostal: '',
        ciudad: 'Bogotá',
        barrio: '',
        // Fin campos dirección
        tipoDocumento: '',
        numeroDocumento: '',
        fechaNacimiento: '',
        correo: '',
        contrasena: '',
        verificarContrasena: '',
        codigoIngresado: '',
        aceptaTerminos: false
    });
    const [fieldErrors, setFieldErrors] = useState({
        nombre: '',
        apellido: '',
        telefono: '',
        telefonoFijo: '',
        // Errores de dirección
        numeroVia: '',
        placa: '',
        numeroComplemento: '',
        codigoPostal: '',
        barrio: '',
        // Fin errores dirección
        tipoDocumento: '',
        numeroDocumento: '',
        fechaNacimiento: '',
        correo: '',
        contrasena: '',
        verificarContrasena: '',
        codigoIngresado: '',
        aceptaTerminos: ''
    });
    const [codigoGenerado, setCodigoGenerado] = useState('');
    const [tiempoRestante, setTiempoRestante] = useState(60);
    const [codigoEnviado, setCodigoEnviado] = useState(false);
    const [codigoVerificado, setCodigoVerificado] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [registroExitoso, setRegistroExitoso] = useState(false);
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
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
                if (value && !/^\d{7}$/.test(value)) {
                    error = 'Debe tener 7 dígitos';
                }
                break;
                
            // Validaciones para campos de dirección
            case 'numeroVia':
                if (!value.trim()) {
                    error = 'Número de vía es obligatorio';
                } else if (!/^[0-9A-Za-z\s\-]+$/.test(value)) {
                    error = 'Solo números, letras, espacios y guiones';
                } else if (value.length > 20) {
                    error = 'Máximo 20 caracteres';
                }
                break;
                
            case 'placa':
                if (!value.trim()) {
                    error = 'Número de placa es obligatorio';
                } else if (!/^\d+[A-Za-z]?$/.test(value)) {
                    error = 'Formato inválido (ej: 123A)';
                } else if (value.length > 10) {
                    error = 'Máximo 10 caracteres';
                }
                break;
                
            case 'numeroComplemento':
                if (value && !/^[0-9A-Za-z\s\-]+$/.test(value)) {
                    error = 'Solo números, letras, espacios y guiones';
                } else if (value && value.length > 10) {
                    error = 'Máximo 10 caracteres';
                }
                break;
                
            case 'codigoPostal':
                if (value && !/^\d{6}$/.test(value)) {
                    error = 'Debe tener 6 dígitos';
                }
                break;
                
            case 'barrio':
                if (!value.trim()) {
                    error = 'Barrio es obligatorio';
                } else if (!/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s\-]+$/.test(value)) {
                    error = 'Solo letras, espacios y guiones';
                } else if (value.length > 50) {
                    error = 'Máximo 50 caracteres';
                }
                break;
            // Fin validaciones dirección
                
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
                
            case 'aceptaTerminos':
                if (!value) {
                    error = 'Debes aceptar los términos y condiciones';
                }
                break;
                
            default:
                break;
        }
        
        return error;
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const inputValue = type === 'checkbox' ? checked : value;
        const error = validateField(name, inputValue);
        
        setFieldErrors(prevErrors => ({
            ...prevErrors,
            [name]: error
        }));
        
        setFormData(prevData => ({
            ...prevData,
            [name]: inputValue
        }));
    };

    const handleSelectChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const validateCurrentStep = () => {
        let isValid = true;
        const newErrors = {...fieldErrors};
        
        if (step === 1) {
            const fieldsToValidate = [
                'nombre', 'apellido', 'telefono', 
                'tipoDocumento', 'numeroDocumento', 'fechaNacimiento',
                'numeroVia', 'placa', 'barrio' // Campos obligatorios de dirección
            ];
            fieldsToValidate.forEach(field => {
                const error = validateField(field, formData[field]);
                newErrors[field] = error;
                if (error) isValid = false;
            });
        } else if (step === 2) {
            const fieldsToValidate = ['correo', 'contrasena', 'verificarContrasena', 'aceptaTerminos'];
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
            setError('Código verificado correctamente.');
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
      
        // Construir la dirección completa para enviar a la base de datos
        const direccionCompleta = `${formData.tipoVia} ${formData.numeroVia} ${formData.cuadrante ? formData.cuadrante + ' ' : ''}` +
                                 `# ${formData.numeroViaGeneradora} - ${formData.placa}` +
                                 `${formData.numeroComplemento ? ', ' + formData.tipoComplemento + ' ' + formData.numeroComplemento : ''}` +
                                 `, ${formData.barrio}, ${formData.ciudad}` +
                                 `${formData.codigoPostal ? ', Código Postal: ' + formData.codigoPostal : ''}`;
      
        const userData = {
          nombre: formData.nombre,
          apellido: formData.apellido,
          email: formData.correo,
          password: formData.contrasena,
          telefono: `${formData.countryCode}${formData.telefono}`,
          telefonoFijo: formData.telefonoFijo ? `${formData.areaCode}${formData.telefonoFijo}` : null,
          direccion: direccionCompleta,
          tipoDocumento: formData.tipoDocumento,
          numeroDocumento: formData.numeroDocumento,
          fechaNacimiento: formData.fechaNacimiento,
          aceptaTerminos: formData.aceptaTerminos
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

    useEffect(() => {
        if (registroExitoso) {
            const timer = setTimeout(() => {
                navigate('/login');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [registroExitoso, navigate]);

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="step-container two-columns">
                        <h2>Información Básica</h2>
                        <div className="form-columns">
                            <div className="form-column">
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
                                <div className="input-group phone-input">
                                    <label>Teléfono Móvil:</label>
                                    <div className="phone-input-container">
                                        <select
                                            name="countryCode"
                                            value={formData.countryCode}
                                            onChange={handleSelectChange}
                                            className="country-code-select"
                                        >
                                            {countryCodes.map((country) => (
                                                <option key={country.code} value={country.code}>
                                                    {country.name}
                                                </option>
                                            ))}
                                        </select>
                                        <input 
                                            type="tel" 
                                            name="telefono" 
                                            value={formData.telefono} 
                                            onChange={handleInputChange} 
                                            maxLength="10"
                                            className={`phone-number-input ${fieldErrors.telefono ? 'input-error' : ''}`}
                                            required 
                                            placeholder="Número móvil"
                                        />
                                    </div>
                                    {fieldErrors.telefono && <span className="error-text">{fieldErrors.telefono}</span>}
                                </div>
                                <div className="input-group phone-input">
                                    <label>Teléfono Fijo (Opcional):</label>
                                    <div className="phone-input-container">
                                        <select
                                            name="areaCode"
                                            value={formData.areaCode}
                                            onChange={handleSelectChange}
                                            className="area-code-select"
                                        >
                                            {areaCodesColombia.map((area) => (
                                                <option key={area.code} value={area.code}>
                                                    {area.name}
                                                </option>
                                            ))}
                                        </select>
                                        <input 
                                            type="tel" 
                                            name="telefonoFijo" 
                                            value={formData.telefonoFijo} 
                                            onChange={handleInputChange} 
                                            maxLength="7"
                                            className={`phone-number-input ${fieldErrors.telefonoFijo ? 'input-error' : ''}`}
                                            placeholder="Número fijo"
                                        />
                                    </div>
                                    {fieldErrors.telefonoFijo && <span className="error-text">{fieldErrors.telefonoFijo}</span>}
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
                            <div className="form-column">
                                
                                <div className="address-row">
                                    <div className="input-group address-select">
                                        <label>Tipo de vía:</label>
                                        <select
                                            name="tipoVia"
                                            value={formData.tipoVia}
                                            onChange={handleSelectChange}
                                        >
                                            {viaTypes.map((via) => (
                                                <option key={via.value} value={via.value}>
                                                    {via.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="input-group address-input">
                                        <label>Número o nombre de vía:</label>
                                        <input 
                                            type="text" 
                                            name="numeroVia" 
                                            value={formData.numeroVia} 
                                            onChange={handleInputChange} 
                                            maxLength="20"
                                            className={fieldErrors.numeroVia ? 'input-error' : ''}
                                            required 
                                            placeholder="Ej: 12B, 45-23, Caracas"
                                        />
                                        {fieldErrors.numeroVia && <span className="error-text">{fieldErrors.numeroVia}</span>}
                                    </div>
                                </div>
                                
                                <div className="address-row">
                                    <div className="input-group address-select">
                                        <label>Cuadrante (opcional):</label>
                                        <select
                                            name="cuadrante"
                                            value={formData.cuadrante}
                                            onChange={handleSelectChange}
                                        >
                                            {cuadrantes.map((cuadrante) => (
                                                <option key={cuadrante.value} value={cuadrante.value}>
                                                    {cuadrante.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="input-group address-input">
                                        <label>Número vía generadora:</label>
                                        <input 
                                            type="text" 
                                            name="numeroViaGeneradora" 
                                            value={formData.numeroViaGeneradora} 
                                            onChange={handleInputChange} 
                                            maxLength="20"
                                            placeholder="Ej: 45, 23A"
                                        />
                                    </div>
                                </div>
                                
                                <div className="address-row">
                                    <div className="input-group address-input">
                                        <label>Número de placa:</label>
                                        <input 
                                            type="text" 
                                            name="placa" 
                                            value={formData.placa} 
                                            onChange={handleInputChange} 
                                            maxLength="10"
                                            className={fieldErrors.placa ? 'input-error' : ''}
                                            required 
                                            placeholder="Ej: 25A, 10B"
                                        />
                                        {fieldErrors.placa && <span className="error-text">{fieldErrors.placa}</span>}
                                    </div>
                                    <div className="input-group address-select">
                                        <label>Tipo complemento:</label>
                                        <select
                                            name="tipoComplemento"
                                            value={formData.tipoComplemento}
                                            onChange={handleSelectChange}
                                        >
                                            <option value="AP">Apartamento</option>
                                            <option value="CS">Casa</option>
                                            <option value="OF">Oficina</option>
                                            <option value="LT">Local</option>
                                        </select>
                                    </div>
                                    <div className="input-group address-input">
                                        <label>Número complemento (opcional):</label>
                                        <input 
                                            type="text" 
                                            name="numeroComplemento" 
                                            value={formData.numeroComplemento} 
                                            onChange={handleInputChange} 
                                            maxLength="10"
                                            className={fieldErrors.numeroComplemento ? 'input-error' : ''}
                                            placeholder="Ej: 201, 5B"
                                        />
                                        {fieldErrors.numeroComplemento && <span className="error-text">{fieldErrors.numeroComplemento}</span>}
                                    </div>
                                </div>
                                
                                <div className="address-row">
                                    <div className="input-group address-input">
                                        <label>Barrio:</label>
                                        <input 
                                            type="text" 
                                            name="barrio" 
                                            value={formData.barrio} 
                                            onChange={handleInputChange} 
                                            maxLength="50"
                                            className={fieldErrors.barrio ? 'input-error' : ''}
                                            required 
                                            placeholder="Nombre del barrio"
                                        />
                                        {fieldErrors.barrio && <span className="error-text">{fieldErrors.barrio}</span>}
                                    </div>
                                    <div className="input-group address-input">
                                        <label>Ciudad:</label>
                                        <input 
                                            type="text" 
                                            name="ciudad" 
                                            value={formData.ciudad} 
                                            onChange={handleInputChange} 
                                            maxLength="50"
                                            required 
                                        />
                                    </div>
                                </div>
                                
                                <div className="address-row">
                                    <div className="input-group address-input">
                                        <label>Código Postal (opcional):</label>
                                        <input 
                                            type="text" 
                                            name="codigoPostal" 
                                            value={formData.codigoPostal} 
                                            onChange={handleInputChange} 
                                            maxLength="6"
                                            className={fieldErrors.codigoPostal ? 'input-error' : ''}
                                            placeholder="6 dígitos"
                                        />
                                        {fieldErrors.codigoPostal && <span className="error-text">{fieldErrors.codigoPostal}</span>}
                                    </div>
                                </div>
                                
                            </div>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="step-container">
                        <h2>Información de Cuenta</h2>
                        <div className="form-columns">
                            <div className="form-column">
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
                            </div>
                            <div className="form-column">
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
                                <div className="input-group terms-checkbox">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            name="aceptaTerminos"
                                            checked={formData.aceptaTerminos}
                                            onChange={handleInputChange}
                                            className={fieldErrors.aceptaTerminos ? 'input-error' : ''}
                                        />
                                        <span>Acepto los <button type="button" className="terms-link" onClick={() => setShowTermsModal(true)}>Términos y Condiciones</button></span>
                                    </label>
                                    {fieldErrors.aceptaTerminos && <span className="error-text">{fieldErrors.aceptaTerminos}</span>}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="step-container verification-step">
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
                                    className="btn-generate-code"
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
                                <div className="verification-actions">
                                    <button 
                                        type="button" 
                                        onClick={verificarCodigo} 
                                        disabled={codigoVerificado || !!fieldErrors.codigoIngresado}
                                        className={codigoVerificado ? 'btn-verified' : 'btn-verify'}
                                    >
                                        {codigoVerificado ? '✓ Código Verificado' : 'Verificar Código'}
                                    </button>
                                    {tiempoRestante > 0 && !codigoVerificado && (
                                        <p className="timer-text">Tiempo restante: {tiempoRestante}s</p>
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
                                </div>
                                {codigoVerificado && (
                                    <div className="success-message">
                                        <p>✓ Código verificado correctamente</p>
                                        <p>✓ Puedes continuar</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

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

    const renderTermsModal = () => {
        if (!showTermsModal) return null;

        return (
            <div className="modal-overlay">
                <div className="terms-modal">
                    <div className="modal-header">
                        <h2>Términos y Condiciones</h2>
                        <button 
                            type="button" 
                            className="close-modal" 
                            onClick={() => setShowTermsModal(false)}
                        >
                            &times;
                        </button>
                    </div>
                    <div className="modal-content">
                        <h3>1. Aceptación de los Términos</h3>
                        <p>
                            Al registrarte en Flooky Pets, aceptas cumplir con estos términos y condiciones, 
                            nuestra Política de Privacidad y todas las leyes y regulaciones aplicables.
                        </p>

                        <h3>2. Uso del Servicio</h3>
                        <p>
                            Flooky Pets proporciona servicios veterinarios y relacionados con mascotas. 
                            Te comprometes a usar el servicio solo para fines legales y de acuerdo con estos términos.
                        </p>

                        <h3>3. Cuenta de Usuario</h3>
                        <p>
                            Eres responsable de mantener la confidencialidad de tu cuenta y contraseña, 
                            y de restringir el acceso a tu computadora. Aceptas la responsabilidad por 
                            todas las actividades que ocurran bajo tu cuenta.
                        </p>

                        <h3>4. Privacidad</h3>
                        <p>
                            Tu información personal se manejará de acuerdo con nuestra Política de Privacidad. 
                            Al usar nuestro servicio, consientes el procesamiento de tus datos personales.
                        </p>

                        <h3>5. Modificaciones</h3>
                        <p>
                            Nos reservamos el derecho de modificar estos términos en cualquier momento. 
                            Las modificaciones entrarán en vigor inmediatamente después de su publicación en el sitio.
                        </p>

                        <h3>6. Limitación de Responsabilidad</h3>
                        <p>
                            Flooky Pets no será responsable por daños indirectos, incidentales, especiales, 
                            consecuentes o punitivos que resulten del uso o la imposibilidad de usar el servicio.
                        </p>

                        <h3>7. Ley Aplicable</h3>
                        <p>
                            Estos términos se regirán e interpretarán de acuerdo con las leyes de Colombia, 
                            sin tener en cuenta sus disposiciones sobre conflictos de leyes.
                        </p>

                        <div className="modal-actions">
                            <button 
                                type="button" 
                                className="btn-accept-terms"
                                onClick={() => {
                                    setFormData(prev => ({...prev, aceptaTerminos: true}));
                                    setFieldErrors(prev => ({...prev, aceptaTerminos: ''}));
                                    setShowTermsModal(false);
                                }}
                            >
                                Aceptar Términos
                            </button>
                            <button 
                                type="button" 
                                className="btn-close-terms"
                                onClick={() => setShowTermsModal(false)}
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="register-container">
            <div className={`register-box ${!isSidebarVisible ? 'full-width' : ''}`}>
                {isSidebarVisible && (
                    <div className="register-sidebar">
                        <div className="sidebar-content">
                            <h1>Únete a Flooky Pets</h1>
                            <p>Regístrate para acceder a todos los beneficios de nuestra comunidad de mascotas.</p>
                            <ul className="benefits-list">
                                <li>✓ Acceso a descuentos exclusivos</li>
                                <li>✓ Historial de compras</li>
                                <li>✓ Programación de citas</li>
                                <li>✓ Seguimiento de mascotas</li>
                            </ul>
                        </div>
                    </div>
                )}
                <div className="register-content">
                    <h1 className="mobile-title">Registro de Usuario</h1>
                    {renderProgressCircles()}
                    {error && <p className="error-message">{error}</p>}
                    {registroExitoso && (
                        <div className="success-message">
                            <p>✓ Registro exitoso. Redirigiendo...</p>
                        </div>
                    )}

                    {!registroExitoso && (
                        <form onSubmit={handleSubmit} className="register-form">
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
                        <Link to="/login" className="link">¿Ya tienes una cuenta? Inicia sesión</Link>
                    </div>
                </div>
            </div>
            {renderTermsModal()}
        </div>
    );
}

export default Registro;