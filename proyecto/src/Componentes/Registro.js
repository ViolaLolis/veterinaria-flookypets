import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Styles/Registro.css';

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
    codigoVerificacion: '',
    codigoIngresado: '',
  });
  const [codigoGenerado, setCodigoGenerado] = useState('');
  const [tiempoRestante, setTiempoRestante] = useState(60);
  const [codigoEnviado, setCodigoEnviado] = useState(false);
  const [codigoVerificado, setCodigoVerificado] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registroExitoso, setRegistroExitoso] = useState(false);

  useEffect(() => {
    let timer;
    if (codigoEnviado && tiempoRestante > 0 && !codigoVerificado) {
      timer = setInterval(() => {
        setTiempoRestante(prevTime => prevTime - 1);
      }, 1000);
    } else if (tiempoRestante === 0) {
      setCodigoEnviado(false);
    }
    return () => clearInterval(timer);
  }, [codigoEnviado, tiempoRestante, codigoVerificado]);

  const generarCodigo = () => {
    const nuevoCodigo = Math.random().toString(36).substring(2, 8).toUpperCase();
    setCodigoGenerado(nuevoCodigo);
    console.log("Código de verificación generado:", nuevoCodigo);
    setCodigoEnviado(true);
    setTiempoRestante(60);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const validateStep1 = () => {
    setError('');
    const { nombre, apellido, telefono, direccion, tipoDocumento, numeroDocumento, fechaNacimiento } = formData;

    if (!nombre.trim()) {
      setError('Por favor, ingrese su nombre.');
      return false;
    }
    if (!apellido.trim()) {
      setError('Por favor, ingrese su apellido.');
      return false;
    }
    if (!telefono.trim()) {
      setError('Por favor, ingrese su número de teléfono.');
      return false;
    }
    if (!/^\d+$/.test(telefono)) {
      setError('El número de teléfono solo debe contener números.');
      return false;
    }
    if (!direccion.trim()) {
      setError('Por favor, ingrese su dirección.');
      return false;
    }
    if (!tipoDocumento) {
      setError('Por favor, seleccione un tipo de documento.');
      return false;
    }
    if (!numeroDocumento.trim()) {
      setError('Por favor, ingrese su número de documento.');
      return false;
    }
    if (!/^\d+$/.test(numeroDocumento)) {
      setError('El número de documento solo debe contener números.');
      return false;
    }
    if (!fechaNacimiento) {
      setError('Por favor, ingrese su fecha de nacimiento.');
      return false;
    }

    const fechaNac = new Date(fechaNacimiento);
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const m = hoy.getMonth() - fechaNac.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }
    if (edad < 18) {
      setError('Debe tener 18 años o más para registrarse.');
      return false;
    }

    return true;
  };

  const validateStep2 = () => {
    setError('');
    const { correo, contrasena, verificarContrasena } = formData;

    if (!correo.trim()) {
      setError('Por favor, ingrese su correo electrónico.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      setError('Por favor, ingrese un correo electrónico válido (ejemplo: usuario@dominio.com).');
      return false;
    }
    if (!correo.endsWith('.com')) {
      setError('El correo electrónico debe terminar en .com');
      return false;
    }
    if (!contrasena.trim()) {
      setError('Por favor, ingrese su contraseña.');
      return false;
    }
    if (contrasena.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return false;
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(contrasena)) {
      setError('La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial.');
      return false;
    }
    if (!verificarContrasena.trim()) {
      setError('Por favor, verifique su contraseña.');
      return false;
    }
    if (contrasena !== verificarContrasena) {
      setError('Las contraseñas no coinciden.');
      return false;
    }
    return true;
  };

  const nextStep = () => {
    setError('');
    if (step === 1 && validateStep1()) {
      setStep(prevStep => prevStep + 1);
    } else if (step === 2 && validateStep2()) {
      setStep(prevStep => prevStep + 1);
    }
  };

  const prevStep = () => {
    setStep(prevStep => prevStep - 1);
    setError('');
  };

  const verificarCodigo = () => {
    setError('');
    if (!formData.codigoIngresado.trim()) {
      setError('Por favor, ingrese el código de verificación.');
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
    setError('');
    if (!codigoVerificado) {
      setError('Por favor, verifique el código antes de enviar.');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log("Enviando datos del formulario:", formData);
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log("Datos del formulario enviados con éxito:", formData);
      setRegistroExitoso(true);
    } catch (error) {
      console.error("Error al enviar el formulario:", error);
      setError('Hubo un error al procesar el registro. Por favor, inténtelo de nuevo más tarde.');
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

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <h2>Información Básica</h2>
            <div className="input-group">
              <label>Nombre:</label>
              <input type="text" name="nombre" placeholder="Nombre" value={formData.nombre} onChange={handleInputChange} required />
            </div>
            <div className="input-group">
              <label>Apellido:</label>
              <input type="text" name="apellido" placeholder="Apellido" value={formData.apellido} onChange={handleInputChange} required />
            </div>
            <div className="input-group">
              <label>Teléfono:</label>
              <input type="tel" name="telefono" placeholder="Teléfono" value={formData.telefono} onChange={handleInputChange} required />
            </div>
            <div className="input-group">
              <label>Teléfono Fijo (Opcional):</label>
              <input type="tel" name="telefonoFijo" placeholder="Teléfono Fijo (Opcional)" value={formData.telefonoFijo} onChange={handleInputChange} />
            </div>
            <div className="input-group">
              <label>Dirección:</label>
              <input type="text" name="direccion" placeholder="Dirección" value={formData.direccion} onChange={handleInputChange} required />
            </div>
            <div className="input-group">
              <label>Tipo de Documento:</label>
              <select name="tipoDocumento" value={formData.tipoDocumento} onChange={handleInputChange} required>
                <option value="">Tipo de Documento</option>
                <option value="CC">Cédula de Ciudadanía</option>
                <option value="Pasaporte">Pasaporte</option>
              </select>
            </div>
            <div className="input-group">
              <label>Número de Documento:</label>
              <input type="text" name="numeroDocumento" placeholder="Número de Documento" value={formData.numeroDocumento} onChange={handleInputChange} required />
            </div>
            <div className="input-group">
              <label>Fecha de Nacimiento:</label>
              <input type="date" name="fechaNacimiento" placeholder="Fecha de Nacimiento" value={formData.fechaNacimiento} onChange={handleInputChange} required />
            </div>
          </div>
        );
      case 2:
        return (
          <div>
            <h2>Información de Cuenta</h2>
            <div className="input-group">
              <label>Correo Electrónico:</label>
              <input type="email" name="correo" placeholder="Correo Electrónico" value={formData.correo} onChange={handleInputChange} required />
            </div>
            <div className="input-group">
              <label>Contraseña:</label>
              <input type="password" name="contrasena" placeholder="Contraseña" value={formData.contrasena} onChange={handleInputChange} required />
            </div>
            <div className="input-group">
              <label>Verificar Contraseña:</label>
              <input type="password" name="verificarContrasena" placeholder="Verificar Contraseña" value={formData.verificarContrasena} onChange={handleInputChange} required />
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <h2>Verificación de Código</h2>
            {!codigoEnviado && (
              <button type="button" onClick={generarCodigo} className="btn-generar-codigo">Generar Código de Verificación</button>
            )}
            {codigoEnviado && (
              <div id="verification-section">
                <p>Se ha enviado un código de verificación a tu correo electrónico.</p>
                <p>Código: <strong>{codigoGenerado}</strong> (Este es solo un ejemplo, en producción se enviaría por email)</p>
                <div className="input-group">
                  <label>Ingresa el código de verificación:</label>
                  <input
                    type="text"
                    name="codigoIngresado"
                    placeholder="Ingresa el código de verificación"
                    value={formData.codigoIngresado}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <button type="button" onClick={verificarCodigo} disabled={codigoVerificado}>
                  {codigoVerificado ? 'Código Verificado' : 'Verificar Código'}
                </button>
                {tiempoRestante > 0 && !codigoVerificado && (
                  <p className="timer-text">Tiempo restante para un nuevo código: {tiempoRestante} segundos</p>
                )}
                {tiempoRestante === 0 && (
                  <button type="button" onClick={generarCodigo}>Reenviar Código</button>
                )}
                {codigoVerificado && <p className="success-message">Código verificado. Puedes continuar.</p>}
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
          <span
            key={circle}
            className={`progress-circle ${step === circle ? 'active' : ''}`}
          ></span>
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
        {registroExitoso && <p className="success-message">Registro exitoso. Redirigiendo...</p>}

        {!registroExitoso && (
          <form onSubmit={handleSubmit} className="registro-form">
            {renderStep()}

            <div className="form-navigation">
              {step > 1 && (
                <button type="button" onClick={prevStep}>Anterior</button>
              )}
              {step < 3 && (
                <button type="button" onClick={nextStep}>Siguiente</button>
              )}
              {step === 3 && codigoVerificado && (
                <button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Registrando...' : 'Registrar'}
                </button>
              )}
            </div>
          </form>
        )}

        {registroExitoso && (
          <p className="volver-inicio"></p>
        )}

        {!registroExitoso && (
          <p className="volver-inicio" onClick={() => navigate('/login')}>
          </p>
        )}
      </div>
    </div>
  );
}

export default Registro;