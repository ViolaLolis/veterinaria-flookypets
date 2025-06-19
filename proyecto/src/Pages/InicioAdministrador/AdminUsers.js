import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEdit, FaTrash, FaSearch, FaBan, FaCheck, FaTimes, FaSpinner, FaInfoCircle, FaPlus, FaSave } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { authFetch } from './api';
import './Styles/AdminStyles.css';

function AdminUsers({ user }) {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccion: '',
    tipo_documento: '',
    numero_documento: '',
    fecha_nacimiento: '',
    password: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const responseData = await authFetch('/admin/usuarios');
      
      if (responseData.success && Array.isArray(responseData.data)) {
        setUsers(responseData.data.map(u => ({
            ...u,
            name: `${u.nombre} ${u.apellido || ''}`.trim(),
            status: u.active ? 'active' : 'inactive'
        })));
        setFilteredUsers(responseData.data.map(u => ({
            ...u,
            name: `${u.nombre} ${u.apellido || ''}`.trim(),
            status: u.active ? 'active' : 'inactive'
        })));
      } else {
        setError(responseData.message || 'Formato de datos de usuarios incorrecto.');
        showNotification(responseData.message || 'Error al cargar usuarios: Formato incorrecto.', 'error');
      }
    } catch (err) {
      setError(`Error al cargar usuarios: ${err.message}`);
      console.error('Error fetching users:', err);
    } finally {
      setIsLoading(false);
    }
  }, [authFetch, showNotification, setError, setIsLoading]);

  useEffect(() => {
    if (user && user.token) {
      fetchUsers();
    } else {
      setIsLoading(false);
      setError('No autorizado. Por favor, inicie sesión.');
      showNotification('No autorizado para ver usuarios.', 'error');
    }
  }, [fetchUsers, user, showNotification]);

  useEffect(() => {
    const results = users.filter(userItem =>
      userItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userItem.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userItem.telefono.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(results);
  }, [searchTerm, users]);

  const toggleStatus = useCallback(async (id, currentStatus) => {
    setIsSubmitting(true);
    setError('');
    try {
      const newStatus = currentStatus === 'active' ? 0 : 1;
      const responseData = await authFetch(`/usuarios/${id}`, {
        method: 'PUT',
        body: { active: newStatus }
      });

      if (responseData.success) {
        setUsers(prevUsers => prevUsers.map(userItem =>
          userItem.id === id ? { ...userItem, active: newStatus, status: newStatus ? 'active' : 'inactive' } : userItem
        ));
        showNotification(responseData.message || `Usuario ${newStatus ? 'activado' : 'desactivado'} correctamente.`);
      } else {
        showNotification(responseData.message || 'Error al cambiar estado del usuario.', 'error');
      }
    } catch (err) {
      showNotification(`Error al cambiar estado: ${err.message}`, 'error');
      console.error('Error toggling user status:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [authFetch, showNotification, setUsers, setError, setIsSubmitting]);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este usuario? Esta acción es irreversible y puede eliminar también sus mascotas e historial médico asociados.')) {
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      const responseData = await authFetch(`/usuarios/${id}`, { method: 'DELETE' });
      if (responseData.success) {
        setUsers(prevUsers => prevUsers.filter(userItem => userItem.id !== id));
        showNotification(responseData.message || 'Usuario eliminado correctamente.');
      } else {
        showNotification(responseData.message || 'Error al eliminar usuario.', 'error');
      }
    } catch (err) {
      showNotification(`Error al eliminar usuario: ${err.message}`, 'error');
      console.error('Error deleting user:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [authFetch, showNotification, setUsers, setError, setIsSubmitting]);

  const handleEdit = useCallback((userItem) => {
    setCurrentUser(userItem);
    setFormData({
      nombre: userItem.nombre,
      apellido: userItem.apellido || '',
      email: userItem.email,
      telefono: userItem.telefono,
      direccion: userItem.direccion || '',
      tipo_documento: userItem.tipo_documento || '',
      numero_documento: userItem.numero_documento || '',
      fecha_nacimiento: userItem.fecha_nacimiento ? userItem.fecha_nacimiento.split('T')[0] : '',
      password: '',
      confirmPassword: ''
    });
    setIsFormOpen(true);
    setError('');
  }, [setCurrentUser, setFormData, setIsFormOpen, setError]);

  const handleAddNew = useCallback(() => {
    setCurrentUser(null);
    setFormData({
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      direccion: '',
      tipo_documento: '',
      numero_documento: '',
      fecha_nacimiento: '',
      password: '',
      confirmPassword: ''
    });
    setIsFormOpen(true);
    setError('');
  }, [setCurrentUser, setFormData, setIsFormOpen, setError]);

  const handleCancelForm = useCallback(() => {
    setIsFormOpen(false);
    setCurrentUser(null);
    setFormData({
      nombre: '', apellido: '', email: '', telefono: '', direccion: '',
      tipo_documento: '', numero_documento: '', fecha_nacimiento: '',
      password: '', confirmPassword: ''
    });
    setError('');
  }, [setIsFormOpen, setCurrentUser, setFormData, setError]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmitForm = useCallback(async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.nombre || !formData.email || !formData.telefono) {
      showNotification('Nombre, email y teléfono son campos obligatorios.', 'error');
      return;
    }
    if (!currentUser && (!formData.password || formData.password.length < 6 || formData.password !== formData.confirmPassword)) {
      if (!formData.password) showNotification('La contraseña es obligatoria para nuevos usuarios.', 'error');
      else if (formData.password.length < 6) showNotification('La contraseña debe tener al menos 6 caracteres.', 'error');
      else if (formData.password !== formData.confirmPassword) showNotification('Las contraseñas no coinciden.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      let responseData;
      const payload = { ...formData };
      delete payload.confirmPassword;

      if (currentUser) {
        if (!payload.password) delete payload.password;
        responseData = await authFetch(`/usuarios/${currentUser.id}`, {
          method: 'PUT',
          body: payload
        });
        if (responseData.success && responseData.data) {
          setUsers(prevUsers => prevUsers.map(u =>
            u.id === currentUser.id ? { ...u, ...responseData.data, name: `${responseData.data.nombre} ${responseData.data.apellido || ''}`.trim(), status: responseData.data.active ? 'active' : 'inactive' } : u
          ));
          showNotification(responseData.message || 'Usuario actualizado correctamente.');
        } else {
          showNotification(responseData.message || 'Error al actualizar usuario.', 'error');
        }
      } else {
        payload.role = 'usuario';
        payload.active = 1;
        responseData = await authFetch('/register', {
          method: 'POST',
          body: payload
        });
        if (responseData.success && responseData.data) {
          setUsers(prevUsers => [...prevUsers, {
              ...responseData.data,
              name: `${responseData.data.nombre} ${responseData.data.apellido || ''}`.trim(),
              status: responseData.data.active ? 'active' : 'inactive'
          }]);
          showNotification(responseData.message || 'Usuario creado correctamente.');
        } else {
          showNotification(responseData.message || 'Error al crear usuario.', 'error');
        }
      }
      handleCancelForm();
      fetchUsers();
    } catch (err) {
      showNotification(`Error al guardar usuario: ${err.message}`, 'error');
      console.error('Error submitting form:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, currentUser, authFetch, showNotification, setUsers, handleCancelForm, fetchUsers, setError]);

  const handleViewDetails = useCallback((userId) => {
    navigate(`/admin/users/${userId}`);
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="loading-container">
        <FaSpinner className="spinner-icon" />
        <p>Cargando usuarios...</p>
      </div>
    );
  }

  if (error && users.length === 0) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="admin-content-container">
      <AnimatePresence>
        {notification && (
          <motion.div
            key="user-notification"
            className={`notification ${notification.type}`}
            initial={{ opacity: 0, y: -20, pointerEvents: 'none' }}
            animate={{ opacity: 1, y: 0, pointerEvents: 'auto' }}
            exit={{ opacity: 0, y: -20, pointerEvents: 'none' }}
            transition={{ duration: 0.3 }}
          >
            <FaInfoCircle className="notification-icon" />
            {notification.message}
            <button className="close-notification" onClick={() => setNotification(null)}>
              <FaTimes />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            key="user-form-modal"
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="modal-form"
              initial={{ y: "-100vh", opacity: 0 }}
              animate={{ y: "0", opacity: 1 }}
              exit={{ y: "100vh", opacity: 0 }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
            >
              <button className="close-modal" onClick={handleCancelForm} disabled={isSubmitting}>
                <FaTimes />
              </button>
              <h3>
                <FaUser className="form-icon" />
                {currentUser ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h3>
              
              <form onSubmit={handleSubmitForm}>
                <div className="form-grid">
                    {currentUser && (
                        <div className="form-group">
                            <label htmlFor="id">ID</label>
                            <input type="text" id="id" name="id" value={currentUser.id} disabled />
                        </div>
                    )}
                    <div className="form-group">
                        <label htmlFor="nombre">Nombre*</label>
                        <input type="text" id="nombre" name="nombre" value={formData.nombre} onChange={handleInputChange} disabled={isSubmitting} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="apellido">Apellido</label>
                        <input type="text" id="apellido" name="apellido" value={formData.apellido} onChange={handleInputChange} disabled={isSubmitting} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email*</label>
                        <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} disabled={!!currentUser || isSubmitting} required={!currentUser} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="telefono">Teléfono*</label>
                        <input type="text" id="telefono" name="telefono" value={formData.telefono} onChange={handleInputChange} disabled={isSubmitting} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="direccion">Dirección</label>
                        <input type="text" id="direccion" name="direccion" value={formData.direccion} onChange={handleInputChange} disabled={isSubmitting} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="tipo_documento">Tipo Documento</label>
                        <input type="text" id="tipo_documento" name="tipo_documento" value={formData.tipo_documento} onChange={handleInputChange} disabled={isSubmitting} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="numero_documento">Número Documento</label>
                        <input type="text" id="numero_documento" name="numero_documento" value={formData.numero_documento} onChange={handleInputChange} disabled={isSubmitting} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="fecha_nacimiento">Fecha Nacimiento</label>
                        <input type="date" id="fecha_nacimiento" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleInputChange} disabled={isSubmitting} />
                    </div>
                    {!currentUser && (
                        <>
                            <div className="form-group">
                                <label htmlFor="password">Contraseña*</label>
                                <input type="password" id="password" name="password" value={formData.password} onChange={handleInputChange} disabled={isSubmitting} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="confirmPassword">Confirmar Contraseña*</label>
                                <input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} disabled={isSubmitting} required />
                            </div>
                        </>
                    )}
                </div>
                
                <div className="form-actions">
                  <button type="button" className="cancel-btn" onClick={handleCancelForm} disabled={isSubmitting}>
                    <FaTimes /> Cancelar
                  </button>
                  <button type="submit" className="save-btn" disabled={isSubmitting}>
                    {isSubmitting ? <FaSpinner className="spinner-icon" /> : <FaSave />}
                    {isSubmitting ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="admin-content-header">
        <h2>
          <FaUser className="header-icon" />
          Gestión de Usuarios
        </h2>
        <div className="header-actions">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={isLoading || isSubmitting}
            />
          </div>
          <button onClick={handleAddNew} className="add-btn" disabled={isLoading || isSubmitting}>
            <FaPlus /> Nuevo Usuario
          </button>
        </div>
      </div>

      <div className="admin-table-container">
        {filteredUsers.length > 0 ? (
          <table className="admin-table"><thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Mascotas</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead><tbody>
            {filteredUsers.map(userItem => (
              <tr key={userItem.id}>
                <td>{userItem.id}</td><td>{userItem.name}</td><td>{userItem.email}</td><td>{userItem.telefono}</td><td>{userItem.num_mascotas || 0}</td><td>
                  <span className={`status-badge ${userItem.status}`}>
                    {userItem.status === 'active' ? 'Activo' : 'Inactivo'}
                  </span>
                </td><td className="actions-cell">
                  <button className="btn-details" onClick={() => handleViewDetails(userItem.id)} disabled={isSubmitting}>
                    <FaInfoCircle /> Detalles
                  </button>
                  <button className="btn-edit" onClick={() => handleEdit(userItem)} disabled={isSubmitting}>
                    <FaEdit /> Editar
                  </button>
                  <button
                    className={`btn-status ${userItem.status === 'active' ? 'inactive' : 'active'}`}
                    onClick={() => toggleStatus(userItem.id, userItem.status)}
                    disabled={isSubmitting}
                  >
                    {userItem.status === 'active' ? <FaBan /> : <FaCheck />}
                    {userItem.status === 'active' ? 'Desactivar' : 'Activar'}
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(userItem.id)}
                    disabled={isSubmitting}
                  >
                    <FaTrash /> Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody></table>
        ) : (
          <div className="no-results">
            <FaInfoCircle className="info-icon" />
            {searchTerm ?
              'No se encontraron usuarios que coincidan con la búsqueda.' :
              'No hay usuarios registrados.'}
            <button onClick={handleAddNew} className="add-btn" disabled={isLoading || isSubmitting}>
              <FaPlus /> Nuevo Usuario
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminUsers;