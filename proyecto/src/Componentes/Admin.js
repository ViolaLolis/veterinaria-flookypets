import React, { useState, useEffect } from 'react';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await fetch("http://localhost:5000/api/users");
      const data = await response.json();
      setUsers(data);
    };
    
    fetchUsers();
  }, []);
  

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  const toggleUserStatus = async (userId) => {
    await fetch(`http://localhost:5000/api/users/${userId}`, { method: "PUT" });
    setUsers(users.map(user => 
      user.id === userId ? { ...user, active: !user.active } : user
    ));
  };
  
  const filteredUsers = users.filter(user => 
    filter === '' || user.role === filter
  );

  return (
    <div>
      <h1>Panel de Administración</h1>

      {/* Filtros */}
      <div>
        <label htmlFor="roleFilter">Filtrar por rol: </label>
        <select id="roleFilter" onChange={handleFilterChange} aria-label="Filtrar usuarios por rol">
          <option value="">Todos</option>
          <option value="admin">Administradores</option>
          <option value="vet">Veterinarios</option>
          <option value="client">Clientes</option>
        </select>
      </div>

      {/* Lista de usuarios */}
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map(user => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                {/* Lupa para detalles */}
                <button 
                  onClick={() => setSelectedUser(user)} 
                  aria-label={`Ver detalles de ${user.name}`}
                >
                  🔍
                </button>
                {/* Botón de activar/desactivar */}
                <button 
                  onClick={() => toggleUserStatus(user.id)} 
                  aria-label={`Cambiar estado de ${user.name}`}
                >
                  {user.active ? 'Desactivar' : 'Activar'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Detalle de usuario seleccionado */}
      {selectedUser && (
        <div aria-live="polite">
          <h2>Detalles de {selectedUser.name}</h2>
          <p><strong>Correo:</strong> {selectedUser.email}</p>
          <p><strong>Rol:</strong> {selectedUser.role}</p>
          <p><strong>Estado:</strong> {selectedUser.active ? 'Activo' : 'Desactivado'}</p>
          {/* Aquí podrías poner un botón para activar/desactivar */}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
