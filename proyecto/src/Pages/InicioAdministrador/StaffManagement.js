import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Styles/InicioAdministrador.css';
import { useNavigate } from 'react-router-dom';
import ConfirmationModal from './ConfirmationModal';

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newStaff, setNewStaff] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    role: 'veterinario'
  });
  const [editingId, setEditingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/staff');
      if (!response.ok) throw new Error('Error al obtener el personal');
      const data = await response.json();
      setStaff(data);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewStaff(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!newStaff.nombre) newErrors.nombre = 'Nombre es requerido';
    if (!newStaff.email) newErrors.email = 'Email es requerido';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newStaff.email)) newErrors.email = 'Email inválido';
    if (!newStaff.telefono) newErrors.telefono = 'Teléfono es requerido';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddStaff = async () => {
    if (!validateForm()) return;
    
    try {
      const response = await fetch('http://localhost:5000/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStaff)
      });
      
      if (!response.ok) throw new Error('Error al agregar personal');
      
      const data = await response.json();
      setStaff([...staff, data]);
      setNewStaff({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        role: 'veterinario'
      });
    } catch (error) {
      console.error('Error:', error);
      alert(error.message);
    }
  };

  const handleEditStaff = (id) => {
    const staffMember = staff.find(s => s.id === id);
    if (staffMember) {
      setNewStaff(staffMember);
      setEditingId(id);
    }
  };

  const handleUpdateStaff = async () => {
    if (!validateForm()) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/staff/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStaff)
      });
      
      if (!response.ok) throw new Error('Error al actualizar personal');
      
      const updatedStaff = staff.map(s => 
        s.id === editingId ? { ...s, ...newStaff } : s
      );
      setStaff(updatedStaff);
      setEditingId(null);
      setNewStaff({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        role: 'veterinario'
      });
    } catch (error) {
      console.error('Error:', error);
      alert(error.message);
    }
  };

  const confirmDelete = (id) => {
    setStaffToDelete(id);
    setShowDeleteModal(true);
  };

  const handleDeleteStaff = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/staff/${staffToDelete}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Error al eliminar personal');
      
      setStaff(staff.filter(s => s.id !== staffToDelete));
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error:', error);
      alert(error.message);
    }
  };

  if (loading) {
    return <div className="loading">Cargando personal...</div>;
  }

  return (
    <div className="management-container">
      <h1>Gestión de Personal</h1>
      
      <div className="form-container">
        <h2>{editingId ? 'Editar Miembro' : 'Agregar Nuevo Miembro'}</h2>
        
        <div className="form-row">
          <div className="form-group">
            <label>Nombre:</label>
            <input 
              type="text" 
              name="nombre" 
              value={newStaff.nombre}
              onChange={handleInputChange}
              className={errors.nombre ? 'input-error' : ''}
            />
            {errors.nombre && <span className="error-message">{errors.nombre}</span>}
          </div>
          
          <div className="form-group">
            <label>Apellido:</label>
            <input 
              type="text" 
              name="apellido" 
              value={newStaff.apellido}
              onChange={handleInputChange}
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Email:</label>
            <input 
              type="email" 
              name="email" 
              value={newStaff.email}
              onChange={handleInputChange}
              className={errors.email ? 'input-error' : ''}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>
          
          <div className="form-group">
            <label>Teléfono:</label>
            <input 
              type="text" 
              name="telefono" 
              value={newStaff.telefono}
              onChange={handleInputChange}
              className={errors.telefono ? 'input-error' : ''}
            />
            {errors.telefono && <span className="error-message">{errors.telefono}</span>}
          </div>
        </div>
        
        <div className="form-group">
          <label>Rol:</label>
          <select 
            name="role" 
            value={newStaff.role}
            onChange={handleInputChange}
          >
            <option value="veterinario">Veterinario</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
        
        <div className="form-actions">
          {editingId ? (
            <>
              <button onClick={handleUpdateStaff} className="btn-primary">
                Actualizar
              </button>
              <button 
                onClick={() => {
                  setEditingId(null);
                  setNewStaff({
                    nombre: '',
                    apellido: '',
                    email: '',
                    telefono: '',
                    role: 'veterinario'
                  });
                }} 
                className="btn-secondary"
              >
                Cancelar
              </button>
            </>
          ) : (
            <button onClick={handleAddStaff} className="btn-primary">
              Agregar
            </button>
          )}
        </div>
      </div>
      
      <div className="list-container">
        <h2>Lista de Personal</h2>
        <table className="staff-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {staff.map(member => (
              <tr key={member.id}>
                <td>{member.id}</td>
                <td>{member.nombre} {member.apellido}</td>
                <td>{member.email}</td>
                <td>{member.telefono}</td>
                <td>{member.role === 'admin' ? 'Administrador' : 'Veterinario'}</td>
                <td>
                  <button 
                    onClick={() => handleEditStaff(member.id)}
                    className="btn-edit"
                  >
                    Editar
                  </button>
                  <button 
                    onClick={() => confirmDelete(member.id)}
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
      
      {showDeleteModal && (
        <ConfirmationModal
          title="Confirmar Eliminación"
          message="¿Estás seguro de que deseas eliminar este miembro del personal?"
          onConfirm={handleDeleteStaff}
          onCancel={() => setShowDeleteModal(false)}
          confirmText="Eliminar"
          cancelText="Cancelar"
          isDanger={true}
        />
      )}
    </div>
  );
};

export default StaffManagement;