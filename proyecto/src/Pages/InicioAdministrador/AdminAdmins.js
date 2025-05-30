import React, { useState, useEffect } from 'react';
import { FaUserShield, FaEdit, FaTrash, FaPlus, FaSearch } from 'react-icons/fa';
import './Styles/Admin.css';

function AdminAdmins({ user }) {
  const [admins, setAdmins] = useState([]);
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        // Simulación de datos - en producción reemplazar con llamada API real
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

  const handleDelete = (id) => {
    if (id === user.id) {
      alert('No puedes eliminar tu propio usuario');
      return;
    }
    
    if (window.confirm('¿Estás seguro de eliminar este administrador?')) {
      setAdmins(admins.filter(admin => admin.id !== id));
    }
  };

  if (isLoading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Cargando administradores...</p>
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="admin-content-container">
      <div className="admin-content-header">
        <h2>
          <FaUserShield className="header-icon" />
          Gestión de Administradores
        </h2>
        <div className="header-actions">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Buscar administradores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn-primary">
            <FaPlus /> Nuevo Administrador
          </button>
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredAdmins.length > 0 ? (
              filteredAdmins.map(admin => (
                <tr key={admin.id}>
                  <td>{admin.id}</td>
                  <td>{admin.name}</td>
                  <td>{admin.email}</td>
                  <td>{admin.phone}</td>
                  <td>{admin.role}</td>
                  <td className="actions-cell">
                    <button className="btn-edit">
                      <FaEdit /> Editar
                    </button>
                    <button 
                      className={`btn-delete ${admin.id === user.id ? 'disabled' : ''}`}
                      onClick={() => handleDelete(admin.id)}
                      disabled={admin.id === user.id}
                    >
                      <FaTrash /> Eliminar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-results">
                  No se encontraron administradores
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminAdmins;