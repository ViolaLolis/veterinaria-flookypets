import React, { useState, useEffect } from 'react';
import { FaUserShield, FaEdit, FaTrash, FaPlus, FaSearch, FaTimes, FaSave, FaSpinner } from 'react-icons/fa';
import './Styles/AdminStyles.css';

function AdminAdmins({ user }) {
  const [admins, setAdmins] = useState([]);
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Administrador'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        // Simulación de datos con retraso para mostrar loading
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const mockAdmins = [
          { id: 1, name: 'Admin Principal', email: 'admin@flookypets.com', phone: '3001234567', role: 'Super Admin' },
          { id: 2, name: 'Carlos Admin', email: 'carlos@flookypets.com', phone: '3102345678', role: 'Administrador' },
          { id: 3, name: 'Laura Admin', email: 'laura@flookypets.com', phone: '3203456789', role: 'Administrador' }
        ];
        
        setAdmins(mockAdmins);
        setFilteredAdmins(mockAdmins);
        setIsLoading(false);
      } catch (err) {
        setError('Error al cargar los administradores');
        setIsLoading(false);
      }
    };

    fetchAdmins();
  }, []);

  useEffect(() => {
    const results = admins.filter(admin =>
      admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAdmins(results);
  }, [searchTerm, admins]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDelete = (id) => {
    if (id === user.id) {
      showNotification('No puedes eliminar tu propio usuario', 'error');
      return;
    }
    
    if (window.confirm('¿Estás seguro de eliminar este administrador?')) {
      setAdmins(admins.filter(admin => admin.id !== id));
      showNotification('Administrador eliminado correctamente');
    }
  };

  const handleEdit = (admin) => {
    setCurrentAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
      role: admin.role
    });
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setCurrentAdmin(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'Administrador'
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
    setIsSubmitting(true);
    
    try {
      // Simulación de API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (currentAdmin) {
        // Editar administrador existente
        const updatedAdmins = admins.map(admin => 
          admin.id === currentAdmin.id ? { ...admin, ...formData } : admin
        );
        setAdmins(updatedAdmins);
        showNotification('Administrador actualizado correctamente');
      } else {
        // Agregar nuevo administrador
        const newAdmin = {
          id: Math.max(...admins.map(a => a.id)) + 1,
          ...formData
        };
        setAdmins([...admins, newAdmin]);
        showNotification('Administrador agregado correctamente');
      }
      
      setIsFormOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
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
      {/* Notificación */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* Modal de formulario */}
      {isFormOpen && (
        <div className="modal-overlay">
          <div className="modal-form">
            <button className="close-modal" onClick={() => setIsFormOpen(false)}>
              <FaTimes />
            </button>
            <h3>
              <FaUserShield className="form-icon" />
              {currentAdmin ? 'Editar Administrador' : 'Nuevo Administrador'}
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Nombre Completo</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Ej: Admin Principal"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Correo Electrónico</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="admin@flookypets.com"
                    required
                    disabled={!!currentAdmin}
                  />
                </div>
                
                <div className="form-group">
                  <label>Teléfono</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="3001234567"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Rol</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                    disabled={currentAdmin?.role === 'Super Admin'}
                  >
                    <option value="Administrador">Administrador</option>
                    <option value="Super Admin">Super Admin</option>
                  </select>
                </div>
              </div>
              
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
            </form>
          </div>
        </div>
      )}

      <div className="dashboard-header">
        <div className="header-title">
          <FaUserShield className="header-icon" />
          <h2>Gestión de Administradores</h2>
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
              />
              {searchTerm && (
                <button 
                  className="clear-search"
                  onClick={() => setSearchTerm('')}
                >
                  <FaTimes />
                </button>
              )}
            </div>
            
            <button 
              className="add-btn"
              onClick={handleAddNew}
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
              <div key={admin.id} className="admin-card">
                <div className="card-header">
                  <h3>{admin.name}</h3>
                  <span className={`role-badge ${admin.role === 'Super Admin' ? 'super-admin' : ''}`}>
                    {admin.role}
                  </span>
                </div>
                
                <div className="card-body">
                  <div className="info-item">
                    <span className="info-label">Email:</span>
                    <span className="info-value">{admin.email}</span>
                  </div>
                  
                  <div className="info-item">
                    <span className="info-label">Teléfono:</span>
                    <span className="info-value">{admin.phone}</span>
                  </div>
                </div>
                
                <div className="card-footer">
                  <button 
                    className="edit-btn"
                    onClick={() => handleEdit(admin)}
                  >
                    <FaEdit /> Editar
                  </button>
                  
                  <button 
                    className={`delete-btn ${admin.id === user.id ? 'disabled' : ''}`}
                    onClick={() => handleDelete(admin.id)}
                    disabled={admin.id === user.id}
                  >
                    <FaTrash /> Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-results">
            No se encontraron administradores
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminAdmins;