import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import "../Styles/Login.css";

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const users = [
    { email: 'admin@example.com', password: '1234', role: 'admin' },
    { email: 'vet@example.com', password: '5678', role: 'veterinario' },
    { email: 'user@example.com', password: 'abcd', role: 'usuario' }
  ];

  const validateInputs = () => {
    if (!email) return '⚠ Debe ingresar un correo electrónico';
    if (!password) return '⚠ Debe ingresar una contraseña';
    return '';
  };

  const handleLogin = (e) => {
    e.preventDefault();

    const validationError = validateInputs();
    if (validationError) {
      setError(validationError);
      return;
    }

    const foundUser = users.find(user => user.email === email && user.password === password);
    
    if (foundUser) {
      navigate(`/${foundUser.role}`);
    } else {
      setError('⚠ Correo electrónico o contraseña incorrectos');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Iniciar Sesión</h2>
        {error && <p className="error-message">⚠ {error} ⚠</p>}

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Correo Electrónico:</label>
            <input 
              type="email" 
              placeholder="Ingrese su correo electrónico" 
              value={email} 
              onChange={(e) => setEmail(e.target.value.slice(0, 63))}
            />
          </div>

          <div className="input-group">
            <label>Contraseña:</label>
            <input 
              type="password" 
              placeholder="Ingrese su contraseña" 
              value={password} 
              onChange={(e) => setPassword(e.target.value.slice(0, 63))}
            />
          </div>

          <button type="submit" className="btn-login">Iniciar Sesión</button>
        </form>

        <div className="login-links">
          <Link to="/olvide-contraseña" className="link">Olvidé mi contraseña</Link>
          <Link to="/register" className="link">Registrarme</Link>
        </div>

        <div className="user-info-box">
          <h3>Usuarios de prueba</h3>
          <p><strong>Admin:</strong> admin@example.com | 1234</p>
          <p><strong>Veterinario:</strong> vet@example.com | 5678</p>
          <p><strong>Usuario:</strong> user@example.com | abcd</p>
        </div>
      </div>

      {/* Nuevo footer con botón para volver al main */}
      <div className="login-footer">
        <button className="btn-back" onClick={() => navigate('/')}>🔙 Volver al inicio</button>
      </div>
    </div>
  );
}

export default Login;
