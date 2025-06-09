import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaSearch, FaUser, FaPaw, FaNotesMedical } from 'react-icons/fa';
import './Styles/AdminAppointments.css';

function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        // Simulación de datos - en producción reemplazar con llamada API real
        const mockAppointments = [
          { id: 1, date: '2023-06-15 09:00', pet: 'Max', owner: 'Juan Pérez', service: 'Consulta General', status: 'completed' },
          { id: 2, date: '2023-06-15 10:30', pet: 'Luna', owner: 'María Gómez', service: 'Vacunación', status: 'completed' },
          { id: 3, date: '2023-06-16 11:00', pet: 'Rocky', owner: 'Carlos López', service: 'Estética', status: 'pending' },
          { id: 4, date: '2023-06-16 14:00', pet: 'Bella', owner: 'Ana Martínez', service: 'Cirugía', status: 'canceled' },
          { id: 5, date: '2023-06-17 09:30', pet: 'Simba', owner: 'Luis Rodríguez', service: 'Consulta', status: 'pending' }
        ];
        
        setAppointments(mockAppointments);
        setFilteredAppointments(mockAppointments);
        setIsLoading(false);
      } catch (err) {
        setError('Error al cargar las citas');
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  useEffect(() => {
    let results = appointments;
    
    // Aplicar filtro de estado
    if (filter !== 'all') {
      results = results.filter(app => app.status === filter);
    }
    
    // Aplicar búsqueda
    if (searchTerm) {
      results = results.filter(app =>
        app.pet.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.service.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredAppointments(results);
  }, [searchTerm, filter, appointments]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return 'badge-success';
      case 'pending':
        return 'badge-warning';
      case 'canceled':
        return 'badge-danger';
      default:
        return 'badge-secondary';
    }
  };

  if (isLoading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Cargando citas...</p>
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
          <FaCalendarAlt className="header-icon" />
          Gestión de Citas
        </h2>
        <div className="header-actions">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Buscar citas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              Todas
            </button>
            <button 
              className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
              onClick={() => setFilter('pending')}
            >
              Pendientes
            </button>
            <button 
              className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
              onClick={() => setFilter('completed')}
            >
              Completadas
            </button>
            <button 
              className={`filter-btn ${filter === 'canceled' ? 'active' : ''}`}
              onClick={() => setFilter('canceled')}
            >
              Canceladas
            </button>
          </div>
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha y Hora</th>
              <th>Mascota</th>
              <th>Dueño</th>
              <th>Servicio</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map(app => (
                <tr key={app.id}>
                  <td>{app.id}</td>
                  <td>{app.date}</td>
                  <td>
                    <FaPaw className="icon" /> {app.pet}
                  </td>
                  <td>
                    <FaUser className="icon" /> {app.owner}
                  </td>
                  <td>
                    <FaNotesMedical className="icon" /> {app.service}
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusBadge(app.status)}`}>
                      {app.status === 'completed' ? 'Completada' : 
                       app.status === 'pending' ? 'Pendiente' : 'Cancelada'}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button className="btn-primary">
                      Ver Detalles
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="no-results">
                  No se encontraron citas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminAppointments;