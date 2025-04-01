import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import "../Styles/Login.css";

function Login({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  const users = [
    { email: 'admin@example.com', password: '1234', role: 'admin', name: 'Administrador' },
    { email: 'vet@example.com', password: '5678', role: 'veterinario', name: 'Dr. Veterinario' },
    { email: 'user@example.com', password: 'abcd', role: 'usuario', name: 'Juan Pérez' }
  ];

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

  const handleLogin = (e) => {
    e.preventDefault();

    // Validar todos los campos al enviar
    setTouched({
      email: true,
      password: true
    });

    // Verificar si hay errores
    const hasErrors = Object.values(errors).some(error => error !== '');
    if (!email || !password || hasErrors) {
      setErrors(prev => ({
        ...prev,
        form: '⚠Correo o contraseña son incorrectas⚠'
      }));
      return;
    }

    const foundUser = users.find(user => user.email === email && user.password === password);
    
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('user', JSON.stringify(foundUser));
      
      if (foundUser.role === 'admin') {
        navigate('/admin');
      } else if (foundUser.role === 'veterinario') {
        navigate('/veterinario');
      } else {
        navigate('/usuario');
      }
    } else {
      setErrors(prev => ({
        ...prev,
        form: '⚠Correo electrónico o contraseña incorrectos⚠'
      }));
    }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <div className="login-box">
          
          <div className="logo-section">
            <img 
              src={require ('../Imagenes/flooty.png')}  
              alt="Logo de la empresa" 
              className="login-logo"
            />
            <h2>Bienvenido</h2>
            <p>Ingresa tus credenciales para acceder a nuestra veterinaria</p>
          </div>
          
          <div className="form-section">
            <h2>Iniciar Sesión</h2>
            {errors.form && <p className="error-message">⚠ {errors.form} ⚠</p>}

            <form onSubmit={handleLogin}>
              <div className="input-group">
                <label>Correo Electrónico:</label>
                <input 
                  type="email" 
                  placeholder="Ingrese su correo electrónico" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value.slice(0, 63))}
                  onBlur={() => handleBlur('email')}
                  className={errors.email ? 'input-error' : ''}
                />
                {errors.email && <span className="field-error">⚠ {errors.email} ⚠</span>}
              </div>

              <div className="input-group">
                <label>Contraseña:</label>
                <input 
                  type="password" 
                  placeholder="Ingrese su contraseña" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value.slice(0, 63))}
                  onBlur={() => handleBlur('password')}
                  className={errors.password ? 'input-error' : ''}
                />
                {errors.password && <span className="field-error">⚠ {errors.password} ⚠</span>}
              </div>

              <button 
                type="submit" 
                className="btn-login"
                disabled={!!errors.email || !!errors.password}
              >
                Iniciar Sesión
              </button>
            </form>

            <div className="login-links">
              <Link to="/olvide-contraseña" className="link">Olvidé mi contraseña</Link>
              <Link to="/register" className="link">Registrarme</Link>
            </div>
          </div>
        </div>

        <div className="login-footer">
          <button className="btn-back" onClick={() => navigate('/')}>Volver al inicio</button>
        </div>
      </div>
    </div>
  );
}

export default Login;