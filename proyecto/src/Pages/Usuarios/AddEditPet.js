import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../Styles/AddEditPet.css";

function AddEditPet({ petToEdit }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: petToEdit?.name || '',
    type: petToEdit?.type || 'Perro',
    breed: petToEdit?.breed || '',
    age: petToEdit?.age || '',
    weight: petToEdit?.weight || '',
    medicalHistory: petToEdit?.medicalHistory || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí iría la lógica para guardar en la API
    console.log('Datos de la mascota:', formData);
    navigate('/usuario');
  };

  return (
    <div className="add-edit-pet-container">
      <h2>{petToEdit ? 'Editar Mascota' : 'Agregar Nueva Mascota'}</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nombre de la mascota</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Tipo de mascota</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
          >
            <option value="Perro">Perro</option>
            <option value="Gato">Gato</option>
            <option value="Ave">Ave</option>
            <option value="Roedor">Roedor</option>
            <option value="Reptil">Reptil</option>
            <option value="Otro">Otro</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Raza</label>
          <input
            type="text"
            name="breed"
            value={formData.breed}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Edad (años)</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              min="0"
              step="0.1"
            />
          </div>
          
          <div className="form-group">
            <label>Peso (kg)</label>
            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              min="0"
              step="0.1"
            />
          </div>
        </div>
        
        <div className="form-group">
          <label>Historial médico (opcional)</label>
          <textarea
            name="medicalHistory"
            value={formData.medicalHistory}
            onChange={handleChange}
            rows="4"
          />
        </div>
        
        <div className="form-actions">
          <button type="button" className="cancel-button" onClick={() => navigate('/usuario')}>
            Cancelar
          </button>
          <button type="submit" className="save-button">
            {petToEdit ? 'Guardar Cambios' : 'Agregar Mascota'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddEditPet;