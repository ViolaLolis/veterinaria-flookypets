import React, { useState, useEffect } from 'react';
import './Styles/Admin.css';

function VetsManagement({ user }) {
  const [vets, setVets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [currentVet, setCurrentVet] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchVets();
  }, []);

  const fetchVets = async () => {
    try {
      const response = await fetch('http://localhost:5000/usuarios/veterinarios', {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setVets(data);
      } else {
        setError(data.message || 'Error al cargar veterinarios');
      }
    } catch (error) {
      setError('Error de conexión con el servidor');
      // Datos de ejemplo para desarrollo
      setVets([
        { id: 2, email: 'vet@example.com', nombre: 'Carlos', apellido: 'Veterinario', telefono: '3102345678', direccion: 'Carrera Vet 456', role: 'veterinario' },
        { id: 12, email: 'vet1@example.com', nombre: 'Laura', apellido: 'Gómez', telefono: '3101234567', direccion: 'Calle Veterinaria 1', role: 'veterinario' },
        { id: 13, email: 'vet2@example.com', nombre: 'Mario', apellido: 'Hernández', telefono: '3152345678', direccion: 'Avenida Animales 2', role: 'veterinario' },
        { id: 14, email: 'vet3@example.com', nombre: 'Sandra', apellido: 'Pérez', telefono: '3203456789', direccion: 'Carrera Mascotas 3', role: 'veterinario' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (vet) => {
    setEditMode(true);
    setCurrentVet(vet);
  };

  const handleCancel = () => {
    setEditMode(false);
    setCurrentVet(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentVet(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`http://localhost:5000/usuarios/${currentVet.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(currentVet)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setVets(vets.map(v => 
          v.id === currentVet.id ? currentVet : v
        ));
        setEditMode(false);
        setCurrentVet(null);
      } else {
        setError(data.message || 'Error al actualizar veterinario');
      }
    } catch (error) {
      setError('Error de conexión con el servidor');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este veterinario?')) {
      try {
        const response = await fetch(`http://localhost:5000/usuarios/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
        
        if (response.ok) {
          setVets(vets.filter(v => v.id !== id));
        } else {
          const data = await response.json();
          setError(data.message || 'Error al eliminar veterinario');
        }
      } catch (error) {
        setError('Error de conexión con el servidor');
      }
    }
  };

  const handleAddNew = () => {
    setCurrentVet({
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      direccion: '',
      password: '',
      role: 'veterinario'
    });
    setEditMode(true);
  };

  const handleCreate = async () => {
    try {
      const response = await fetch('http://localhost:5000/usuarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(currentVet)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setVets([...vets, data]);
        setEditMode(false);
        setCurrentVet(null);
      } else {
        setError(data.message || 'Error al crear veterinario');
      }
    } catch (error) {
      setError('Error de conexión con el servidor');
    }
  };

  const filteredVets = vets.filter(vet =>
    vet.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vet.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vet.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando veterinarios...</p>
      </div>
    );
  }

  return (
    <div className="vets-management">
      <div className="management-header">
        <h2>Gestión de Veterinarios</h2>
        <div className="header-actions">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Buscar veterinarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <i className="fas fa-search"></i>
          </div>
          <button onClick={handleAddNew} className="add-btn">
            <i className="fas fa-plus"></i> Nuevo Veterinario
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {editMode ? (
        <div className="edit-form">
          <h3>{currentVet.id ? 'Editar Veterinario' : 'Nuevo Veterinario'}</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>Nombre:</label>
              <input
                type="text"
                name="nombre"
                value={currentVet.nombre}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="form-group">
              <label>Apellido:</label>
              <input
                type="text"
                name="apellido"
                value={currentVet.apellido}
                onChange={handleInputChange}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={currentVet.email}
              onChange={handleInputChange}
              disabled={!!currentVet.id}
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Teléfono:</label>
              <input
                type="text"
                name="telefono"
                value={currentVet.telefono}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="form-group">
              <label>Dirección:</label>
              <input
                type="text"
                name="direccion"
                value={currentVet.direccion}
                onChange={handleInputChange}
              />
            </div>
          </div>
          
          {!currentVet.id && (
            <div className="form-group">
              <label>Contraseña:</label>
              <input
                type="password"
                name="password"
                value={currentVet.password}
                onChange={handleInputChange}
              />
            </div>
          )}
          
          <div className="form-actions">
            <button 
              onClick={currentVet.id ? handleSave : handleCreate} 
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
        <div className="vets-table-container">
          <table className="vets-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredVets.length > 0 ? (
                filteredVets.map(vet => (
                  <tr key={vet.id}>
                    <td>{vet.id}</td>
                    <td>{`${vet.nombre} ${vet.apellido}`}</td>
                    <td>{vet.email}</td>
                    <td>{vet.telefono}</td>
                    <td className="actions-cell">
                      <button 
                        onClick={() => handleEdit(vet)} 
                        className="edit-btn"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        onClick={() => handleDelete(vet.id)} 
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
                    No se encontraron veterinarios
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

export default VetsManagement;