import React, { useState} from 'react';
import './Styles/InicioAdministrador.css';

const ServicesManagement = () => {
  const [services, setServices] = useState([
    { id: 1, nombre: 'Consulta General', descripción: 'Revisión médica básica para tu mascota.', precio: '$50.000' },
    { id: 2, nombre: 'Vacunación', descripción: 'Programas de vacunación personalizados para proteger a tu compañero.', precio: '$30.000' },
    { id: 3, nombre: 'Estética Canina y Felina', descripción: 'Baño, corte de pelo y otros tratamientos de belleza.', precio: '$40.000' },
    { id: 4, nombre: 'Cirugía', descripción: 'Procedimientos quirúrgicos con equipo moderno y veterinarios especializados.', precio: 'Consultar' },
    { id: 5, nombre: 'Diagnóstico por Imagen', descripción: 'Rayos X, ecografías y otros métodos de diagnóstico avanzado.', precio: 'Consultar' },
    { id: 6, nombre: 'Laboratorio Clínico', descripción: 'Análisis de sangre, orina y otros fluidos corporales.', precio: '25.000' },
  ]);

  const [newService, setNewService] = useState({
    nombre: '',
    descripción: '',
    precio: ''
  });

  const [editingId, setEditingId] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewService(prev => ({ ...prev, [name]: value }));
  };

  const handleAddService = () => {
    if (!newService.nombre || !newService.descripción) return;
    
    const newId = services.length > 0 ? Math.max(...services.map(s => s.id)) + 1 : 1;
    
    setServices([...services, {
      id: newId,
      ...newService
    }]);
    
    setNewService({ nombre: '', descripción: '', precio: '' });
  };

  const handleEditService = (id) => {
    const serviceToEdit = services.find(s => s.id === id);
    if (serviceToEdit) {
      setNewService(serviceToEdit);
      setEditingId(id);
    }
  };

  const handleUpdateService = () => {
    if (!editingId) return;
    
    setServices(services.map(s => 
      s.id === editingId ? { ...newService, id: editingId } : s
    ));
    
    setNewService({ nombre: '', descripción: '', precio: '' });
    setEditingId(null);
  };

  const handleDeleteService = (id) => {
    setServices(services.filter(s => s.id !== id));
  };

  return (
    <div className="management-container">
      <h1>Gestión de Servicios</h1>
      
      <div className="form-container">
        <h2>{editingId ? 'Editar Servicio' : 'Agregar Nuevo Servicio'}</h2>
        
        <div className="form-group">
          <label>Nombre:</label>
          <input 
            type="text" 
            name="nombre" 
            value={newService.nombre}
            onChange={handleInputChange}
          />
        </div>
        
        <div className="form-group">
          <label>Descripción:</label>
          <textarea 
            name="descripción" 
            value={newService.descripción}
            onChange={handleInputChange}
          />
        </div>
        
        <div className="form-group">
          <label>Precio:</label>
          <input 
            type="text" 
            name="precio" 
            value={newService.precio}
            onChange={handleInputChange}
          />
        </div>
        
        <div className="form-actions">
          {editingId ? (
            <>
              <button onClick={handleUpdateService} className="btn-primary">
                Actualizar
              </button>
              <button 
                onClick={() => {
                  setNewService({ nombre: '', descripción: '', precio: '' });
                  setEditingId(null);
                }} 
                className="btn-secondary"
              >
                Cancelar
              </button>
            </>
          ) : (
            <button onClick={handleAddService} className="btn-primary">
              Agregar
            </button>
          )}
        </div>
      </div>
      
      <div className="list-container">
        <h2>Lista de Servicios</h2>
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
            {services.map(service => (
              <tr key={service.id}>
                <td>{service.id}</td>
                <td>{service.nombre}</td>
                <td>{service.descripción}</td>
                <td>{service.precio}</td>
                <td>
                  <button 
                    onClick={() => handleEditService(service.id)}
                    className="btn-edit"
                  >
                    Editar
                  </button>
                  <button 
                    onClick={() => handleDeleteService(service.id)}
                    className="btn-delete"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ServicesManagement;