import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate
import { FaNotesMedical, FaSearch, FaPaw, FaUserMd, FaCalendarAlt, FaSpinner, FaInfoCircle, FaEye } from 'react-icons/fa';
import { authFetch } from './api'; // Asegúrate de que la ruta sea correcta a tu api.js
import './Styles/AdminStyles.css'; // Asegúrate de que este CSS exista

function AdminMedicalRecords({ user }) { // Asegúrate de que `user` se pasa como prop
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Inicializa useNavigate

  /**
   * Muestra una notificación temporal en la UI.
   * @param {string} message - El mensaje a mostrar.
   * @param {string} type - El tipo de notificación ('success' o 'error').
   */
  const showNotification = useCallback((message, type = 'success') => {
    // Implementación de notificación si es necesaria, por ahora solo un console.log
    console.log(`Notificación (${type}): ${message}`);
  }, []);

  /**
   * Carga la lista de historiales médicos desde la API.
   * Maneja los estados de carga y error.
   */
  const fetchRecords = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      // Realiza la petición para obtener historiales médicos desde el backend
      const responseData = await authFetch('/admin/historiales'); // Endpoint definido en server.js
      
      if (responseData.success && Array.isArray(responseData.data)) {
        // Asegúrate de mapear `id_propietario` si tu backend lo envía
        const formattedRecords = responseData.data.map(record => ({
          ...record,
          id_propietario: record.id_propietario // Asumiendo que el backend ahora devuelve este campo
        }));
        setRecords(formattedRecords);
        setFilteredRecords(formattedRecords);
      } else {
        setError(responseData.message || 'Formato de datos de historiales médicos incorrecto.');
        showNotification(responseData.message || 'Error al cargar historiales médicos: Formato incorrecto.', 'error');
      }
    } catch (err) {
      setError(`Error al cargar historiales médicos: ${err.message}`);
      console.error('Error fetching medical records:', err);
    } finally {
      setIsLoading(false);
    }
  }, [authFetch, showNotification, setError, setIsLoading]);

  // useEffect para cargar los historiales médicos cuando el componente se monta
  useEffect(() => {
    if (user && user.token) { // Solo cargar si el usuario está autenticado
      fetchRecords();
    } else {
      setIsLoading(false);
      setError('No autorizado. Por favor, inicie sesión.');
      showNotification('No autorizado para ver historiales médicos.', 'error');
    }
  }, [fetchRecords, user, showNotification]);

  // useEffect para filtrar los historiales médicos cada vez que cambia el término de búsqueda o la lista de historiales
  useEffect(() => {
    const results = records.filter(record =>
      record.mascota.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.propietario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.diagnostico.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.veterinario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record.fecha_consulta && new Date(record.fecha_consulta).toLocaleDateString().toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredRecords(results);
  }, [searchTerm, records]);

  /**
   * Maneja el clic en el botón "Ver Detalles" para navegar a la página de detalles del usuario propietario.
   * @param {number} idPropietario - El ID del propietario (usuario) asociado al historial.
   */
  const handleViewDetails = useCallback((idPropietario) => {
    if (idPropietario) {
      // CORRECCIÓN AQUÍ: Cambiar '/admin/usuarios/' a '/admin/users/' para que coincida con App.js
      navigate(`/admin/users/${idPropietario}`); 
    } else {
      showNotification('No se encontró el ID del propietario para ver detalles.', 'warning');
    }
  }, [navigate, showNotification]);


  if (isLoading) {
    return (
      <div className="loading-container">
        <FaSpinner className="spinner-icon" />
        <p>Cargando historiales médicos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        <FaInfoCircle className="icon" /> {error}
      </div>
    );
  }

  return (
    <div className="admin-content-container">
      <div className="admin-content-header">
        <h2>
          <FaNotesMedical className="header-icon" />
          Historiales Médicos
        </h2>
        <div className="header-actions">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Buscar historiales..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="admin-table-container">
        {filteredRecords.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID Historial</th>
                <th>Fecha</th>
                <th>Mascota</th>
                <th>Dueño</th>
                <th>Veterinario</th>
                <th>Diagnóstico</th>
                <th>Tratamiento</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map(record => (
                <tr key={record.id_historial}>
                  <td>{record.id_historial}</td>
                  <td>
                    <FaCalendarAlt className="icon" /> {new Date(record.fecha_consulta).toLocaleDateString()}
                  </td>
                  <td>
                    <FaPaw className="icon" /> {record.mascota} ({record.especie})
                  </td>
                  <td>{record.propietario}</td>
                  <td>
                    <FaUserMd className="icon" /> {record.veterinario}
                  </td>
                  <td>{record.diagnostico}</td>
                  <td>{record.tratamiento}</td>
                  <td className="actions-cell">
                    <button 
                      className="btn-primary"
                      onClick={() => handleViewDetails(record.id_propietario)} // Pasar el ID del propietario
                      disabled={!record.id_propietario} // Deshabilitar si no hay ID de propietario
                    >
                      <FaEye /> Ver Detalles
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-results">
            <FaInfoCircle className="info-icon" />
            {searchTerm ?
              'No se encontraron historiales médicos que coincidan con la búsqueda.' :
              'No hay historiales médicos registrados.'}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminMedicalRecords;
