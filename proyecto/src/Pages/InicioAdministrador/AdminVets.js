import React, { useState, useEffect } from 'react';
// Importa los iconos de Font Awesome para una mejor interfaz de usuario
import { FaUserMd, FaEdit, FaTrash, FaPlus, FaSearch, FaTimes, FaSave, FaSpinner, FaInfoCircle } from 'react-icons/fa';
import './Styles/AdminStyles.css'; // Asegúrate de que este archivo CSS existe y contiene los estilos necesarios

function AdminVets() {
  // Estado para almacenar la lista completa de veterinarios
  const [vets, setVets] = useState([]);
  // Estado para almacenar la lista de veterinarios después de aplicar filtros de búsqueda
  const [filteredVets, setFilteredVets] = useState([]);
  // Estado para el término de búsqueda en el input
  const [searchTerm, setSearchTerm] = useState('');
  // Estado para indicar si los datos están siendo cargados desde la API
  const [isLoading, setIsLoading] = useState(true);
  // Estado para almacenar y mostrar mensajes de error
  const [error, setError] = useState('');
  // Estado para controlar la visibilidad del formulario de edición/creación
  const [isFormOpen, setIsFormOpen] = useState(false);
  // Estado para almacenar los datos del veterinario que se está editando (o null si es uno nuevo)
  const [currentVet, setCurrentVet] = useState(null);
  // Estado para los datos del formulario, mapeados a las columnas de la tabla 'usuarios'
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccion: '',
    password: '', // Solo se usa al crear un nuevo veterinario
    confirmPassword: '' // Para confirmar la contraseña al crear
  });
  // Estado para indicar si una operación de envío de formulario está en curso
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Estado para mostrar notificaciones al usuario (éxito o error)
  const [notification, setNotification] = useState(null);

  // Obtiene la información del usuario logueado (incluido el token) desde localStorage.
  // Es crucial para la autorización de las peticiones a la API.
  const user = JSON.parse(localStorage.getItem('user')) || {};

  /**
   * Muestra una notificación temporal en la interfaz de usuario.
   * @param {string} message - El mensaje a mostrar en la notificación.
   * @param {string} type - El tipo de notificación ('success' o 'error'), para aplicar estilos.
   */
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    // La notificación desaparecerá automáticamente después de 5 segundos
    setTimeout(() => setNotification(null), 5000);
  };

  /**
   * Obtiene el token de autenticación del almacenamiento local.
   * Esta función es interna al componente.
   * @returns {string|null} El token JWT o null si no se encuentra.
   */
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  /**
   * Realiza una petición fetch a la API con autenticación JWT.
   * Esta función es interna al componente.
   * @param {string} endpoint - El endpoint de la API (ej: '/usuarios/veterinarios').
   * Se asume que es una ruta relativa a 'http://localhost:5000'.
   * @param {object} options - Opciones para la petición fetch (método, cuerpo, encabezados adicionales).
   * @returns {Promise<object>} Los datos de la respuesta JSON.
   * @throws {Error} Si no se encuentra el token o si la respuesta de la red no es OK.
   */
  const authFetch = async (endpoint, options = {}) => {
    const token = getAuthToken();
    if (!token) {
      // Si no hay token, lanza un error que será capturado por el bloque catch
      throw new Error('No se encontró token de autenticación. Por favor, inicie sesión nuevamente.');
    }

    // Encabezados predeterminados para todas las peticiones autenticadas
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` // Incluye el token JWT
    };

    // Combina las opciones predeterminadas con las opciones proporcionadas por la llamada
    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers // Permite sobrescribir o añadir encabezados adicionales
      }
    };

    // Si hay un cuerpo en la petición, asegúrate de que sea JSON stringificado
    if (options.body) {
      config.body = JSON.stringify(options.body);
    }

    // Realiza la petición a tu servidor backend
    const response = await fetch(`http://localhost:5000${endpoint}`, config);

    // Si la respuesta no es exitosa (ej. 401, 403, 404, 500), lanza un error
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})); // Intenta parsear el error del servidor
      const errorMessage = errorData.message || `Error ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    // Retorna la respuesta JSON si la petición fue exitosa
    return response.json();
  };

  /**
   * Función asíncrona para cargar la lista de veterinarios desde el backend.
   * Actualiza los estados de carga, error y la lista de veterinarios.
   */
  const fetchVets = async () => {
    setIsLoading(true); // Activa el estado de carga
    setError(''); // Limpia cualquier error previo
    try {
      // RUTA CORRECTA A TU BACKEND: /usuarios/veterinarios
      // Llama a la API para obtener todos los usuarios con rol 'veterinario'
      const responseData = await authFetch('/usuarios/veterinarios');
      
      // Asumiendo que tu backend devuelve un objeto con { success: true, data: [...] }
      if (responseData.success && Array.isArray(responseData.data)) {
        setVets(responseData.data); // Actualiza la lista completa de veterinarios
        setFilteredVets(responseData.data); // Inicializa la lista filtrada también
      } else {
        setError(responseData.message || 'Formato de datos de veterinarios incorrecto.');
      }
    } catch (err) {
      setError(`Error al cargar veterinarios: ${err.message}`);
      console.error('Error fetching vets:', err);
      // Opcional: Si el error es por autenticación, redirige al login
      // if (err.message.includes('token de autenticación') || err.message.includes('Token inválido')) {
      //   window.location.href = '/login'; // Descomentar y ajustar si tienes una ruta de login
      // }
    } finally {
      setIsLoading(false); // Desactiva el estado de carga
    }
  };

  // useEffect para cargar los veterinarios al montar el componente (una sola vez)
  useEffect(() => {
    fetchVets();
  }, []);

  // useEffect para filtrar la lista de veterinarios cada vez que el término de búsqueda o la lista original cambian
  useEffect(() => {
    const results = vets.filter(vet =>
      vet.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vet.apellido && vet.apellido.toLowerCase().includes(searchTerm.toLowerCase())) ||
      vet.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vet.telefono.includes(searchTerm) ||
      (vet.direccion && vet.direccion.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredVets(results);
  }, [searchTerm, vets]);

  /**
   * Maneja la eliminación de un veterinario.
   * Muestra un cuadro de confirmación antes de proceder.
   * @param {number} id - El ID del veterinario a eliminar.
   */
  const handleDelete = async (id) => {
    // Reemplazar `window.confirm` con un modal de confirmación personalizado para mejor UX
    if (!window.confirm('¿Estás seguro de que quieres eliminar este veterinario? Esta acción es irreversible y puede fallar si tiene citas o historiales médicos asociados.')) {
      return; // Si el usuario cancela, no se hace nada
    }

    setIsSubmitting(true); // Activa el estado de envío para mostrar spinner
    setError(''); // Limpia errores previos
    try {
      // RUTA CORRECTA A TU BACKEND: /usuarios/veterinarios/:id
      const responseData = await authFetch(`/usuarios/veterinarios/${id}`, {
        method: 'DELETE'
      });

      if (responseData.success) {
        setVets(vets.filter(vet => vet.id !== id)); // Actualiza el estado local para reflejar la eliminación
        showNotification(responseData.message || 'Veterinario eliminado correctamente.');
      } else {
        showNotification(responseData.message || 'Error al eliminar veterinario.', 'error');
      }
    } catch (err) {
      showNotification(`Error de conexión al eliminar: ${err.message}`, 'error');
      console.error('Error deleting vet:', err);
    } finally {
      setIsSubmitting(false); // Desactiva el estado de envío
    }
  };

  /**
   * Prepara el formulario para editar un veterinario existente.
   * @param {object} vet - El objeto veterinario a editar.
   */
  const handleEdit = (vet) => {
    setCurrentVet(vet); // Establece el veterinario actual para la edición
    setFormData({ // Rellena el formulario con los datos del veterinario
      nombre: vet.nombre,
      apellido: vet.apellido || '',
      email: vet.email,
      telefono: vet.telefono,
      direccion: vet.direccion || '',
      password: '', // La contraseña nunca se precarga por seguridad al editar
      confirmPassword: ''
    });
    setIsFormOpen(true); // Abre el modal del formulario
    setError(''); // Limpia cualquier error anterior del formulario
  };

  /**
   * Prepara el formulario para agregar un nuevo veterinario.
   */
  const handleAddNew = () => {
    setCurrentVet(null); // No hay veterinario actual, es una nueva entrada
    setFormData({ // Limpia el formulario
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      direccion: '',
      password: '',
      confirmPassword: ''
    });
    setIsFormOpen(true); // Abre el modal del formulario
    setError(''); // Limpia cualquier error anterior del formulario
  };

  /**
   * Maneja los cambios en los campos del formulario.
   * @param {object} e - El evento de cambio del input.
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Maneja el envío del formulario, ya sea para crear o actualizar un veterinario.
   * Incluye validaciones y llamadas a la API.
   * @param {object} e - El evento de envío del formulario.
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Evita que la página se recargue

    // Validaciones básicas del formulario
    if (!formData.nombre || !formData.telefono || !formData.email) {
      showNotification('Nombre, email y teléfono son campos requeridos.', 'error');
      return;
    }

    if (!currentVet) { // Validaciones solo para la creación de un nuevo veterinario
      if (!formData.password) {
        showNotification('Contraseña es requerida para nuevos veterinarios.', 'error');
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

    setIsSubmitting(true); // Activa el estado de envío
    setError(''); // Limpia errores previos

    try {
      let responseData;
      // Los datos a enviar al backend
      const payload = { ...formData };
      delete payload.confirmPassword; // Siempre elimina confirmPassword del payload

      if (currentVet) {
        // Lógica para ACTUALIZAR un veterinario existente
        delete payload.password; // No enviar la contraseña si no se está actualizando explícitamente
        // RUTA CORRECTA A TU BACKEND: /usuarios/veterinarios/:id
        responseData = await authFetch(`/usuarios/veterinarios/${currentVet.id}`, {
          method: 'PUT',
          body: payload // Envía solo los campos actualizables
        });

        if (responseData.success && responseData.data) {
          // Actualiza el veterinario en el estado local con los datos del backend
          setVets(vets.map(vet =>
            vet.id === currentVet.id ? { ...vet, ...responseData.data } : vet
          ));
          showNotification(responseData.message || 'Veterinario actualizado correctamente.');
        } else {
          showNotification(responseData.message || 'Error al actualizar veterinario.', 'error');
        }
      } else {
        // Lógica para CREAR un nuevo veterinario
        payload.role = 'veterinario'; // Asegura que el rol sea 'veterinario'
        // RUTA CORRECTA A TU BACKEND: /usuarios/veterinarios
        responseData = await authFetch('/usuarios/veterinario', { // Usar endpoint para crear veterinario, que podria ser diferente
          method: 'POST',
          body: payload // Envía todos los datos necesarios para un nuevo veterinario
        });

        if (responseData.success && responseData.data && responseData.data.id) {
          // Agrega el nuevo veterinario a la lista con el ID recibido del backend
          setVets([...vets, responseData.data]);
          showNotification(responseData.message || 'Veterinario creado correctamente.');
        } else {
          showNotification(responseData.message || 'Error al crear veterinario.', 'error');
        }
      }

      setIsFormOpen(false); // Cierra el modal después de una operación exitosa
    } catch (err) {
      showNotification(`Error al guardar veterinario: ${err.message}`, 'error');
      console.error('Error submitting form:', err);
    } finally {
      setIsSubmitting(false); // Desactiva el estado de envío
    }
  };

  // Muestra un spinner de carga mientras se obtienen los datos iniciales
  if (isLoading && vets.length === 0 && !error) {
    return (
      <div className="loading-container">
        <FaSpinner className="spinner-icon" />
        <p>Cargando veterinarios...</p>
      </div>
    );
  }

  // Muestra un mensaje de error si la carga inicial falla y no hay datos
  if (error && vets.length === 0) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="admin-dashboard"> {/* Usa la clase general del dashboard */}
      {/* Área para mostrar notificaciones */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          <FaInfoCircle className="notification-icon" />
          {notification.message}
          <button className="close-notification" onClick={() => setNotification(null)}>
            <FaTimes />
          </button>
        </div>
      )}

      {/* Modal de formulario para agregar/editar veterinarios */}
      {isFormOpen && (
        <div className="modal-overlay">
          <div className="modal-form"> {/* Usa la clase modal-form para el formulario */}
            {/* Botón para cerrar el modal */}
            <button
              className="close-modal"
              onClick={() => setIsFormOpen(false)}
              disabled={isSubmitting} // Deshabilita el botón mientras se envía el formulario
            >
              <FaTimes />
            </button>
            {/* Título del formulario dinámico (Editar/Nuevo) */}
            <h3>
              <FaUserMd className="form-icon" />
              {currentVet ? 'Editar Veterinario' : 'Nuevo Veterinario'}
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                {/* Campo: ID (solo lectura si es edición) */}
                {currentVet && (
                  <div className="form-group">
                    <label htmlFor="id">ID</label>
                    <input
                      type="text"
                      id="id"
                      name="id"
                      value={currentVet.id}
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
                {/* Campo: Email (deshabilitado si se edita un veterinario existente) */}
                <div className="form-group">
                  <label htmlFor="email">Email*</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!!currentVet || isSubmitting} // Deshabilita si es edición o se está enviando
                    required={!currentVet} // Requerido solo si es nuevo
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
                {/* Campos de contraseña (solo visibles al crear un nuevo veterinario) */}
                {!currentVet && (
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
                {/* Botón para cancelar la edición/creación */}
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setIsFormOpen(false)}
                  disabled={isSubmitting}
                >
                  <FaTimes /> Cancelar
                </button>
                {/* Botón para guardar (crear o actualizar) */}
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
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contenedor principal de gestión de veterinarios */}
      {/* Usamos 'management-section' para el padding y la sombra, como ya definimos */}
      <div className="management-section"> 
        {/* Encabezado del panel de gestión de veterinarios */}
        <div className="management-header">
          <div className="header-title">
            <FaUserMd className="header-icon" />
            <h2>Gestión de Veterinarios</h2>
            <span className="badge">{vets.length} veterinarios</span>
          </div>

          <div className="header-actions">
            <div className="search-bar"> {/* Usa search-bar en lugar de search-container + search-box */}
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Buscar veterinarios..."
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

            <button
              className="add-btn"
              onClick={handleAddNew}
              disabled={isLoading}
            >
              <FaPlus /> Nuevo Veterinario
            </button>
          </div>
        </div>

        {/* Contenedor de la tabla de veterinarios */}
        <div className="admin-table-container"> {/* Clase genérica para contenedor de tabla */}
          {filteredVets.length > 0 ? (
            <table className="admin-table"> {/* Usa la clase genérica admin-table */}
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre Completo</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Dirección</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredVets.map(vet => (
                  <tr key={vet.id}>
                    <td>{vet.id}</td>
                    <td>{`${vet.nombre} ${vet.apellido || ''}`}</td>
                    <td>{vet.email}</td>
                    <td>{vet.telefono}</td>
                    <td>{vet.direccion || 'N/A'}</td>
                    <td className="actions-cell">
                      <button
                        onClick={() => handleEdit(vet)}
                        className="edit-btn"
                        disabled={isLoading || isSubmitting}
                        title="Editar Veterinario"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(vet.id)}
                        className="delete-btn"
                        disabled={isLoading || isSubmitting}
                        title="Eliminar Veterinario"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-results">
              <FaInfoCircle className="info-icon" /> {/* Icono para no results */}
              {searchTerm ?
                'No se encontraron veterinarios que coincidan con la búsqueda.' :
                'No hay veterinarios registrados.'}
              <button
                className="add-btn"
                onClick={handleAddNew}
                disabled={isLoading}
              >
                <FaPlus /> Agregar Veterinario
              </button>
            </div>
          )}
        </div>
      </div> {/* Cierre de .management-section */}
    </div>
  );
}

export default AdminVets;
