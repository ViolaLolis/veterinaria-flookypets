import React, { useState, useEffect } from 'react';
import { FaUser, FaEdit, FaTrash, FaSearch, FaBan, FaCheck } from 'react-icons/fa';
import './Styles/Admin.css';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Simulación de datos - en producción reemplazar con llamada API real
        const mockUsers = [
          { id: 1, name: 'Juan Pérez', email: 'juan@example.com', phone: '3001234567', status: 'active', pets: 2 },
          { id: 2, name: 'María Gómez', email: 'maria@example.com', phone: '3102345678', status: 'active', pets: 1 },
          { id: 3, name: 'Carlos López', email: 'carlos@example.com', phone: '3203456789', status: 'inactive', pets: 0 },
          { id: 4, name: 'Ana Martínez', email: 'ana@example.com', phone: '3154567890', status: 'active', pets: 3 }
        ];
        
        setUsers(mockUsers);
        setFilteredUsers(mockUsers);
        setIsLoading(false);
      } catch (err) {
        setError('Error al cargar los usuarios');
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const results = users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(results);
  }, [searchTerm, users]);

  const toggleStatus = (id) => {
    setUsers(users.map(user => 
      user.id === id ? { 
        ...user, 
        status: user.status === 'active' ? 'inactive' : 'active' 
      } : user
    ));
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      setUsers(users.filter(user => user.id !== id));
    }
  };

  if (isLoading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Cargando usuarios...</p>
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
          <FaUser className="header-icon" />
          Gestión de Usuarios
        </h2>
        <div className="header-actions">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
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
              <th>Mascotas</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.phone}</td>
                  <td>{user.pets}</td>
                  <td>
                    <span className={`status-badge ${user.status}`}>
                      {user.status === 'active' ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button className="btn-edit">
                      <FaEdit /> Editar
                    </button>
                    <button 
                      className={`btn-status ${user.status === 'active' ? 'inactive' : 'active'}`}
                      onClick={() => toggleStatus(user.id)}
                    >
                      {user.status === 'active' ? <FaBan /> : <FaCheck />}
                      {user.status === 'active' ? 'Desactivar' : 'Activar'}
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDelete(user.id)}
                    >
                      <FaTrash /> Eliminar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="no-results">
                  No se encontraron usuarios
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminUsers;