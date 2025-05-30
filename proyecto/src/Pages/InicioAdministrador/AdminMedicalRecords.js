import React, { useState, useEffect } from 'react';
import { FaNotesMedical, FaSearch, FaPaw, FaUserMd, FaCalendarAlt } from 'react-icons/fa';
import './Styles/Admin.css';

function AdminMedicalRecords() {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        // Simulación de datos - en producción reemplazar con llamada API real
        const mockRecords = [
          { id: 1, date: '2023-06-10', pet: 'Max', owner: 'Juan Pérez', vet: 'Dr. Carlos', diagnosis: 'Control anual', treatment: 'Vacuna antirrábica' },
          { id: 2, date: '2023-06-05', pet: 'Luna', owner: 'María Gómez', vet: 'Dra. Laura', diagnosis: 'Desparasitación', treatment: 'Tabletas antiparasitarias' },
          { id: 3, date: '2023-05-28', pet: 'Rocky', owner: 'Carlos López', vet: 'Dr. Mario', diagnosis: 'Problemas de piel', treatment: 'Shampoo medicado' },
          { id: 4, date: '2023-05-20', pet: 'Bella', owner: 'Ana Martínez', vet: 'Dra. Sandra', diagnosis: 'Control de peso', treatment: 'Dieta especial' }
        ];
        
        setRecords(mockRecords);
        setFilteredRecords(mockRecords);
        setIsLoading(false);
      } catch (err) {
        setError('Error al cargar los historiales médicos');
        setIsLoading(false);
      }
    };

    fetchRecords();
  }, []);

  useEffect(() => {
    const results = records.filter(record =>
      record.pet.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.vet.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRecords(results);
  }, [searchTerm, records]);

  if (isLoading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Cargando historiales médicos...</p>
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
          <FaNotesMedical className="header-icon" />
          Historiales Médicos
        </h2>
        <div className="header-actions">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Buscar historiales..."
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
              <th>Fecha</th>
              <th>Mascota</th>
              <th>Dueño</th>
              <th>Veterinario</th>
              <th>Diagnóstico</th>
              <th>Tratamiento</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.length > 0 ? (
              filteredRecords.map(record => (
                <tr key={record.id}>
                  <td>{record.id}</td>
                  <td>
                    <FaCalendarAlt className="icon" /> {record.date}
                  </td>
                  <td>
                    <FaPaw className="icon" /> {record.pet}
                  </td>
                  <td>{record.owner}</td>
                  <td>
                    <FaUserMd className="icon" /> {record.vet}
                  </td>
                  <td>{record.diagnosis}</td>
                  <td>{record.treatment}</td>
                  <td className="actions-cell">
                    <button className="btn-primary">
                      Ver Detalles
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="no-results">
                  No se encontraron historiales médicos
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminMedicalRecords;