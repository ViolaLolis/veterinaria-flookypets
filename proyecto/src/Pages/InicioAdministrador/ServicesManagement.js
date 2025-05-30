import React, { useState, useEffect } from 'react';
import './Styles/Admin.css';

function ServicesManagement({ user }) {
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [currentService, setCurrentService] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch('http://localhost:5000/servicios', {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setServices(data);
      } else {
        setError(data.message || 'Error al cargar servicios');
      }
    } catch (error) {
      setError('Error de conexión con el servidor');
      // Datos de ejemplo para desarrollo
      setServices([
        { id_servicio: 1, nombre: 'Consulta General', descripcion: 'Revisión médica básica para tu mascota.', precio: '$50.000' },
        { id_servicio: 2, nombre: 'Vacunación', descripcion: 'Programas de vacunación personalizados para proteger a tu compañero.', precio: '$30.000' },
        { id_servicio: 3, nombre: 'Estética Canina y Felina', descripcion: 'Baño, corte de pelo y otros tratamientos de belleza.', precio: '$40.000' },
        { id_servicio: 4, nombre: 'Cirugía', descripcion: 'Procedimientos quirúrgicos con equipo moderno y veterinarios especializados.', precio: 'Consultar' },
        { id_servicio: 5, nombre: 'Diagnóstico por Imagen', descripcion: 'Rayos X, ecografías y otros métodos de diagnóstico avanzado.', precio: 'Consultar' },
        { id_servicio: 6, nombre: 'Laboratorio Clínico', descripcion: 'Análisis de sangre, orina y otros fluidos corporales.', precio: '$25.000' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (service) => {
    setEditMode(true);
    setCurrentService(service);
  };

  const handleCancel = () => {
    setEditMode(false);
    setCurrentService(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentService(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`http://localhost:5000/servicios/${currentService.id_servicio}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(currentService)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setServices(services.map(s => 
          s.id_servicio === currentService.id_servicio ? currentService : s
        ));
        setEditMode(false);
        setCurrentService(null);
      } else {
        setError(data.message || 'Error al actualizar servicio');
      }
    } catch (error) {
      setError('Error de conexión con el servidor');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este servicio?')) {
      try {
        const response = await fetch(`http://localhost:5000/servicios/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
        
        if (response.ok) {
          setServices(services.filter(s => s.id_servicio !== id));
        } else {
          const data = await response.json();
          setError(data.message || 'Error al eliminar servicio');
        }
      } catch (error) {
        setError('Error de conexión con el servidor');
      }
    }
  };

  const handleAddNew = () => {
    setCurrentService({
      nombre: '',
      descripcion: '',
      precio: ''
    });
    setEditMode(true);
  };

  const handleCreate = async () => {
    try {
      const response = await fetch('http://localhost:5000/servicios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(currentService)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setServices([...services, data]);
        setEditMode(false);
        setCurrentService(null);
      } else {
        setError(data.message || 'Error al crear servicio');
      }
    } catch (error) {
      setError('Error de conexión con el servidor');
    }
  };

  const filteredServices = services.filter(service =>
    service.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando servicios...</p>
      </div>
    );
  }

  return (
    <div className="services-management">
      <div className="management-header">
        <h2>Gestión de Servicios</h2>
        <div className="header-actions">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Buscar servicios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <i className="fas fa-search"></i>
          </div>
          <button onClick={handleAddNew} className="add-btn">
            <i className="fas fa-plus"></i> Nuevo Servicio
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {editMode ? (
        <div className="edit-form">
          <h3>{currentService.id_servicio ? 'Editar Servicio' : 'Nuevo Servicio'}</h3>
          
          <div className="form-group">
            <label>Nombre:</label>
            <input
              type="text"
              name="nombre"
              value={currentService.nombre}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="form-group">
            <label>Descripción:</label>
            <textarea
              name="descripcion"
              value={currentService.descripcion}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="form-group">
            <label>Precio:</label>
            <input
              type="text"
              name="precio"
              value={currentService.precio}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="form-actions">
            <button 
              onClick={currentService.id_servicio ? handleSave : handleCreate} 
              className="save-btn"
            >
              Guardar
            </button>
            <button onClick={handleCancel} className="cancel-btn">
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="services-table-container">
          <table className="services-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Precio</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.length > 0 ? (
                filteredServices.map(service => (
                  <tr key={service.id_servicio}>
                    <td>{service.id_servicio}</td>
                    <td>{service.nombre}</td>
                    <td>{service.descripcion}</td>
                    <td>{service.precio}</td>
                    <td className="actions-cell">
                      <button 
                        onClick={() => handleEdit(service)} 
                        className="edit-btn"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        onClick={() => handleDelete(service.id_servicio)} 
                        className="delete-btn"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-results">
                    No se encontraron servicios
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ServicesManagement;