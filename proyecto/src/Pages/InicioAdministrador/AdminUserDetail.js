import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaUser, FaPaw, FaNotesMedical, FaSpinner, FaArrowLeft, FaInfoCircle, FaCalendarAlt, FaUserMd } from 'react-icons/fa';
import { authFetch } from './api'; // Asegúrate de que la ruta sea correcta a tu api.js
import './Styles/AdminStyles.css'; // O un archivo CSS específico para detalles

function AdminUserDetail({ user }) { // Recibe 'user' como prop para authFetch
  const { userId } = useParams(); // Obtener el ID del usuario de la URL
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [pets, setPets] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState({}); // Para almacenar historiales por ID de mascota
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUserData = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      // Obtener datos del usuario
      const userResponse = await authFetch(`/usuarios/${userId}`);
      if (userResponse.success && userResponse.data) {
        setUserData(userResponse.data);

        // Obtener mascotas asociadas al usuario por id_propietario
        // Endpoint: /mascotas?id_propietario={userId}
        const petsResponse = await authFetch(`/mascotas?id_propietario=${userId}`); 
        if (petsResponse.success && Array.isArray(petsResponse.data)) {
          setPets(petsResponse.data);

          // Obtener todos los historiales médicos y luego filtrarlos por mascota en el frontend
          const allMedicalRecordsResponse = await authFetch('/historial_medico');
          if (allMedicalRecordsResponse.success && Array.isArray(allMedicalRecordsResponse.data)) {
            const recordsMap = {};
            petsResponse.data.forEach(pet => {
              recordsMap[pet.id_mascota] = allMedicalRecordsResponse.data.filter(
                record => record.id_mascota === pet.id_mascota
              );
            });
            setMedicalRecords(recordsMap);
          } else {
            console.warn("No se pudieron cargar todos los historiales médicos o formato incorrecto:", allMedicalRecordsResponse.message);
            setMedicalRecords({});
          }

        } else {
          console.warn(`No se encontraron mascotas o formato incorrecto para el usuario ${userId}:`, petsResponse.message);
          setPets([]);
          setMedicalRecords({}); // Asegurarse de que no haya historiales si no hay mascotas
        }
      } else {
        setError(userResponse.message || 'Error al cargar los datos del usuario.');
      }
    } catch (err) {
      setError(`Error de conexión: ${err.message}`);
      console.error('Error fetching user details:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, authFetch]);

  useEffect(() => {
    if (user && user.token && userId) {
      fetchUserData();
    } else if (!userId) {
      setError('ID de usuario no proporcionado en la URL.');
      setIsLoading(false);
    } else {
      setError('No autorizado. Por favor, inicie sesión.');
      setIsLoading(false);
    }
  }, [user, userId, fetchUserData]);

  if (isLoading) {
    return (
      <div className="loading-container">
        <FaSpinner className="spinner-icon" />
        <p>Cargando detalles del usuario...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        <FaInfoCircle className="icon" /> {error}
        <button onClick={() => navigate(-1)} className="back-btn">
          <FaArrowLeft /> Volver
        </button>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="no-results">
        <FaInfoCircle className="icon" /> No se encontraron datos para este usuario.
        <button onClick={() => navigate(-1)} className="back-btn">
          <FaArrowLeft /> Volver
        </button>
      </div>
    );
  }

  return (
    <div className="user-detail-container">
      <button onClick={() => navigate(-1)} className="back-btn">
        <FaArrowLeft /> Volver a Usuarios
      </button>

      {/* Sección de Datos del Usuario */}
      <div className="user-profile-card">
        <h3><FaUser className="header-icon" /> Detalles del Usuario</h3>
        <div className="profile-info-grid">
          <div className="info-item">
            <strong>ID:</strong> <span>{userData.id}</span>
          </div>
          <div className="info-item">
            <strong>Nombre:</strong> <span>{userData.nombre} {userData.apellido}</span>
          </div>
          <div className="info-item">
            <strong>Email:</strong> <span>{userData.email}</span>
          </div>
          <div className="info-item">
            <strong>Teléfono:</strong> <span>{userData.telefono}</span>
          </div>
          <div className="info-item">
            <strong>Dirección:</strong> <span>{userData.direccion || 'N/A'}</span>
          </div>
          <div className="info-item">
            <strong>Documento:</strong> <span>{userData.tipo_documento} - {userData.numero_documento}</span>
          </div>
          <div className="info-item">
            <strong>Fecha Nacimiento:</strong> <span>{userData.fecha_nacimiento ? new Date(userData.fecha_nacimiento).toLocaleDateString() : 'N/A'}</span>
          </div>
          <div className="info-item">
            <strong>Rol:</strong> <span>{userData.role}</span>
          </div>
          <div className="info-item">
            <strong>Estado:</strong>
            <span className={`status-badge ${userData.active ? 'active' : 'inactive'}`}>
              {userData.active ? 'Activo' : 'Inactivo'}
            </span>
          </div>
          <div className="info-item">
            <strong>Miembro desde:</strong> <span>{userData.created_at ? new Date(userData.created_at).toLocaleDateString() : 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Sección de Mascotas del Usuario */}
      <div className="pets-section">
        <h3><FaPaw className="header-icon" /> Mascotas de {userData.nombre}</h3>
        {pets.length > 0 ? (
          <div className="pets-grid">
            {pets.map(pet => (
              <div key={pet.id_mascota} className="pet-card">
                <div className="card-header">
                  <h4>{pet.nombre}</h4>
                  <span className="badge">{pet.especie} - {pet.raza}</span>
                </div>
                <div className="card-body">
                  <p><strong>Edad:</strong> {pet.edad || 'N/A'} años</p>
                  <p><strong>Peso:</strong> {pet.peso || 'N/A'} kg</p>
                  <p><strong>Sexo:</strong> {pet.sexo || 'N/A'}</p>
                  <p><strong>Color:</strong> {pet.color || 'N/A'}</p>
                  <p><strong>Microchip:</strong> {pet.microchip || 'N/A'}</p>
                  <p><strong>Fecha Registro:</strong> {pet.fecha_registro ? new Date(pet.fecha_registro).toLocaleDateString() : 'N/A'}</p>
                </div>

                {/* Historial Médico de la Mascota */}
                <div className="medical-history-section">
                  <h5><FaNotesMedical className="icon" /> Historial Médico</h5>
                  {medicalRecords[pet.id_mascota] && medicalRecords[pet.id_mascota].length > 0 ? (
                    <table className="medical-records-table">
                      <thead>
                        <tr>
                          <th>Fecha</th>
                          <th>Veterinario</th>
                          <th>Diagnóstico</th>
                          <th>Tratamiento</th>
                        </tr>
                      </thead>
                      <tbody>
                        {medicalRecords[pet.id_mascota].map(record => (
                          <tr key={record.id_historial}>
                            <td><FaCalendarAlt className="icon-small" /> {record.fecha_consulta ? new Date(record.fecha_consulta).toLocaleDateString() : 'N/A'}</td>
                            <td><FaUserMd className="icon-small" /> {record.veterinario_nombre || 'N/A'}</td>
                            <td>{record.diagnostico}</td>
                            <td>{record.tratamiento}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="no-records">No hay historiales médicos para esta mascota.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-results">
            <FaInfoCircle className="info-icon" /> Este usuario no tiene mascotas registradas.
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminUserDetail;
