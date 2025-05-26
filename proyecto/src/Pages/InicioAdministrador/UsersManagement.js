import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import UserForm from './Components/UserForm';
import "./Styles/AdminTables.css";

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, [filter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const url = filter === 'all' 
        ? 'http://localhost:5000/admin/users' 
        : `http://localhost:5000/admin/users?role=${filter}`;
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
      
      if (error.response) {
        if (error.response.status === 401) {
          setError('No autorizado - por favor inicia sesión');
          navigate('/login');
        } else if (error.response.status === 403) {
          setError('No tienes permisos para acceder a esta sección');
        } else {
          setError('Error al cargar los usuarios');
        }
      } else {
        setError('No se pudo conectar al servidor');
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/admin/users/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error al eliminar el usuario');
      }
    }
  };

  if (loading) {
    return <div className="loading">Cargando usuarios...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="management-container">
      <div className="management-header">
        <h1>Gestión de Usuarios</h1>
        <div className="filter-controls">
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">Todos</option>
            <option value="admin">Administradores</option>
            <option value="veterinario">Veterinarios</option>
            <option value="recepcionista">Recepcionistas</option>
            <option value="asistente">Asistentes</option>
            <option value="usuario">Usuarios</option>
          </select>
          <button 
            className="add-btn"
            onClick={() => {
              setEditingUser(null);
              setShowForm(true);
            }}
          >
            + Añadir Usuario
          </button>
        </div>
      </div>

      {showForm && (
        <UserForm 
          user={editingUser}
          onClose={() => setShowForm(false)}
          onRefresh={fetchUsers}
        />
      )}

      <table className="management-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map(user => (
              <tr key={user.id}>
                <td>{user.nombre} {user.apellido}</td>
                <td>{user.email}</td>
                <td>{user.telefono}</td>
                <td>
                  <span className={`role-badge ${user.role}`}>
                    {user.role}
                  </span>
                </td>
                <td className="actions">
                  <button 
                    className="edit-btn"
                    onClick={() => {
                      setEditingUser(user);
                      setShowForm(true);
                    }}
                  >
                    Editar
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDelete(user.id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="no-data">No se encontraron usuarios</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UsersManagement;