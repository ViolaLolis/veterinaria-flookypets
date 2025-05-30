import React, { useState, useEffect } from 'react';
import { FaUserMd, FaEdit, FaTrash, FaPlus, FaSearch } from 'react-icons/fa';
import './Styles/Admin.css';

function AdminVets() {
  const [vets, setVets] = useState([]);
  const [filteredVets, setFilteredVets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVets = async () => {
      try {
        // Simulación de datos - en producción reemplazar con llamada API real
        const mockVets = [
          { id: 1, name: 'Dr. Carlos Pérez', email: 'carlos@vet.com', phone: '3001234567', specialty: 'Cirugía' },
          { id: 2, name: 'Dra. Laura Gómez', email: 'laura@vet.com', phone: '3102345678', specialty: 'Dermatología' },
          { id: 3, name: 'Dr. Mario Rodríguez', email: 'mario@vet.com', phone: '3203456789', specialty: 'Oftalmología' },
          { id: 4, name: 'Dra. Sandra López', email: 'sandra@vet.com', phone: '3154567890', specialty: 'Cardiología' }
        ];
        
        setVets(mockVets);
        setFilteredVets(mockVets);
        setIsLoading(false);
      } catch (err) {
        setError('Error al cargar los veterinarios');
        setIsLoading(false);
      }
    };

    fetchVets();
  }, []);

  useEffect(() => {
    const results = vets.filter(vet =>
      vet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vet.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vet.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredVets(results);
  }, [searchTerm, vets]);

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este veterinario?')) {
      setVets(vets.filter(vet => vet.id !== id));
    }
  };

  if (isLoading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Cargando veterinarios...</p>
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
          <FaUserMd className="header-icon" />
          Gestión de Veterinarios
        </h2>
        <div className="header-actions">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Buscar veterinarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn-primary">
            <FaPlus /> Nuevo Veterinario
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
              <th>Especialidad</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredVets.length > 0 ? (
              filteredVets.map(vet => (
                <tr key={vet.id}>
                  <td>{vet.id}</td>
                  <td>{vet.name}</td>
                  <td>{vet.email}</td>
                  <td>{vet.phone}</td>
                  <td>{vet.specialty}</td>
                  <td className="actions-cell">
                    <button className="btn-edit">
                      <FaEdit /> Editar
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDelete(vet.id)}
                    >
                      <FaTrash /> Eliminar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-results">
                  No se encontraron veterinarios
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminVets;