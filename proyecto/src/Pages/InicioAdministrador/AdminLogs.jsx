import React, { useState } from 'react';
import './Styles/AdminLogs.css';

const AdminLogs = () => {
  const [logs, setLogs] = useState([
    { id: 1, date: '2023-11-01 10:30', user: 'admin', action: 'Inicio de sesión' },
    { id: 2, date: '2023-11-01 09:15', user: 'vet1', action: 'Actualizó historial médico' },
  ]);
  const [filter, setFilter] = useState('all');

  const filteredLogs = filter === 'all' 
    ? logs 
    : logs.filter(log => log.user.includes(filter));

  return (
    <div className="logs-container">
      <h2>Registros del Sistema</h2>
      <div className="logs-filter">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">Todos</option>
          <option value="admin">Administradores</option>
          <option value="vet">Veterinarios</option>
          <option value="user">Usuarios</option>
        </select>
      </div>
      <table className="logs-table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Usuario</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {filteredLogs.map(log => (
            <tr key={log.id}>
              <td>{log.date}</td>
              <td>{log.user}</td>
              <td>{log.action}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminLogs;