import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ServiceForm from './Components/ServiceForm';
import "./Styles/AdminTables.css";

const ServicesManagement = () => {
  const [services, setServices] = useState([]);
  const [editingService, setEditingService] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await axios.get('http://localhost:5000/services');
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este servicio?')) {
      try {
        await axios.delete(`http://localhost:5000/services/${id}`);
        fetchServices();
      } catch (error) {
        console.error('Error deleting service:', error);
      }
    }
  };

  return (
    <div className="management-container">
      <div className="management-header">
        <h1>Gestión de Servicios</h1>
        <button 
          className="add-btn"
          onClick={() => {
            setEditingService(null);
            setShowForm(true);
          }}
        >
          + Añadir Servicio
        </button>
      </div>

      {showForm && (
        <ServiceForm 
          service={editingService}
          onClose={() => setShowForm(false)}
          onRefresh={fetchServices}
        />
      )}

      <table className="management-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Precio</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {services.map(service => (
            <tr key={service.id_servicio}>
              <td>{service.nombre}</td>
              <td>{service.descripcion}</td>
              <td>{service.precio}</td>
              <td className="actions">
                <button 
                  className="edit-btn"
                  onClick={() => {
                    setEditingService(service);
                    setShowForm(true);
                  }}
                >
                  Editar
                </button>
                <button 
                  className="delete-btn"
                  onClick={() => handleDelete(service.id_servicio)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ServicesManagement;