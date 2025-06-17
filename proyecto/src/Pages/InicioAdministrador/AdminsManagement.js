import React, { useState, useEffect } from 'react';
import { FaUserShield, FaEdit, FaTrash, FaPlus, FaSearch, FaSave, FaTimes, FaSpinner, FaInfoCircle } from 'react-icons/fa';
import './Styles/AdminStyles.css'; // Importa AdminStyles.css que contiene los estilos generales, incluyendo los del modal

const AdminsManagement = () => {
  // Estados para gestionar los datos de los administradores y la UI
  const [admins, setAdmins] = useState([]); // Lista completa de administradores
  const [filteredAdmins, setFilteredAdmins] = useState([]); // Lista de administradores filtrados por búsqueda
  const [searchTerm, setSearchTerm] = useState(''); // Término de búsqueda
  const [isLoading, setIsLoading] = useState(true); // Indica si los datos están cargando
  const [error, setError] = useState(''); // Mensaje de error
  const [isFormOpen, setIsFormOpen] = useState(false); // Controla la visibilidad del modal de formulario
  const [currentAdmin, setCurrentAdmin] = useState(null); // Administrador actualmente en edición (o null para nuevo)
  const [formData, setFormData] = useState({ // Datos del formulario de administrador
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccion: '',
    password: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false); // Indica si el formulario se está enviando
  const [notification, setNotification] = useState(null); // Para mostrar mensajes de éxito/error temporales

  // Obtener el usuario logueado desde localStorage. Necesario para prevenir que un admin se elimine a sí mismo.
  const user = JSON.parse(localStorage.getItem('user')) || {};

  // Función auxiliar para obtener el token de autenticación del localStorage
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  /**
   * Función mejorada para realizar peticiones fetch con autenticación JWT.
   * Agrega automáticamente el token de autorización y maneja errores de respuesta HTTP.
   * @param {string} endpoint - El endpoint de la API relativo a /api/admin.
   * @param {object} options - Opciones para la petición fetch (método, body, headers adicionales).
   * @returns {Promise<object>} Los datos de la respuesta JSON.
   * @throws {Error} Si no se encuentra el token o la respuesta de la red no es OK.
   */
  const authFetch = async (endpoint, options = {}) => {
    const token = getAuthToken();
    // Lanza un error si no hay token, lo cual será capturado por las funciones que llaman a authFetch
    if (!token) {
      throw new Error('No se encontró token de autenticación. Por favor, inicie sesión nuevamente.');
    }

    // Encabezados predeterminados para JSON y autorización
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    // Configuración de la petición, fusionando encabezados predeterminados con los personalizados
    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    };

    // Si hay un cuerpo en la petición, asegúrate de que sea JSON stringificado
    if (options.body) {
      config.body = JSON.stringify(options.body);
    }

    // Realiza la petición a la API de administración
    const response = await fetch(`http://localhost:5000/api/admin${endpoint}`, config);

    // Verifica si la respuesta HTTP no fue exitosa
    if (!response.ok) {
      // Intenta parsear el error del servidor, si existe
      const errorData = await response.json().catch(() => ({}));
      // Construye un mensaje de error más informativo
      const errorMessage = errorData.message || `Error ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    // Retorna la respuesta JSON si la petición fue exitosa
    return response.json();
  };

  /**
   * Muestra una notificación temporal en la UI.
   * @param {string} message - El mensaje a mostrar.
   * @param {string} type - El tipo de notificación ('success' o 'error').
   */
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    // La notificación desaparecerá automáticamente después de 5 segundos
    setTimeout(() => setNotification(null), 5000);
  };

  /**
   * Carga la lista de administradores desde la API.
   * Maneja los estados de carga y error.
   */
  const fetchAdmins = async () => {
    setIsLoading(true); // Activa el estado de carga
    setError(''); // Limpia cualquier error previo
    try {
      // Realiza la petición para obtener administradores
      const response = await authFetch('/administrators'); // Endpoint para obtener todos los administradores
      const data = response.data; // Asumiendo que la respuesta tiene un campo 'data'

      // Formatea los datos recibidos para el estado local
      const formattedAdmins = data.map(admin => ({
        id: admin.id,
        nombre: admin.nombre,
        apellido: admin.apellido || '',
        email: admin.email,
        telefono: admin.telefono,
        direccion: admin.direccion || '',
        active: admin.active,
        created_at: admin.created_at, // Asegurarse de que el backend devuelve created_at
        name: `${admin.nombre} ${admin.apellido || ''}`.trim(),
        role: 'Administrador' // Asigna el rol para visualización si tu backend no lo devuelve explícitamente así
      }));

      setAdmins(formattedAdmins); // Actualiza la lista completa de administradores
      setFilteredAdmins(formattedAdmins); // Inicializa la lista filtrada con todos los administradores
    } catch (err) {
      // Establece el mensaje de error para mostrar al usuario
      setError(`Error al cargar administradores: ${err.message}`);
      console.error('Error fetching admins:', err);
    } finally {
      setIsLoading(false); // Desactiva el estado de carga
    }
  };

  // useEffect para cargar los administradores cuando el componente se monta
  useEffect(() => {
    fetchAdmins();
  }, []); // El array vacío asegura que se ejecuta solo una vez al montar

  // useEffect para filtrar los administradores cada vez que cambia el término de búsqueda o la lista de administradores
  useEffect(() => {
    const results = admins.filter(admin =>
      admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.telefono.includes(searchTerm) || // Incluir teléfono en la búsqueda
      (admin.direccion && admin.direccion.toLowerCase().includes(searchTerm.toLowerCase())) // Incluir dirección
    );
    setFilteredAdmins(results);
  }, [searchTerm, admins]); // Se ejecuta cuando searchTerm o admins cambian

  /**
   * Maneja la eliminación de un administrador.
   * @param {number} id - El ID del administrador a eliminar.
   */
  const handleDelete = async (id) => {
    // Evita que un administrador se elimine a sí mismo
    if (id === user.id) {
      showNotification('No puedes eliminar tu propio usuario.', 'error');
      return;
    }

    // Usando una confirmación simple para este ejemplo. En una aplicación real, se usaría un modal personalizado.
    if (!window.confirm('¿Estás seguro de que quieres eliminar este administrador? Esta acción es irreversible.')) {
      return; // Si el usuario cancela, no hacemos nada
    }

    setIsSubmitting(true); // Activa el spinner de carga
    try {
      // Realiza la petición DELETE a la API
      const response = await authFetch(`/administrators/${id}`, {
        method: 'DELETE'
      });

      if (response.success) { // Asumiendo que tu API devuelve un campo 'success'
        // Actualiza el estado para remover el administrador eliminado
        setAdmins(admins.filter(admin => admin.id !== id));
        showNotification(response.message || 'Administrador eliminado correctamente.'); // Muestra un mensaje de éxito
      } else {
        showNotification(response.message || 'Error al eliminar administrador.', 'error');
      }
    } catch (err) {
      showNotification(`Error al eliminar administrador: ${err.message}`, 'error'); // Muestra un mensaje de error
      console.error('Error deleting admin:', err);
    } finally {
      setIsSubmitting(false); // Desactiva el spinner de carga
    }
  };

  /**
   * Abre el formulario modal para editar un administrador existente.
   * @param {object} admin - El objeto administrador a editar.
   */
  const handleEdit = (admin) => {
    setCurrentAdmin(admin); // Establece el administrador a editar
    setFormData({ // Rellena el formulario con los datos del administrador existente
      nombre: admin.nombre,
      apellido: admin.apellido || '',
      email: admin.email,
      telefono: admin.telefono,
      direccion: admin.direccion || '',
      password: '', // Las contraseñas no se precargan por seguridad
      confirmPassword: ''
    });
    setIsFormOpen(true); // Abre el modal del formulario
    setError(''); // Limpia cualquier error previo del formulario
  };

  /**
   * Abre el formulario modal para agregar un nuevo administrador.
   */
  const handleAddNew = () => {
    setCurrentAdmin(null); // No hay administrador actual para una nueva entrada
    setFormData({ // Limpia los datos del formulario para una nueva entrada
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      direccion: '',
      password: '',
      confirmPassword: ''
    });
    setIsFormOpen(true); // Abre el modal del formulario
    setError(''); // Limpia cualquier error previo del formulario
  };

  /**
   * Maneja los cambios en los campos de entrada del formulario.
   * @param {object} e - El evento de cambio.
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Maneja el envío del formulario, ya sea para crear o actualizar un administrador.
   * Realiza validaciones y llama a la API correspondiente.
   * @param {object} e - El evento de envío del formulario.
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Previene el comportamiento predeterminado del formulario

    // Validaciones básicas del formulario
    if (!formData.nombre || !formData.telefono || !formData.email) { // Email es crítico para ambos casos
      showNotification('Nombre, email y teléfono son campos requeridos.', 'error');
      return;
    }

    // Validaciones específicas para la creación de un nuevo administrador
    if (!currentAdmin) { // Si se está creando un nuevo administrador
      if (!formData.password) {
        showNotification('Contraseña es requerida para nuevos administradores.', 'error');
        return;
      }
      if (formData.password.length < 6) {
        showNotification('La contraseña debe tener al menos 6 caracteres.', 'error');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        showNotification('Las contraseñas no coinciden.', 'error');
        return;
      }
    }

    setIsSubmitting(true); // Indica que el envío está en curso (activa el spinner)

    try {
      let responseData;
      // Prepara el payload, excluyendo confirmPassword
      const payload = { ...formData };
      delete payload.confirmPassword;

      if (currentAdmin) {
        // Lógica para ACTUALIZAR un administrador existente
        // Para PUT, la API generalmente no espera 'password' si no se está cambiando explícitamente.
        // Si tu API permite cambiar la contraseña con PUT, podrías incluirla aquí.
        // Por ahora, la excluiremos si es una edición y no se ha tocado el campo password (o se dejó vacío)
        if (!payload.password) {
            delete payload.password;
        }

        responseData = await authFetch(`/administrators/${currentAdmin.id}`, {
          method: 'PUT',
          body: payload // Envía los datos actualizables
        });

        if (responseData.success && responseData.data) {
              // Actualiza el administrador en el estado local con los datos recibidos del backend
            setAdmins(admins.map(admin =>
                admin.id === currentAdmin.id ? {
                    ...admin,
                    ...responseData.data, // Usa los datos actualizados del backend
                    name: `${responseData.data.nombre} ${responseData.data.apellido || ''}`.trim()
                } : admin
            ));
            showNotification(responseData.message || 'Administrador actualizado correctamente.');
        } else {
            showNotification(responseData.message || 'Error al actualizar administrador.', 'error');
        }

      } else {
        // Lógica para CREAR un nuevo administrador
        payload.role = 'administrador'; // Asegura que el rol sea 'administrador'
        
        responseData = await authFetch('/administrators', {
          method: 'POST',
          body: payload // Envía los datos del nuevo administrador (la API se encargará de hashear la contraseña)
        });

        if (responseData.success && responseData.data && responseData.data.id) {
            // Agrega el nuevo administrador al estado local con el ID y otros datos de la respuesta del backend
            const newAdmin = {
                id: responseData.data.id,
                ...responseData.data, // Usa los datos completos devueltos por el backend
                name: `${responseData.data.nombre} ${responseData.data.apellido || ''}`.trim(),
                role: responseData.data.role || 'administrador', // Asegura el rol
                active: responseData.data.active !== undefined ? responseData.data.active : 1, // Si active no viene, asume 1
                created_at: responseData.data.created_at || new Date().toISOString() // Si created_at no viene, usa fecha actual
            };
            setAdmins([...admins, newAdmin]);
            showNotification(responseData.message || 'Administrador creado correctamente.');
        } else {
            showNotification(responseData.message || 'Error al crear administrador.', 'error');
        }
      }

      setIsFormOpen(false); // Cierra el modal del formulario tras el éxito
    } catch (err) {
      // Muestra un mensaje de error específico
      showNotification(`Error al guardar administrador: ${err.message}`, 'error');
      console.error('Error submitting form:', err);
    } finally {
      setIsSubmitting(false); // Desactiva el estado de envío (oculta el spinner)
    }
  };

  // Renderizado condicional: Muestra spinner mientras carga por primera vez
  if (isLoading && admins.length === 0 && !error) {
    return (
      <div className="loading-container">
        <FaSpinner className="spinner-icon" />
        <p>Cargando administradores...</p>
      </div>
    );
  }

  // Renderizado condicional: Muestra mensaje de error si la carga inicial falla
  if (error && admins.length === 0) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="management-section"> {/* Usando la clase general 'management-section' */}
      {/* Componente para mostrar notificaciones (éxito/error) */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          <FaInfoCircle className="notification-icon" />
          {notification.message}
          <button className="close-notification" onClick={() => setNotification(null)}>
            <FaTimes />
          </button>
        </div>
      )}

      {/* Modal para el formulario de agregar/editar administrador */}
      {isFormOpen && (
        <div className="modal-overlay"> {/* El overlay cubre toda la pantalla */}
          <div className="modal-form"> {/* El formulario modal en sí */}
            {/* Botón para cerrar el modal */}
            <button
              className="close-modal"
              onClick={() => setIsFormOpen(false)}
              disabled={isSubmitting}
            >
              <FaTimes />
            </button>
            {/* Título del formulario */}
            <h3>
              <FaUserShield className="form-icon" />
              {currentAdmin ? 'Editar Administrador' : 'Nuevo Administrador'}
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                {/* Campo: ID (solo lectura si es edición) */}
                {currentAdmin && (
                  <div className="form-group">
                    <label htmlFor="id">ID</label>
                    <input
                      type="text"
                      id="id"
                      name="id"
                      value={currentAdmin.id}
                      disabled
                    />
                  </div>
                )}
                {/* Campo: Nombre */}
                <div className="form-group">
                  <label htmlFor="nombre">Nombre*</label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    required
                  />
                </div>
                {/* Campo: Apellido */}
                <div className="form-group">
                  <label htmlFor="apellido">Apellido</label>
                  <input
                    type="text"
                    id="apellido"
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                  />
                </div>
                {/* Campo: Email (deshabilitado si se edita un admin existente) */}
                <div className="form-group">
                  <label htmlFor="email">Email*</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!!currentAdmin || isSubmitting} // Deshabilita si es edición
                    required={!currentAdmin} // Requerido solo si es nuevo
                  />
                </div>
                {/* Campo: Teléfono */}
                <div className="form-group">
                  <label htmlFor="telefono">Teléfono*</label>
                  <input
                    type="text"
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    required
                  />
                </div>
                {/* Campo: Dirección */}
                <div className="form-group">
                  <label htmlFor="direccion">Dirección</label>
                  <input
                    type="text"
                    id="direccion"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                  />
                </div>
                {/* Campos de contraseña (solo visibles para nuevos administradores) */}
                {!currentAdmin && (
                  <>
                    <div className="form-group">
                      <label htmlFor="password">Contraseña*</label>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="confirmPassword">Confirmar Contraseña*</label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                        required
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="form-actions">
                {/* Botón Cancelar */}
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setIsFormOpen(false)}
                  disabled={isSubmitting}
                >
                  <FaTimes /> Cancelar
                </button>
                {/* Botón Guardar/Actualizar */}
                <button
                  type="submit"
                  className="save-btn" // Usando save-btn para unificar estilos
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="spinner-icon" /> Procesando...
                    </>
                  ) : (
                    <>
                      <FaSave /> {currentAdmin ? 'Actualizar' : 'Guardar'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Encabezado del panel de administración */}
      <div className="management-header">
        <h2><FaUserShield className="header-icon" /> Gestión de Administradores</h2> {/* Asegura que el icono tiene la clase header-icon */}
        <div className="header-actions">
          {/* Barra de búsqueda */}
          <div className="search-bar"> {/* Usando la clase general search-bar */}
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Buscar administradores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={isLoading}
            />
            {searchTerm && (
              <button
                className="clear-search"
                onClick={() => setSearchTerm('')}
                disabled={isLoading}
              >
                <FaTimes />
              </button>
            )}
          </div>
          {/* Botón para agregar nuevo administrador */}
          <button
            onClick={handleAddNew}
            className="add-btn"
            disabled={isLoading}
          >
            <FaPlus /> Nuevo Administrador
          </button>
        </div>
      </div>

      {/* Contenedor de la tabla de administradores */}
      <div className="admin-table-container"> {/* Usando la clase general admin-table-container */}
        {filteredAdmins.length > 0 ? (
          <table className="admin-table"><thead>
            <tr>
              <th>ID</th>
              <th>Nombre Completo</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Estado</th>
              <th>Registro</th>
              <th>Acciones</th>
            </tr>
          </thead><tbody>
            {/* Mapea y renderiza cada administrador en una fila de la tabla */}
            {filteredAdmins.map(admin => (
              <tr key={admin.id} className={admin.id === user.id ? 'current-user-row' : ''}>
                <td>{admin.id}</td><td>{`${admin.nombre} ${admin.apellido || ''}`}</td><td>{admin.email}</td><td>{admin.telefono}</td><td>
                  <span className={`status-badge ${admin.active ? 'active' : 'inactive'}`}>
                    {admin.active ? 'Activo' : 'Inactivo'}
                  </span>
                </td><td>{admin.created_at}</td><td className="actions-cell">
                  <button
                    onClick={() => handleEdit(admin)}
                    className="edit-btn"
                    disabled={isLoading || isSubmitting}
                    title="Editar Administrador"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(admin.id)}
                    className="delete-btn"
                    disabled={admin.id === user.id || isLoading || isSubmitting}
                    title={admin.id === user.id ? 'No puedes eliminar tu propio usuario' : 'Eliminar Administrador'}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody></table>
        ) : (
          <div className="no-results">
            {/* Icono para no results */}
            <FaInfoCircle className="info-icon" />
            {searchTerm ?
              'No se encontraron administradores que coincidan con la búsqueda.' :
              'No hay administradores registrados.'}
            <button
              className="add-btn"
              onClick={handleAddNew}
              disabled={isLoading}
            >
              <FaPlus /> Agregar Administrador
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminsManagement;
