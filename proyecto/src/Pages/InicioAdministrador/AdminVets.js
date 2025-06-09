import React, { useState, useEffect } from 'react';
import { FaUserMd, FaEdit, FaTrash, FaPlus, FaSearch, FaTimes, FaSave, FaSpinner } from 'react-icons/fa';
import './Styles/AdminVets.css';

function AdminVets() {
  const [vets, setVets] = useState([]);
  const [filteredVets, setFilteredVets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentVet, setCurrentVet] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialty: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const fetchVets = async () => {
      try {
        // Simulación de datos con un pequeño retraso para mostrar el loading
        await new Promise(resolve => setTimeout(resolve, 800));
        
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

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este veterinario?')) {
      setVets(vets.filter(vet => vet.id !== id));
      showNotification('Veterinario eliminado correctamente');
    }
  };

  const handleEdit = (vet) => {
    setCurrentVet(vet);
    setFormData({
      name: vet.name,
      email: vet.email,
      phone: vet.phone,
      specialty: vet.specialty
    });
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setCurrentVet(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      specialty: ''
    });
    setIsFormOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simular tiempo de espera para operación
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (currentVet) {
        // Editar veterinario existente
        const updatedVets = vets.map(vet => 
          vet.id === currentVet.id ? { ...vet, ...formData } : vet
        );
        setVets(updatedVets);
        showNotification('Veterinario actualizado correctamente');
      } else {
        // Agregar nuevo veterinario
        const newVet = {
          id: Math.max(...vets.map(v => v.id)) + 1,
          ...formData
        };
        setVets([...vets, newVet]);
        showNotification('Veterinario agregado correctamente');
      }
      
      setIsFormOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <FaSpinner className="spinner-icon" />
        </div>
        <p>Cargando veterinarios...</p>
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="admin-dashboard">
      {/* Notificación */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* Modal de formulario */}
      {isFormOpen && (
        <div className="modal-overlay">
          <div className="modal-form">
            <button className="close-modal" onClick={() => setIsFormOpen(false)}>
              <FaTimes />
            </button>
            <h3>
              <FaUserMd className="form-icon" />
              {currentVet ? 'Editar Veterinario' : 'Nuevo Veterinario'}
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Nombre Completo</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Ej: Dr. Carlos Pérez"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Correo Electrónico</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="correo@ejemplo.com"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Teléfono</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="3001234567"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Especialidad</label>
                  <input
                    type="text"
                    name="specialty"
                    value={formData.specialty}
                    onChange={handleInputChange}
                    placeholder="Ej: Cirugía"
                    required
                  />
                </div>
              </div>
              
              <button 
                type="submit" 
                className="submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="spinner-icon" /> Procesando...
                  </>
                ) : (
                  <>
                    <FaSave /> {currentVet ? 'Actualizar' : 'Guardar'}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="dashboard-header">
        <div className="header-title">
          <FaUserMd className="header-icon" />
          <h2>Gestión de Veterinarios</h2>
        </div>
        
        <div className="header-actions">
          <div className="search-container">
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Buscar veterinarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  className="clear-search"
                  onClick={() => setSearchTerm('')}
                >
                  <FaTimes />
                </button>
              )}
            </div>
            
            <button 
              className="add-btn"
              onClick={handleAddNew}
            >
              <FaPlus /> Nuevo Veterinario
            </button>
          </div>
        </div>
      </div>

      <div className="vets-container">
        {filteredVets.length > 0 ? (
          <div className="vets-grid">
            {filteredVets.map(vet => (
              <div key={vet.id} className="vet-card">
                <div className="card-header">
                  <h3>{vet.name}</h3>
                  <span className="vet-id">ID: {vet.id}</span>
                </div>
                
                <div className="card-body">
                  <div className="info-item">
                    <span className="info-label">Email:</span>
                    <span className="info-value">{vet.email}</span>
                  </div>
                  
                  <div className="info-item">
                    <span className="info-label">Teléfono:</span>
                    <span className="info-value">{vet.phone}</span>
                  </div>
                  
                  <div className="info-item">
                    <span className="info-label">Especialidad:</span>
                    <span className="specialty-badge">{vet.specialty}</span>
                  </div>
                </div>
                
                <div className="card-footer">
                  <button 
                    className="edit-btn"
                    onClick={() => handleEdit(vet)}
                  >
                    <FaEdit /> Editar
                  </button>
                  
                  <button 
                    className="delete-btn"
                    onClick={() => handleDelete(vet.id)}
                  >
                    <FaTrash /> Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-results">
            No se encontraron veterinarios
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminVets;