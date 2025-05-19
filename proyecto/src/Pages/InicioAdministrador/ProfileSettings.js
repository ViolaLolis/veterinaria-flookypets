import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Styles/InicioAdministrador.css';

const ProfileSettings = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccion: '',
    tipo_documento: 'CC',
    numero_documento: '',
    fecha_nacimiento: ''
  });

  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (user) {
      setProfile({
        nombre: user.nombre || '',
        apellido: user.apellido || '',
        email: user.email || '',
        telefono: user.telefono || '',
        direccion: user.direccion || '',
        tipo_documento: user.tipo_documento || 'CC',
        numero_documento: user.numero_documento || '',
        fecha_nacimiento: user.fecha_nacimiento || ''
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPassword(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    // Aquí iría la llamada a la API para actualizar el perfil
    try {
      // Simular éxito
      alert('Perfil actualizado correctamente');
      setUser({ ...user, ...profile });
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      alert('Error al actualizar perfil');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (password.new !== password.confirm) {
      alert('Las contraseñas no coinciden');
      return;
    }
    
    // Aquí iría la llamada a la API para cambiar la contraseña
    try {
      // Simular éxito
      alert('Contraseña cambiada correctamente');
      setPassword({ current: '', new: '', confirm: '' });
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      alert('Error al cambiar contraseña');
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.')) {
      // Aquí iría la llamada a la API para eliminar la cuenta
      alert('Cuenta eliminada (simulado)');
      localStorage.removeItem('user');
      setUser(null);
      navigate('/login');
    }
  };

  return (
    <div className="profile-settings-container">
      <h1>Configuración de Cuenta</h1>
      
      <div className="settings-tabs">
        <button 
          className={activeTab === 'profile' ? 'active' : ''}
          onClick={() => setActiveTab('profile')}
        >
          Perfil
        </button>
        <button 
          className={activeTab === 'password' ? 'active' : ''}
          onClick={() => setActiveTab('password')}
        >
          Contraseña
        </button>
        <button 
          className={activeTab === 'danger' ? 'active' : ''}
          onClick={() => setActiveTab('danger')}
        >
          Zona de Peligro
        </button>
      </div>
      
      {activeTab === 'profile' && (
        <form onSubmit={handleProfileSubmit} className="profile-form">
          <div className="form-row">
            <div className="form-group">
              <label>Nombre:</label>
              <input 
                type="text" 
                name="nombre" 
                value={profile.nombre}
                onChange={handleProfileChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Apellido:</label>
              <input 
                type="text" 
                name="apellido" 
                value={profile.apellido}
                onChange={handleProfileChange}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Email:</label>
            <input 
              type="email" 
              name="email" 
              value={profile.email}
              onChange={handleProfileChange}
              required
              disabled
            />
          </div>
          
          <div className="form-group">
            <label>Teléfono:</label>
            <input 
              type="text" 
              name="telefono" 
              value={profile.telefono}
              onChange={handleProfileChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Dirección:</label>
            <input 
              type="text" 
              name="direccion" 
              value={profile.direccion}
              onChange={handleProfileChange}
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Tipo de Documento:</label>
              <select 
                name="tipo_documento" 
                value={profile.tipo_documento}
                onChange={handleProfileChange}
              >
                <option value="CC">Cédula</option>
                <option value="TI">Tarjeta de Identidad</option>
                <option value="CE">Cédula de Extranjería</option>
                <option value="PA">Pasaporte</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Número de Documento:</label>
              <input 
                type="text" 
                name="numero_documento" 
                value={profile.numero_documento}
                onChange={handleProfileChange}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Fecha de Nacimiento:</label>
            <input 
              type="date" 
              name="fecha_nacimiento" 
              value={profile.fecha_nacimiento}
              onChange={handleProfileChange}
            />
          </div>
          
          <div className="form-actions">
            <button type="submit" className="btn-primary">
              Guardar Cambios
            </button>
          </div>
        </form>
      )}
      
      {activeTab === 'password' && (
        <form onSubmit={handlePasswordSubmit} className="password-form">
          <div className="form-group">
            <label>Contraseña Actual:</label>
            <input 
              type="password" 
              name="current" 
              value={password.current}
              onChange={handlePasswordChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Nueva Contraseña:</label>
            <input 
              type="password" 
              name="new" 
              value={password.new}
              onChange={handlePasswordChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Confirmar Nueva Contraseña:</label>
            <input 
              type="password" 
              name="confirm" 
              value={password.confirm}
              onChange={handlePasswordChange}
              required
            />
          </div>
          
          <div className="form-actions">
            <button type="submit" className="btn-primary">
              Cambiar Contraseña
            </button>
          </div>
        </form>
      )}
      
      {activeTab === 'danger' && (
        <div className="danger-zone">
          <h2>Zona de Peligro</h2>
          <p>Estas acciones son irreversibles. Por favor, procede con precaución.</p>
          
          <div className="danger-action">
            <h3>Eliminar Cuenta</h3>
            <p>Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor, asegúrate.</p>
            <button 
              onClick={handleDeleteAccount}
              className="btn-danger"
            >
              Eliminar Mi Cuenta
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSettings;