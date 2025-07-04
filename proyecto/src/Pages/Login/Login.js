import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  const navigate = useNavigate();

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

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

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
        setErrors(prev => ({
          ...prev,
          form: data.message || '⚠ Error al iniciar sesión ⚠'
        }));
        return;
      }

      // Login exitoso
      setUser(data);
      // >>>>>>>>>> LÍNEA CRUCIAL AÑADIDA <<<<<<<<<<
      localStorage.setItem('token', data.token); // <-- ¡Guardando el token!
      localStorage.setItem('user', JSON.stringify(data));


      // Redirige según el rol del usuario
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
            {errors.form && <p className="error-message">⚠ {errors.form} ⚠</p>}

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
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={toggleShowPassword}
                  >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                  </button>
                </div>
                {errors.password && <span className="field-error">⚠ {errors.password} ⚠</span>}
              </div>

              <button
                type="submit"
                className="btn-auth"
                disabled={!!errors.email || !!errors.password}
              >
                Iniciar Sesión
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