import React, { useState, useEffect } from 'react';
import '../Styles/Admin.css';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('');
  const [editUser, setEditUser] = useState(null);

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

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditUser({ ...editUser, [name]: value });
  };

  const handleSaveEdit = async () => {
    if (!/^[a-zA-Z ]+$/.test(editUser.name)) {
      alert("El nombre solo debe contener letras.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/users/${editUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editUser),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar el usuario");
      }

      // Recargar usuarios después de editar
      const updatedUsers = users.map(user =>
        user.id === editUser.id ? { ...user, ...editUser } : user
      );
      setUsers(updatedUsers);
      setEditUser(null);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const filteredUsers = users.filter(user =>
    filter === '' || user.role === filter
  );

  return (
    <div className="admin-container">
      <aside className="sidebar">
        <h2>Filtros</h2>
        <label htmlFor="roleFilter">Filtrar por rol:</label>
        <select id="roleFilter" onChange={handleFilterChange}>
          <option value="">Todos</option>
          <option value="admin">Administradores</option>
          <option value="vet">Veterinarios</option>
          <option value="client">Clientes</option>

        </select>
      </aside>
      <div className="content">
        <h1>Panel de Administración</h1>
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
                <td>{user.name} {user.lastname}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <button onClick={() => setEditUser(user)}>✏️</button>
                  <button onClick={() => toggleUserStatus(user.id)}>
                    {user.active ? 'Desactivar' : 'Activar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editUser && (
        <div className="modal">
          <div className="modal-content">
            <h2>Editar Usuario</h2>
            <input type="text" name="name" value={editUser.name} onChange={handleEditChange} />
            <input type="text" name="lastname" value={editUser.lastname} onChange={handleEditChange} />
            <input type="text" name="city" value={editUser.city} onChange={handleEditChange} />
            <input type="text" name="phone" value={editUser.phone} onChange={handleEditChange} />
            <input type="text" name="landline" value={editUser.landline} onChange={handleEditChange} />
            <input type="text" name="address" value={editUser.address} onChange={handleEditChange} />
            <input type="text" name="document_type" value={editUser.document_type} onChange={handleEditChange} />
            <input type="text" name="document_number" value={editUser.document_number} onChange={handleEditChange} />
            <button onClick={handleSaveEdit}>Confirmar</button>
            <button onClick={() => setEditUser(null)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;

