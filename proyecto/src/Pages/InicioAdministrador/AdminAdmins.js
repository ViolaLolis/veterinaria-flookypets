import React, { useState, useEffect } from 'react';
import { FaUserShield, FaPlus, FaSearch, FaTimes, FaSave, FaSpinner } from 'react-icons/fa';
import './Styles/AdminStyles.css';

const AdminAdmins = ({ user }) => {
  const [admins, setAdmins] = useState([]);
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccion: '',
    password: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  // Función para obtener token de autenticación
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Función mejorada para hacer fetch con autenticación
  const authFetch = async (url, options = {}) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No se encontró token de autenticación');
    }

    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    };

    if (options.body) {
      config.body = JSON.stringify(options.body);
    }

    const response = await fetch(`http://localhost:5000/api/admin${url}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || `Error ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    return response.json();
  };

  // Cargar administradores
  const fetchAdmins = async () => {
    setIsLoading(true);
    setError('');
    try {
      const { data } = await authFetch('/administrators');
      
      const formattedAdmins = data.map(admin => ({
        id: admin.id,
        nombre: admin.nombre,
        apellido: admin.apellido,
        email: admin.email,
        telefono: admin.telefono,
        direccion: admin.direccion,
        active: admin.active,
        created_at: admin.created_at,
        name: `${admin.nombre} ${admin.apellido || ''}`.trim(),
        role: 'Administrador'
      }));

      setAdmins(formattedAdmins);
      setFilteredAdmins(formattedAdmins);
    } catch (err) {
      setError(`Error al cargar administradores: ${err.message}`);
      console.error('Error fetching admins:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  useEffect(() => {
    const results = admins.filter(admin =>
      admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAdmins(results);
  }, [searchTerm, admins]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleDelete = async (id) => {
    if (id === user.id) {
      showNotification('No puedes eliminar tu propio usuario', 'error');
      return;
    }
    
    if (!window.confirm('¿Estás seguro de eliminar este administrador?')) {
      return;
    }

    try {
      setIsLoading(true);
      await authFetch(`/administrators/${id}`, {
        method: 'DELETE'
      });
      
      setAdmins(admins.filter(admin => admin.id !== id));
      showNotification('Administrador eliminado correctamente');
    } catch (err) {
      showNotification(`Error al eliminar: ${err.message}`, 'error');
      console.error('Error deleting admin:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (admin) => {
    setCurrentAdmin(admin);
    setFormData({
      nombre: admin.nombre,
      apellido: admin.apellido || '',
      email: admin.email,
      telefono: admin.telefono,
      direccion: admin.direccion || '',
      password: '',
      confirmPassword: ''
    });
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setCurrentAdmin(null);
    setFormData({
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      direccion: '',
      password: '',
      confirmPassword: ''
    });
    setIsFormOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones del formulario
    if (!formData.nombre || !formData.telefono) {
      showNotification('Nombre y teléfono son requeridos', 'error');
      return;
    }
    
    if (!currentAdmin) {
      if (!formData.email) {
        showNotification('Email es requerido', 'error');
        return;
      }
      
      if (!formData.password || formData.password.length < 6) {
        showNotification('La contraseña debe tener al menos 6 caracteres', 'error');
        return;
      }
      
      if (formData.password !== formData.confirmPassword) {
        showNotification('Las contraseñas no coinciden', 'error');
        return;
      }
    }
    
    setIsSubmitting(true);
    
    try {
      if (currentAdmin) {
        // Actualizar administrador existente
        const { password, confirmPassword, ...updateData } = formData;
        const { data } = await authFetch(`/administrators/${currentAdmin.id}`, {
          method: 'PUT',
          body: updateData
        });
        
        setAdmins(admins.map(admin => 
          admin.id === currentAdmin.id ? { 
            ...admin, 
            ...updateData, 
            name: `${updateData.nombre} ${updateData.apellido || ''}`.trim() 
          } : admin
        ));
        
        showNotification(data.message);
      } else {
        // Crear nuevo administrador
        const { confirmPassword, ...newAdminData } = formData;
        const { data } = await authFetch('/administrators', {
          method: 'POST',
          body: newAdminData
        });
        
        const newAdmin = {
          id: data.data.id,
          ...newAdminData,
          name: `${newAdminData.nombre} ${newAdminData.apellido || ''}`.trim(),
          role: 'Administrador',
          active: 1,
          created_at: data.data.created_at
        };
        
        setAdmins([...admins, newAdmin]);
        showNotification(data.message);
      }
      
      setIsFormOpen(false);
    } catch (err) {
      showNotification(err.message, 'error');
      console.error('Error submitting form:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && admins.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <FaSpinner className="spinner-icon" />
        </div>
        <p>Cargando administradores...</p>
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="admin-dashboard">
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      {isFormOpen && (
        <div className="modal-overlay">
          <div className="modal-form">
            <button 
              className="close-modal" 
              onClick={() => setIsFormOpen(false)}
              disabled={isSubmitting}
            >
              <FaTimes />
            </button>
            <h3>
              <FaUserShield className="form-icon" />
              {currentAdmin ? 'Editar Administrador' : 'Nuevo Administrador'}
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                {/* Campos del formulario */}
                {/* ... (mantener los mismos campos del formulario que ya tenías) ... */}
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => setIsFormOpen(false)}
                  disabled={isSubmitting}
                >
                  <FaTimes /> Cancelar
                </button>
                
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="spinner-icon" /> Procesando...
                    </>
                  ) : (
                    <>
                      <FaSave /> {currentAdmin ? 'Actualizar' : 'Guardar'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="dashboard-header">
        <div className="header-title">
          <FaUserShield className="header-icon" />
          <h2>Gestión de Administradores</h2>
          <span className="badge">{admins.length} administradores</span>
        </div>
        
        <div className="header-actions">
          <div className="search-container">
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Buscar administradores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={isLoading}
              />
              {searchTerm && (
                <button 
                  className="clear-search"
                  onClick={() => setSearchTerm('')}
                  disabled={isLoading}
                >
                  <FaTimes />
                </button>
              )}
            </div>
            
            <button 
              className="add-btn"
              onClick={handleAddNew}
              disabled={isLoading}
            >
              <FaPlus /> Nuevo Administrador
            </button>
          </div>
        </div>
      </div>

      <div className="admins-container">
        {filteredAdmins.length > 0 ? (
          <div className="admins-grid">
            {filteredAdmins.map(admin => (
              <div key={admin.id} className={`admin-card ${admin.id === user.id ? 'current-user' : ''}`}>
                {/* Tarjeta de administrador */}
                {/* ... (mantener la misma estructura de tarjeta que ya tenías) ... */}
              </div>
            ))}
          </div>
        ) : (
          <div className="no-results">
            {searchTerm ? 
              'No se encontraron administradores que coincidan con la búsqueda' : 
              'No hay administradores registrados'}
            <button 
              className="add-btn"
              onClick={handleAddNew}
              disabled={isLoading}
            >
              <FaPlus /> Agregar Administrador
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAdmins;