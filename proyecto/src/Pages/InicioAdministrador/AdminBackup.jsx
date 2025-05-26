import React, { useState } from 'react';
import './Styles/AdminBackup.css';

const AdminBackup = () => {
  const [backups, setBackups] = useState([
    { id: 1, date: '2023-11-01', size: '45MB', type: 'Completa' },
    { id: 2, date: '2023-10-28', size: '40MB', type: 'Completa' },
  ]);

  const createBackup = async () => {
    try {
      // Lógica para crear backup
      alert('Copia de seguridad creada exitosamente');
    } catch (error) {
      console.error('Error creating backup:', error);
    }
  };

  return (
    <div className="backup-container">
      <h2>Copias de Seguridad</h2>
      <button onClick={createBackup} className="create-backup-btn">
        Crear Copia de Seguridad
      </button>
      <table className="backup-table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Tamaño</th>
            <th>Tipo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {backups.map(backup => (
            <tr key={backup.id}>
              <td>{backup.date}</td>
              <td>{backup.size}</td>
              <td>{backup.type}</td>
              <td>
                <button className="restore-btn">Restaurar</button>
                <button className="download-btn">Descargar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminBackup;