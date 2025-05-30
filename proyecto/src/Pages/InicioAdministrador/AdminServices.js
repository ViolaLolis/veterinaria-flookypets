import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaConciergeBell } from 'react-icons/fa';
import './Styles/Admin.css';

function AdminServices({ user }) {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingService, setEditingService] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        // Simulación de datos - en producción reemplazar con llamada API real
        const mockServices = [
          { id: 1, name: 'Consulta General', description: 'Revisión médica básica', price: '$50.000', duration: '30 min' },
          { id: 2, name: 'Vacunación', description: 'Aplicación de vacunas', price: '$30.000', duration: '20 min' },
          { id: 3, name: 'Estética Canina', description: 'Baño y corte de pelo', price: '$40.000', duration: '1 hora' },
          { id: 4, name: 'Cirugía', description: 'Procedimientos quirúrgicos', price: 'Consultar', duration: 'Variable' },
          { id: 5, name: 'Laboratorio', description: 'Análisis clínicos', price: '$25.000', duration: '15 min' }
        ];
        
        setServices(mockServices);
        setFilteredServices(mockServices);
        setIsLoading(false);
      } catch (err) {
        setError('Error al cargar los servicios');
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []);

  useEffect(() => {
    const results = services.filter(service =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredServices(results);
  }, [searchTerm, services]);

  const handleEdit = (service) => {
    setEditingService(service);
    navigate(`/admin/services/edit/${service.id}`);
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este servicio?')) {
      setServices(services.filter(service => service.id !== id));
    }
  };

  const handleAddNew = () => {
    navigate('/admin/services/new');
  };

  if (isLoading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Cargando servicios...</p>
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
          <FaConciergeBell className="header-icon" />
          Gestión de Servicios
        </h2>
        <div className="header-actions">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Buscar servicios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn-primary" onClick={handleAddNew}>
            <FaPlus /> Nuevo Servicio
          </button>
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Precio</th>
              <th>Duración</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredServices.length > 0 ? (
              filteredServices.map(service => (
                <tr key={service.id}>
                  <td>{service.id}</td>
                  <td>{service.name}</td>
                  <td>{service.description}</td>
                  <td>{service.price}</td>
                  <td>{service.duration}</td>
                  <td className="actions-cell">
                    <button 
                      className="btn-edit"
                      onClick={() => handleEdit(service)}
                    >
                      <FaEdit /> Editar
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDelete(service.id)}
                    >
                      <FaTrash /> Eliminar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-results">
                  No se encontraron servicios
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminServices;