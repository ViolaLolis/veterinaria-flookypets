import React, { useState, useEffect } from 'react';
import './Styles/Admin.css';

function AdminsManagement({ user }) {
  const [admins, setAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await fetch('http://localhost:5000/admin/administrators', {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setAdmins(data);
      } else {
        setError(data.message || 'Error al cargar administradores');
      }
    } catch (error) {
      setError('Error de conexión con el servidor');
      // Datos de ejemplo para desarrollo
      setAdmins([
        { id: 1, email: 'admin@example.com', nombre: 'Admin', apellido: 'Principal', telefono: '3001234567', direccion: 'Calle Admin 123', role: 'admin' },
        { id: 15, email: 'admin2@example.com', nombre: 'Carlos', apellido: 'Admin', telefono: '3156789012', direccion: 'Avenida Admin 456', role: 'admin' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (admin) => {
    setEditMode(true);
    setCurrentAdmin(admin);
  };

  const handleCancel = () => {
    setEditMode(false);
    setCurrentAdmin(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentAdmin(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`http://localhost:5000/usuarios/${currentAdmin.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(currentAdmin)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setAdmins(admins.map(a => 
          a.id === currentAdmin.id ? currentAdmin : a
        ));
        setEditMode(false);
        setCurrentAdmin(null);
      } else {
        setError(data.message || 'Error al actualizar administrador');
      }
    } catch (error) {
      setError('Error de conexión con el servidor');
    }
  };

  const handleDelete = async (id) => {
    if (id === user.id) {
      setError('No puedes eliminar tu propio usuario administrador');
      return;
    }

    if (window.confirm('¿Estás seguro de eliminar este administrador?')) {
      try {
        const response = await fetch(`http://localhost:5000/usuarios/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
        
        if (response.ok) {
          setAdmins(admins.filter(a => a.id !== id));
        } else {
          const data = await response.json();
          setError(data.message || 'Error al eliminar administrador');
        }
      } catch (error) {
        setError('Error de conexión con el servidor');
      }
    }
  };

  const handleAddNew = () => {
    setCurrentAdmin({
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      direccion: '',
      password: '',
      role: 'admin'
    });
    setEditMode(true);
  };

  const handleCreate = async () => {
    try {
      const response = await fetch('http://localhost:5000/usuarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(currentAdmin)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setAdmins([...admins, data]);
        setEditMode(false);
        setCurrentAdmin(null);
      } else {
        setError(data.message || 'Error al crear administrador');
      }
    } catch (error) {
      setError('Error de conexión con el servidor');
    }
  };

  const filteredAdmins = admins.filter(admin =>
    admin.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando administradores...</p>
      </div>
    );
  }

  return (
    <div className="admins-management">
      <div className="management-header">
        <h2>Gestión de Administradores</h2>
        <div className="header-actions">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Buscar administradores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <i className="fas fa-search"></i>
          </div>
          <button onClick={handleAddNew} className="add-btn">
            <i className="fas fa-plus"></i> Nuevo Administrador
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {editMode ? (
        <div className="edit-form">
          <h3>{currentAdmin.id ? 'Editar Administrador' : 'Nuevo Administrador'}</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>Nombre:</label>
              <input
                type="text"
                name="nombre"
                value={currentAdmin.nombre}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="form-group">
              <label>Apellido:</label>
              <input
                type="text"
                name="apellido"
                value={currentAdmin.apellido}
                onChange={handleInputChange}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={currentAdmin.email}
              onChange={handleInputChange}
              disabled={!!currentAdmin.id}
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Teléfono:</label>
              <input
                type="text"
                name="telefono"
                value={currentAdmin.telefono}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="form-group">
              <label>Dirección:</label>
              <input
                type="text"
                name="direccion"
                value={currentAdmin.direccion}
                onChange={handleInputChange}
              />
            </div>
          </div>
          
          {!currentAdmin.id && (
            <div className="form-group">
              <label>Contraseña:</label>
              <input
                type="password"
                name="password"
                value={currentAdmin.password}
                onChange={handleInputChange}
              />
            </div>
          )}
          
          <div className="form-actions">
            <button 
              onClick={currentAdmin.id ? handleSave : handleCreate} 
              className="save-btn"
            >
              Guardar
            </button>
            <button onClick={handleCancel} className="cancel-btn">
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="admins-table-container">
          <table className="admins-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredAdmins.length > 0 ? (
                filteredAdmins.map(admin => (
                  <tr key={admin.id}>
                    <td>{admin.id}</td>
                    <td>{`${admin.nombre} ${admin.apellido}`}</td>
                    <td>{admin.email}</td>
                    <td>{admin.telefono}</td>
                    <td className="actions-cell">
                      <button 
                        onClick={() => handleEdit(admin)} 
                        className="edit-btn"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        onClick={() => handleDelete(admin.id)} 
                        className="delete-btn"
                        disabled={admin.id === user.id}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-results">
                    No se encontraron administradores
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminsManagement;