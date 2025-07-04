import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import "../Styles/Login.css";

function Login({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    form: ''
  });
  const [touched, setTouched] = useState({
    email: false,
    password: false
  });
  const [attempts, setAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTime, setBlockTime] = useState(30);
  const navigate = useNavigate();
  const location = useLocation();

  // Validación en tiempo real
  useEffect(() => {
    const newErrors = {
      email: '',
      password: ''
    };

    if (touched.email) {
      if (!email) {
        newErrors.email = 'Debe ingresar un correo electrónico';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        newErrors.email = 'Ingrese un correo válido';
      }
    }

    setErrors(prev => ({ ...prev, ...newErrors }));
  }, [email, password, touched]);

  // Efecto para el temporizador de bloqueo
  useEffect(() => {
    let timer;
    if (isBlocked && blockTime > 0) {
      timer = setTimeout(() => {
        setBlockTime(prev => prev - 1);
      }, 1000);
    } else if (isBlocked && blockTime === 0) {
      setIsBlocked(false);
      setAttempts(0);
      setBlockTime(30);
    }
    
    return () => clearTimeout(timer);
  }, [isBlocked, blockTime]);

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    // Si la cuenta está bloqueada, no hacer nada
    if (isBlocked) {
      setErrors(prev => ({
        ...prev,
        form: `Cuenta bloqueada temporalmente. Intente nuevamente en ${blockTime} segundos.`
      }));
      return;
    }

    setTouched({
      email: true,
      password: true
    });

    const hasErrors = Object.entries(errors)
      .filter(([key]) => key !== 'form')
      .some(([, error]) => error !== '');

    if (!email || !password || hasErrors) {
      setErrors(prev => ({
        ...prev,
        form: '⚠ Correo o contraseña son incorrectas ⚠'
      }));
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        // Incrementar intentos fallidos
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);

        // Bloquear después de 3 intentos fallidos
        if (newAttempts >= 3) {
          setIsBlocked(true);
          setErrors(prev => ({
            ...prev,
            form: `⚠ Demasiados intentos fallidos. Cuenta bloqueada por 30 segundos. ⚠`
          }));
        } else {
          setErrors(prev => ({
            ...prev,
            form: data.message || `⚠ Credenciales incorrectas. Intentos restantes: ${3 - newAttempts} ⚠`
          }));
        }
        return;
      }

      // Login exitoso - resetear contador de intentos
      setAttempts(0);
      setIsBlocked(false);
      setBlockTime(30);

      setUser(data);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));

      // Limpiar banderas de sesión inválida
      sessionStorage.removeItem('sessionInvalidated');
      sessionStorage.removeItem('logoutReason');

      // Redirigir según el rol del usuario
      if (data.role === 'admin') {
        navigate('/admin');
      } else if (data.role === 'veterinario') {
        navigate('/veterinario');
      } else {
        navigate('/usuario');
      }

    } catch (error) {
      console.error('Error al conectar con el servidor:', error);
      setErrors(prev => ({
        ...prev,
        form: '⚠ Error al conectar con el servidor ⚠'
      }));
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-box">
          <div className="brand-section">
            <img
              src={require('../Inicio/Imagenes/flooty.png')}
              alt="Logo de la empresa"
              className="auth-logo"
            />
            <h2>Bienvenido</h2>
            <p>Ingresa tus credenciales para acceder a nuestra veterinaria</p>
          </div>

          <div className="auth-form">
            <h2>Iniciar Sesión</h2>
            
            {/* Mostrar mensaje de razón de logout si existe */}
            {location.state?.reason && (
              <div className="info-message">
                {location.state.reason === 'inactividad' 
                  ? 'Su sesión expiró por inactividad' 
                  : 'Debe iniciar sesión nuevamente'}
              </div>
            )}
            
            {errors.form && (
              <p className={`error-message ${isBlocked ? 'blocked-message' : ''}`}>
                {errors.form}
                {isBlocked && (
                  <span className="blocked-timer"> ({blockTime}s)</span>
                )}
              </p>
            )}

            <form onSubmit={handleLogin}>
              <div className="form-field">
                <label>Correo Electrónico:</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value.slice(0, 63));
                    setErrors(prev => ({ ...prev, form: '' }));
                  }}
                  onBlur={() => handleBlur('email')}
                  className={errors.email ? 'input-error' : ''}
                  disabled={isBlocked}
                />
                {errors.email && <span className="field-error">⚠ {errors.email} ⚠</span>}
              </div>

              <div className="form-field password-field">
                <label>Contraseña:</label>
                <div className="password-input-container">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value.slice(0, 63));
                      setErrors(prev => ({ ...prev, form: '' }));
                    }}
                    onBlur={() => handleBlur('password')}
                    className={errors.password ? 'input-error' : ''}
                    disabled={isBlocked}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={toggleShowPassword}
                    disabled={isBlocked}
                  >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                  </button>
                </div>
                {errors.password && <span className="field-error">⚠ {errors.password} ⚠</span>}
              </div>

              <button
                type="submit"
                className={`btn-auth ${isBlocked ? 'btn-disabled' : ''}`}
                disabled={!!errors.email || !!errors.password || isBlocked}
              >
                {isBlocked ? `Espere ${blockTime}s` : 'Iniciar Sesión'}
              </button>
            </form>

            <div className="auth-links">
              <Link to="/olvide-contraseña" className="link">Olvidé mi contraseña</Link>
              <Link to="/register" className="link">Registrarme</Link>
            </div>
          </div>
        </div>

        <div className="auth-footer">
          <button className="btn-return" onClick={() => navigate('/')}>Volver al inicio</button>
        </div>
      </div>
    </div>
  );
}

export default Login;
